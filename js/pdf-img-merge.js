/**
 * OmniConvert Studio - PDF & Image Combined Merger Module
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let combinedItems = []; // Array of { id, type: 'image'|'pdf-page', title, dataUrl, width, height, rawPdfBytes, pageIndex }
  let itemCounter = 0;

  const dropzone = document.getElementById('pdf-img-merge-dropzone');
  const fileInput = document.getElementById('pdf-img-merge-file');
  const previewContainer = document.getElementById('pdf-img-merge-preview');
  const countBadge = document.getElementById('pdf-img-merge-count');
  const pageSizeSelect = document.getElementById('pdf-img-merge-size');
  const filenameInput = document.getElementById('pdf-img-merge-filename');
  const mergeBtn = document.getElementById('pdf-img-merge-btn');
  const clearBtn = document.getElementById('pdf-img-merge-clear-btn');
  const statusMsg = document.getElementById('pdf-img-merge-status');
  const progressBar = document.getElementById('pdf-img-merge-progress');
  const progressFill = document.getElementById('pdf-img-merge-progress-fill');

  if (!dropzone) return;

  setupDropzone(dropzone, fileInput, (files) => {
    handleFiles(Array.from(files));
  });

  async function handleFiles(files) {
    statusMsg.innerHTML = `<span class="spinner"></span> Processing ${files.length} file(s)...`;

    for (const file of files) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // Extract pages from PDF
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

          for (let p = 1; p <= pdfDoc.numPages; p++) {
            const page = await pdfDoc.getPage(p);
            const viewport = page.getViewport({ scale: 1.0 });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            combinedItems.push({
              id: ++itemCounter,
              type: 'pdf-page',
              title: `${file.name} (p.${p})`,
              dataUrl: canvas.toDataURL('image/jpeg', 0.92),
              width: viewport.width,
              height: viewport.height
            });
          }
        } catch (err) {
          console.error(err);
          showToast(`Could not read PDF: ${file.name}`, 'error');
        }
      } else if (file.type.startsWith('image/')) {
        // Image
        const dataUrl = await readFileDataUrl(file);
        const dims = await getImageDims(dataUrl);

        combinedItems.push({
          id: ++itemCounter,
          type: 'image',
          title: file.name,
          dataUrl: dataUrl,
          width: dims.width,
          height: dims.height
        });
      }
    }

    renderItems();
    updateStatus();
    showToast(`Added items. Total pages: ${combinedItems.length}`, 'success');
  }

  function readFileDataUrl(file) {
    return new Promise(res => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.readAsDataURL(file);
    });
  }

  function getImageDims(dataUrl) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = dataUrl;
    });
  }

  function updateStatus() {
    const total = combinedItems.length;
    countBadge.textContent = `${total} ${total === 1 ? 'page' : 'pages'}`;
    mergeBtn.disabled = total === 0;
    clearBtn.disabled = total === 0;
    statusMsg.textContent = total > 0 
      ? `Ready to merge ${total} page(s) and image(s).` 
      : 'Select or drop PDFs and Images above to begin.';
  }

  function renderItems() {
    previewContainer.innerHTML = '';

    combinedItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'preview-item';

      const thumb = document.createElement('div');
      thumb.className = 'preview-thumb';
      const img = document.createElement('img');
      img.src = item.dataUrl;
      thumb.appendChild(img);

      const info = document.createElement('div');
      info.className = 'preview-info';
      info.innerHTML = `<span>#${index + 1} ${item.type === 'pdf-page' ? '📄' : '🖼️'}</span>`;

      const actions = document.createElement('div');
      actions.className = 'preview-actions';

      // Move Prev
      if (index > 0) {
        const upBtn = document.createElement('button');
        upBtn.className = 'item-btn';
        upBtn.title = 'Move Left';
        upBtn.innerHTML = '←';
        upBtn.addEventListener('click', () => {
          const t = combinedItems[index - 1];
          combinedItems[index - 1] = combinedItems[index];
          combinedItems[index] = t;
          renderItems();
        });
        actions.appendChild(upBtn);
      }

      // Move Next
      if (index < combinedItems.length - 1) {
        const downBtn = document.createElement('button');
        downBtn.className = 'item-btn';
        downBtn.title = 'Move Right';
        downBtn.innerHTML = '→';
        downBtn.addEventListener('click', () => {
          const t = combinedItems[index + 1];
          combinedItems[index + 1] = combinedItems[index];
          combinedItems[index] = t;
          renderItems();
        });
        actions.appendChild(downBtn);
      }

      // Delete
      const delBtn = document.createElement('button');
      delBtn.className = 'item-btn btn-remove';
      delBtn.title = 'Remove';
      delBtn.innerHTML = '✕';
      delBtn.addEventListener('click', () => {
        combinedItems = combinedItems.filter(i => i.id !== item.id);
        renderItems();
        updateStatus();
      });
      actions.appendChild(delBtn);

      info.appendChild(actions);
      card.appendChild(thumb);
      card.appendChild(info);
      previewContainer.appendChild(card);
    });
  }

  const targetSizeSelect = document.getElementById('pdf-img-merge-target-size');
  const customSizeInput = document.getElementById('pdf-img-merge-custom-size');
  const customSizeGroup = document.getElementById('pdf-img-merge-custom-size-group');

  if (targetSizeSelect) {
    targetSizeSelect.addEventListener('change', () => {
      if (targetSizeSelect.value === 'custom') {
        customSizeGroup.style.display = 'block';
      } else {
        customSizeGroup.style.display = 'none';
      }
    });
  }

  // Clear
  clearBtn.addEventListener('click', () => {
    combinedItems = [];
    renderItems();
    updateStatus();
    showToast('Cleared all items', 'info');
  });

  // Merge Clicked
  mergeBtn.addEventListener('click', async () => {
    if (combinedItems.length === 0) return;

    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      showToast('PDF library not ready.', 'error');
      return;
    }

    mergeBtn.disabled = true;
    progressBar.classList.add('active');
    progressFill.style.width = '10%';
    statusMsg.innerHTML = '<span class="spinner"></span> Compiling unified PDF...';

    const pageSize = pageSizeSelect.value || 'a4';
    const finalFilename = (filenameInput.value.trim() || 'merged_document') + '.pdf';
    const total = combinedItems.length;

    // Calculate target file size budget
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
      ? Math.floor((targetMaxBytes * 0.86) / total) 
      : 0;

    let pdf = null;

    for (let i = 0; i < total; i++) {
      const item = combinedItems[i];
      progressFill.style.width = `${Math.round(((i + 1) / total) * 90)}%`;
      statusMsg.innerHTML = `<span class="spinner"></span> Adding page ${i + 1} of ${total}...`;

      let imgData = item.dataUrl;
      let itemWidth = item.width;
      let itemHeight = item.height;

      if (perPageBudget > 0) {
        const imgObj = new Image();
        imgObj.src = item.dataUrl;
        await new Promise(r => { if (imgObj.complete) r(); else imgObj.onload = r; });
        const comp = await adaptiveCompressImage(imgObj, perPageBudget);
        imgData = comp.dataUrl;
        itemWidth = comp.width;
        itemHeight = comp.height;
      }

      const aspect = itemWidth / itemHeight;
      let orientation = aspect >= 1 ? 'l' : 'p';
      let pageFormat = pageSize;

      if (pageSize === 'fit') {
        const scale = 0.264583;
        pageFormat = [itemWidth * scale, itemHeight * scale];
        orientation = itemWidth >= itemHeight ? 'l' : 'p';
      }

      if (i === 0) {
        pdf = new jsPDF({ orientation, unit: 'mm', format: pageFormat });
      } else {
        pdf.addPage(pageFormat, orientation);
      }

      const pW = pdf.internal.pageSize.getWidth();
      const pH = pdf.internal.pageSize.getHeight();

      // Fit with aspect ratio
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

      pdf.addImage(imgData, 'JPEG', x, y, rW, rH, undefined, 'FAST');
    }

    progressFill.style.width = '100%';
    const pdfBlob = pdf.output('blob');
    triggerDownload(pdfBlob, finalFilename);

    setTimeout(() => progressBar.classList.remove('active'), 500);
    mergeBtn.disabled = false;

    const sizeInfo = targetMaxBytes > 0 
      ? `Final Size: ${formatBytes(pdfBlob.size)} (Target: Max ${formatBytes(targetMaxBytes)})` 
      : `Final Size: ${formatBytes(pdfBlob.size)}`;

    statusMsg.textContent = `Merged PDF saved as "${finalFilename}"! ${sizeInfo}`;
    showToast(`Merged PDF created! ${sizeInfo}`, 'success');
  });

})();
