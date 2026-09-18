/**
 * OmniConvert Studio - QR Code & Barcode Studio (100% Offline)
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const tabGenerate = document.getElementById('tab-qr-gen');
  const tabBarcode = document.getElementById('tab-barcode-gen');
  const sectionQr = document.getElementById('section-qr-gen');
  const sectionBarcode = document.getElementById('section-barcode-gen');

  // QR Elements
  const qrTextInput = document.getElementById('qr-text-input');
  const qrTypeSelect = document.getElementById('qr-type-select');
  const qrColorDark = document.getElementById('qr-color-dark');
  const qrColorLight = document.getElementById('qr-color-light');
  const qrSizeSelect = document.getElementById('qr-size-select');
  const qrCaptionInput = document.getElementById('qr-caption-input');
  const qrRenderContainer = document.getElementById('qr-render-box');
  const qrDownloadPngBtn = document.getElementById('qr-dl-png');
  const qrDownloadPdfBtn = document.getElementById('qr-dl-pdf');
  const qrStatusMsg = document.getElementById('qr-status');

  // Barcode Elements
  const barcodeTextInput = document.getElementById('barcode-text-input');
  const barcodeTypeSelect = document.getElementById('barcode-type-select');
  const barcodeCanvas = document.getElementById('barcode-canvas');
  const barcodeDownloadPngBtn = document.getElementById('barcode-dl-png');
  const barcodeStatus = document.getElementById('barcode-status');

  if (!qrRenderContainer) return;

  // Tabs
  if (tabGenerate && tabBarcode) {
    tabGenerate.addEventListener('click', () => {
      tabGenerate.classList.add('active');
      tabBarcode.classList.remove('active');
      if (sectionQr) sectionQr.style.display = 'block';
      if (sectionBarcode) sectionBarcode.style.display = 'none';
    });

    tabBarcode.addEventListener('click', () => {
      tabBarcode.classList.add('active');
      tabGenerate.classList.remove('active');
      if (sectionQr) sectionQr.style.display = 'none';
      if (sectionBarcode) sectionBarcode.style.display = 'block';
      renderBarcode();
    });
  }

  // Preset suggestions
  const presetPills = document.querySelectorAll('.qr-preset-pill');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const text = pill.dataset.preset;
      if (text && qrTextInput) {
        qrTextInput.value = text;
        generateQrCode();
      }
    });
  });

  [qrTextInput, qrColorDark, qrColorLight, qrSizeSelect, qrCaptionInput].forEach(el => {
    if (el) el.addEventListener('input', generateQrCode);
  });

  // QR Code Generation
  function generateQrCode() {
    const rawText = (qrTextInput ? qrTextInput.value.trim() : '') || 'OmniConvert Studio - RO Faridabad';
    const darkColor = qrColorDark ? qrColorDark.value : '#000000';
    const lightColor = qrColorLight ? qrColorLight.value : '#ffffff';
    const size = parseInt(qrSizeSelect ? qrSizeSelect.value : '300', 10) || 300;
    const caption = qrCaptionInput ? qrCaptionInput.value.trim() : '';

    if (!window.QRCode) {
      if (qrStatusMsg) qrStatusMsg.textContent = 'QR Code library not loaded.';
      return;
    }

    qrRenderContainer.innerHTML = '';

    // Create container for QRCode.js
    const tempDiv = document.createElement('div');
    new QRCode(tempDiv, {
      text: rawText,
      width: size,
      height: size,
      colorDark: darkColor,
      colorLight: lightColor,
      correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
      const generatedCanvas = tempDiv.querySelector('canvas');
      if (!generatedCanvas) return;

      // Create final canvas with optional caption and border
      const pad = 24;
      const captionH = caption ? 40 : 0;
      const finalCanvas = document.createElement('canvas');
      finalCanvas.id = 'qr-final-canvas';
      finalCanvas.width = size + (pad * 2);
      finalCanvas.height = size + (pad * 2) + captionH;

      const ctx = finalCanvas.getContext('2d');
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Draw QR in center
      ctx.drawImage(generatedCanvas, pad, pad);

      // Draw Caption
      if (caption) {
        ctx.fillStyle = darkColor;
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(caption, finalCanvas.width / 2, size + pad + (captionH / 2));
      }

      // Add border outline
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, finalCanvas.width - 2, finalCanvas.height - 2);

      qrRenderContainer.innerHTML = '';
      qrRenderContainer.appendChild(finalCanvas);

      if (qrDownloadPngBtn) qrDownloadPngBtn.disabled = false;
      if (qrDownloadPdfBtn) qrDownloadPdfBtn.disabled = false;
      if (qrStatusMsg) qrStatusMsg.textContent = `Generated QR Code (${size}x${size} px) successfully!`;
    }, 50);
  }

  // QR Download PNG
  if (qrDownloadPngBtn) {
    qrDownloadPngBtn.addEventListener('click', () => {
      const canvas = document.getElementById('qr-final-canvas');
      if (!canvas) return;
      canvas.toBlob((blob) => {
        triggerDownload(blob, 'qrcode.png');
        showToast('Downloaded QR Code as PNG!', 'success');
      }, 'image/png');
    });
  }

  // QR Download PDF
  if (qrDownloadPdfBtn) {
    qrDownloadPdfBtn.addEventListener('click', () => {
      const canvas = document.getElementById('qr-final-canvas');
      if (!canvas || !window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png');

      // Center on A4
      const a4W = 210;
      const a4H = 297;
      const qrW = 80;
      const qrH = 80 * (canvas.height / canvas.width);
      const x = (a4W - qrW) / 2;
      const y = (a4H - qrH) / 2 - 20;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('OFFICIAL VERIFICATION QR CODE', a4W / 2, y - 15, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Regional Office (RO), Faridabad', a4W / 2, y - 8, { align: 'center' });

      pdf.addImage(imgData, 'PNG', x, y, qrW, qrH);

      const caption = qrCaptionInput ? qrCaptionInput.value.trim() : '';
      if (caption) {
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42);
        pdf.text(caption, a4W / 2, y + qrH + 12, { align: 'center' });
      }

      pdf.save('qrcode_document.pdf');
      showToast('Downloaded QR Code as printable PDF!', 'success');
    });
  }

  // --- BARCODE GENERATION (Code 39 Pure Canvas Engine) ---
  const CODE39_ENCODINGS = {
    '0': 'bwbwbwBwb', '1': 'BwbwbWbwb', '2': 'bwBwbWbwb', '3': 'BwBwbWbwB',
    '4': 'bwbwBWbwb', '5': 'BwbwBWbwB', '6': 'bwBwBWbwb', '7': 'bwbwbWBwb',
    '8': 'BwbwbWBwB', '9': 'bwBwbWBwb', 'A': 'BwbwbwbWB', 'B': 'bwBwbwbWB',
    'C': 'BwBwbwbWb', 'D': 'bwbwBwbWB', 'E': 'BwbwBwbWb', 'F': 'bwBwBwbWb',
    'G': 'bwbwbwBWB', 'H': 'BwbwbwBWb', 'I': 'bwBwbwBWb', 'J': 'bwbwBwBWb',
    'K': 'BwbwbwbwB', 'L': 'bwBwbwbwB', 'M': 'BwBwbwbwb', 'N': 'bwbwBwbwB',
    'O': 'BwbwBwbwb', 'P': 'bwBwBwbwb', 'Q': 'bwbwbwBwB', 'R': 'BwbwbwBwb',
    'S': 'bwBwbwBwb', 'T': 'bwbwBwBwb', 'U': 'BWbwbwbwB', 'V': 'bWBwbwbwB',
    'W': 'BWBwbwbwb', 'X': 'bWbwBwbwB', 'Y': 'BWbwBwbwb', 'Z': 'bWBwBwbwb',
    '-': 'bWbwbwBwB', '.': 'BWbwbwBwb', ' ': 'bWBwbwBwb', '$': 'bWbWbWbwb',
    '/': 'bWbWbwbWb', '+': 'bWbwbWbWb', '%': 'bwbWbWbWb', '*': 'bWbwBwBwb'
  };

  function renderBarcode() {
    if (!barcodeCanvas) return;
    let text = (barcodeTextInput ? barcodeTextInput.value.trim() : '') || 'EPFO-FBD-2026';
    text = text.toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g, '');

    const fullCode = '*' + text + '*'; // Asterisks are start/stop in Code 39
    const ctx = barcodeCanvas.getContext('2d');

    const narrow = 3;
    const wide = 8;
    const barHeight = 100;
    const pad = 30;

    let totalWidth = pad * 2;
    for (let char of fullCode) {
      const pattern = CODE39_ENCODINGS[char] || CODE39_ENCODINGS['-'];
      for (let i = 0; i < pattern.length; i++) {
        totalWidth += (pattern[i] === 'B' || pattern[i] === 'W') ? wide : narrow;
      }
      totalWidth += narrow; // Inter-character gap
    }

    barcodeCanvas.width = totalWidth;
    barcodeCanvas.height = barHeight + (pad * 2) + 30;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, barcodeCanvas.width, barcodeCanvas.height);

    let curX = pad;
    for (let char of fullCode) {
      const pattern = CODE39_ENCODINGS[char] || CODE39_ENCODINGS['-'];
      for (let i = 0; i < pattern.length; i++) {
        const isBar = (pattern[i] === 'b' || pattern[i] === 'B');
        const w = (pattern[i] === 'B' || pattern[i] === 'W') ? wide : narrow;

        if (isBar) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(curX, pad, w, barHeight);
        }
        curX += w;
      }
      curX += narrow;
    }

    // Text caption below barcode
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Consolas", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, barcodeCanvas.width / 2, barHeight + pad + 24);

    if (barcodeDownloadPngBtn) barcodeDownloadPngBtn.disabled = false;
    if (barcodeStatus) barcodeStatus.textContent = `Generated Code 39 Barcode for "${text}"`;
  }

  if (barcodeTextInput) {
    barcodeTextInput.addEventListener('input', renderBarcode);
  }

  if (barcodeDownloadPngBtn) {
    barcodeDownloadPngBtn.addEventListener('click', () => {
      if (!barcodeCanvas) return;
      barcodeCanvas.toBlob(blob => {
        triggerDownload(blob, 'barcode.png');
        showToast('Downloaded barcode as PNG!', 'success');
      });
    });
  }

  // Initial QR render
  setTimeout(generateQrCode, 150);
})();
