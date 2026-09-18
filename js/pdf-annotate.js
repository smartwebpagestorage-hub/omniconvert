/**
 * OmniConvert Studio - PDF Annotate & Redact Studio
 * Blackout sensitive data (redaction), highlight, and draw onto PDF pages
 * Uses canvas & pdf-lib to permanently bake annotations
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedFile = null;
  let loadedPdfDoc = null;
  let currentPageIndex = 1;
  let currentViewport = null;
  let pageCanvases = {}; // Cache rendered base canvases
  let pageDrawings = {}; // Cache overlay drawings per page { pageNum: canvas }

  let currentTool = 'redact'; // 'redact', 'highlight', 'pen'
  let isDrawing = false;
  let startX = 0, startY = 0;

  const dropzone = document.getElementById('annotate-dropzone');
  const fileInput = document.getElementById('annotate-file');
  const fileInfo = document.getElementById('annotate-file-info');
  const pageSelect = document.getElementById('annotate-page-select');
  const toolRedactBtn = document.getElementById('annotate-tool-redact');
  const toolHighlightBtn = document.getElementById('annotate-tool-highlight');
  const toolPenBtn = document.getElementById('annotate-tool-pen');
  const clearCurrentBtn = document.getElementById('annotate-clear-page-btn');
  const saveBtn = document.getElementById('annotate-save-btn');
  const clearAllBtn = document.getElementById('annotate-clear-all-btn');
  const canvasContainer = document.getElementById('annotate-canvas-container');
  const baseCanvas = document.getElementById('annotate-base-canvas');
  const drawCanvas = document.getElementById('annotate-draw-canvas');
  const statusMsg = document.getElementById('annotate-status');
  const progressBar = document.getElementById('annotate-progress');
  const progressFill = document.getElementById('annotate-progress-fill');

  if (!dropzone || !drawCanvas) return;

  const drawCtx = drawCanvas.getContext('2d');

  function setTool(tool) {
    currentTool = tool;
    [toolRedactBtn, toolHighlightBtn, toolPenBtn].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (tool === 'redact' && toolRedactBtn) toolRedactBtn.classList.add('active');
    if (tool === 'highlight' && toolHighlightBtn) toolHighlightBtn.classList.add('active');
    if (tool === 'pen' && toolPenBtn) toolPenBtn.classList.add('active');
  }

  if (toolRedactBtn) toolRedactBtn.addEventListener('click', () => setTool('redact'));
  if (toolHighlightBtn) toolHighlightBtn.addEventListener('click', () => setTool('highlight'));
  if (toolPenBtn) toolPenBtn.addEventListener('click', () => setTool('pen'));

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
    pageCanvases = {};
    pageDrawings = {};
    currentPageIndex = 1;
    fileInfo.innerHTML = `<strong>Document:</strong> ${escapeHtml(file.name)} (${formatBytes(file.size)})`;
    fileInfo.style.display = 'block';
    statusMsg.innerHTML = '<span class="spinner"></span> Loading document pages...';
    saveBtn.disabled = true;
    clearAllBtn.disabled = false;

    try {
      const buffer = await file.arrayBuffer();
      loadedPdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
      const total = loadedPdfDoc.numPages;

      pageSelect.innerHTML = '';
      for (let i = 1; i <= total; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Page ${i} of ${total}`;
        pageSelect.appendChild(opt);
      }
      pageSelect.value = 1;

      await renderPage(1);
      saveBtn.disabled = false;
      statusMsg.textContent = `Loaded ${total} pages. Select a tool (Redact/Highlight/Pen) and drag over the page to blackout or annotate.`;
      showToast('PDF loaded for annotation & redaction', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to load PDF.';
      showToast('Error reading PDF', 'error');
    }
  }

  pageSelect.addEventListener('change', async () => {
    saveCurrentDrawing();
    currentPageIndex = parseInt(pageSelect.value, 10) || 1;
    await renderPage(currentPageIndex);
  });

  function saveCurrentDrawing() {
    if (!drawCanvas.width || !drawCanvas.height) return;
    const cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = drawCanvas.width;
    cacheCanvas.height = drawCanvas.height;
    const ctx = cacheCanvas.getContext('2d');
    ctx.drawImage(drawCanvas, 0, 0);
    pageDrawings[currentPageIndex] = cacheCanvas;
  }

  async function renderPage(pageNum) {
    if (!loadedPdfDoc) return;

    const page = await loadedPdfDoc.getPage(pageNum);
    currentViewport = page.getViewport({ scale: 1.0 });

    baseCanvas.width = currentViewport.width;
    baseCanvas.height = currentViewport.height;
    drawCanvas.width = currentViewport.width;
    drawCanvas.height = currentViewport.height;

    const baseCtx = baseCanvas.getContext('2d');
    await page.render({ canvasContext: baseCtx, viewport: currentViewport }).promise;

    // Restore cached drawing for this page if exists
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    if (pageDrawings[pageNum]) {
      drawCtx.drawImage(pageDrawings[pageNum], 0, 0);
    }
  }

  function getMousePos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = drawCanvas.width / rect.width;
    const scaleY = drawCanvas.height / rect.height;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  let snapshot = null;

  drawCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = getMousePos(e);
    startX = pos.x;
    startY = pos.y;

    if (currentTool === 'pen') {
      drawCtx.beginPath();
      drawCtx.moveTo(startX, startY);
      drawCtx.strokeStyle = '#ef4444';
      drawCtx.lineWidth = 3;
      drawCtx.lineCap = 'round';
    } else {
      snapshot = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    }
  });

  drawCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);

    if (currentTool === 'pen') {
      drawCtx.lineTo(pos.x, pos.y);
      drawCtx.stroke();
    } else {
      drawCtx.putImageData(snapshot, 0, 0);
      const w = pos.x - startX;
      const h = pos.y - startY;

      if (currentTool === 'redact') {
        drawCtx.fillStyle = '#000000';
        drawCtx.fillRect(startX, startY, w, h);
      } else if (currentTool === 'highlight') {
        drawCtx.fillStyle = 'rgba(253, 224, 71, 0.4)';
        drawCtx.fillRect(startX, startY, w, h);
      }
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDrawing) {
      isDrawing = false;
      saveCurrentDrawing();
    }
  });

  clearCurrentBtn.addEventListener('click', () => {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    delete pageDrawings[currentPageIndex];
    showToast(`Cleared annotations on Page ${currentPageIndex}`, 'info');
  });

  clearAllBtn.addEventListener('click', () => {
    loadedFile = null;
    loadedPdfDoc = null;
    pageDrawings = {};
    pageCanvases = {};
    fileInput.value = '';
    fileInfo.style.display = 'none';
    const bCtx = baseCanvas.getContext('2d');
    bCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    saveBtn.disabled = true;
    clearAllBtn.disabled = true;
    statusMsg.textContent = 'Upload a PDF above to begin.';
    showToast('Cleared', 'info');
  });

  saveBtn.addEventListener('click', async () => {
    if (!loadedPdfDoc || !loadedFile) return;

    saveCurrentDrawing();

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      showToast('PDF generator library not ready.', 'error');
      return;
    }

    saveBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '10%';
    statusMsg.innerHTML = '<span class="spinner"></span> Burning annotations and redacting document...';

    const total = loadedPdfDoc.numPages;

    try {
      let outDoc = null;

      for (let i = 1; i <= total; i++) {
        progressFill.style.width = `${Math.round((i / total) * 85)}%`;
        statusMsg.innerHTML = `<span class="spinner"></span> Processing page ${i} of ${total}...`;

        const page = await loadedPdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const mergedCanvas = document.createElement('canvas');
        mergedCanvas.width = viewport.width;
        mergedCanvas.height = viewport.height;
        const mCtx = mergedCanvas.getContext('2d');

        // Draw original page
        await page.render({ canvasContext: mCtx, viewport }).promise;

        // Overlay drawings/redactions if present
        if (pageDrawings[i]) {
          mCtx.drawImage(pageDrawings[i], 0, 0, mergedCanvas.width, mergedCanvas.height);
        }

        const imgData = mergedCanvas.toDataURL('image/jpeg', 0.92);
        const aspect = mergedCanvas.width / mergedCanvas.height;
        const orientation = aspect >= 1 ? 'l' : 'p';

        if (i === 1) {
          outDoc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
        } else {
          outDoc.addPage('a4', orientation);
        }

        const pW = outDoc.internal.pageSize.getWidth();
        const pH = outDoc.internal.pageSize.getHeight();
        const pageAspect = pW / pH;
        let rW = pW, rH = pH, x = 0, y = 0;

        if (aspect > pageAspect) {
          rH = pW / aspect;
          y = (pH - rH) / 2;
        } else {
          rW = pH * aspect;
          x = (pW - rW) / 2;
        }

        outDoc.addImage(imgData, 'JPEG', x, y, rW, rH, undefined, 'FAST');
      }

      const blob = outDoc.output('blob');
      const baseName = loadedFile.name.replace(/\.[^/.]+$/, "");
      const outName = `${baseName}_annotated.pdf`;
      triggerDownload(blob, outName);

      statusMsg.innerHTML = `<span style="color: var(--accent-emerald);">✓ Successfully saved annotated document!</span> Downloaded: ${outName}`;
      showToast('Annotated & redacted PDF downloaded!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to save annotated PDF.';
      showToast('Error saving PDF', 'error');
    } finally {
      saveBtn.disabled = false;
      progressBar.classList.remove('active');
    }
  });
})();
