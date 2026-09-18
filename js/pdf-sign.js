/**
 * OmniConvert Studio - PDF Digital Signature Studio
 * Draw, type, or upload signature and stamp onto any PDF page
 * Uses pdf-lib for vector-accurate PNG embedding
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedFile = null;
  let loadedArrayBuffer = null;
  let loadedPdfDoc = null;
  let currentPdfPage = null;
  let signatureDataUrl = null;
  let signaturePlacement = { xPct: 0.5, yPct: 0.8, widthPct: 0.25 }; // Relative to page

  // Signature Pad Elements
  const sigCanvas = document.getElementById('sign-pad-canvas');
  const sigClearBtn = document.getElementById('sign-pad-clear');
  const sigTypeInput = document.getElementById('sign-type-input');
  const sigTypeBtn = document.getElementById('sign-type-apply');
  const sigUploadInput = document.getElementById('sign-upload-file');
  const sigPreviewImg = document.getElementById('sign-preview-img');

  // PDF Placement Elements
  const dropzone = document.getElementById('sign-dropzone');
  const fileInput = document.getElementById('sign-file');
  const fileInfo = document.getElementById('sign-file-info');
  const pageSelect = document.getElementById('sign-page-select');
  const docCanvas = document.getElementById('sign-doc-canvas');
  const applyBtn = document.getElementById('sign-apply-btn');
  const clearBtn = document.getElementById('sign-clear-btn');
  const statusMsg = document.getElementById('sign-status');
  const progressBar = document.getElementById('sign-progress');
  const progressFill = document.getElementById('sign-progress-fill');

  if (!sigCanvas || !dropzone) return;

  // Init Drawing Canvas
  const sigCtx = sigCanvas.getContext('2d');
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function initPad() {
    sigCtx.strokeStyle = '#1e293b';
    sigCtx.lineWidth = 2.5;
    sigCtx.lineCap = 'round';
    sigCtx.lineJoin = 'round';
  }
  initPad();

  function getPos(e) {
    const rect = sigCanvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const scaleX = sigCanvas.width / rect.width;
    const scaleY = sigCanvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDraw(e) {
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    e.preventDefault();
  }

  function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    sigCtx.beginPath();
    sigCtx.moveTo(lastX, lastY);
    sigCtx.lineTo(pos.x, pos.y);
    sigCtx.stroke();
    lastX = pos.x;
    lastY = pos.y;
    updateSigFromCanvas();
    e.preventDefault();
  }

  function stopDraw() {
    if (isDrawing) {
      isDrawing = false;
      updateSigFromCanvas();
    }
  }

  sigCanvas.addEventListener('mousedown', startDraw);
  sigCanvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDraw);

  sigCanvas.addEventListener('touchstart', startDraw, { passive: false });
  sigCanvas.addEventListener('touchmove', draw, { passive: false });
  window.addEventListener('touchend', stopDraw);

  sigClearBtn.addEventListener('click', () => {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    signatureDataUrl = null;
    if (sigPreviewImg) sigPreviewImg.style.display = 'none';
    renderDocPreview();
    showToast('Signature pad cleared', 'info');
  });

  function updateSigFromCanvas() {
    signatureDataUrl = sigCanvas.toDataURL('image/png');
    if (sigPreviewImg) {
      sigPreviewImg.src = signatureDataUrl;
      sigPreviewImg.style.display = 'block';
    }
    renderDocPreview();
  }

  // Type signature
  if (sigTypeBtn && sigTypeInput) {
    sigTypeBtn.addEventListener('click', () => {
      const text = sigTypeInput.value.trim();
      if (!text) return;

      sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
      sigCtx.font = 'italic 36px "Brush Script MT", cursive, sans-serif';
      sigCtx.fillStyle = '#0f172a';
      sigCtx.textAlign = 'center';
      sigCtx.textBaseline = 'middle';
      sigCtx.fillText(text, sigCanvas.width / 2, sigCanvas.height / 2);
      updateSigFromCanvas();
      showToast('Typed signature created', 'success');
    });
  }

  // Upload signature image
  if (sigUploadInput) {
    sigUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
          sigCtx.drawImage(img, 20, 20, sigCanvas.width - 40, sigCanvas.height - 40);
          updateSigFromCanvas();
          showToast('Signature image imported', 'success');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Setup PDF Document Dropzone
  setupDropzone(dropzone, fileInput, (files) => {
    const file = files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      loadPdf(file);
    } else {
      showToast('Please select a valid PDF file.', 'error');
    }
  });

  async function loadPdf(file) {
    loadedFile = file;
    fileInfo.innerHTML = `<strong>Document:</strong> ${escapeHtml(file.name)} (${formatBytes(file.size)})`;
    fileInfo.style.display = 'block';
    statusMsg.innerHTML = '<span class="spinner"></span> Reading PDF pages...';
    applyBtn.disabled = true;
    clearBtn.disabled = false;

    try {
      loadedArrayBuffer = await file.arrayBuffer();
      loadedPdfDoc = await pdfjsLib.getDocument({ data: loadedArrayBuffer.slice(0) }).promise;
      const total = loadedPdfDoc.numPages;

      pageSelect.innerHTML = '';
      for (let i = 1; i <= total; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Page ${i} of ${total}`;
        pageSelect.appendChild(opt);
      }
      pageSelect.value = 1;

      await loadPagePreview(1);
      applyBtn.disabled = false;
      statusMsg.textContent = `PDF loaded. Click anywhere on the document preview to position your signature, then click "Apply Signature & Save".`;
      showToast('PDF loaded for signing', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to load PDF.';
      showToast('Error reading PDF', 'error');
    }
  }

  pageSelect.addEventListener('change', () => {
    const pageNum = parseInt(pageSelect.value, 10) || 1;
    loadPagePreview(pageNum);
  });

  async function loadPagePreview(pageNum) {
    if (!loadedPdfDoc) return;
    currentPdfPage = await loadedPdfDoc.getPage(pageNum);
    await renderDocPreview();
  }

  async function renderDocPreview() {
    if (!currentPdfPage || !docCanvas) return;

    const viewport = currentPdfPage.getViewport({ scale: 0.6 });
    docCanvas.width = viewport.width;
    docCanvas.height = viewport.height;
    const ctx = docCanvas.getContext('2d');

    await currentPdfPage.render({ canvasContext: ctx, viewport }).promise;

    // Draw Signature Stamp at placement position if available
    if (signatureDataUrl) {
      const sigImg = new Image();
      sigImg.src = signatureDataUrl;
      await new Promise(r => { if (sigImg.complete) r(); else sigImg.onload = r; });

      const targetW = docCanvas.width * signaturePlacement.widthPct;
      const aspect = sigImg.width / sigImg.height;
      const targetH = targetW / aspect;

      const posX = docCanvas.width * signaturePlacement.xPct - (targetW / 2);
      const posY = docCanvas.height * signaturePlacement.yPct - (targetH / 2);

      // Stamp border highlight
      ctx.save();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(posX - 4, posY - 4, targetW + 8, targetH + 8);
      ctx.drawImage(sigImg, posX, posY, targetW, targetH);
      ctx.restore();
    }
  }

  // Click on PDF Preview Canvas to reposition signature
  if (docCanvas) {
    docCanvas.addEventListener('click', (e) => {
      const rect = docCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      signaturePlacement.xPct = Math.max(0.1, Math.min(0.9, clickX / rect.width));
      signaturePlacement.yPct = Math.max(0.1, Math.min(0.9, clickY / rect.height));

      renderDocPreview();
      showToast('Signature position updated', 'info');
    });
  }

  clearBtn.addEventListener('click', () => {
    loadedFile = null;
    loadedArrayBuffer = null;
    loadedPdfDoc = null;
    currentPdfPage = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    if (docCanvas) {
      const ctx = docCanvas.getContext('2d');
      ctx.clearRect(0, 0, docCanvas.width, docCanvas.height);
    }
    applyBtn.disabled = true;
    clearBtn.disabled = true;
    statusMsg.textContent = 'Upload a PDF above to begin.';
    showToast('Cleared', 'info');
  });

  applyBtn.addEventListener('click', async () => {
    if (!loadedArrayBuffer || !loadedFile || !signatureDataUrl) {
      showToast('Please create a signature and upload a PDF first.', 'warning');
      return;
    }

    const { PDFDocument } = window.PDFLib || {};
    if (!PDFDocument) {
      showToast('PDF-Lib engine not ready', 'error');
      return;
    }

    applyBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '20%';
    statusMsg.innerHTML = '<span class="spinner"></span> Embedding digital signature into PDF...';

    try {
      const pdfDoc = await PDFDocument.load(loadedArrayBuffer);
      const targetPageNum = parseInt(pageSelect.value, 10) || 1;
      const page = pdfDoc.getPages()[targetPageNum - 1];
      const { width, height } = page.getSize();

      // Convert DataURL to PNG bytes
      const base64Data = signatureDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const pngBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        pngBytes[i] = binaryString.charCodeAt(i);
      }

      const pngImage = await pdfDoc.embedPng(pngBytes);
      const sigAspect = pngImage.width / pngImage.height;

      const stampWidth = width * signaturePlacement.widthPct;
      const stampHeight = stampWidth / sigAspect;

      // Note: PDF coordinate (0,0) is bottom-left, while canvas (0,0) is top-left
      const stampX = width * signaturePlacement.xPct - (stampWidth / 2);
      const stampY = height - (height * signaturePlacement.yPct) - (stampHeight / 2);

      page.drawImage(pngImage, {
        x: stampX,
        y: stampY,
        width: stampWidth,
        height: stampHeight,
      });

      progressFill.style.width = '85%';
      statusMsg.innerHTML = '<span class="spinner"></span> Saving signed PDF...';

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const baseName = loadedFile.name.replace(/\.[^/.]+$/, "");
      const outName = `${baseName}_signed.pdf`;
      triggerDownload(blob, outName);

      statusMsg.innerHTML = `<span style="color: var(--accent-emerald);">✓ Signed page ${targetPageNum} successfully!</span> Saved: ${outName}`;
      showToast('Signed PDF downloaded!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to apply signature.';
      showToast('Error applying signature', 'error');
    } finally {
      applyBtn.disabled = false;
      progressBar.classList.remove('active');
    }
  });
})();
