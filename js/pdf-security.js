/**
 * OmniConvert Studio - PDF Security Suite
 * Protect (Encrypt with password), Unlock (Decrypt), and Flatten Forms
 * Uses jsPDF, pdf-lib, and pdf.js offline engines
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  // Protect Panel
  const protectDropzone = document.getElementById('protect-dropzone');
  const protectFile = document.getElementById('protect-file');
  const protectFileInfo = document.getElementById('protect-file-info');
  const protectPass = document.getElementById('protect-password');
  const protectPassConfirm = document.getElementById('protect-password-confirm');
  const protectBtn = document.getElementById('protect-btn');
  const protectClearBtn = document.getElementById('protect-clear-btn');
  const protectStatus = document.getElementById('protect-status');
  let loadedProtectFile = null;

  if (protectDropzone) {
    setupDropzone(protectDropzone, protectFile, (files) => {
      const file = files[0];
      if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
        loadedProtectFile = file;
        protectFileInfo.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)} (${formatBytes(file.size)})`;
        protectFileInfo.style.display = 'block';
        protectBtn.disabled = false;
        protectClearBtn.disabled = false;
        protectStatus.textContent = 'Enter a password and click "Protect PDF".';
        showToast('PDF loaded for encryption', 'success');
      }
    });

    protectClearBtn.addEventListener('click', () => {
      loadedProtectFile = null;
      protectFile.value = '';
      protectPass.value = '';
      protectPassConfirm.value = '';
      protectFileInfo.style.display = 'none';
      protectBtn.disabled = true;
      protectClearBtn.disabled = true;
      protectStatus.textContent = 'Upload a PDF above to protect.';
      showToast('Cleared', 'info');
    });

    protectBtn.addEventListener('click', async () => {
      if (!loadedProtectFile) return;
      const pass = protectPass.value;
      const passConfirm = protectPassConfirm.value;

      if (!pass || pass.length < 3) {
        showToast('Please enter a password with at least 3 characters.', 'warning');
        return;
      }
      if (pass !== passConfirm) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        showToast('PDF library not ready.', 'error');
        return;
      }

      protectBtn.disabled = true;
      protectStatus.innerHTML = '<span class="spinner"></span> Encrypting PDF document with password...';

      try {
        const buffer = await loadedProtectFile.arrayBuffer();
        const srcPdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const total = srcPdf.numPages;

        let encDoc = null;

        for (let i = 1; i <= total; i++) {
          protectStatus.innerHTML = `<span class="spinner"></span> Encrypting page ${i} of ${total}...`;
          const page = await srcPdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;

          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          const aspect = canvas.width / canvas.height;
          const orientation = aspect >= 1 ? 'l' : 'p';

          if (i === 1) {
            encDoc = new jsPDF({
              orientation,
              unit: 'mm',
              format: 'a4',
              encryption: {
                userPassword: pass,
                ownerPassword: pass + '_owner',
                userPermissions: ['print', 'modify', 'copy', 'annot-forms']
              }
            });
          } else {
            encDoc.addPage('a4', orientation);
          }

          const pW = encDoc.internal.pageSize.getWidth();
          const pH = encDoc.internal.pageSize.getHeight();
          const pageAspect = pW / pH;
          let rW = pW, rH = pH, x = 0, y = 0;

          if (aspect > pageAspect) {
            rH = pW / aspect;
            y = (pH - rH) / 2;
          } else {
            rW = pH * aspect;
            x = (pW - rW) / 2;
          }

          encDoc.addImage(imgData, 'JPEG', x, y, rW, rH, undefined, 'FAST');
        }

        const blob = encDoc.output('blob');
        const baseName = loadedProtectFile.name.replace(/\.[^/.]+$/, "");
        const outName = `${baseName}_protected.pdf`;
        triggerDownload(blob, outName);

        protectStatus.innerHTML = `<span style="color: var(--accent-emerald);">✓ Successfully encrypted with password!</span> Saved: ${outName}`;
        showToast('Password protected PDF downloaded!', 'success');
      } catch (err) {
        console.error(err);
        protectStatus.textContent = 'Failed to encrypt PDF.';
        showToast('Encryption failed', 'error');
      } finally {
        protectBtn.disabled = false;
      }
    });
  }

  // Unlock Panel
  const unlockDropzone = document.getElementById('unlock-dropzone');
  const unlockFile = document.getElementById('unlock-file');
  const unlockFileInfo = document.getElementById('unlock-file-info');
  const unlockPass = document.getElementById('unlock-password');
  const unlockBtn = document.getElementById('unlock-btn');
  const unlockClearBtn = document.getElementById('unlock-clear-btn');
  const unlockStatus = document.getElementById('unlock-status');
  let loadedUnlockFile = null;

  if (unlockDropzone) {
    setupDropzone(unlockDropzone, unlockFile, (files) => {
      const file = files[0];
      if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
        loadedUnlockFile = file;
        unlockFileInfo.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)} (${formatBytes(file.size)})`;
        unlockFileInfo.style.display = 'block';
        unlockBtn.disabled = false;
        unlockClearBtn.disabled = false;
        unlockStatus.textContent = 'Enter the document password and click "Unlock PDF".';
        showToast('PDF loaded for unlocking', 'success');
      }
    });

    unlockClearBtn.addEventListener('click', () => {
      loadedUnlockFile = null;
      unlockFile.value = '';
      unlockPass.value = '';
      unlockFileInfo.style.display = 'none';
      unlockBtn.disabled = true;
      unlockClearBtn.disabled = true;
      unlockStatus.textContent = 'Upload a locked PDF above to unlock.';
      showToast('Cleared', 'info');
    });

    unlockBtn.addEventListener('click', async () => {
      if (!loadedUnlockFile) return;
      const pass = unlockPass.value;

      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        showToast('PDF library not ready.', 'error');
        return;
      }

      unlockBtn.disabled = true;
      unlockStatus.innerHTML = '<span class="spinner"></span> Verifying password & decrypting...';

      try {
        const buffer = await loadedUnlockFile.arrayBuffer();
        const srcPdf = await pdfjsLib.getDocument({ data: buffer, password: pass }).promise;
        const total = srcPdf.numPages;

        let unlDoc = null;

        for (let i = 1; i <= total; i++) {
          unlockStatus.innerHTML = `<span class="spinner"></span> Decrypting page ${i} of ${total}...`;
          const page = await srcPdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;

          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          const aspect = canvas.width / canvas.height;
          const orientation = aspect >= 1 ? 'l' : 'p';

          if (i === 1) {
            unlDoc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
          } else {
            unlDoc.addPage('a4', orientation);
          }

          const pW = unlDoc.internal.pageSize.getWidth();
          const pH = unlDoc.internal.pageSize.getHeight();
          const pageAspect = pW / pH;
          let rW = pW, rH = pH, x = 0, y = 0;

          if (aspect > pageAspect) {
            rH = pW / aspect;
            y = (pH - rH) / 2;
          } else {
            rW = pH * aspect;
            x = (pW - rW) / 2;
          }

          unlDoc.addImage(imgData, 'JPEG', x, y, rW, rH, undefined, 'FAST');
        }

        const blob = unlDoc.output('blob');
        const baseName = loadedUnlockFile.name.replace(/\.[^/.]+$/, "");
        const outName = `${baseName}_unlocked.pdf`;
        triggerDownload(blob, outName);

        unlockStatus.innerHTML = `<span style="color: var(--accent-emerald);">✓ Password removed successfully!</span> Saved: ${outName}`;
        showToast('Unlocked PDF downloaded!', 'success');
      } catch (err) {
        console.error(err);
        unlockStatus.textContent = 'Incorrect password or corrupted PDF.';
        showToast('Incorrect password or decryption failed', 'error');
      } finally {
        unlockBtn.disabled = false;
      }
    });
  }

  // Flatten Panel
  const flattenDropzone = document.getElementById('flatten-dropzone');
  const flattenFile = document.getElementById('flatten-file');
  const flattenFileInfo = document.getElementById('flatten-file-info');
  const flattenBtn = document.getElementById('flatten-btn');
  const flattenClearBtn = document.getElementById('flatten-clear-btn');
  const flattenStatus = document.getElementById('flatten-status');
  let loadedFlattenFile = null;

  if (flattenDropzone) {
    setupDropzone(flattenDropzone, flattenFile, (files) => {
      const file = files[0];
      if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
        loadedFlattenFile = file;
        flattenFileInfo.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)} (${formatBytes(file.size)})`;
        flattenFileInfo.style.display = 'block';
        flattenBtn.disabled = false;
        flattenClearBtn.disabled = false;
        flattenStatus.textContent = 'Click "Flatten PDF" to bake form fields into read-only static pages.';
        showToast('PDF loaded for flattening', 'success');
      }
    });

    flattenClearBtn.addEventListener('click', () => {
      loadedFlattenFile = null;
      flattenFile.value = '';
      flattenFileInfo.style.display = 'none';
      flattenBtn.disabled = true;
      flattenClearBtn.disabled = true;
      flattenStatus.textContent = 'Upload a PDF above to flatten.';
      showToast('Cleared', 'info');
    });

    flattenBtn.addEventListener('click', async () => {
      if (!loadedFlattenFile) return;

      const { PDFDocument } = window.PDFLib || {};
      flattenBtn.disabled = true;
      flattenStatus.innerHTML = '<span class="spinner"></span> Flattening form fields and annotations...';

      try {
        const buffer = await loadedFlattenFile.arrayBuffer();
        let pdfBytes;

        if (PDFDocument) {
          const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          try {
            const form = doc.getForm();
            form.flatten();
          } catch (e) {
            console.log('No AcroForm found or already flat:', e);
          }
          pdfBytes = await doc.save();
        }

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const baseName = loadedFlattenFile.name.replace(/\.[^/.]+$/, "");
        const outName = `${baseName}_flattened.pdf`;
        triggerDownload(blob, outName);

        flattenStatus.innerHTML = `<span style="color: var(--accent-emerald);">✓ Form fields flattened permanently!</span> Saved: ${outName}`;
        showToast('Flattened PDF downloaded!', 'success');
      } catch (err) {
        console.error(err);
        flattenStatus.textContent = 'Failed to flatten PDF.';
        showToast('Error flattening PDF', 'error');
      } finally {
        flattenBtn.disabled = false;
      }
    });
  }
})();
