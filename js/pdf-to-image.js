/**
 * OmniConvert Studio - PDF to Image Converter Module
 */

(function() {
  let loadedPdfDoc = null;
  let pdfFileName = 'document';
  let renderedPages = []; // Array of { pageNum, canvas }

  const dropzone = document.getElementById('pdf-to-img-dropzone');
  const fileInput = document.getElementById('pdf-to-img-file');
  const formatSelect = document.getElementById('pdf-to-img-format');
  const scaleSelect = document.getElementById('pdf-to-img-scale');
  const qualityGroup = document.getElementById('pdf-to-img-quality-group');
  const qualitySlider = document.getElementById('pdf-to-img-quality');
  const qualityVal = document.getElementById('pdf-to-img-quality-val');
  const convertBtn = document.getElementById('pdf-to-img-convert-btn');
  const downloadAllBtn = document.getElementById('pdf-to-img-download-all-btn');
  const previewContainer = document.getElementById('pdf-to-img-preview');
  const statusMsg = document.getElementById('pdf-to-img-status');
  const progressBar = document.getElementById('pdf-to-img-progress');
  const progressFill = document.getElementById('pdf-to-img-progress-fill');
  const fileInfoEl = document.getElementById('pdf-to-img-file-info');

  if (!dropzone) return;

  // Toggle JPEG quality slider visibility
  formatSelect.addEventListener('change', () => {
    if (formatSelect.value === 'image/jpeg' || formatSelect.value === 'image/webp') {
      qualityGroup.style.display = 'block';
    } else {
      qualityGroup.style.display = 'none';
    }
  });

  qualitySlider.addEventListener('input', (e) => {
    qualityVal.textContent = `${Math.round(e.target.value * 100)}%`;
  });

  // Setup Drag & Drop
  setupDropzone(dropzone, fileInput, (files) => {
    const file = files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      loadPdfFile(file);
    } else {
      showToast('Please select a valid PDF file.', 'error');
    }
  });

  async function loadPdfFile(file) {
    pdfFileName = file.name.replace(/\.[^/.]+$/, "");
    fileInfoEl.innerHTML = `<strong>Selected:</strong> ${file.name} (${formatBytes(file.size)})`;
    fileInfoEl.style.display = 'block';

    statusMsg.innerHTML = '<span class="spinner"></span> Reading PDF document...';
    convertBtn.disabled = true;
    downloadAllBtn.disabled = true;
    previewContainer.innerHTML = '';
    renderedPages = [];

    try {
      const arrayBuffer = await file.arrayBuffer();
      loadedPdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      statusMsg.textContent = `Loaded "${file.name}" with ${loadedPdfDoc.numPages} page(s). Click "Convert Pages" to process.`;
      convertBtn.disabled = false;
      showToast(`PDF loaded successfully (${loadedPdfDoc.numPages} pages)`, 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Failed to read PDF. The file may be corrupted or password-protected.';
      showToast('Failed to load PDF file', 'error');
    }
  }

  // Convert button clicked
  convertBtn.addEventListener('click', async () => {
    if (!loadedPdfDoc) return;

    convertBtn.disabled = true;
    downloadAllBtn.disabled = true;
    previewContainer.innerHTML = '';
    renderedPages = [];

    const scale = parseFloat(scaleSelect.value) || 2.0;
    const format = formatSelect.value;
    const quality = parseFloat(qualitySlider.value) || 0.92;
    const totalPages = loadedPdfDoc.numPages;

    progressBar.classList.add('active');
    progressFill.style.width = '0%';

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      statusMsg.innerHTML = `<span class="spinner"></span> Rendering page ${pageNum} of ${totalPages}...`;
      progressFill.style.width = `${Math.round((pageNum / totalPages) * 100)}%`;

      const page = await loadedPdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      renderedPages.push({ pageNum, canvas });
      appendPageCard(pageNum, canvas, format, quality);
    }

    progressBar.classList.remove('active');
    statusMsg.textContent = `Completed! ${totalPages} page(s) converted successfully.`;
    convertBtn.disabled = false;
    downloadAllBtn.disabled = false;
    showToast(`Converted all ${totalPages} pages`, 'success');
  });

  function appendPageCard(pageNum, canvas, format, quality) {
    const ext = format === 'image/jpeg' ? 'jpg' : (format === 'image/webp' ? 'webp' : 'png');
    
    const card = document.createElement('div');
    card.className = 'preview-item';

    const thumb = document.createElement('div');
    thumb.className = 'preview-thumb';
    
    // Create miniature view
    const miniImg = document.createElement('img');
    miniImg.src = canvas.toDataURL(format, quality);
    thumb.appendChild(miniImg);

    const info = document.createElement('div');
    info.className = 'preview-info';
    info.innerHTML = `<span>Page ${pageNum}</span>`;

    const actions = document.createElement('div');
    actions.className = 'preview-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'item-btn';
    downloadBtn.title = `Download Page ${pageNum}`;
    downloadBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    downloadBtn.addEventListener('click', () => {
      canvas.toBlob((blob) => {
        triggerDownload(blob, `${pdfFileName}_page_${pageNum}.${ext}`);
      }, format, quality);
    });

    actions.appendChild(downloadBtn);
    info.appendChild(actions);

    card.appendChild(thumb);
    card.appendChild(info);
    previewContainer.appendChild(card);
  }

  // Batch download all as ZIP
  downloadAllBtn.addEventListener('click', async () => {
    if (renderedPages.length === 0) return;

    if (!window.JSZip) {
      showToast('Zip library not loaded.', 'error');
      return;
    }

    downloadAllBtn.disabled = true;
    statusMsg.innerHTML = '<span class="spinner"></span> Packing pages into ZIP archive...';
    progressBar.classList.add('active');
    progressFill.style.width = '30%';

    const zip = new JSZip();
    const format = formatSelect.value;
    const ext = format === 'image/jpeg' ? 'jpg' : (format === 'image/webp' ? 'webp' : 'png');
    const quality = parseFloat(qualitySlider.value) || 0.92;

    for (let i = 0; i < renderedPages.length; i++) {
      const { pageNum, canvas } = renderedPages[i];
      const blob = await new Promise(resolve => canvas.toBlob(resolve, format, quality));
      zip.file(`${pdfFileName}_page_${pageNum}.${ext}`, blob);
    }

    progressFill.style.width = '80%';
    const zipContent = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipContent, `${pdfFileName}_images.zip`);

    progressFill.style.width = '100%';
    setTimeout(() => progressBar.classList.remove('active'), 500);
    statusMsg.textContent = 'ZIP download initiated!';
    downloadAllBtn.disabled = false;
    showToast('Downloaded all pages as ZIP!', 'success');
  });

})();
