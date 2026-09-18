/**
 * OmniConvert Studio - Image to PDF Module
 */

(function() {
  let imagesList = []; // Array of { id, file, dataUrl, width, height, name, size }
  let idCounter = 0;

  const dropzone = document.getElementById('img-to-pdf-dropzone');
  const fileInput = document.getElementById('img-to-pdf-file');
  const pageSizeSelect = document.getElementById('img-to-pdf-size');
  const orientationSelect = document.getElementById('img-to-pdf-orientation');
  const marginSelect = document.getElementById('img-to-pdf-margin');
  const imageFitSelect = document.getElementById('img-to-pdf-fit');
  const filenameInput = document.getElementById('img-to-pdf-filename');
  const generateBtn = document.getElementById('img-to-pdf-generate-btn');
  const clearBtn = document.getElementById('img-to-pdf-clear-btn');
  const previewContainer = document.getElementById('img-to-pdf-preview');
  const countBadge = document.getElementById('img-to-pdf-count');
  const statusMsg = document.getElementById('img-to-pdf-status');
  const progressBar = document.getElementById('img-to-pdf-progress');
  const progressFill = document.getElementById('img-to-pdf-progress-fill');

  if (!dropzone) return;

  setupDropzone(dropzone, fileInput, (files) => {
    handleIncomingFiles(Array.from(files));
  });

  async function handleIncomingFiles(files) {
    const validImageFiles = files.filter(f => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) {
      showToast('Please select image files (PNG, JPG, WebP, etc.)', 'error');
      return;
    }

    statusMsg.innerHTML = `<span class="spinner"></span> Loading ${validImageFiles.length} image(s)...`;

    for (const file of validImageFiles) {
      const dataUrl = await readFileAsDataURL(file);
      const dimensions = await getImageDimensions(dataUrl);

      imagesList.push({
        id: ++idCounter,
        file,
        dataUrl,
        width: dimensions.width,
        height: dimensions.height,
        name: file.name,
        size: file.size
      });
    }

    renderThumbnails();
    updateUIState();
    statusMsg.textContent = `Ready! ${imagesList.length} image(s) queued for PDF compilation.`;
    showToast(`Added ${validImageFiles.length} image(s)`, 'success');
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  function getImageDimensions(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = dataUrl;
    });
  }

  function updateUIState() {
    const count = imagesList.length;
    countBadge.textContent = `${count} ${count === 1 ? 'image' : 'images'}`;
    generateBtn.disabled = count === 0;
    clearBtn.disabled = count === 0;
  }

  function renderThumbnails() {
    previewContainer.innerHTML = '';

    imagesList.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'preview-item';

      const thumb = document.createElement('div');
      thumb.className = 'preview-thumb';
      const img = document.createElement('img');
      img.src = item.dataUrl;
      thumb.appendChild(img);

      const info = document.createElement('div');
      info.className = 'preview-info';
      info.innerHTML = `<span>#${index + 1}</span>`;

      const actions = document.createElement('div');
      actions.className = 'preview-actions';

      // Move Prev
      if (index > 0) {
        const upBtn = document.createElement('button');
        upBtn.className = 'item-btn';
        upBtn.title = 'Move Left';
        upBtn.innerHTML = '←';
        upBtn.addEventListener('click', () => {
          const temp = imagesList[index - 1];
          imagesList[index - 1] = imagesList[index];
          imagesList[index] = temp;
          renderThumbnails();
        });
        actions.appendChild(upBtn);
      }

      // Move Next
      if (index < imagesList.length - 1) {
        const downBtn = document.createElement('button');
        downBtn.className = 'item-btn';
        downBtn.title = 'Move Right';
        downBtn.innerHTML = '→';
        downBtn.addEventListener('click', () => {
          const temp = imagesList[index + 1];
          imagesList[index + 1] = imagesList[index];
          imagesList[index] = temp;
          renderThumbnails();
        });
        actions.appendChild(downBtn);
      }

      // Delete
      const delBtn = document.createElement('button');
      delBtn.className = 'item-btn btn-remove';
      delBtn.title = 'Remove Image';
      delBtn.innerHTML = '✕';
      delBtn.addEventListener('click', () => {
        imagesList = imagesList.filter(imgItem => imgItem.id !== item.id);
        renderThumbnails();
        updateUIState();
      });
      actions.appendChild(delBtn);

      info.appendChild(actions);
      card.appendChild(thumb);
      card.appendChild(info);
      previewContainer.appendChild(card);
    });
  }

  // Clear button
  clearBtn.addEventListener('click', () => {
    imagesList = [];
    renderThumbnails();
    updateUIState();
    statusMsg.textContent = 'Queue cleared.';
    showToast('Images cleared', 'info');
  });

  const targetSizeSelect = document.getElementById('img-to-pdf-target-size');
  const customSizeInput = document.getElementById('img-to-pdf-custom-size');
  const customSizeGroup = document.getElementById('img-to-pdf-custom-size-group');

  if (targetSizeSelect) {
    targetSizeSelect.addEventListener('change', () => {
      if (targetSizeSelect.value === 'custom') {
        customSizeGroup.style.display = 'block';
      } else {
        customSizeGroup.style.display = 'none';
      }
    });
  }

  // Generate PDF
  generateBtn.addEventListener('click', async () => {
    if (imagesList.length === 0) return;

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      showToast('PDF generator library not loaded.', 'error');
      return;
    }

    generateBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '10%';
    statusMsg.innerHTML = '<span class="spinner"></span> Building PDF document...';

    const pageSizeSetting = pageSizeSelect.value; // 'a4', 'letter', 'fit'
    const orientationSetting = orientationSelect.value; // 'auto', 'p', 'l'
    const marginSetting = parseInt(marginSelect.value, 10) || 0; // mm
    const fitSetting = imageFitSelect.value; // 'fit', 'fill'

    // Determine target size budget
    let targetMaxBytes = 0;
    if (targetSizeSelect) {
      if (targetSizeSelect.value === 'custom') {
        const valMb = parseFloat(customSizeInput.value) || 2;
        targetMaxBytes = Math.round(valMb * 1024 * 1024);
      } else {
        const valKb = parseInt(targetSizeSelect.value, 10) || 0;
        targetMaxBytes = valKb * 1024;
      }
    }

    const perPageBudget = targetMaxBytes > 0 
      ? Math.floor((targetMaxBytes * 0.86) / imagesList.length) 
      : 0;

    let pdf = null;

    for (let i = 0; i < imagesList.length; i++) {
      const item = imagesList[i];
      statusMsg.innerHTML = `<span class="spinner"></span> Processing image ${i + 1} of ${imagesList.length}...`;
      progressFill.style.width = `${Math.round(((i + 1) / imagesList.length) * 90)}%`;

      let imgData = item.dataUrl;
      let imgWidthPx = item.width;
      let imgHeightPx = item.height;

      // Apply target compression budget if enabled
      if (perPageBudget > 0) {
        const imgObj = new Image();
        imgObj.src = item.dataUrl;
        await new Promise(r => { if (imgObj.complete) r(); else imgObj.onload = r; });
        const comp = await adaptiveCompressImage(imgObj, perPageBudget);
        imgData = comp.dataUrl;
        imgWidthPx = comp.width;
        imgHeightPx = comp.height;
      }

      const imgAspect = imgWidthPx / imgHeightPx;

      let pageFormat = pageSizeSetting;
      let orientation = orientationSetting;

      if (orientation === 'auto') {
        orientation = imgAspect >= 1 ? 'l' : 'p';
      }

      // Standard millimeter page sizes
      const PAGE_SIZES = {
        a4: { p: [210, 297], l: [297, 210] },
        letter: { p: [215.9, 279.4], l: [279.4, 215.9] }
      };

      let pageWidthMm, pageHeightMm;

      if (pageFormat === 'fit') {
        const scaleFactor = 0.264583;
        pageWidthMm = imgWidthPx * scaleFactor;
        pageHeightMm = imgHeightPx * scaleFactor;
        orientation = pageWidthMm >= pageHeightMm ? 'l' : 'p';
        pageFormat = [pageWidthMm, pageHeightMm];
      } else {
        const dims = PAGE_SIZES[pageFormat][orientation];
        pageWidthMm = dims[0];
        pageHeightMm = dims[1];
      }

      if (i === 0) {
        pdf = new jsPDF({
          orientation: orientation,
          unit: 'mm',
          format: pageFormat
        });
      } else {
        pdf.addPage(pageFormat, orientation);
      }

      // Compute image position on page considering margins and fit
      const availableWidth = Math.max(10, pageWidthMm - (marginSetting * 2));
      const availableHeight = Math.max(10, pageHeightMm - (marginSetting * 2));

      let renderWidth = availableWidth;
      let renderHeight = availableHeight;
      let posX = marginSetting;
      let posY = marginSetting;

      if (fitSetting === 'fit') {
        const availableAspect = availableWidth / availableHeight;
        if (imgAspect > availableAspect) {
          renderWidth = availableWidth;
          renderHeight = availableWidth / imgAspect;
          posY = marginSetting + ((availableHeight - renderHeight) / 2);
        } else {
          renderHeight = availableHeight;
          renderWidth = availableHeight * imgAspect;
          posX = marginSetting + ((availableWidth - renderWidth) / 2);
        }
      }

      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
    }

    progressFill.style.width = '100%';
    const finalName = (filenameInput.value.trim() || 'compiled_document') + '.pdf';
    
    // Check actual PDF size
    const pdfBlob = pdf.output('blob');
    triggerDownload(pdfBlob, finalName);

    setTimeout(() => progressBar.classList.remove('active'), 500);
    generateBtn.disabled = false;
    
    const sizeInfo = targetMaxBytes > 0 
      ? `Final Size: ${formatBytes(pdfBlob.size)} (Target: Max ${formatBytes(targetMaxBytes)})` 
      : `Final Size: ${formatBytes(pdfBlob.size)}`;

    statusMsg.textContent = `PDF "${finalName}" saved! ${sizeInfo}`;
    showToast(`PDF generated! ${sizeInfo}`, 'success');
  });

})();
