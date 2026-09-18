/**
 * OmniConvert Studio - PDF Page Extractor Module
 * Extract specific pages or page ranges into a separate PDF
 * Uses pdf-lib for lossless page copying
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedFile = null;
  let loadedArrayBuffer = null;
  let totalPagesCount = 0;
  let selectedPages = new Set(); // Set of 0-based page indices

  const dropzone = document.getElementById('extract-dropzone');
  const fileInput = document.getElementById('extract-file');
  const fileInfo = document.getElementById('extract-file-info');
  const rangeInput = document.getElementById('extract-range-input');
  const previewGrid = document.getElementById('extract-preview');
  const selectAllBtn = document.getElementById('extract-all-btn');
  const deselectBtn = document.getElementById('extract-none-btn');
  const extractBtn = document.getElementById('extract-btn');
  const clearBtn = document.getElementById('extract-clear-btn');
  const statusMsg = document.getElementById('extract-status');
  const countBadge = document.getElementById('extract-badge');
  const progressBar = document.getElementById('extract-progress');
  const progressFill = document.getElementById('extract-progress-fill');

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
    selectedPages.clear();
    fileInfo.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)} (${formatBytes(file.size)})`;
    fileInfo.style.display = 'block';
    previewGrid.innerHTML = '';
    statusMsg.innerHTML = '<span class="spinner"></span> Rendering page previews...';
    extractBtn.disabled = true;
    selectAllBtn.disabled = true;
    deselectBtn.disabled = true;
    clearBtn.disabled = false;
    progressBar.classList.add('active');
    progressFill.style.width = '10%';

    try {
      loadedArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: loadedArrayBuffer.slice(0) }).promise;
      totalPagesCount = pdfDoc.numPages;

      for (let i = 1; i <= totalPagesCount; i++) {
        progressFill.style.width = `${Math.round((i / totalPagesCount) * 90)}%`;

        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.38 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const card = document.createElement('div');
        card.className = 'preview-item extract-card';
        card.id = `ext-card-${i - 1}`;
        card.style.cursor = 'pointer';

        const thumb = document.createElement('div');
        thumb.className = 'preview-thumb';
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/jpeg', 0.85);
        thumb.appendChild(img);

        const info = document.createElement('div');
        info.className = 'preview-info';
        info.innerHTML = `<span>Page ${i}</span><input type="checkbox" id="ext-cb-${i - 1}" style="pointer-events:none;">`;

        card.appendChild(thumb);
        card.appendChild(info);

        card.addEventListener('click', () => {
          togglePage(i - 1);
        });

        previewGrid.appendChild(card);
      }

      selectAllBtn.disabled = false;
      deselectBtn.disabled = false;
      updateUI();
      showToast(`Loaded ${totalPagesCount} pages`, 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to load PDF pages.';
      showToast('Error loading PDF', 'error');
    } finally {
      progressBar.classList.remove('active');
    }
  }

  function togglePage(index) {
    if (selectedPages.has(index)) {
      selectedPages.delete(index);
    } else {
      selectedPages.add(index);
    }
    syncRangeInput();
    updateUI();
  }

  function syncRangeInput() {
    if (!rangeInput) return;
    const sorted = Array.from(selectedPages).sort((a, b) => a - b).map(idx => idx + 1);
    rangeInput.value = sorted.join(', ');
  }

  if (rangeInput) {
    rangeInput.addEventListener('change', () => {
      parseRange(rangeInput.value);
    });
  }

  function parseRange(text) {
    selectedPages.clear();
    const parts = text.split(/[,;\s]+/).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.min(start, end); p <= Math.max(start, end); p++) {
            if (p >= 1 && p <= totalPagesCount) selectedPages.add(p - 1);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPagesCount) {
          selectedPages.add(p - 1);
        }
      }
    }
    updateUI();
  }

  function updateUI() {
    for (let i = 0; i < totalPagesCount; i++) {
      const cb = document.getElementById(`ext-cb-${i}`);
      const card = document.getElementById(`ext-card-${i}`);
      const isChecked = selectedPages.has(i);

      if (cb) cb.checked = isChecked;
      if (card) {
        if (isChecked) {
          card.style.border = '2px solid var(--primary)';
          card.style.background = 'rgba(99, 102, 241, 0.15)';
        } else {
          card.style.border = '';
          card.style.background = '';
        }
      }
    }

    const count = selectedPages.size;
    if (countBadge) countBadge.textContent = `${count} selected`;

    if (count > 0) {
      extractBtn.disabled = false;
      statusMsg.textContent = `${count} page(s) selected for extraction. Click "Extract Pages & Save PDF".`;
    } else {
      extractBtn.disabled = true;
      statusMsg.textContent = 'Select pages or enter page range to extract.';
    }
  }

  selectAllBtn.addEventListener('click', () => {
    selectedPages.clear();
    for (let i = 0; i < totalPagesCount; i++) selectedPages.add(i);
    syncRangeInput();
    updateUI();
  });

  deselectBtn.addEventListener('click', () => {
    selectedPages.clear();
    syncRangeInput();
    updateUI();
  });

  clearBtn.addEventListener('click', () => {
    loadedFile = null;
    loadedArrayBuffer = null;
    selectedPages.clear();
    fileInput.value = '';
    fileInfo.style.display = 'none';
    previewGrid.innerHTML = '';
    if (rangeInput) rangeInput.value = '';
    extractBtn.disabled = true;
    selectAllBtn.disabled = true;
    deselectBtn.disabled = true;
    clearBtn.disabled = true;
    if (countBadge) countBadge.textContent = '0 selected';
    statusMsg.textContent = 'Select a PDF above to begin.';
    showToast('Cleared', 'info');
  });

  extractBtn.addEventListener('click', async () => {
    if (!loadedArrayBuffer || !loadedFile || selectedPages.size === 0) return;

    const { PDFDocument } = window.PDFLib || {};
    if (!PDFDocument) {
      showToast('PDF-Lib engine not ready', 'error');
      return;
    }

    extractBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '20%';
    statusMsg.innerHTML = '<span class="spinner"></span> Extracting selected pages...';

    try {
      const srcDoc = await PDFDocument.load(loadedArrayBuffer);
      const newDoc = await PDFDocument.create();

      const sortedIndices = Array.from(selectedPages).sort((a, b) => a - b);
      const copiedPages = await newDoc.copyPages(srcDoc, sortedIndices);

      for (const page of copiedPages) {
        newDoc.addPage(page);
      }

      progressFill.style.width = '80%';
      statusMsg.innerHTML = '<span class="spinner"></span> Building extracted PDF...';

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const baseName = loadedFile.name.replace(/\.[^/.]+$/, "");
      const outName = `${baseName}_extracted.pdf`;
      triggerDownload(blob, outName);

      statusMsg.innerHTML = `<span style="color: var(--accent-emerald);">✓ Successfully extracted ${sortedIndices.length} page(s)!</span> Saved: ${outName}`;
      showToast('Extracted pages saved to new PDF!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to extract pages.';
      showToast('Error extracting pages', 'error');
    } finally {
      extractBtn.disabled = false;
      progressBar.classList.remove('active');
    }
  });
})();
