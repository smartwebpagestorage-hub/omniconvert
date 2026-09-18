/**
 * OmniConvert Studio - Image Format Converter & Compressor Module
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let images = [];

  const dropzone = document.getElementById('img-conv-dropzone');
  const fileInput = document.getElementById('img-conv-file');
  const formatSelect = document.getElementById('img-conv-format');
  const qualitySlider = document.getElementById('img-conv-quality');
  const qualityVal = document.getElementById('img-conv-quality-val');
  const convertBtn = document.getElementById('img-conv-btn');
  const downloadAllBtn = document.getElementById('img-conv-dl-all-btn');
  const clearBtn = document.getElementById('img-conv-clear-btn');
  const previewContainer = document.getElementById('img-conv-preview');
  const statusMsg = document.getElementById('img-conv-status');

  let convertedBlobs = [];

  if (!dropzone) return;

  qualitySlider.addEventListener('input', (e) => {
    qualityVal.textContent = `${Math.round(e.target.value * 100)}%`;
  });

  setupDropzone(dropzone, fileInput, (files) => {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (list.length === 0) {
      showToast('Please select valid image files.', 'error');
      return;
    }

    images = list;
    convertBtn.disabled = false;
    clearBtn.disabled = false;
    statusMsg.textContent = `${images.length} image(s) loaded. Choose format & quality and click Convert Images.`;
    showToast(`Loaded ${images.length} images`, 'success');
  });

  clearBtn.addEventListener('click', () => {
    images = [];
    convertedBlobs = [];
    previewContainer.innerHTML = '';
    convertBtn.disabled = true;
    downloadAllBtn.disabled = true;
    clearBtn.disabled = true;
    statusMsg.textContent = 'Upload images above to start converting.';
    showToast('Cleared images', 'info');
  });

  const targetSizeSelect = document.getElementById('img-conv-target-size');
  const customSizeInput = document.getElementById('img-conv-custom-size');
  const customSizeGroup = document.getElementById('img-conv-custom-size-group');

  if (targetSizeSelect) {
    targetSizeSelect.addEventListener('change', () => {
      if (targetSizeSelect.value === 'custom') {
        customSizeGroup.style.display = 'block';
      } else {
        customSizeGroup.style.display = 'none';
      }
    });
  }

  convertBtn.addEventListener('click', async () => {
    if (images.length === 0) return;

    convertBtn.disabled = true;
    previewContainer.innerHTML = '';
    convertedBlobs = [];
    statusMsg.innerHTML = '<span class="spinner"></span> Converting images...';

    const targetFormat = formatSelect.value;
    const ext = targetFormat === 'image/jpeg' ? 'jpg' : (targetFormat === 'image/webp' ? 'webp' : 'png');
    const quality = parseFloat(qualitySlider.value) || 0.9;

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

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const img = await loadImage(file);

      let blob;
      if (targetMaxBytes > 0) {
        const comp = await adaptiveCompressImage(img, targetMaxBytes);
        blob = comp.blob;
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        blob = await new Promise(res => canvas.toBlob(res, targetFormat, quality));
      }

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const newName = `${baseName}_converted.${ext}`;

      convertedBlobs.push({ name: newName, blob });

      // Thumbnail card
      const card = document.createElement('div');
      card.className = 'preview-item';
      const thumb = document.createElement('div');
      thumb.className = 'preview-thumb';
      const thumbImg = document.createElement('img');
      thumbImg.src = URL.createObjectURL(blob);
      thumb.appendChild(thumbImg);

      const info = document.createElement('div');
      info.className = 'preview-info';
      info.innerHTML = `<span>${formatBytes(blob.size)}</span>`;

      const actions = document.createElement('div');
      actions.className = 'preview-actions';
      const dlBtn = document.createElement('button');
      dlBtn.className = 'item-btn';
      dlBtn.title = 'Download';
      dlBtn.innerHTML = '↓';
      dlBtn.addEventListener('click', () => triggerDownload(blob, newName));
      actions.appendChild(dlBtn);
      info.appendChild(actions);

      card.appendChild(thumb);
      card.appendChild(info);
      previewContainer.appendChild(card);
    }

    convertBtn.disabled = false;
    downloadAllBtn.disabled = false;
    statusMsg.textContent = `Converted ${convertedBlobs.length} images successfully!`;
    showToast(`Converted ${convertedBlobs.length} images!`, 'success');
  });

  function loadImage(file) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = URL.createObjectURL(file);
    });
  }

  downloadAllBtn.addEventListener('click', async () => {
    if (convertedBlobs.length === 0 || !window.JSZip) return;

    downloadAllBtn.disabled = true;
    statusMsg.innerHTML = '<span class="spinner"></span> Bundling ZIP archive...';

    const zip = new JSZip();
    convertedBlobs.forEach(item => {
      zip.file(item.name, item.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, 'converted_images.zip');

    downloadAllBtn.disabled = false;
    statusMsg.textContent = 'ZIP download initiated!';
    showToast('Downloaded converted images as ZIP!', 'success');
  });

})();
