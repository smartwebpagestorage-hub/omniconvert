/**
 * OmniConvert Studio - Word to PDF Module (100% Offline)
 * Converts Word (.docx / .doc) documents into professional multi-page PDF documents.
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const dropzone = document.getElementById('word-to-pdf-dropzone');
  const fileInput = document.getElementById('word-to-pdf-file');
  const fileInfoEl = document.getElementById('word-to-pdf-file-info');
  const titleInput = document.getElementById('word-to-pdf-title');
  const bodyEditor = document.getElementById('word-to-pdf-body');
  const pageSizeSelect = document.getElementById('word-to-pdf-pagesize');
  const orientSelect = document.getElementById('word-to-pdf-orientation');
  const fontSelect = document.getElementById('word-to-pdf-font');
  const fontSizeSelect = document.getElementById('word-to-pdf-fontsize');
  const marginSelect = document.getElementById('word-to-pdf-margin');
  const pageNumToggle = document.getElementById('word-to-pdf-pagenum');
  const filenameInput = document.getElementById('word-to-pdf-filename');
  const exportBtn = document.getElementById('word-to-pdf-export-btn');
  const clearBtn = document.getElementById('word-to-pdf-clear-btn');
  const statsWords = document.getElementById('word-to-pdf-words');
  const statsChars = document.getElementById('word-to-pdf-chars');
  const statsPages = document.getElementById('word-to-pdf-pages');
  const statusMsg = document.getElementById('word-to-pdf-status');

  let currentDocName = 'word_document';

  if (!dropzone) return;

  // Setup drag and drop
  if (typeof setupDropzone === 'function') {
    setupDropzone(dropzone, fileInput, (files) => {
      const file = files[0];
      if (file) handleWordFile(file);
    });
  }

  // Handle file selection
  async function handleWordFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['docx', 'doc', 'txt', 'rtf', 'odt'].includes(ext)) {
      showToast('Please select a valid Word (.docx, .doc) or text document.', 'error');
      return;
    }

    currentDocName = file.name.replace(/\.[^/.]+$/, "");
    if (fileInfoEl) {
      fileInfoEl.innerHTML = `<strong>Selected:</strong> ${file.name} (${formatBytes(file.size)})`;
      fileInfoEl.style.display = 'block';
    }

    if (titleInput && !titleInput.value.trim()) {
      titleInput.value = currentDocName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    if (filenameInput) {
      filenameInput.value = currentDocName;
    }

    if (statusMsg) {
      statusMsg.innerHTML = '<span class="spinner"></span> Reading Word document...';
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = '';

      if (ext === 'docx') {
        // 1. Try Mammoth.js first
        if (window.mammoth) {
          try {
            const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            extractedText = result.value;
          } catch (mErr) {
            console.warn('Mammoth extraction failed, trying JSZip fallback:', mErr);
          }
        }

        // 2. Fallback to direct JSZip OpenXML parsing
        if (!extractedText && window.JSZip) {
          try {
            const zip = await window.JSZip.loadAsync(arrayBuffer);
            const docXmlFile = zip.file('word/document.xml');
            if (docXmlFile) {
              const xmlText = await docXmlFile.async('text');
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
              const paragraphs = xmlDoc.getElementsByTagName('w:p');
              const lines = [];
              for (let i = 0; i < paragraphs.length; i++) {
                const textNodes = paragraphs[i].getElementsByTagName('w:t');
                let pText = '';
                for (let j = 0; j < textNodes.length; j++) {
                  pText += textNodes[j].textContent;
                }
                lines.push(pText);
              }
              extractedText = lines.join('\n');
            }
          } catch (zipErr) {
            console.error('JSZip docx parse error:', zipErr);
          }
        }
      } else {
        // Plain text / legacy extraction
        extractedText = await file.text();
      }

      if (!extractedText || !extractedText.trim()) {
        throw new Error('Could not extract readable text from document. File may be encrypted or empty.');
      }

      if (bodyEditor) {
        bodyEditor.value = extractedText.trim();
      }

      updateWordStats();
      if (exportBtn) exportBtn.disabled = false;
      if (clearBtn) clearBtn.disabled = false;

      if (statusMsg) {
        statusMsg.textContent = `Extracted text from "${file.name}" successfully. Ready to export PDF!`;
      }
      showToast(`Loaded Word document: "${file.name}"`, 'success');

    } catch (err) {
      console.error(err);
      if (statusMsg) statusMsg.textContent = 'Failed to read Word document. ' + err.message;
      showToast('Error reading document: ' + err.message, 'error');
    }
  }

  function updateWordStats() {
    const text = bodyEditor ? bodyEditor.value : '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    // Estimate pages (approx ~350 words per standard page)
    const estPages = words > 0 ? Math.max(1, Math.ceil(words / 350)) : 0;

    if (statsWords) statsWords.textContent = words.toLocaleString();
    if (statsChars) statsChars.textContent = chars.toLocaleString();
    if (statsPages) statsPages.textContent = estPages.toLocaleString();

    if (exportBtn) exportBtn.disabled = text.trim().length === 0;
  }

  if (bodyEditor) {
    bodyEditor.addEventListener('input', updateWordStats);
  }

  // Clear Button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (bodyEditor) bodyEditor.value = '';
      if (titleInput) titleInput.value = '';
      if (fileInfoEl) fileInfoEl.style.display = 'none';
      if (fileInput) fileInput.value = '';
      updateWordStats();
      if (exportBtn) exportBtn.disabled = true;
      if (clearBtn) clearBtn.disabled = true;
      if (statusMsg) statusMsg.textContent = 'Select a Word document (.docx) above to begin.';
      showToast('Cleared Word document content', 'info');
    });
  }

  // Export to PDF
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const text = bodyEditor ? bodyEditor.value.trim() : '';
      if (!text) {
        showToast('Document body is empty. Please enter or upload text.', 'error');
        return;
      }

      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        showToast('PDF generator library not loaded.', 'error');
        return;
      }

      const format = pageSizeSelect ? pageSizeSelect.value : 'a4';
      const orientation = orientSelect ? orientSelect.value : 'portrait';
      const font = fontSelect ? fontSelect.value : 'helvetica';
      const fontSize = fontSizeSelect ? (parseInt(fontSizeSelect.value, 10) || 12) : 12;
      const isPageNumEnabled = pageNumToggle ? pageNumToggle.checked : true;
      const docTitle = titleInput ? titleInput.value.trim() : '';
      const marginVal = marginSelect ? marginSelect.value : 'normal';

      let marginMm = 20;
      if (marginVal === 'narrow') marginMm = 12;
      if (marginVal === 'wide') marginMm = 28;

      const baseName = (filenameInput && filenameInput.value.trim()) || currentDocName || 'converted_word';
      const finalFilename = baseName.endsWith('.pdf') ? baseName : `${baseName}.pdf`;

      if (statusMsg) {
        statusMsg.innerHTML = '<span class="spinner"></span> Generating PDF document...';
      }

      // Check if text contains Devanagari (Hindi) or non-ASCII characters
      const hasUnicode = /[^\u0000-\u007F]/.test(text + docTitle);

      if (hasUnicode) {
        renderUnicodeWordToPdf({
          text,
          docTitle,
          format,
          orientation,
          fontSize,
          marginMm,
          isPageNumEnabled,
          finalFilename
        });
        return;
      }

      // Standard Vector PDF Generation
      try {
        const pdf = new jsPDF({
          orientation: orientation,
          unit: 'mm',
          format: format
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (marginMm * 2);
        let currentY = marginMm;

        // Title Header
        if (docTitle) {
          pdf.setFont(font, 'bold');
          pdf.setFontSize(fontSize + 6);
          pdf.setTextColor(15, 23, 42); // slate-900
          const titleLines = pdf.splitTextToSize(docTitle, contentWidth);
          pdf.text(titleLines, marginMm, currentY);
          currentY += (titleLines.length * ((fontSize + 6) * 0.45)) + 4;

          // Header border rule
          pdf.setDrawColor(203, 213, 225);
          pdf.setLineWidth(0.4);
          pdf.line(marginMm, currentY, pageWidth - marginMm, currentY);
          currentY += 8;
        }

        // Body Content
        pdf.setFont(font, 'normal');
        pdf.setFontSize(fontSize);
        pdf.setTextColor(30, 41, 59); // slate-800

        const lineHeightMm = fontSize * 0.3527 * 1.45;
        const paragraphs = text.split('\n');

        paragraphs.forEach((para) => {
          if (para.trim() === '') {
            currentY += lineHeightMm * 0.6;
            return;
          }

          const lines = pdf.splitTextToSize(para, contentWidth);

          lines.forEach((line) => {
            if (currentY + lineHeightMm > pageHeight - marginMm) {
              pdf.addPage();
              currentY = marginMm;
            }
            pdf.text(line, marginMm, currentY);
            currentY += lineHeightMm;
          });

          currentY += lineHeightMm * 0.35;
        });

        // Page Numbers
        if (isPageNumEnabled) {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setTextColor(148, 163, 184);
            pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
          }
        }

        pdf.save(finalFilename);
        if (statusMsg) statusMsg.textContent = `Generated "${finalFilename}" successfully!`;
        showToast(`Downloaded "${finalFilename}"!`, 'success');

      } catch (err) {
        console.error(err);
        if (statusMsg) statusMsg.textContent = 'Failed to generate PDF: ' + err.message;
        showToast('PDF generation failed: ' + err.message, 'error');
      }
    });
  }

  // Unicode/Hindi Render Engine via crisp offscreen Canvas
  function renderUnicodeWordToPdf(opts) {
    const {
      text,
      docTitle,
      format,
      orientation,
      fontSize,
      marginMm,
      isPageNumEnabled,
      finalFilename
    } = opts;

    const { jsPDF } = window.jspdf;
    const isLandscape = orientation === 'landscape';
    const isA4 = format === 'a4';

    let pageW = isA4 ? 1240 : 1275;
    let pageH = isA4 ? 1754 : 1650;
    if (isLandscape) {
      const tmp = pageW;
      pageW = pageH;
      pageH = tmp;
    }

    const marginPx = Math.round((marginMm / 210) * pageW);
    const maxTextWidth = pageW - (marginPx * 2);
    const scaledFontSize = Math.round(fontSize * 2.2);
    const lineHeight = Math.round(scaledFontSize * 1.45);
    const fontStack = '"Outfit", "Inter", "Nirmala UI", "Mangal", "Segoe UI", -apple-system, sans-serif';

    const offscreen = document.createElement('canvas');
    offscreen.width = pageW;
    offscreen.height = pageH;
    const ctx = offscreen.getContext('2d');

    const pages = [];
    let currentY = marginPx;
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

      pages.push(offscreen.toDataURL('image/jpeg', 0.94));
      currentLines = [];
      currentY = marginPx;
    }

    // Title
    if (docTitle) {
      const titleSize = Math.round(scaledFontSize * 1.35);
      ctx.font = `bold ${titleSize}px ${fontStack}`;
      const wrappedTitle = wrapCanvasLines(ctx, docTitle, maxTextWidth);

      wrappedTitle.forEach(tLine => {
        currentLines.push({
          type: 'text',
          text: tLine,
          x: marginPx,
          y: currentY + titleSize,
          font: `bold ${titleSize}px ${fontStack}`,
          color: '#0f172a'
        });
        currentY += titleSize * 1.3;
      });

      currentY += 14;
      currentLines.push({
        type: 'line',
        x1: marginPx,
        x2: pageW - marginPx,
        y: currentY,
        color: '#cbd5e1',
        width: 2
      });
      currentY += 26;
    }

    // Paragraphs
    ctx.font = `normal ${scaledFontSize}px ${fontStack}`;
    const paragraphs = text.split('\n');

    for (let p = 0; p < paragraphs.length; p++) {
      const para = paragraphs[p];
      if (para.trim() === '') {
        currentY += lineHeight * 0.65;
        continue;
      }

      const wrapped = wrapCanvasLines(ctx, para, maxTextWidth);

      for (let w = 0; w < wrapped.length; w++) {
        if (currentY + lineHeight > pageH - marginPx) {
          finalizePage();
        }

        currentLines.push({
          type: 'text',
          text: wrapped[w],
          x: marginPx,
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

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    });

    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage(format, orientation);
      pdf.addImage(pages[i], 'JPEG', 0, 0, pdfW, pdfH);

      if (isPageNumEnabled) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Page ${i + 1} of ${pages.length}`, pdfW / 2, pdfH - 8, { align: 'center' });
      }
    }

    pdf.save(finalFilename);
    if (statusMsg) statusMsg.textContent = `Generated "${finalFilename}" successfully!`;
    showToast(`PDF document "${finalFilename}" downloaded!`, 'success');
  }

  function wrapCanvasLines(context, text, maxWidth) {
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

  updateWordStats();
})();
