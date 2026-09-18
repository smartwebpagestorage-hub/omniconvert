/**
 * OmniConvert Studio - PDF Watermark Studio
 * Add custom text or image watermarks with angle, opacity, and live preview
 * Uses pdf-lib for vector stamping
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedFile = null;
  let loadedArrayBuffer = null;
  let watermarkImageBytes = null;
  let previewPdfPage = null;

  const dropzone = document.getElementById('watermark-dropzone');
  const fileInput = document.getElementById('watermark-file');
  const fileInfo = document.getElementById('watermark-file-info');
  const textInput = document.getElementById('watermark-text');
  const presetSelect = document.getElementById('watermark-preset');
  const opacitySlider = document.getElementById('watermark-opacity');
  const opacityVal = document.getElementById('watermark-opacity-val');
  const angleSlider = document.getElementById('watermark-angle');
  const angleVal = document.getElementById('watermark-angle-val');
  const sizeSlider = document.getElementById('watermark-size');
  const sizeVal = document.getElementById('watermark-size-val');
  const colorSelect = document.getElementById('watermark-color');
  const applyBtn = document.getElementById('watermark-apply-btn');
  const clearBtn = document.getElementById('watermark-clear-btn');
  const previewCanvas = document.getElementById('watermark-preview-canvas');
  const statusMsg = document.getElementById('watermark-status');
  const progressBar = document.getElementById('watermark-progress');
  const progressFill = document.getElementById('watermark-progress-fill');

  if (!dropzone) return;

  presetSelect.addEventListener('change', () => {
    if (presetSelect.value !== 'custom') {
      textInput.value = presetSelect.value;
      updatePreview();
    }
  });

  textInput.addEventListener('input', updatePreview);
  colorSelect.addEventListener('change', updatePreview);

  opacitySlider.addEventListener('input', (e) => {
    opacityVal.textContent = `${Math.round(e.target.value * 100)}%`;
    updatePreview();
  });

  angleSlider.addEventListener('input', (e) => {
    angleVal.textContent = `${e.target.value}°`;
    updatePreview();
  });

  sizeSlider.addEventListener('input', (e) => {
    sizeVal.textContent = `${e.target.value}px`;
    updatePreview();
  });

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
    statusMsg.innerHTML = '<span class="spinner"></span> Rendering live preview...';
    applyBtn.disabled = true;
    clearBtn.disabled = false;

    try {
      loadedArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: loadedArrayBuffer.slice(0) }).promise;
      previewPdfPage = await pdfDoc.getPage(1);
      await updatePreview();
      applyBtn.disabled = false;
      statusMsg.textContent = `Loaded "${file.name}" (${pdfDoc.numPages} pages). Adjust settings and click "Apply Watermark".`;
      showToast('PDF loaded for watermarking', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to load PDF.';
      showToast('Error reading PDF', 'error');
    }
  }

  async function updatePreview() {
    if (!previewPdfPage || !previewCanvas) return;

    const viewport = previewPdfPage.getViewport({ scale: 0.55 });
    previewCanvas.width = viewport.width;
    previewCanvas.height = viewport.height;
    const ctx = previewCanvas.getContext('2d');

    await previewPdfPage.render({ canvasContext: ctx, viewport }).promise;

    // Draw Watermark Overlay on Canvas
    const text = textInput.value || 'CONFIDENTIAL';
    const opacity = parseFloat(opacitySlider.value) || 0.3;
    const angle = (parseFloat(angleSlider.value) || 45) * Math.PI / 180;
    const fontSize = (parseInt(sizeSlider.value, 10) || 50) * 0.55;
    const color = colorSelect.value || '#ef4444';

    ctx.save();
    ctx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
    ctx.rotate(-angle);
    ctx.globalAlpha = opacity;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  clearBtn.addEventListener('click', () => {
    loadedFile = null;
    loadedArrayBuffer = null;
    previewPdfPage = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    if (previewCanvas) {
      const ctx = previewCanvas.getContext('2d');
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }
    applyBtn.disabled = true;
    clearBtn.disabled = true;
    statusMsg.textContent = 'Upload a PDF above to begin.';
    showToast('Cleared', 'info');
  });

  applyBtn.addEventListener('click', async () => {
    if (!loadedArrayBuffer || !loadedFile) return;

    const { PDFDocument, StandardFonts, rgb, degrees } = window.PDFLib || {};
    if (!PDFDocument) {
      showToast('PDF-Lib engine not ready', 'error');
      return;
    }

    applyBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '15%';
    statusMsg.innerHTML = '<span class="spinner"></span> Applying watermark to all pages...';

    try {
      const pdfDoc = await PDFDocument.load(loadedArrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();
      const text = textInput.value.trim() || 'CONFIDENTIAL';
      const opacity = parseFloat(opacitySlider.value) || 0.3;
      const angleDeg = parseFloat(angleSlider.value) || 45;
      const fontSize = parseInt(sizeSlider.value, 10) || 50;

      // Color mapping
      let r = 0.8, g = 0.2, b = 0.2;
      if (colorSelect.value === '#3b82f6') { r = 0.23; g = 0.51; b = 0.96; }
      else if (colorSelect.value === '#64748b') { r = 0.39; g = 0.45; b = 0.55; }
      else if (colorSelect.value === '#000000') { r = 0; g = 0; b = 0; }

      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // Calculate center placement taking rotation into account
        const x = (width - textWidth) / 2;
        const y = (height - textHeight) / 2;

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(angleDeg),
        });

        progressFill.style.width = `${Math.round(((i + 1) / pages.length) * 80)}%`;
      }

      progressFill.style.width = '90%';
      statusMsg.innerHTML = '<span class="spinner"></span> Generating watermarked PDF...';

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const baseName = loadedFile.name.replace(/\.[^/.]+$/, "");
      const outName = `${baseName}_watermarked.pdf`;
      triggerDownload(blob, outName);

      statusMsg.innerHTML = `<span style="color: var(--accent-emerald);">✓ Successfully watermarked ${pages.length} pages!</span> Saved: ${outName}`;
      showToast('Watermarked PDF downloaded!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to apply watermark.';
      showToast('Error applying watermark', 'error');
    } finally {
      applyBtn.disabled = false;
      progressBar.classList.remove('active');
    }
  });
})();
