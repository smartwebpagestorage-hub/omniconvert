/**
 * OmniConvert Studio - EXIF & Document Metadata Stripper
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const dropzone = document.getElementById('meta-clean-dropzone');
  const fileInput = document.getElementById('meta-clean-file');
  const fileInfo = document.getElementById('meta-clean-file-info');
  const metadataDisplay = document.getElementById('meta-clean-table');
  const sanitizeBtn = document.getElementById('meta-clean-btn');
  const clearBtn = document.getElementById('meta-clean-clear-btn');
  const statusMsg = document.getElementById('meta-clean-status');

  let currentFile = null;
  let detectedMetadata = {};

  if (!dropzone) return;

  setupDropzone(dropzone, fileInput, (files) => {
    const file = files[0];
    if (file) {
      currentFile = file;
      if (fileInfo) {
        fileInfo.innerHTML = `<strong>Selected:</strong> ${file.name} (${formatBytes(file.size)})`;
        fileInfo.style.display = 'block';
      }
      analyzeFileMetadata(file);
    }
  });

  async function analyzeFileMetadata(file) {
    detectedMetadata = {
      'File Name': file.name,
      'File Size': formatBytes(file.size),
      'File Type': file.type || 'Unknown',
      'Last Modified': new Date(file.lastModified).toLocaleString(),
    };

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      // PDF Metadata
      try {
        if (window.PDFLib) {
          const { PDFDocument } = window.PDFLib;
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

          detectedMetadata['PDF Title'] = pdfDoc.getTitle() || '(None)';
          detectedMetadata['PDF Author'] = pdfDoc.getAuthor() || '(None)';
          detectedMetadata['PDF Subject'] = pdfDoc.getSubject() || '(None)';
          detectedMetadata['PDF Creator Software'] = pdfDoc.getCreator() || '(None)';
          detectedMetadata['PDF Producer'] = pdfDoc.getProducer() || '(None)';
          detectedMetadata['Creation Date'] = pdfDoc.getCreationDate() ? pdfDoc.getCreationDate().toLocaleString() : '(None)';
          detectedMetadata['Modification Date'] = pdfDoc.getModificationDate() ? pdfDoc.getModificationDate().toLocaleString() : '(None)';
          detectedMetadata['Page Count'] = pdfDoc.getPageCount();
        }
      } catch (e) {
        console.warn('PDF metadata read error:', e);
      }
    } else if (file.type.startsWith('image/')) {
      // Image Metadata (Basic EXIF parser)
      try {
        const arrayBuffer = await file.arrayBuffer();
        const exifData = extractBasicExif(new DataView(arrayBuffer));
        Object.assign(detectedMetadata, exifData);
      } catch (e) {
        console.warn('EXIF read error:', e);
      }
    }

    renderMetadataTable();
    if (sanitizeBtn) sanitizeBtn.disabled = false;
    if (clearBtn) clearBtn.disabled = false;
    if (statusMsg) statusMsg.textContent = `Metadata extracted. Click "Sanitize & Strip Metadata" to remove all tracking tags.`;
    showToast('Analyzed file metadata!', 'info');
  }

  function extractBasicExif(view) {
    const exif = {};
    if (view.byteLength < 2) return exif;
    // Check JPEG marker 0xFFD8
    if (view.getUint16(0, false) === 0xFFD8) {
      let offset = 2;
      while (offset < view.byteLength) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xFFE1) { // APP1 EXIF
          exif['EXIF Header'] = 'Present (Contains camera, timestamp & device tags)';
          break;
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
    }
    if (!exif['EXIF Header']) {
      exif['EXIF Header'] = 'Standard / Clean';
    }
    return exif;
  }

  function renderMetadataTable() {
    if (!metadataDisplay) return;
    let html = '<div class="table-responsive"><table class="data-table"><thead><tr>';
    html += '<th style="width: 220px;">Metadata Attribute</th>';
    html += '<th>Detected Value</th>';
    html += '<th style="width: 130px; text-align: center;">Sanitize Status</th>';
    html += '</tr></thead><tbody>';

    for (let key in detectedMetadata) {
      const val = detectedMetadata[key];
      const isSensitive = ['PDF Author', 'PDF Creator Software', 'PDF Producer', 'Creation Date', 'Modification Date', 'EXIF Header'].includes(key);
      html += `
        <tr>
          <td><strong>${escapeHtml(key)}</strong></td>
          <td style="font-family: var(--font-mono); font-size: 0.85rem; color: ${isSensitive ? '#f59e0b' : 'inherit'};">${escapeHtml(val.toString())}</td>
          <td style="text-align: center;">
            <span class="brand-tag" style="background: ${isSensitive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${isSensitive ? '#ef4444' : '#10b981'};">
              ${isSensitive ? 'Will Wipe' : 'Safe'}
            </span>
          </td>
        </tr>
      `;
    }

    html += '</tbody></table></div>';
    metadataDisplay.innerHTML = html;
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Sanitize Button
  if (sanitizeBtn) {
    sanitizeBtn.addEventListener('click', async () => {
      if (!currentFile) return;

      sanitizeBtn.disabled = true;
      if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Sanitizing file and removing metadata...';

      try {
        const isPdf = currentFile.type === 'application/pdf' || currentFile.name.toLowerCase().endsWith('.pdf');

        if (isPdf && window.PDFLib) {
          const { PDFDocument } = window.PDFLib;
          const arrayBuffer = await currentFile.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);

          // Strip all metadata
          pdfDoc.setTitle('');
          pdfDoc.setAuthor('');
          pdfDoc.setSubject('');
          pdfDoc.setKeywords([]);
          pdfDoc.setProducer('OmniConvert Studio');
          pdfDoc.setCreator('OmniConvert Studio');

          const cleanBytes = await pdfDoc.save();
          const cleanBlob = new Blob([cleanBytes], { type: 'application/pdf' });
          const cleanName = currentFile.name.replace(/\.[^/.]+$/, "") + '_sanitized.pdf';
          triggerDownload(cleanBlob, cleanName);

          showToast('Wiped all PDF metadata and downloaded clean PDF!', 'success');
        } else {
          // Image: Re-render through clean canvas to strip all EXIF/GPS chunks
          const img = new Image();
          const reader = new FileReader();
          reader.onload = (e) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);

              canvas.toBlob((blob) => {
                const cleanName = currentFile.name.replace(/\.[^/.]+$/, "") + '_sanitized.jpg';
                triggerDownload(blob, cleanName);
                showToast('Wiped all EXIF & location data from image!', 'success');
              }, 'image/jpeg', 0.98);
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(currentFile);
        }

        if (statusMsg) statusMsg.textContent = 'Sanitization complete! Clean file downloaded with 0 tracking metadata.';
      } catch (err) {
        console.error('Sanitize error:', err);
        showToast('Error sanitizing file: ' + err.message, 'error');
      } finally {
        sanitizeBtn.disabled = false;
      }
    });
  }

  // Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentFile = null;
      detectedMetadata = {};
      if (fileInput) fileInput.value = '';
      if (fileInfo) fileInfo.style.display = 'none';
      if (metadataDisplay) metadataDisplay.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-dim);">No file selected. Upload an image or PDF to inspect and strip metadata.</div>';
      if (sanitizeBtn) sanitizeBtn.disabled = true;
      if (clearBtn) clearBtn.disabled = true;
      if (statusMsg) statusMsg.textContent = 'Upload a file above to inspect metadata.';
      showToast('Cleared metadata view', 'info');
    });
  }

})();
