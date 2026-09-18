/**
 * OmniConvert Studio - Batch File Renamer Module
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const dropzone = document.getElementById('renamer-dropzone');
  const fileInput = document.getElementById('renamer-file');
  const fileCountEl = document.getElementById('renamer-count');
  const prefixInput = document.getElementById('renamer-prefix');
  const suffixInput = document.getElementById('renamer-suffix');
  const findInput = document.getElementById('renamer-find');
  const replaceInput = document.getElementById('renamer-replace');
  const numDigitsSelect = document.getElementById('renamer-digits');
  const numStartInput = document.getElementById('renamer-start');
  const addDateToggle = document.getElementById('renamer-add-date');
  const previewContainer = document.getElementById('renamer-preview-table');
  const downloadZipBtn = document.getElementById('renamer-dl-zip-btn');
  const clearBtn = document.getElementById('renamer-clear-btn');
  const statusMsg = document.getElementById('renamer-status');

  let uploadedFiles = [];

  if (!dropzone) return;

  setupDropzone(dropzone, fileInput, (files) => {
    if (files.length > 0) {
      uploadedFiles = Array.from(files);
      if (fileCountEl) fileCountEl.textContent = `${uploadedFiles.length} files`;
      updateRenamedList();
      if (downloadZipBtn) downloadZipBtn.disabled = false;
      if (clearBtn) clearBtn.disabled = false;
      if (statusMsg) statusMsg.textContent = `Loaded ${uploadedFiles.length} files. Configure renaming rules above.`;
      showToast(`Selected ${uploadedFiles.length} files for batch renaming!`, 'success');
    }
  });

  [prefixInput, suffixInput, findInput, replaceInput, numDigitsSelect, numStartInput, addDateToggle].forEach(el => {
    if (el) el.addEventListener('input', updateRenamedList);
    if (el && el.type === 'checkbox') el.addEventListener('change', updateRenamedList);
  });

  function computeNewName(origName, index) {
    const ext = origName.includes('.') ? '.' + origName.split('.').pop() : '';
    let base = origName.replace(/\.[^/.]+$/, "");

    const findText = findInput ? findInput.value : '';
    const replaceText = replaceInput ? replaceInput.value : '';
    if (findText) {
      base = base.split(findText).join(replaceText);
    }

    const prefix = prefixInput ? prefixInput.value : '';
    const suffix = suffixInput ? suffixInput.value : '';

    const digits = parseInt(numDigitsSelect ? numDigitsSelect.value : '2', 10) || 2;
    const startNum = parseInt(numStartInput ? numStartInput.value : '1', 10) || 1;
    const numSeq = (startNum + index).toString().padStart(digits, '0');

    let datePart = '';
    if (addDateToggle && addDateToggle.checked) {
      const today = new Date().toISOString().split('T')[0];
      datePart = `_${today}`;
    }

    if (prefix || suffix || digits > 0 || datePart) {
      return `${prefix}${base}${datePart}_${numSeq}${suffix}${ext}`;
    }

    return origName;
  }

  function updateRenamedList() {
    if (!previewContainer) return;
    if (uploadedFiles.length === 0) {
      previewContainer.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-dim);">No files uploaded yet. Drop files above.</div>';
      return;
    }

    let html = '<div class="table-responsive"><table class="data-table"><thead><tr>';
    html += '<th style="width: 40px;">#</th>';
    html += '<th>Original File Name</th>';
    html += '<th style="width: 30px; text-align: center;">➔</th>';
    html += '<th>New Renamed File Name</th>';
    html += '</tr></thead><tbody>';

    uploadedFiles.forEach((f, idx) => {
      const newName = computeNewName(f.name, idx);
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">${escapeHtml(f.name)}</td>
          <td style="text-align: center; color: var(--primary);">➔</td>
          <td style="color: #10b981; font-weight: 600; font-family: var(--font-mono); font-size: 0.85rem;">${escapeHtml(newName)}</td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    previewContainer.innerHTML = html;
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Download All as Renamed ZIP
  if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', async () => {
      if (uploadedFiles.length === 0 || !window.JSZip) return;

      downloadZipBtn.disabled = true;
      if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Packing renamed files into ZIP...';

      const zip = new JSZip();

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const newName = computeNewName(file.name, i);
        const arrayBuffer = await file.arrayBuffer();
        zip.file(newName, arrayBuffer);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(zipBlob, 'batch_renamed_files.zip');

      downloadZipBtn.disabled = false;
      if (statusMsg) statusMsg.textContent = `Successfully renamed and bundled ${uploadedFiles.length} files in ZIP!`;
      showToast(`Downloaded ${uploadedFiles.length} renamed files!`, 'success');
    });
  }

  // Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      uploadedFiles = [];
      if (fileInput) fileInput.value = '';
      if (fileCountEl) fileCountEl.textContent = '0 files';
      if (previewContainer) previewContainer.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-dim);">No files uploaded yet. Drop files above.</div>';
      if (downloadZipBtn) downloadZipBtn.disabled = true;
      if (clearBtn) clearBtn.disabled = true;
      if (statusMsg) statusMsg.textContent = 'Drop files above to begin.';
      showToast('Cleared files', 'info');
    });
  }

})();
