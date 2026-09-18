/**
 * OmniConvert Studio - Image Split & Slicer Module
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let loadedImage = null;
  let imageName = 'image';
  let slicedCanvases = [];

  const dropzone = document.getElementById('img-split-dropzone');
  const fileInput = document.getElementById('img-split-file');
  const gridSelect = document.getElementById('img-split-grid');
  const customCols = document.getElementById('img-split-cols');
  const customRows = document.getElementById('img-split-rows');
  const customGroup = document.getElementById('img-split-custom-group');
  const splitBtn = document.getElementById('img-split-btn');
  const downloadAllBtn = document.getElementById('img-split-dl-all-btn');
  const clearBtn = document.getElementById('img-split-clear-btn');
  const canvasPreview = document.getElementById('img-split-canvas-preview');
  const tilesPreview = document.getElementById('img-split-tiles') || document.getElementById('img-split-tiles-preview');
  const statusMsg = document.getElementById('img-split-status');
  const fileInfoEl = document.getElementById('img-split-file-info');

  if (!dropzone) return;

  if (gridSelect) {
    gridSelect.addEventListener('change', () => {
      if (customGroup) {
        customGroup.style.display = (gridSelect.value === 'custom') ? 'grid' : 'none';
      }
      drawOverlay();
    });
  }

  [customCols, customRows].forEach(el => {
    if (el) el.addEventListener('input', drawOverlay);
  });

  setupDropzone(dropzone, fileInput, (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      imageName = file.name.replace(/\.[^/.]+$/, "");
      if (fileInfoEl) {
        fileInfoEl.innerHTML = `<strong>Selected:</strong> ${file.name} (${formatBytes(file.size)})`;
        fileInfoEl.style.display = 'block';
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          loadedImage = img;
          drawOverlay();
          if (splitBtn) splitBtn.disabled = false;
          if (clearBtn) clearBtn.disabled = false;
          if (statusMsg) statusMsg.textContent = `Loaded "${file.name}" (${img.width} x ${img.height} px). Choose layout and click Split Image.`;
          showToast('Image loaded successfully', 'success');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      showToast('Please select a valid image file.', 'error');
    }
  });

  function getRowsAndCols() {
    const val = gridSelect ? gridSelect.value : '2x2';
    if (val === '2x2') return { rows: 2, cols: 2 };
    if (val === '3x3') return { rows: 3, cols: 3 };
    if (val === '1x3') return { rows: 3, cols: 1 }; // 3 vertical parts
    if (val === '3x1') return { rows: 1, cols: 3 }; // 3 horizontal parts
    if (val === 'custom') {
      const c = Math.max(1, parseInt(customCols ? customCols.value : '2', 10) || 2);
      const r = Math.max(1, parseInt(customRows ? customRows.value : '2', 10) || 2);
      return { rows: r, cols: c };
    }
    return { rows: 2, cols: 2 };
  }

  function drawOverlay() {
    if (!loadedImage || !canvasPreview) return;
    const ctx = canvasPreview.getContext('2d');
    const { rows, cols } = getRowsAndCols();

    // Scale canvas for preview
    const maxDim = 500;
    const scale = Math.min(1, maxDim / Math.max(loadedImage.width, loadedImage.height));
    canvasPreview.width = loadedImage.width * scale;
    canvasPreview.height = loadedImage.height * scale;

    ctx.drawImage(loadedImage, 0, 0, canvasPreview.width, canvasPreview.height);

    // Draw grid guide lines
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);

    const cellW = canvasPreview.width / cols;
    const cellH = canvasPreview.height / rows;

    for (let c = 1; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, canvasPreview.height);
      ctx.stroke();
    }

    for (let r = 1; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(canvasPreview.width, r * cellH);
      ctx.stroke();
    }
  }

  // Split Button Clicked
  if (splitBtn) {
    splitBtn.addEventListener('click', () => {
      if (!loadedImage) return;

      const { rows, cols } = getRowsAndCols();
      const cellW = Math.floor(loadedImage.width / cols);
      const cellH = Math.floor(loadedImage.height / rows);

      if (tilesPreview) tilesPreview.innerHTML = '';
      slicedCanvases = [];

      let tileNum = 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tileCanvas = document.createElement('canvas');
          tileCanvas.width = cellW;
          tileCanvas.height = cellH;
          const ctx = tileCanvas.getContext('2d');

          ctx.drawImage(
            loadedImage,
            c * cellW, r * cellH, cellW, cellH,
            0, 0, cellW, cellH
          );

          slicedCanvases.push({ num: tileNum, canvas: tileCanvas });

          // Add to thumbnail grid
          if (tilesPreview) {
            const card = document.createElement('div');
            card.className = 'preview-item';
            const thumb = document.createElement('div');
            thumb.className = 'preview-thumb';
            const img = document.createElement('img');
            img.src = tileCanvas.toDataURL('image/png');
            thumb.appendChild(img);

            const info = document.createElement('div');
            info.className = 'preview-info';
            info.innerHTML = `<span>Tile ${tileNum} (${cellW}x${cellH})</span>`;

            const actions = document.createElement('div');
            actions.className = 'preview-actions';
            const dlBtn = document.createElement('button');
            dlBtn.className = 'item-btn';
            dlBtn.title = 'Download Tile';
            dlBtn.innerHTML = '↓';
            const currentNum = tileNum;
            dlBtn.addEventListener('click', () => {
              tileCanvas.toBlob(b => triggerDownload(b, `${imageName}_tile_${currentNum}.png`));
            });
            actions.appendChild(dlBtn);
            info.appendChild(actions);

            card.appendChild(thumb);
            card.appendChild(info);
            tilesPreview.appendChild(card);
          }

          tileNum++;
        }
      }

      if (downloadAllBtn) downloadAllBtn.disabled = false;
      if (statusMsg) statusMsg.textContent = `Split into ${slicedCanvases.length} tiles! Download individually or as ZIP.`;
      showToast(`Created ${slicedCanvases.length} image tiles!`, 'success');
    });
  }

  // Download All as ZIP
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', async () => {
      if (slicedCanvases.length === 0 || !window.JSZip) return;

      downloadAllBtn.disabled = true;
      if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Packing tiles into ZIP archive...';

      const zip = new JSZip();
      for (const item of slicedCanvases) {
        const blob = await new Promise(res => item.canvas.toBlob(res, 'image/png'));
        zip.file(`${imageName}_part_${item.num}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(zipBlob, `${imageName}_split_tiles.zip`);

      downloadAllBtn.disabled = false;
      if (statusMsg) statusMsg.textContent = 'ZIP download initiated!';
      showToast('Downloaded all tiles in ZIP!', 'success');
    });
  }

  // Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      loadedImage = null;
      slicedCanvases = [];
      if (fileInput) fileInput.value = '';
      if (fileInfoEl) fileInfoEl.style.display = 'none';
      if (tilesPreview) {
        tilesPreview.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 40px 10px;">Sliced image tiles will appear here for download.</div>';
      }
      if (splitBtn) splitBtn.disabled = true;
      if (downloadAllBtn) downloadAllBtn.disabled = true;
      if (clearBtn) clearBtn.disabled = true;
      if (statusMsg) statusMsg.textContent = 'Select an image above to begin.';
      showToast('Cleared image split data', 'info');
    });
  }

})();
