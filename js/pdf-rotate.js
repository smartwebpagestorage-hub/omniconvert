/**
 * OmniConvert Studio - PDF Page Rotator Module
 * Supports 90°, 180°, 270° rotation per page or bulk rotate
 * Uses pdf-lib for lossless rotation saving
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedFile = null;
  let loadedArrayBuffer = null;
  let pageRotations = []; // Array of angles [0, 90, 180, 270...]

  const dropzone = document.getElementById('rotate-dropzone');
  const fileInput = document.getElementById('rotate-file');
  const fileInfo = document.getElementById('rotate-file-info');
  const previewGrid = document.getElementById('rotate-preview');
  const rotateCwAllBtn = document.getElementById('rotate-cw-all-btn');
  const rotateCcwAllBtn = document.getElementById('rotate-ccw-all-btn');
  const saveBtn = document.getElementById('rotate-save-btn');
  const clearBtn = document.getElementById('rotate-clear-btn');
  const statusMsg = document.getElementById('rotate-status');
  const progressBar = document.getElementById('rotate-progress');
  const progressFill = document.getElementById('rotate-progress-fill');

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
    pageRotations = [];
    fileInfo.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)} (${formatBytes(file.size)})`;
    fileInfo.style.display = 'block';
    previewGrid.innerHTML = '';
    statusMsg.innerHTML = '<span class="spinner"></span> Rendering page previews...';
    rotateCwAllBtn.disabled = true;
    rotateCcwAllBtn.disabled = true;
    saveBtn.disabled = true;
    clearBtn.disabled = false;
    progressBar.classList.add('active');
    progressFill.style.width = '10%';

    try {
      loadedArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: loadedArrayBuffer.slice(0) }).promise;
      const numPages = pdfDoc.numPages;

      for (let i = 1; i <= numPages; i++) {
        pageRotations.push(0);
        progressFill.style.width = `${Math.round((i / numPages) * 90)}%`;

        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Card UI
        const card = document.createElement('div');
        card.className = 'preview-item rotate-card';
        card.id = `rotate-card-${i - 1}`;

        const thumb = document.createElement('div');
        thumb.className = 'preview-thumb';
        thumb.style.position = 'relative';
        thumb.style.overflow = 'hidden';

        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/jpeg', 0.85);
        img.id = `rotate-img-${i - 1}`;
        img.style.transition = 'transform 0.3s ease';
        thumb.appendChild(img);

        const info = document.createElement('div');
        info.className = 'preview-info';
        info.innerHTML = `<span>Page ${i}</span><span id="rotate-deg-${i - 1}" class="brand-tag">0°</span>`;

        const actions = document.createElement('div');
        actions.className = 'preview-actions';

        const ccwBtn = document.createElement('button');
        ccwBtn.className = 'item-btn';
        ccwBtn.title = 'Rotate 90° Counter-Clockwise';
        ccwBtn.innerHTML = '↺';
        ccwBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          rotatePage(i - 1, -90);
        });

        const cwBtn = document.createElement('button');
        cwBtn.className = 'item-btn';
        cwBtn.title = 'Rotate 90° Clockwise';
        cwBtn.innerHTML = '↻';
        cwBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          rotatePage(i - 1, 90);
        });

        actions.appendChild(ccwBtn);
        actions.appendChild(cwBtn);
        info.appendChild(actions);

        card.appendChild(thumb);
        card.appendChild(info);
        previewGrid.appendChild(card);
      }

      rotateCwAllBtn.disabled = false;
      rotateCcwAllBtn.disabled = false;
      saveBtn.disabled = false;
      statusMsg.textContent = `Loaded ${numPages} pages. Rotate individual pages or all pages, then click "Save Rotated PDF".`;
      showToast(`Loaded ${numPages} pages`, 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to load PDF pages.';
      showToast('Error loading PDF', 'error');
    } finally {
      progressBar.classList.remove('active');
    }
  }

  function rotatePage(index, delta) {
    let newAngle = (pageRotations[index] + delta) % 360;
    if (newAngle < 0) newAngle += 360;
    pageRotations[index] = newAngle;

    const img = document.getElementById(`rotate-img-${index}`);
    const degBadge = document.getElementById(`rotate-deg-${index}`);
    if (img) img.style.transform = `rotate(${newAngle}deg)`;
    if (degBadge) degBadge.textContent = `${newAngle}°`;
  }

  rotateCwAllBtn.addEventListener('click', () => {
    for (let i = 0; i < pageRotations.length; i++) {
      rotatePage(i, 90);
    }
    showToast('Rotated all pages 90° CW', 'info');
  });

  rotateCcwAllBtn.addEventListener('click', () => {
    for (let i = 0; i < pageRotations.length; i++) {
      rotatePage(i, -90);
    }
    showToast('Rotated all pages 90° CCW', 'info');
  });

  clearBtn.addEventListener('click', () => {
    loadedFile = null;
    loadedArrayBuffer = null;
    pageRotations = [];
    fileInput.value = '';
    fileInfo.style.display = 'none';
    previewGrid.innerHTML = '';
    rotateCwAllBtn.disabled = true;
    rotateCcwAllBtn.disabled = true;
    saveBtn.disabled = true;
    clearBtn.disabled = true;
    statusMsg.textContent = 'Select a PDF above to begin.';
    showToast('Cleared', 'info');
  });

  saveBtn.addEventListener('click', async () => {
    if (!loadedArrayBuffer || !loadedFile) return;

    const { PDFDocument, degrees } = window.PDFLib || {};
    if (!PDFDocument) {
      showToast('PDF-Lib engine not ready', 'error');
      return;
    }

    saveBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '20%';
    statusMsg.innerHTML = '<span class="spinner"></span> Applying page rotations...';

    try {
      const pdfDoc = await PDFDocument.load(loadedArrayBuffer);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const delta = pageRotations[i] || 0;
        if (delta !== 0) {
          const currentRotation = pages[i].getRotation().angle;
          pages[i].setRotation(degrees((currentRotation + delta) % 360));
        }
      }

      progressFill.style.width = '80%';
      statusMsg.innerHTML = '<span class="spinner"></span> Saving rotated PDF...';

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const baseName = loadedFile.name.replace(/\.[^/.]+$/, "");
      const outName = `${baseName}_rotated.pdf`;
      triggerDownload(blob, outName);

      statusMsg.innerHTML = `<span style="color: var(--accent-emerald);">✓ Saved rotated PDF: ${outName}</span>`;
      showToast('Rotated PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to save rotated PDF.';
      showToast('Error saving PDF', 'error');
    } finally {
      saveBtn.disabled = false;
      progressBar.classList.remove('active');
    }
  });
})();
