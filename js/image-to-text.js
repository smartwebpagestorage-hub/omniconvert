/**
 * OmniConvert Studio - Image to Text Module (In-Browser OCR)
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const dropzone = document.getElementById('img-to-txt-dropzone');
  const fileInput = document.getElementById('img-to-txt-file');
  const outputEditor = document.getElementById('img-to-txt-output');
  const previewImg = document.getElementById('img-to-txt-img-preview');
  const previewContainer = document.getElementById('img-to-txt-preview-container');
  const copyBtn = document.getElementById('img-to-txt-copy-btn');
  const downloadBtn = document.getElementById('img-to-txt-download-btn') || document.getElementById('img-to-txt-dl-btn');
  const clearBtn = document.getElementById('img-to-txt-clear-btn');
  const statusMsg = document.getElementById('img-to-txt-status');
  const progressBar = document.getElementById('img-to-txt-progress');
  const progressFill = document.getElementById('img-to-txt-progress-fill');
  const wordCountEl = document.getElementById('img-to-txt-words');
  const charCountEl = document.getElementById('img-to-txt-chars');

  let currentImageName = 'image_text';

  if (!dropzone) return;

  setupDropzone(dropzone, fileInput, (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      processImageOcr(file);
    } else {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
    }
  });

  async function processImageOcr(file) {
    currentImageName = file.name.replace(/\.[^/.]+$/, "");
    
    // Show image preview if container exists
    if (previewImg && previewContainer) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }

    if (!window.Tesseract) {
      if (statusMsg) statusMsg.textContent = 'OCR library is loading or network is unavailable.';
      showToast('Tesseract OCR library unavailable', 'error');
      return;
    }

    if (outputEditor) outputEditor.value = '';
    updateStats(0, 0);
    if (progressBar) progressBar.classList.add('active');
    if (progressFill) progressFill.style.width = '0%';
    if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Initializing OCR worker...';

    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              const pct = Math.round(m.progress * 100);
              if (progressFill) progressFill.style.width = `${pct}%`;
              if (statusMsg) statusMsg.innerHTML = `<span class="spinner"></span> Recognizing text: ${pct}%...`;
            } else {
              if (statusMsg) statusMsg.textContent = `${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`;
            }
          }
        }
      );

      const text = result.data.text.trim();
      if (outputEditor) outputEditor.value = text;

      const words = text ? text.split(/\s+/).length : 0;
      const chars = text.length;
      updateStats(words, chars);

      if (progressFill) progressFill.style.width = '100%';
      if (progressBar) setTimeout(() => progressBar.classList.remove('active'), 500);
      if (statusMsg) statusMsg.textContent = `OCR complete! Extracted ${words} word(s).`;
      showToast(`OCR finished successfully!`, 'success');

      if (copyBtn) copyBtn.disabled = false;
      if (downloadBtn) downloadBtn.disabled = false;
    } catch (err) {
      console.error('OCR error:', err);
      if (progressBar) progressBar.classList.remove('active');
      if (statusMsg) statusMsg.textContent = 'Failed to recognize text from this image.';
      showToast('OCR recognition failed: ' + (err.message || err), 'error');
    }
  }

  function updateStats(words, chars) {
    if (wordCountEl) wordCountEl.textContent = words.toLocaleString();
    if (charCountEl) charCountEl.textContent = chars.toLocaleString();
  }

  // Copy
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = outputEditor ? outputEditor.value : '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied OCR text to clipboard!', 'success');
      } catch (e) {
        if (outputEditor) {
          outputEditor.select();
          document.execCommand('copy');
          showToast('Copied OCR text to clipboard!', 'success');
        }
      }
    });
  }

  // Download
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const text = outputEditor ? outputEditor.value : '';
      if (!text) return;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      triggerDownload(blob, `${currentImageName}_ocr.txt`);
      showToast('Downloaded OCR text file', 'success');
    });
  }

  // Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (outputEditor) outputEditor.value = '';
      if (previewImg) previewImg.src = '';
      if (previewContainer) previewContainer.style.display = 'none';
      updateStats(0, 0);
      if (copyBtn) copyBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      if (statusMsg) statusMsg.textContent = 'Upload an image to start OCR.';
      showToast('Cleared OCR data', 'info');
    });
  }

})();
