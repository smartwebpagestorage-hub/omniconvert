/**
 * OmniConvert Studio - Text to Image (Graphic Card & Typography Studio)
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const canvas = document.getElementById('text-to-img-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Input elements
  const textInput = document.getElementById('text-to-img-content');
  const authorInput = document.getElementById('text-to-img-author');
  const ratioSelect = document.getElementById('text-to-img-ratio');
  const themeSelect = document.getElementById('text-to-img-theme');
  const fontSelect = document.getElementById('text-to-img-font');
  const fontSizeSlider = document.getElementById('text-to-img-fontsize');
  const fontSizeVal = document.getElementById('text-to-img-fontsize-val');
  const textAlignSelect = document.getElementById('text-to-img-align');
  const ratioPills = document.querySelectorAll('.ratio-pill');
  const gradientSwatches = document.querySelectorAll('.gradient-swatch');
  const glassCardToggle = document.getElementById('text-to-img-glass');
  const downloadPngBtn = document.getElementById('text-to-img-dl-png');
  const downloadJpgBtn = document.getElementById('text-to-img-dl-jpg');
  const presetQuotesBtn = document.getElementById('text-to-img-preset-btn');

  let currentRatio = (ratioSelect ? ratioSelect.value : '1:1');
  let isGlassEnabled = true;

  const GRADIENT_PRESETS = {
    'cosmic': ['#0f172a', '#1e1b4b', '#4c1d95'],
    'nebula': ['#0f172a', '#1e1b4b', '#4c1d95'],
    'sunset': ['#831843', '#be123c', '#fb7185'],
    'emerald': ['#064e3b', '#047857', '#10b981'],
    'ocean': ['#082f49', '#0369a1', '#06b6d4'],
    'cyber': ['#180828', '#3b0764', '#701a75'],
    'dark': ['#090d16', '#111827', '#1f2937'],
    'minimal-dark': ['#090d16', '#111827', '#1f2937'],
    'aurora': ['#065f46', '#1e40af', '#3730a3'],
    'clean-light': ['#f8fafc', '#e2e8f0', '#cbd5e1']
  };

  let activeGradientKey = (themeSelect ? themeSelect.value : 'cosmic');

  if (ratioSelect) {
    ratioSelect.addEventListener('change', () => {
      currentRatio = ratioSelect.value;
      renderCanvas();
    });
  }

  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      activeGradientKey = themeSelect.value;
      renderCanvas();
    });
  }

  // Ratio Pill Clicks (if present)
  ratioPills.forEach(pill => {
    pill.addEventListener('click', () => {
      ratioPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentRatio = pill.dataset.ratio;
      renderCanvas();
    });
  });

  // Gradient Swatch Clicks (if present)
  gradientSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      gradientSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      activeGradientKey = swatch.dataset.grad;
      renderCanvas();
    });
  });

  // Font Size Slider (if present)
  if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', (e) => {
      if (fontSizeVal) fontSizeVal.textContent = `${e.target.value}px`;
      renderCanvas();
    });
  }

  // Event Listeners for live updates
  [textInput, authorInput, fontSelect, textAlignSelect].forEach(el => {
    if (el) el.addEventListener('input', renderCanvas);
  });

  if (glassCardToggle) {
    glassCardToggle.addEventListener('change', (e) => {
      isGlassEnabled = e.target.checked;
      renderCanvas();
    });
  }

  // Sample presets button (if present)
  if (presetQuotesBtn) {
    presetQuotesBtn.addEventListener('click', () => {
      const SAMPLE_QUOTES = [
        { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
        { text: "उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः।", author: "हितोपदेश" },
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "सफलता का कोई शॉर्टकट नहीं होता, केवल निरंतर प्रयास ही इसका मार्ग है।", author: "अनमोल वचन" },
        { text: "कर्म ही पूजा है, और सत्य ही सबसे बड़ा धर्म है।", author: "महात्मा गांधी" }
      ];
      const random = SAMPLE_QUOTES[Math.floor(Math.random() * SAMPLE_QUOTES.length)];
      if (textInput) textInput.value = random.text;
      if (authorInput) authorInput.value = random.author;
      renderCanvas();
      showToast('Loaded sample quote', 'info', 1500);
    });
  }

  // Render text to canvas with word wrap
  function renderCanvas() {
    // Base resolution dimensions
    const dimensions = {
      '1:1': { w: 1080, h: 1080 },
      '16:9': { w: 1280, h: 720 },
      '9:16': { w: 1080, h: 1920 },
      '4:5': { w: 1080, h: 1350 }
    }[currentRatio] || { w: 1080, h: 1080 };

    canvas.width = dimensions.w;
    canvas.height = dimensions.h;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw Background Gradient
    const colors = GRADIENT_PRESETS[activeGradientKey] || GRADIENT_PRESETS['cosmic'] || ['#0f172a', '#1e1b4b', '#4c1d95'];
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, colors[0]);
    bgGrad.addColorStop(0.5, colors[1]);
    bgGrad.addColorStop(1, colors[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle background mesh glow
    const radial = ctx.createRadialGradient(width * 0.3, height * 0.2, 50, width * 0.5, height * 0.5, width * 0.8);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // 2. Glass Card Container
    const padding = Math.round(width * 0.08);
    const cardX = padding;
    const cardY = padding;
    const cardW = width - (padding * 2);
    const cardH = height - (padding * 2);

    const isLightScheme = activeGradientKey === 'clean-light';
    const textColor = isLightScheme ? '#0f172a' : '#ffffff';
    const authorColor = isLightScheme ? '#475569' : 'rgba(255, 255, 255, 0.7)';

    if (isGlassEnabled) {
      ctx.save();
      const radius = 32;
      roundRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = isLightScheme ? 'rgba(255, 255, 255, 0.75)' : 'rgba(15, 23, 42, 0.55)';
      ctx.fill();

      // Glass border
      ctx.lineWidth = 2;
      ctx.strokeStyle = isLightScheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.18)';
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw Text
    const rawText = (textInput ? textInput.value.trim() : '') || 'Type your message or quote here...';
    const author = authorInput ? authorInput.value.trim() : '';
    const fontSize = fontSizeSlider ? (parseInt(fontSizeSlider.value, 10) || 38) : 38;
    const fontFamily = fontSelect ? fontSelect.value : 'Inter';
    const align = textAlignSelect ? textAlignSelect.value : 'center';

    ctx.fillStyle = textColor;
    ctx.font = `600 ${fontSize}px "${fontFamily}", "Nirmala UI", "Mangal", "Segoe UI", -apple-system, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';

    const innerMargin = isGlassEnabled ? 60 : 20;
    const maxTextWidth = cardW - (innerMargin * 2);
    const lineHeight = fontSize * 1.45;

    const lines = wrapText(ctx, rawText, maxTextWidth);
    const totalBlockHeight = (lines.length * lineHeight) + (author ? (fontSize * 1.5) : 0);

    let startY = (height / 2) - (totalBlockHeight / 2) + (lineHeight / 2);

    let posX = cardX + (cardW / 2);
    if (align === 'left') posX = cardX + innerMargin;
    if (align === 'right') posX = cardX + cardW - innerMargin;

    lines.forEach((line) => {
      ctx.fillText(line, posX, startY);
      startY += lineHeight;
    });

    // 4. Draw Author / Subtitle
    if (author) {
      startY += (fontSize * 0.4);
      ctx.fillStyle = authorColor;
      ctx.font = `400 ${Math.round(fontSize * 0.55)}px "${fontFamily}", -apple-system, sans-serif`;
      const authorText = `— ${author}`;
      ctx.fillText(authorText, posX, startY);
    }
  }

  function wrapText(context, text, maxWidth) {
    const paragraphs = text.split('\n');
    const allLines = [];

    paragraphs.forEach(paragraph => {
      if (paragraph.trim() === '') {
        allLines.push('');
        return;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const metrics = context.measureText(testLine);

        if (metrics.width > maxWidth && i > 0) {
          allLines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        allLines.push(currentLine);
      }
    });

    return allLines;
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  // Export PNG
  if (downloadPngBtn) {
    downloadPngBtn.addEventListener('click', () => {
      canvas.toBlob((blob) => {
        triggerDownload(blob, 'text_card.png');
        showToast('Downloaded image as PNG!', 'success');
      }, 'image/png');
    });
  }

  // Export JPG
  if (downloadJpgBtn) {
    downloadJpgBtn.addEventListener('click', () => {
      canvas.toBlob((blob) => {
        triggerDownload(blob, 'text_card.jpg');
        showToast('Downloaded image as JPG!', 'success');
      }, 'image/jpeg', 0.95);
    });
  }

  // Initial render once fonts load
  if (document.fonts) {
    document.fonts.ready.then(renderCanvas);
  }
  setTimeout(renderCanvas, 200);

})();
