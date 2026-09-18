/**
 * OmniConvert Studio - Text to PDF Module
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const textInput = document.getElementById('text-to-pdf-body') || document.getElementById('text-to-pdf-content');
  const fileUpload = document.getElementById('text-to-pdf-file-upload');
  const titleInput = document.getElementById('text-to-pdf-title');
  const pageSizeSelect = document.getElementById('text-to-pdf-size') || document.getElementById('text-to-pdf-pagesize');
  const fontSelect = document.getElementById('text-to-pdf-font');
  const fontSizeSelect = document.getElementById('text-to-pdf-font-size') || document.getElementById('text-to-pdf-fontsize');
  const lineSpacingSelect = document.getElementById('text-to-pdf-spacing');
  const pageNumToggle = document.getElementById('text-to-pdf-pagenum');
  const filenameInput = document.getElementById('text-to-pdf-filename');
  const downloadBtn = document.getElementById('text-to-pdf-export-btn') || document.getElementById('text-to-pdf-download-btn');
  const clearBtn = document.getElementById('text-to-pdf-clear-btn');
  const statsWord = document.getElementById('text-to-pdf-words');
  const statsChar = document.getElementById('text-to-pdf-chars');
  const statusMsg = document.getElementById('text-to-pdf-status');

  if (!textInput) return;

  // File upload for TXT or Markdown files
  if (fileUpload) {
    fileUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          textInput.value = evt.target.result;
          updateStats();
          showToast(`Imported text from "${file.name}"`, 'success');
        };
        reader.readAsText(file);
      }
    });
  }

  function updateStats() {
    const text = textInput ? textInput.value : '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    if (statsWord) statsWord.textContent = words.toLocaleString();
    if (statsChar) statsChar.textContent = chars.toLocaleString();
    if (downloadBtn) downloadBtn.disabled = text.trim().length === 0;
    if (statusMsg) {
      statusMsg.textContent = text.trim().length > 0 
        ? `Ready to generate PDF (${words} words, ${chars} chars).` 
        : 'Ready to generate PDF document.';
    }
  }

  textInput.addEventListener('input', updateStats);

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      textInput.value = '';
      if (titleInput) titleInput.value = '';
      updateStats();
      showToast('Cleared text content', 'info');
    });
  }

  // Generate & Download PDF
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const text = textInput.value.trim();
      if (!text) {
        showToast('Please enter text to create a PDF.', 'error');
        return;
      }

      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        showToast('PDF library not loaded.', 'error');
        return;
      }

      const format = pageSizeSelect ? pageSizeSelect.value : 'a4'; // 'a4' or 'letter'
      const font = fontSelect ? fontSelect.value : 'helvetica';
      const fontSize = fontSizeSelect ? (parseInt(fontSizeSelect.value, 10) || 12) : 12;
      const lineHeightFactor = lineSpacingSelect ? (parseFloat(lineSpacingSelect.value) || 1.5) : 1.5;
      const isPageNumEnabled = pageNumToggle ? pageNumToggle.checked : true;
      const docTitle = titleInput ? titleInput.value.trim() : '';

      const finalFilename = ((filenameInput ? filenameInput.value.trim() : '') || 'document') + '.pdf';

      // Check if text contains Devanagari (Hindi) or non-ASCII characters
      const hasUnicode = /[^\u0000-\u007F]/.test(text + docTitle);

      if (hasUnicode) {
        renderUnicodeTextToPdf({
          text,
          docTitle,
          format,
          fontSize,
          lineHeightFactor,
          isPageNumEnabled,
          finalFilename
        });
        return;
      }

      // Standard ASCII/Latin Vector PDF Generation
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: format
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Document Title Header
      if (docTitle) {
        pdf.setFont(font, 'bold');
        pdf.setFontSize(fontSize + 6);
        pdf.setTextColor(15, 23, 42); // slate-900
        const titleLines = pdf.splitTextToSize(docTitle, contentWidth);
        pdf.text(titleLines, margin, currentY);
        currentY += (titleLines.length * ((fontSize + 6) * 0.45)) + 4;

        // Subtle divider line
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.4);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 8;
      }

      // Body Paragraphs
      pdf.setFont(font, 'normal');
      pdf.setFontSize(fontSize);
      pdf.setTextColor(51, 65, 85); // slate-700

      const lineHeightMm = fontSize * 0.3527 * lineHeightFactor;
      const paragraphs = text.split('\n');

      paragraphs.forEach((para) => {
        if (para.trim() === '') {
          currentY += lineHeightMm * 0.75;
          return;
        }

        const lines = pdf.splitTextToSize(para, contentWidth);

        lines.forEach((line) => {
          if (currentY + lineHeightMm > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += lineHeightMm;
        });

        currentY += lineHeightMm * 0.4;
      });

      // Add Page Numbers
      if (isPageNumEnabled) {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(9);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      }

      pdf.save(finalFilename);
      showToast(`Generated "${finalFilename}" successfully!`, 'success');
    });
  }

  // Unicode/Hindi Render Engine (Uses offscreen Canvas to render crisp text, then embed)
  function renderUnicodeTextToPdf(options) {
    const {
      text,
      docTitle,
      format,
      fontSize,
      lineHeightFactor,
      isPageNumEnabled,
      finalFilename
    } = options;

    const { jsPDF } = window.jspdf;
    const isA4 = format === 'a4';
    // 150 DPI dimensions: A4 ~ 1240 x 1754 px, Letter ~ 1275 x 1650 px
    const pageW = isA4 ? 1240 : 1275;
    const pageH = isA4 ? 1754 : 1650;
    const margin = 100;
    const maxTextWidth = pageW - (margin * 2);

    const scaledFontSize = Math.round(fontSize * 2.2);
    const lineHeight = Math.round(scaledFontSize * lineHeightFactor);

    const offscreen = document.createElement('canvas');
    offscreen.width = pageW;
    offscreen.height = pageH;
    const ctx = offscreen.getContext('2d');

    const fontStack = '"Outfit", "Inter", "Nirmala UI", "Mangal", "Segoe UI", -apple-system, sans-serif';

    const pages = [];
    let currentY = margin;
    let currentLines = [];

    function finalizePage() {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageW, pageH);

      currentLines.forEach((item) => {
        if (item.type === 'text') {
          ctx.font = item.font;
          ctx.fillStyle = item.color;
          ctx.fillText(item.text, item.x, item.y);
        } else if (item.type === 'line') {
          ctx.strokeStyle = item.color;
          ctx.lineWidth = item.width;
          ctx.beginPath();
          ctx.moveTo(item.x1, item.y);
          ctx.lineTo(item.x2, item.y);
          ctx.stroke();
        }
      });

      pages.push(offscreen.toDataURL('image/jpeg', 0.92));
      currentLines = [];
      currentY = margin;
    }

    // Title
    if (docTitle) {
      const titleSize = Math.round(scaledFontSize * 1.35);
      ctx.font = `bold ${titleSize}px ${fontStack}`;
      const wrappedTitle = wrapCanvasText(ctx, docTitle, maxTextWidth);

      wrappedTitle.forEach(tLine => {
        currentLines.push({
          type: 'text',
          text: tLine,
          x: margin,
          y: currentY + titleSize,
          font: `bold ${titleSize}px ${fontStack}`,
          color: '#0f172a'
        });
        currentY += titleSize * 1.3;
      });

      currentY += 16;
      currentLines.push({
        type: 'line',
        x1: margin,
        x2: pageW - margin,
        y: currentY,
        color: '#cbd5e1',
        width: 2
      });
      currentY += 30;
    }

    // Paragraphs
    ctx.font = `normal ${scaledFontSize}px ${fontStack}`;
    const paragraphs = text.split('\n');

    for (let p = 0; p < paragraphs.length; p++) {
      const para = paragraphs[p];
      if (para.trim() === '') {
        currentY += lineHeight * 0.7;
        continue;
      }

      const wrapped = wrapCanvasText(ctx, para, maxTextWidth);

      for (let w = 0; w < wrapped.length; w++) {
        if (currentY + lineHeight > pageH - margin) {
          finalizePage();
        }

        currentLines.push({
          type: 'text',
          text: wrapped[w],
          x: margin,
          y: currentY + scaledFontSize,
          font: `normal ${scaledFontSize}px ${fontStack}`,
          color: '#1e293b'
        });

        currentY += lineHeight;
      }
      currentY += lineHeight * 0.35;
    }

    if (currentLines.length > 0) {
      finalizePage();
    }

    // Compile into PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format
    });

    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage(format, 'portrait');
      pdf.addImage(pages[i], 'JPEG', 0, 0, pdfW, pdfH);

      if (isPageNumEnabled) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Page ${i + 1} of ${pages.length}`, pdfW / 2, pdfH - 10, { align: 'center' });
      }
    }

    pdf.save(finalFilename);
    showToast(`PDF document "${finalFilename}" downloaded!`, 'success');
  }

  function wrapCanvasText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (let i = 0; i < words.length; i++) {
      const test = current ? `${current} ${words[i]}` : words[i];
      if (context.measureText(test).width > maxWidth && i > 0) {
        lines.push(current);
        current = words[i];
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  updateStats();
})();
