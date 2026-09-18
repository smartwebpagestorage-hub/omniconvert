/**
 * OmniConvert Studio - PDF Page Deleter Module
 * Select and remove unwanted pages from any PDF visually
 * Uses pdf-lib for clean lossless page removal
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedFile = null;
  let loadedArrayBuffer = null;
  let totalPagesCount = 0;
  let markedForDeletion = new Set(); // Set of 0-based page indices

  const dropzone = document.getElementById('delete-pages-dropzone');
  const fileInput = document.getElementById('delete-pages-file');
  const fileInfo = document.getElementById('delete-pages-file-info');
  const previewGrid = document.getElementById('delete-pages-preview');
  const selectAllBtn = document.getElementById('delete-pages-all-btn');
  const deselectBtn = document.getElementById('delete-pages-none-btn');
  const saveBtn = document.getElementById('delete-pages-save-btn');
  const clearBtn = document.getElementById('delete-pages-clear-btn');
  const statusMsg = document.getElementById('delete-pages-status');
  const countBadge = document.getElementById('delete-pages-badge');
  const progressBar = document.getElementById('delete-pages-progress');
  const progressFill = document.getElementById('delete-pages-progress-fill');

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
    markedForDeletion.clear();
    fileInfo.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)} (${formatBytes(file.size)})`;
    fileInfo.style.display = 'block';
    previewGrid.innerHTML = '';
    statusMsg.innerHTML = '<span class="spinner"></span> Rendering page previews...';
    saveBtn.disabled = true;
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
        card.className = 'preview-item delete-card';
        card.id = `del-card-${i - 1}`;
        card.style.cursor = 'pointer';
        card.style.position = 'relative';

        const thumb = document.createElement('div');
        thumb.className = 'preview-thumb';
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/jpeg', 0.85);
        thumb.appendChild(img);

        // Delete overlay
        const overlay = document.createElement('div');
        overlay.className = 'delete-overlay';
        overlay.id = `del-overlay-${i - 1}`;
        overlay.innerHTML = '<span style="font-size: 1.5rem;">🗑️</span><span>REMOVE</span>';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(239, 68, 68, 0.75)';
        overlay.style.color = '#ffffff';
        overlay.style.display = 'none';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.fontWeight = 'bold';
        overlay.style.borderRadius = 'var(--radius-sm)';
        card.appendChild(overlay);

        const info = document.createElement('div');
        info.className = 'preview-info';
        info.innerHTML = `<span>Page ${i}</span><span id="del-status-${i - 1}" class="brand-tag">Keep</span>`;

        card.appendChild(thumb);
        card.appendChild(info);

        card.addEventListener('click', () => {
          toggleDeletePage(i - 1);
        });

        previewGrid.appendChild(card);
      }

      saveBtn.disabled = true;
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

  function toggleDeletePage(index) {
    if (markedForDeletion.has(index)) {
      markedForDeletion.delete(index);
    } else {
      markedForDeletion.add(index);
    }
    updateUI();
  }

  function updateUI() {
    for (let i = 0; i < totalPagesCount; i++) {
      const overlay = document.getElementById(`del-overlay-${i}`);
      const statusBadge = document.getElementById(`del-status-${i}`);
      const card = document.getElementById(`del-card-${i}`);

      if (markedForDeletion.has(i)) {
        if (overlay) overlay.style.display = 'flex';
        if (statusBadge) {
          statusBadge.textContent = 'Delete';
          statusBadge.style.background = 'rgba(239, 68, 68, 0.3)';
          statusBadge.style.color = '#f87171';
        }
        if (card) card.style.border = '2px solid var(--accent-rose)';
      } else {
        if (overlay) overlay.style.display = 'none';
        if (statusBadge) {
          statusBadge.textContent = 'Keep';
          statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
          statusBadge.style.color = '#34d399';
        }
        if (card) card.style.border = '';
      }
    }

    const count = markedForDeletion.size;
    if (countBadge) countBadge.textContent = `${count} marked for removal`;

    if (count > 0 && count < totalPagesCount) {
      saveBtn.disabled = false;
      statusMsg.textContent = `${count} page(s) marked for removal. Click "Remove Pages & Save PDF" to proceed.`;
    } else if (count === totalPagesCount) {
      saveBtn.disabled = true;
      statusMsg.textContent = 'Cannot delete all pages in a document. Keep at least 1 page.';
    } else {
      saveBtn.disabled = true;
      statusMsg.textContent = 'Click pages above to select them for deletion.';
    }
  }

  selectAllBtn.addEventListener('click', () => {
    // Select all except the first page to prevent empty doc
    markedForDeletion.clear();
    for (let i = 1; i < totalPagesCount; i++) {
      markedForDeletion.add(i);
    }
    updateUI();
  });

  deselectBtn.addEventListener('click', () => {
    markedForDeletion.clear();
    updateUI();
  });

  clearBtn.addEventListener('click', () => {
    loadedFile = null;
    loadedArrayBuffer = null;
    markedForDeletion.clear();
    fileInput.value = '';
    fileInfo.style.display = 'none';
    previewGrid.innerHTML = '';
    saveBtn.disabled = true;
    selectAllBtn.disabled = true;
    deselectBtn.disabled = true;
    clearBtn.disabled = true;
    if (countBadge) countBadge.textContent = '0 marked';
    statusMsg.textContent = 'Select a PDF above to begin.';
    showToast('Cleared', 'info');
  });

  saveBtn.addEventListener('click', async () => {
    if (!loadedArrayBuffer || !loadedFile || markedForDeletion.size === 0) return;

    const { PDFDocument } = window.PDFLib || {};
    if (!PDFDocument) {
      showToast('PDF-Lib engine not ready', 'error');
      return;
    }

    saveBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '20%';
    statusMsg.innerHTML = '<span class="spinner"></span> Removing selected pages...';

    try {
      const pdfDoc = await PDFDocument.load(loadedArrayBuffer);

      // Sort indices descending to remove from back to front without index shifting!
      const sortedIndices = Array.from(markedForDeletion).sort((a, b) => b - a);
      for (const idx of sortedIndices) {
        pdfDoc.removePage(idx);
      }

      progressFill.style.width = '80%';
      statusMsg.innerHTML = '<span class="spinner"></span> Generating updated PDF...';

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const baseName = loadedFile.name.replace(/\.[^/.]+$/, "");
      const outName = `${baseName}_deleted_pages.pdf`;
      triggerDownload(blob, outName);

      statusMsg.innerHTML = `<span style="color: var(--accent-emerald);">✓ Successfully removed ${sortedIndices.length} page(s)!</span> Saved: ${outName}`;
      showToast('Pages deleted and new PDF downloaded!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to remove pages.';
      showToast('Error removing pages', 'error');
    } finally {
      saveBtn.disabled = false;
      progressBar.classList.remove('active');
    }
  });
})();
