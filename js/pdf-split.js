/**
 * OmniConvert Studio - PDF Page Split Module
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedPdfBytes = null;
  let loadedPdfDoc = null;
  let pdfFileName = 'document';

  const dropzone = document.getElementById('pdf-split-dropzone');
  const fileInput = document.getElementById('pdf-split-file');
  const modeSelect = document.getElementById('pdf-split-mode');
  const rangeGroup = document.getElementById('pdf-split-range-group');
  const rangeInput = document.getElementById('pdf-split-range');
  const splitBtn = document.getElementById('pdf-split-btn');
  const previewContainer = document.getElementById('pdf-split-preview');
  const statusMsg = document.getElementById('pdf-split-status');
  const progressBar = document.getElementById('pdf-split-progress');
  const progressFill = document.getElementById('pdf-split-progress-fill');
  const fileInfoEl = document.getElementById('pdf-split-file-info');

  if (!dropzone) return;

  if (modeSelect) {
    modeSelect.addEventListener('change', () => {
      if (rangeGroup) {
        rangeGroup.style.display = (modeSelect.value === 'range') ? 'block' : 'none';
      }
    });
  }

  setupDropzone(dropzone, fileInput, (files) => {
    const file = files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      loadPdf(file);
    } else {
      showToast('Please select a valid PDF file.', 'error');
    }
  });

  async function loadPdf(file) {
    pdfFileName = file.name.replace(/\.[^/.]+$/, "");
    if (fileInfoEl) {
      fileInfoEl.innerHTML = `<strong>Selected:</strong> ${file.name} (${formatBytes(file.size)})`;
      fileInfoEl.style.display = 'block';
    }

    if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Loading PDF pages...';
    if (splitBtn) splitBtn.disabled = true;
    if (previewContainer) previewContainer.innerHTML = '';

    try {
      const rawBuffer = await file.arrayBuffer();
      // Keep a permanent pristine clone so worker transfer cannot detach it
      loadedPdfBytes = rawBuffer.slice(0);

      // Pass a separate sliced Uint8Array to pdfjsLib so worker transfer only detaches the throwaway copy
      loadedPdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(rawBuffer.slice(0)) }).promise;
      const totalPages = loadedPdfDoc.numPages;

      if (statusMsg) statusMsg.textContent = `Loaded "${file.name}" with ${totalPages} page(s). Rendering thumbnails...`;

      // Render thumbnail preview of all pages
      if (previewContainer) {
        for (let p = 1; p <= totalPages; p++) {
          const page = await loadedPdfDoc.getPage(p);
          const viewport = page.getViewport({ scale: 0.3 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;

          const item = document.createElement('div');
          item.className = 'preview-item';
          const thumb = document.createElement('div');
          thumb.className = 'preview-thumb';
          thumb.appendChild(canvas);
          const info = document.createElement('div');
          info.className = 'preview-info';
          info.innerHTML = `<span>Page ${p}</span>`;

          item.appendChild(thumb);
          item.appendChild(info);
          previewContainer.appendChild(item);
        }
      }

      if (splitBtn) splitBtn.disabled = false;
      if (statusMsg) statusMsg.textContent = `Ready! Document has ${totalPages} page(s). Choose split mode and click Split PDF.`;
      showToast(`Loaded ${totalPages} pages`, 'success');
    } catch (err) {
      console.error('loadPdf error:', err);
      if (statusMsg) statusMsg.textContent = 'Failed to read PDF file.';
      showToast('Error reading PDF: ' + (err.message || err), 'error');
    }
  }

  // Parse page range string (e.g. "1-3, 5, 8-10") into zero-based indices
  function parsePageRange(str, maxPages) {
    const indices = new Set();
    const parts = str.split(',');

    for (let part of parts) {
      part = part.trim();
      if (!part) continue;

      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (!isNaN(start) && !isNaN(end)) {
          const s = Math.max(1, Math.min(start, end));
          const e = Math.min(maxPages, Math.max(start, end));
          for (let i = s; i <= e; i++) {
            indices.add(i - 1);
          }
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          indices.add(pageNum - 1);
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  }

  // Split Clicked
  if (splitBtn) {
    splitBtn.addEventListener('click', async () => {
      if (!loadedPdfBytes || !window.PDFLib) {
        showToast('PDF-lib is not available or no PDF loaded.', 'error');
        return;
      }

      splitBtn.disabled = true;
      if (progressBar) progressBar.classList.add('active');
      if (progressFill) progressFill.style.width = '10%';
      if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Processing split...';

      try {
        const { PDFDocument } = window.PDFLib;
        // Pass fresh slice so loadedPdfBytes is never mutated or detached
        const srcDoc = await PDFDocument.load(loadedPdfBytes.slice(0));
        const totalPages = srcDoc.getPageCount();
        const mode = modeSelect ? modeSelect.value : 'all';

        if (mode === 'all') {
          // Separate each page into its own PDF and bundle in a ZIP
          if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Creating individual PDF pages...';
          const zip = new JSZip();

          for (let i = 0; i < totalPages; i++) {
            if (progressFill) progressFill.style.width = `${Math.round(((i + 1) / totalPages) * 80)}%`;
            const singleDoc = await PDFDocument.create();
            const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
            singleDoc.addPage(copiedPage);
            const singleBytes = await singleDoc.save();
            zip.file(`${pdfFileName}_page_${i + 1}.pdf`, singleBytes);
          }

          if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Bundling ZIP archive...';
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          triggerDownload(zipBlob, `${pdfFileName}_split_pages.zip`);

          showToast(`Extracted all ${totalPages} pages into ZIP!`, 'success');
        } else {
          // Custom range extraction
          const rangeText = (rangeInput ? rangeInput.value.trim() : '') || `1-${totalPages}`;
          const pageIndices = parsePageRange(rangeText, totalPages);

          if (pageIndices.length === 0) {
            showToast('Invalid page range entered.', 'error');
            splitBtn.disabled = false;
            if (progressBar) progressBar.classList.remove('active');
            return;
          }

          if (statusMsg) statusMsg.innerHTML = `<span class="spinner"></span> Extracting ${pageIndices.length} page(s)...`;
          const newDoc = await PDFDocument.create();
          const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
          copiedPages.forEach(p => newDoc.addPage(p));

          const newPdfBytes = await newDoc.save();
          const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
          triggerDownload(blob, `${pdfFileName}_extracted.pdf`);

          showToast(`Extracted ${pageIndices.length} page(s) successfully!`, 'success');
        }

        if (progressFill) progressFill.style.width = '100%';
        if (progressBar) setTimeout(() => progressBar.classList.remove('active'), 500);
        if (statusMsg) statusMsg.textContent = 'Split completed successfully!';
      } catch (err) {
        console.error('Split error:', err);
        showToast('Error during PDF split: ' + (err.message || err), 'error');
        if (statusMsg) statusMsg.textContent = 'Error during PDF split.';
      } finally {
        splitBtn.disabled = false;
      }
    });
  }

})();
