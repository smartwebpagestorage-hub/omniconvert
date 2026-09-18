/**
 * OmniConvert Studio - Main Application Orchestrator
 */

// Toast notification helper
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = {
    success: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  }[type] || '';

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Global Theme Management
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('omni-theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      localStorage.setItem('omni-theme', currentTheme);
      showToast(`Switched to ${currentTheme} theme`, 'info', 1500);
    });
  }
}

// Tab & Flyout Navigation
function initTabs() {
  const navTriggers = document.querySelectorAll('[data-tool]');
  const panels = document.querySelectorAll('.tool-panel');
  const topbarTitle = document.getElementById('active-tool-title');
  const navItemWrappers = document.querySelectorAll('.nav-item-wrapper');

  function switchTool(toolId, triggerEl) {
    panels.forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.flyout-item').forEach(fi => fi.classList.remove('active'));
    document.querySelectorAll('.sidebar-btn').forEach(sb => sb.classList.remove('active'));
    navItemWrappers.forEach(nw => nw.classList.remove('active'));

    const targetPanel = document.getElementById(`panel-${toolId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    if (triggerEl) {
      triggerEl.classList.add('active');
      const parentWrapper = triggerEl.closest('.nav-item-wrapper');
      if (parentWrapper) {
        parentWrapper.classList.add('active');
        const parentBtn = parentWrapper.querySelector('.sidebar-btn');
        if (parentBtn) parentBtn.classList.add('active');
      }
    }

    // Update Topbar Title
    if (topbarTitle && targetPanel) {
      const headerH2 = targetPanel.querySelector('.tool-header h2');
      if (headerH2) {
        topbarTitle.textContent = headerH2.textContent;
      }
    }

    // Close flyouts
    navItemWrappers.forEach(w => w.classList.remove('flyout-open'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const toolId = trigger.dataset.tool;
      if (toolId) {
        switchTool(toolId, trigger);
      }
    });
  });

  // Toggle flyout on click for touch/mobile devices
  navItemWrappers.forEach(wrapper => {
    const btn = wrapper.querySelector('.sidebar-btn');
    const flyout = wrapper.querySelector('.flyout-menu');
    if (btn && flyout) {
      btn.addEventListener('click', (e) => {
        if (!btn.dataset.tool) {
          e.stopPropagation();
          const isOpen = wrapper.classList.contains('flyout-open');
          navItemWrappers.forEach(w => w.classList.remove('flyout-open'));
          if (!isOpen) wrapper.classList.add('flyout-open');
        }
      });
    }
  });

  // Close flyout on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item-wrapper')) {
      navItemWrappers.forEach(w => w.classList.remove('flyout-open'));
    }
  });
}

// Drag and drop helper for any dropzone
function setupDropzone(dropzoneEl, fileInputEl, onFilesSelected) {
  if (!dropzoneEl || !fileInputEl) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzoneEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzoneEl.classList.remove('dragover');
    }, false);
  });

  dropzoneEl.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  });

  fileInputEl.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  });
}

// Format file size
function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Download a blob or dataURL (with optional monetization timer modal)
function triggerDownload(urlOrBlob, filename) {
  const performActualDownload = () => {
    const a = document.createElement('a');
    if (typeof urlOrBlob === 'string') {
      a.href = urlOrBlob;
    } else {
      a.href = URL.createObjectURL(urlOrBlob);
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof urlOrBlob !== 'string') {
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
  };

  const isOnline = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  const cfg = window.ADS_CONFIG;
  const showModal = cfg && cfg.enabled && cfg.downloadTimer && cfg.downloadTimer.enabled && (!cfg.onlineOnly || isOnline);

  if (showModal) {
    showDownloadAdModal(filename, performActualDownload);
  } else {
    performActualDownload();
  }
}

// Download Countdown & Ad Modal
function showDownloadAdModal(filename, onDownload) {
  const overlay = document.getElementById('download-ad-modal-overlay');
  const filenameEl = document.getElementById('download-modal-filename');
  const countdownNumEl = document.getElementById('download-countdown-num');
  const actionBtn = document.getElementById('download-modal-action-btn');
  const closeBtn = document.getElementById('download-modal-close');

  if (!overlay) {
    onDownload();
    return;
  }

  if (filenameEl) filenameEl.textContent = filename;
  overlay.style.display = 'flex';

  let remaining = (window.ADS_CONFIG && window.ADS_CONFIG.downloadTimer && window.ADS_CONFIG.downloadTimer.seconds) || 3;
  if (countdownNumEl) countdownNumEl.textContent = remaining;

  let downloaded = false;
  const doDownload = () => {
    if (!downloaded) {
      downloaded = true;
      onDownload();
      if (actionBtn) {
        actionBtn.innerHTML = '✅ Downloaded! (Click to re-download)';
        actionBtn.classList.remove('btn-emerald');
        actionBtn.classList.add('btn-primary');
      }
    } else {
      onDownload();
    }
  };

  const timerInterval = setInterval(() => {
    remaining--;
    if (countdownNumEl) countdownNumEl.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      if (window.ADS_CONFIG && window.ADS_CONFIG.downloadTimer && window.ADS_CONFIG.downloadTimer.autoDownload) {
        doDownload();
      }
    }
  }, 1000);

  const cleanup = () => {
    clearInterval(timerInterval);
    overlay.style.display = 'none';
  };

  if (actionBtn) {
    actionBtn.onclick = () => {
      clearInterval(timerInterval);
      doDownload();
    };
  }

  if (closeBtn) closeBtn.onclick = cleanup;
  overlay.onclick = (e) => {
    if (e.target === overlay) cleanup();
  };
}


/**
 * Adaptively compress an image (Image or Canvas) to fit under targetMaxBytes
 */
async function adaptiveCompressImage(sourceImgOrCanvas, targetMaxBytes) {
  let srcCanvas;
  if (sourceImgOrCanvas instanceof HTMLCanvasElement) {
    srcCanvas = sourceImgOrCanvas;
  } else {
    srcCanvas = document.createElement('canvas');
    srcCanvas.width = sourceImgOrCanvas.naturalWidth || sourceImgOrCanvas.width;
    srcCanvas.height = sourceImgOrCanvas.naturalHeight || sourceImgOrCanvas.height;
    const ctx = srcCanvas.getContext('2d');
    ctx.drawImage(sourceImgOrCanvas, 0, 0);
  }

  // If no target limit, return standard high quality
  if (!targetMaxBytes || targetMaxBytes <= 0) {
    const blob = await new Promise(r => srcCanvas.toBlob(r, 'image/jpeg', 0.92));
    const dataUrl = await new Promise(r => {
      const reader = new FileReader();
      reader.onload = e => r(e.target.result);
      reader.readAsDataURL(blob);
    });
    return { dataUrl, blob, size: blob.size, width: srcCanvas.width, height: srcCanvas.height };
  }

  // Iterative quality reduction & scaling down
  const qualitySteps = [0.90, 0.80, 0.70, 0.55, 0.40, 0.25];
  let bestResult = null;

  for (let scale of [1.0, 0.8, 0.65, 0.5]) {
    const curCanvas = document.createElement('canvas');
    curCanvas.width = Math.round(srcCanvas.width * scale);
    curCanvas.height = Math.round(srcCanvas.height * scale);
    const curCtx = curCanvas.getContext('2d');
    curCtx.drawImage(srcCanvas, 0, 0, curCanvas.width, curCanvas.height);

    for (let q of qualitySteps) {
      const blob = await new Promise(r => curCanvas.toBlob(r, 'image/jpeg', q));
      if (!bestResult || blob.size < bestResult.size) {
        bestResult = { blob, width: curCanvas.width, height: curCanvas.height };
      }
      if (blob.size <= targetMaxBytes) {
        const dataUrl = await new Promise(r => {
          const reader = new FileReader();
          reader.onload = e => r(e.target.result);
          reader.readAsDataURL(blob);
        });
        return { dataUrl, blob, size: blob.size, width: curCanvas.width, height: curCanvas.height };
      }
    }
  }

  // If even lowest is slightly above, return best achieved
  const finalBlob = bestResult.blob;
  const dataUrl = await new Promise(r => {
    const reader = new FileReader();
    reader.onload = e => r(e.target.result);
    reader.readAsDataURL(finalBlob);
  });
  return { dataUrl, blob: finalBlob, size: finalBlob.size, width: bestResult.width, height: bestResult.height };
}

function initAboutModal() {
  const openBtn = document.getElementById('about-creator-btn');
  const overlay = document.getElementById('about-modal-overlay');
  const closeBtn = document.getElementById('about-modal-close');
  const okBtn = document.getElementById('about-modal-ok-btn');

  if (!overlay) return;

  const showModal = () => { overlay.style.display = 'flex'; };
  const hideModal = () => { overlay.style.display = 'none'; };

  if (openBtn) openBtn.addEventListener('click', showModal);
  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (okBtn) okBtn.addEventListener('click', hideModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal();
  });
}

// Online Fillable Forms Hub with connectivity detection
function initOnlineFormsPortal() {
  const portalUrl = 'https://smartwebpagestorage-hub.github.io/all-type-fillable-form/';
  const offlineOverlay = document.getElementById('offline-modal-overlay');
  const offlineCloseBtn = document.getElementById('offline-modal-close');
  const offlineOkBtn = document.getElementById('offline-modal-ok-btn');
  const offlineRetryBtn = document.getElementById('offline-modal-retry-btn');
  const btnSidebar = document.getElementById('btn-online-forms');
  const btnTopbar = document.getElementById('topbar-forms-btn');

  const showOfflineNotice = () => {
    if (offlineOverlay) {
      offlineOverlay.style.display = 'flex';
    } else {
      const msg = (typeof currentLanguage !== 'undefined' && currentLanguage === 'hi')
        ? '⚠️ आप ऑफ़लाइन हैं! ऑनलाइन फॉर्म पोर्टल खोलने के लिए सक्रिय इंटरनेट कनेक्शन आवश्यक है।'
        : '⚠️ You are currently offline! An active internet connection is required to open the Fillable Forms Hub.';
      showToast(msg, 'error', 4500);
    }
  };

  const hideOfflineNotice = () => {
    if (offlineOverlay) offlineOverlay.style.display = 'none';
  };

  if (offlineCloseBtn) offlineCloseBtn.addEventListener('click', hideOfflineNotice);
  if (offlineOkBtn) offlineOkBtn.addEventListener('click', hideOfflineNotice);
  if (offlineOverlay) {
    offlineOverlay.addEventListener('click', (e) => {
      if (e.target === offlineOverlay) hideOfflineNotice();
    });
  }

  const handlePortalLaunch = (e) => {
    if (!navigator.onLine) {
      if (e) e.preventDefault();
      showOfflineNotice();
    } else {
      // User is online: let standard navigation proceed or notify user
      hideOfflineNotice();
      if (typeof showToast === 'function') {
        const successMsg = (typeof currentLanguage !== 'undefined' && currentLanguage === 'hi')
          ? '🚀 ऑनलाइन फॉर्म पोर्टल खोला जा रहा है...'
          : '🚀 Opening Fillable Forms Hub...';
        showToast(successMsg, 'success', 2500);
      }
    }
  };

  if (offlineRetryBtn) {
    offlineRetryBtn.addEventListener('click', () => {
      if (navigator.onLine) {
        window.open(portalUrl, '_blank', 'noopener,noreferrer');
        hideOfflineNotice();
      } else {
        showOfflineNotice();
      }
    });
  }

  if (btnSidebar) btnSidebar.addEventListener('click', handlePortalLaunch);
  if (btnTopbar) btnTopbar.addEventListener('click', handlePortalLaunch);
}

// Privacy Policy and Terms of Service Modals (Required for Google AdSense Approval)
function initLegalModals() {
  const privacyLink = document.getElementById('footer-privacy-link');
  const termsLink = document.getElementById('footer-terms-link');
  const privacyOverlay = document.getElementById('privacy-modal-overlay');
  const termsOverlay = document.getElementById('terms-modal-overlay');
  const privacyClose = document.getElementById('privacy-modal-close');
  const termsClose = document.getElementById('terms-modal-close');
  const privacyOk = document.getElementById('privacy-modal-ok-btn');
  const termsOk = document.getElementById('terms-modal-ok-btn');

  const setupModal = (link, overlay, closeBtn, okBtn) => {
    if (!overlay) return;
    const show = () => { overlay.style.display = 'flex'; };
    const hide = () => { overlay.style.display = 'none'; };
    if (link) link.addEventListener('click', show);
    if (closeBtn) closeBtn.addEventListener('click', hide);
    if (okBtn) okBtn.addEventListener('click', hide);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) hide();
    });
  };

  setupModal(privacyLink, privacyOverlay, privacyClose, privacyOk);
  setupModal(termsLink, termsOverlay, termsClose, termsOk);
}

// Display Ad Slots if online and enabled
function initAdSlots() {
  const isOnline = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  const cfg = window.ADS_CONFIG;
  if (!cfg || !cfg.enabled) return;
  if (cfg.onlineOnly && !isOnline) return;

  const topSlot = document.getElementById('ad-slot-top');
  const sidebarSlot = document.getElementById('ad-slot-sidebar');
  if (topSlot) topSlot.style.display = 'block';
  if (sidebarSlot) sidebarSlot.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initAboutModal();
  initOnlineFormsPortal();
  initLegalModals();
  initAdSlots();

  // Configure PDF.js worker if available (offline local worker)
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
  }
});

