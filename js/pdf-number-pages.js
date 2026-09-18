/**
 * OmniConvert Studio - PDF Page Numbering Module
 * Add custom header/footer page numbers to every page
 * Uses pdf-lib for vector numbering
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedFile = null;
  let loadedArrayBuffer = null;

  const dropzone = document.getElementById('numbering-dropzone');
  const fileInput = document.getElementById('numbering-file');
  const fileInfo = document.getElementById('numbering-file-info');
  const formatSelect = document.getElementById('numbering-format');
  const positionSelect = document.getElementById('numbering-position');
  const startNumInput = document.getElementById('numbering-start');
  const fontSizeSelect = document.getElementById('numbering-size');
  const applyBtn = document.getElementById('numbering-apply-btn');
  const clearBtn = document.getElementById('numbering-clear-btn');
  const statusMsg = document.getElementById('numbering-status');
  const progressBar = document.getElementById('numbering-progress');
  const progressFill = document.getElementById('numbering-progress-fill');

  if (!dropzone) return;

  setupDropzone(dropzone, fileInput, (files) => {
    const file = files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      loadFile(file);
    } else {
      showToast('Please select a valid PDF file.', 'error');
    }
  });

  async function loadFile(file) {
    loadedFile = file;
    fileInfo.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)} (${formatBytes(file.size)})`;
    fileInfo.style.display = 'block';
    statusMsg.innerHTML = '<span class="spinner"></span> Reading PDF...';
    applyBtn.disabled = true;
    clearBtn.disabled = false;

    try {
      loadedArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: loadedArrayBuffer.slice(0) }).promise;
      applyBtn.disabled = false;
      statusMsg.textContent = `Loaded "${file.name}" with ${pdfDoc.numPages} pages. Choose page number format and click "Apply Page Numbers".`;
      showToast(`Loaded ${pdfDoc.numPages} pages`, 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to load PDF.';
      showToast('Error reading PDF', 'error');
    }
  }

  clearBtn.addEventListener('click', () => {
    loadedFile = null;
    loadedArrayBuffer = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    applyBtn.disabled = true;
    clearBtn.disabled = true;
    statusMsg.textContent = 'Upload a PDF above to begin.';
    showToast('Cleared', 'info');
  });

  applyBtn.addEventListener('click', async () => {
    if (!loadedArrayBuffer || !loadedFile) return;

    const { PDFDocument, StandardFonts, rgb } = window.PDFLib || {};
    if (!PDFDocument) {
      showToast('PDF-Lib engine not ready', 'error');
      return;
    }

    applyBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '15%';
    statusMsg.innerHTML = '<span class="spinner"></span> Numbering pages...';

    try {
      const pdfDoc = await PDFDocument.load(loadedArrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const total = pages.length;
      const startNum = parseInt(startNumInput.value, 10) || 1;
      const fontSize = parseInt(fontSizeSelect.value, 10) || 10;
      const fmt = formatSelect.value || 'page_of_total';
      const pos = positionSelect.value || 'bottom_center';

      for (let i = 0; i < total; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const currentNum = startNum + i;

        let label = `Page ${currentNum} of ${total}`;
        if (fmt === 'num_of_total') label = `${currentNum} / ${total}`;
        else if (fmt === 'page_num') label = `Page ${currentNum}`;
        else if (fmt === 'num_only') label = `${currentNum}`;

        const textWidth = font.widthOfTextAtSize(label, fontSize);
        const margin = 30;

        let x = (width - textWidth) / 2;
        let y = margin;

        if (pos === 'bottom_right') x = width - textWidth - margin;
        else if (pos === 'bottom_left') x = margin;
        else if (pos === 'top_center') { x = (width - textWidth) / 2; y = height - margin; }
        else if (pos === 'top_right') { x = width - textWidth - margin; y = height - margin; }

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });

        progressFill.style.width = `${Math.round(((i + 1) / total) * 80)}%`;
      }

      progressFill.style.width = '90%';
      statusMsg.innerHTML = '<span class="spinner"></span> Finalizing PDF...';

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const baseName = loadedFile.name.replace(/\.[^/.]+$/, "");
      const outName = `${baseName}_numbered.pdf`;
      triggerDownload(blob, outName);

      statusMsg.innerHTML = `<span style="color: var(--accent-emerald);">✓ Successfully added page numbers to ${total} pages!</span> Saved: ${outName}`;
      showToast('Numbered PDF downloaded!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to number pages.';
      showToast('Error numbering PDF', 'error');
    } finally {
      applyBtn.disabled = false;
      progressBar.classList.remove('active');
    }
  });
})();
