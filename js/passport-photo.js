/**
 * OmniConvert Studio - Passport Photo & ID Card Studio
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  // Mode selection: 'passport' or 'idcard'
  const tabPassport = document.getElementById('tab-passport-mode');
  const tabIdCard = document.getElementById('tab-idcard-mode');
  const sectionPassport = document.getElementById('section-passport-mode');
  const sectionIdCard = document.getElementById('section-idcard-mode');

  // --- 1. PASSPORT PHOTO MODULE ---
  const dropzonePass = document.getElementById('pass-photo-dropzone');
  const fileInputPass = document.getElementById('pass-photo-file');
  const fileInfoPass = document.getElementById('pass-photo-file-info');
  const gridSelect = document.getElementById('pass-photo-grid');
  const nameInput = document.getElementById('pass-photo-name');
  const dateInput = document.getElementById('pass-photo-date');
  const borderToggle = document.getElementById('pass-photo-border');
  const generateBtnPass = document.getElementById('pass-photo-generate-btn');
  const downloadJpgBtn = document.getElementById('pass-photo-dl-jpg');
  const downloadPdfBtn = document.getElementById('pass-photo-dl-pdf');
  const previewCanvasPass = document.getElementById('pass-photo-canvas');
  const statusMsgPass = document.getElementById('pass-photo-status');

  let loadedPassImage = null;

  // --- 2. ID CARD MERGER MODULE ---
  const dropzoneFront = document.getElementById('idcard-front-dropzone');
  const fileInputFront = document.getElementById('idcard-front-file');
  const previewFront = document.getElementById('idcard-front-preview');

  const dropzoneBack = document.getElementById('idcard-back-dropzone');
  const fileInputBack = document.getElementById('idcard-back-file');
  const previewBack = document.getElementById('idcard-back-preview');

  const idcardLayoutSelect = document.getElementById('idcard-layout');
  const idcardGenerateBtn = document.getElementById('idcard-generate-btn');
  const idcardCanvas = document.getElementById('idcard-canvas');
  const idcardDownloadPdf = document.getElementById('idcard-dl-pdf');
  const idcardStatus = document.getElementById('idcard-status');

  let frontImg = null;
  let backImg = null;

  if (!dropzonePass) return;

  // Tab switching
  if (tabPassport && tabIdCard) {
    tabPassport.addEventListener('click', () => {
      tabPassport.classList.add('active');
      tabIdCard.classList.remove('active');
      if (sectionPassport) sectionPassport.style.display = 'block';
      if (sectionIdCard) sectionIdCard.style.display = 'none';
    });

    tabIdCard.addEventListener('click', () => {
      tabIdCard.classList.add('active');
      tabPassport.classList.remove('active');
      if (sectionPassport) sectionPassport.style.display = 'none';
      if (sectionIdCard) sectionIdCard.style.display = 'block';
    });
  }

  // Set today's date in pass-photo-date
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Passport Photo Upload
  setupDropzone(dropzonePass, fileInputPass, (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      if (fileInfoPass) {
        fileInfoPass.innerHTML = `<strong>Selected:</strong> ${file.name} (${formatBytes(file.size)})`;
        fileInfoPass.style.display = 'block';
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          loadedPassImage = img;
          renderPassportGrid();
          if (generateBtnPass) generateBtnPass.disabled = false;
          if (downloadJpgBtn) downloadJpgBtn.disabled = false;
          if (downloadPdfBtn) downloadPdfBtn.disabled = false;
          if (statusMsgPass) statusMsgPass.textContent = 'Photo loaded! Preview generated below. Click download for printable sheet.';
          showToast('Photo loaded successfully', 'success');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      showToast('Please select a valid image file.', 'error');
    }
  });

  [gridSelect, nameInput, dateInput, borderToggle].forEach(el => {
    if (el) el.addEventListener('input', () => {
      if (loadedPassImage) renderPassportGrid();
    });
  });

  // Render Passport Photos on A4 Canvas (300 DPI: 2480 x 3508 px)
  function renderPassportGrid() {
    if (!loadedPassImage || !previewCanvasPass) return;
    const ctx = previewCanvasPass.getContext('2d');

    // A4 at 300 DPI
    const A4_W = 2480;
    const A4_H = 3508;
    previewCanvasPass.width = A4_W;
    previewCanvasPass.height = A4_H;

    // Fill clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_W, A4_H);

    // Standard Passport Photo Dimensions (3.5 cm x 4.5 cm at 300 DPI)
    // 1 cm = ~118.11 pixels at 300 DPI
    const photoW = Math.round(3.5 * 118.11); // ~413 px
    const photoH = Math.round(4.5 * 118.11); // ~531 px

    const gridType = gridSelect ? gridSelect.value : '8'; // '8', '16', 'single'
    let cols = 4;
    let rows = 2;

    if (gridType === '16') {
      cols = 4;
      rows = 4;
    } else if (gridType === 'single') {
      cols = 1;
      rows = 1;
    }

    const totalPhotos = cols * rows;

    // Center grid on page
    const gapX = 60;
    const gapY = 80;
    const totalGridW = (cols * photoW) + ((cols - 1) * gapX);
    const totalGridH = (rows * photoH) + ((rows - 1) * gapY);

    const startX = Math.round((A4_W - totalGridW) / 2);
    const startY = Math.round((A4_H - totalGridH) / 2);

    const hasBorder = borderToggle ? borderToggle.checked : true;
    const nameText = (nameInput ? nameInput.value.trim() : '');
    const dateText = (dateInput ? dateInput.value.trim() : '');

    // Crop source image to 3.5 : 4.5 aspect ratio centered
    const targetAspect = 3.5 / 4.5;
    let srcW = loadedPassImage.width;
    let srcH = loadedPassImage.height;
    let srcX = 0;
    let srcY = 0;

    if (srcW / srcH > targetAspect) {
      // Source is wider than 3.5:4.5
      srcW = srcH * targetAspect;
      srcX = (loadedPassImage.width - srcW) / 2;
    } else {
      // Source is taller
      srcH = srcW / targetAspect;
      srcY = 0; // anchor from top/chest area
    }

    // Temporary single photo canvas
    const singleCanvas = document.createElement('canvas');
    singleCanvas.width = photoW;
    singleCanvas.height = photoH;
    const sCtx = singleCanvas.getContext('2d');

    // Draw cropped photo
    sCtx.drawImage(loadedPassImage, srcX, srcY, srcW, srcH, 0, 0, photoW, photoH);

    // Optional Name & Date strip at bottom
    if (nameText || dateText) {
      const stripH = Math.round(photoH * 0.18);
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      sCtx.fillRect(0, photoH - stripH, photoW, stripH);

      sCtx.fillStyle = '#000000';
      sCtx.textAlign = 'center';
      sCtx.textBaseline = 'middle';

      if (nameText && dateText) {
        sCtx.font = 'bold 24px Arial, sans-serif';
        sCtx.fillText(nameText, photoW / 2, photoH - stripH + (stripH * 0.32));
        sCtx.font = 'normal 20px Arial, sans-serif';
        sCtx.fillText(dateText, photoW / 2, photoH - stripH + (stripH * 0.72));
      } else {
        sCtx.font = 'bold 26px Arial, sans-serif';
        sCtx.fillText(nameText || dateText, photoW / 2, photoH - (stripH / 2));
      }
    }

    // Optional subtle outline border & dashed cut line
    if (hasBorder) {
      sCtx.strokeStyle = '#94a3b8';
      sCtx.lineWidth = 2;
      sCtx.strokeRect(1, 1, photoW - 2, photoH - 2);
    }

    // Place photos in grid
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + (c * (photoW + gapX));
        const y = startY + (r * (photoH + gapY));

        ctx.drawImage(singleCanvas, x, y);

        // Cutting guides (corners)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x - 2, y - 2, photoW + 4, photoH + 4);
        ctx.setLineDash([]);
      }
    }

    // Header stamp at top of sheet
    ctx.fillStyle = '#64748b';
    ctx.font = 'normal 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OmniConvert Studio — A4 Passport Photo Sheet (3.5 cm x 4.5 cm)', A4_W / 2, startY - 60);
    ctx.font = 'normal 24px Arial, sans-serif';
    ctx.fillText('Designed by Niraj Kumar, Section Supervisor, RO, Faridabad', A4_W / 2, startY - 20);
  }

  // Download Sheet as JPG
  if (downloadJpgBtn) {
    downloadJpgBtn.addEventListener('click', () => {
      if (!previewCanvasPass) return;
      previewCanvasPass.toBlob((blob) => {
        triggerDownload(blob, 'passport_photos_a4.jpg');
        showToast('Downloaded printable A4 photo sheet (JPG)!', 'success');
      }, 'image/jpeg', 0.95);
    });
  }

  // Download Sheet as PDF
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      if (!previewCanvasPass || !window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = previewCanvasPass.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save('passport_photos_sheet.pdf');
      showToast('Downloaded printable A4 photo sheet (PDF)!', 'success');
    });
  }

  // --- ID CARD MERGER LOGIC ---
  function setupIdCardUpload(dropzone, input, previewEl, callback) {
    if (!dropzone || !input) return;
    setupDropzone(dropzone, input, (files) => {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            callback(img);
            if (previewEl) {
              previewEl.src = e.target.result;
              previewEl.style.display = 'block';
            }
            checkIdCardReady();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  setupIdCardUpload(dropzoneFront, fileInputFront, previewFront, (img) => {
    frontImg = img;
  });

  setupIdCardUpload(dropzoneBack, fileInputBack, previewBack, (img) => {
    backImg = img;
  });

  function checkIdCardReady() {
    if (frontImg || backImg) {
      if (idcardGenerateBtn) idcardGenerateBtn.disabled = false;
      renderIdCardLayout();
    }
  }

  if (idcardLayoutSelect) {
    idcardLayoutSelect.addEventListener('change', renderIdCardLayout);
  }

  function renderIdCardLayout() {
    if (!idcardCanvas) return;
    const ctx = idcardCanvas.getContext('2d');

    // A4 standard at 300 DPI
    const A4_W = 2480;
    const A4_H = 3508;
    idcardCanvas.width = A4_W;
    idcardCanvas.height = A4_H;

    // Clean white page
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_W, A4_H);

    // Standard physical card dimensions: 8.56 cm x 5.398 cm (CR80 Aadhaar/PAN)
    // At 300 DPI: ~1011 x 638 px
    const cardW = 1011;
    const cardH = 638;

    const layout = idcardLayoutSelect ? idcardLayoutSelect.value : 'stacked'; // 'stacked' (vertical) or 'side' (horizontal)

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IDENTITY CARD / पहचान पत्र — A4 PRINTABLE SHEET', A4_W / 2, 220);
    ctx.font = 'normal 26px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('100% Exact Physical Scale (8.5 cm x 5.4 cm) with Cutting Guides', A4_W / 2, 270);

    if (layout === 'stacked') {
      // Front on top, Back on bottom
      const startX = Math.round((A4_W - cardW) / 2);
      const topY = 480;
      const bottomY = topY + cardH + 160;

      drawCardWithGuide(ctx, frontImg, startX, topY, cardW, cardH, 'FRONT / मुख्य भाग');
      drawCardWithGuide(ctx, backImg, startX, bottomY, cardW, cardH, 'BACK / पिछला भाग');
    } else {
      // Side by Side
      const gap = 120;
      const totalW = (cardW * 2) + gap;
      const startX = Math.round((A4_W - totalW) / 2);
      const startY = 600;

      drawCardWithGuide(ctx, frontImg, startX, startY, cardW, cardH, 'FRONT / मुख्य भाग');
      drawCardWithGuide(ctx, backImg, startX + cardW + gap, startY, cardW, cardH, 'BACK / पिछला भाग');
    }

    if (idcardDownloadPdf) idcardDownloadPdf.disabled = false;
    if (idcardStatus) idcardStatus.textContent = 'ID Card sheet ready! Click download to get print-ready PDF.';
  }

  function drawCardWithGuide(ctx, img, x, y, w, h, label) {
    // Background placeholder
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x, y, w, h);

    if (img) {
      ctx.drawImage(img, x, y, w, h);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('(Upload Card Image)', x + (w / 2), y + (h / 2));
    }

    // Outer cutting guideline
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    // Corner cut markers
    const markerLen = 30;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x - 15, y); ctx.lineTo(x - 15 - markerLen, y);
    ctx.moveTo(x, y - 15); ctx.lineTo(x, y - 15 - markerLen);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + (w / 2), y - 20);
  }

  // ID Card PDF Download
  if (idcardDownloadPdf) {
    idcardDownloadPdf.addEventListener('click', () => {
      if (!idcardCanvas || !window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = idcardCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save('id_card_a4_sheet.pdf');
      showToast('Downloaded ID card sheet as PDF!', 'success');
    });
  }

})();
