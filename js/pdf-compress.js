/**
 * OmniConvert Studio - PDF Compressor Module
 * Supports Target File Size (500KB, 1MB, 2MB, 4MB, Custom MB) & Adaptive Re-encoding
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedFile = null;
  let loadedPdfDoc = null;
  let compressedBlob = null;

  const dropzone = document.getElementById('compress-dropzone');
  const fileInput = document.getElementById('compress-file');
  const fileInfo = document.getElementById('compress-file-info');
  const targetSizeSelect = document.getElementById('compress-target-size');
  const customSizeGroup = document.getElementById('compress-custom-size-group');
  const customSizeInput = document.getElementById('compress-custom-size');
  const compressBtn = document.getElementById('compress-btn');
  const clearBtn = document.getElementById('compress-clear-btn');
  const downloadBtn = document.getElementById('compress-download-btn');
  const progressBar = document.getElementById('compress-progress');
  const progressFill = document.getElementById('compress-progress-fill');
  const statusMsg = document.getElementById('compress-status');
  const resultCard = document.getElementById('compress-result-card');
  const resultStats = document.getElementById('compress-result-stats');

  if (!dropzone) return;

  if (targetSizeSelect) {
    targetSizeSelect.addEventListener('change', () => {
      if (targetSizeSelect.value === 'custom') {
        customSizeGroup.style.display = 'block';
      } else {
        customSizeGroup.style.display = 'none';
      }
    });
  }

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
    compressedBlob = null;
    fileInfo.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)} <span class="brand-tag">${formatBytes(file.size)}</span>`;
    fileInfo.style.display = 'block';
    if (resultCard) resultCard.style.display = 'none';
    if (downloadBtn) downloadBtn.style.display = 'none';
    statusMsg.innerHTML = '<span class="spinner"></span> Reading PDF document...';
    compressBtn.disabled = true;

    try {
      const buffer = await file.arrayBuffer();
      loadedPdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
      statusMsg.textContent = `Loaded "${file.name}" (${loadedPdfDoc.numPages} pages). Choose target size and click "Compress PDF".`;
      compressBtn.disabled = false;
      clearBtn.disabled = false;
      showToast(`PDF loaded (${loadedPdfDoc.numPages} pages)`, 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to read PDF file.';
      showToast('Error reading PDF', 'error');
    }
  }

  clearBtn.addEventListener('click', () => {
    loadedFile = null;
    loadedPdfDoc = null;
    compressedBlob = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    if (resultCard) resultCard.style.display = 'none';
    if (downloadBtn) downloadBtn.style.display = 'none';
    compressBtn.disabled = true;
    clearBtn.disabled = true;
    statusMsg.textContent = 'Select a PDF above to compress.';
    showToast('Cleared', 'info');
  });

  compressBtn.addEventListener('click', async () => {
    if (!loadedPdfDoc || !loadedFile) return;

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      showToast('PDF generator library not ready.', 'error');
      return;
    }

    compressBtn.disabled = true;
    clearBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '5%';
    statusMsg.innerHTML = '<span class="spinner"></span> Analyzing and compressing document...';

    const totalPages = loadedPdfDoc.numPages;

    let targetMaxBytes = 0;
    if (targetSizeSelect.value === 'custom') {
      const valMb = parseFloat(customSizeInput.value) || 2;
      targetMaxBytes = Math.round(valMb * 1024 * 1024);
    } else {
      const valKb = parseInt(targetSizeSelect.value, 10) || 0;
      targetMaxBytes = valKb * 1024;
    }

    let perPageBudget = 0;
    let baseScale = 1.5;
    let baseQuality = 0.75;

    if (targetMaxBytes > 0) {
      perPageBudget = Math.floor((targetMaxBytes * 0.85) / totalPages);
    } else {
      baseScale = 1.25;
      baseQuality = 0.70;
    }

    try {
      let outputPdf = null;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pct = Math.round((pageNum / totalPages) * 90);
        progressFill.style.width = `${pct}%`;
        statusMsg.innerHTML = `<span class="spinner"></span> Compressing page ${pageNum} of ${totalPages}...`;

        const page = await loadedPdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: baseScale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        let imgDataUrl;
        let imgWidthPx = canvas.width;
        let imgHeightPx = canvas.height;

        if (perPageBudget > 0) {
          const compressed = await adaptiveCompressImage(canvas, perPageBudget);
          imgDataUrl = compressed.dataUrl;
          imgWidthPx = compressed.width;
          imgHeightPx = compressed.height;
        } else {
          imgDataUrl = canvas.toDataURL('image/jpeg', baseQuality);
        }

        const aspect = imgWidthPx / imgHeightPx;
        const orientation = aspect >= 1 ? 'l' : 'p';

        if (pageNum === 1) {
          outputPdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
        } else {
          outputPdf.addPage('a4', orientation);
        }

        const pW = outputPdf.internal.pageSize.getWidth();
        const pH = outputPdf.internal.pageSize.getHeight();
        const pageAspect = pW / pH;
        let rW = pW;
        let rH = pH;
        let x = 0;
        let y = 0;

        if (aspect > pageAspect) {
          rH = pW / aspect;
          y = (pH - rH) / 2;
        } else {
          rW = pH * aspect;
          x = (pW - rW) / 2;
        }

        outputPdf.addImage(imgDataUrl, 'JPEG', x, y, rW, rH, undefined, 'FAST');
      }

      progressFill.style.width = '96%';
      statusMsg.innerHTML = '<span class="spinner"></span> Finalizing compressed PDF file...';

      compressedBlob = outputPdf.output('blob');
      const origSize = loadedFile.size;
      const newSize = compressedBlob.size;
      const reduction = Math.round(((origSize - newSize) / origSize) * 100);
      const isSmaller = newSize < origSize;

      if (resultStats) {
        resultStats.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; text-align: center;">
            <div class="glass-card" style="padding: 12px;">
              <div style="font-size: 0.8rem; color: var(--text-dim);">Original Size</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">${formatBytes(origSize)}</div>
            </div>
            <div class="glass-card" style="padding: 12px; border-color: var(--accent-emerald);">
              <div style="font-size: 0.8rem; color: var(--text-dim);">Compressed Size</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--accent-emerald);">${formatBytes(newSize)}</div>
            </div>
            <div class="glass-card" style="padding: 12px;">
              <div style="font-size: 0.8rem; color: var(--text-dim);">Reduction</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: ${isSmaller ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">
                ${isSmaller ? `-${reduction}%` : 'Optimal'}
              </div>
            </div>
          </div>
        `;
      }
      if (resultCard) resultCard.style.display = 'block';
      if (downloadBtn) {
        downloadBtn.style.display = 'inline-flex';
        downloadBtn.disabled = false;
      }
      progressFill.style.width = '100%';
      statusMsg.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 600;">✓ Compression Complete!</span> ${formatBytes(origSize)} ➔ ${formatBytes(newSize)}`;
      showToast('PDF compressed successfully!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to compress PDF.';
      showToast('Compression failed', 'error');
    } finally {
      compressBtn.disabled = false;
      clearBtn.disabled = false;
      progressBar.classList.remove('active');
    }
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!compressedBlob || !loadedFile) return;
      const baseName = loadedFile.name.replace(/\.[^/.]+$/, "");
      const outName = `${baseName}_compressed.pdf`;
      triggerDownload(compressedBlob, outName);
      showToast(`Downloaded ${outName}`, 'success');
    });
  }
})();
