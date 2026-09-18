/**
 * OmniConvert Studio - PDF to Text Extraction Module
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  let extractedTextData = '';
  let originalPdfName = 'extracted_text';

  const dropzone = document.getElementById('pdf-to-txt-dropzone');
  const fileInput = document.getElementById('pdf-to-txt-file');
  const outputEditor = document.getElementById('pdf-to-txt-output');
  const searchInput = document.getElementById('pdf-to-txt-search');
  const copyBtn = document.getElementById('pdf-to-txt-copy-btn');
  const downloadBtn = document.getElementById('pdf-to-txt-download-btn') || document.getElementById('pdf-to-txt-dl-txt');
  const downloadMdBtn = document.getElementById('pdf-to-txt-dl-md');
  const clearBtn = document.getElementById('pdf-to-txt-clear-btn');
  const pageCountBadge = document.getElementById('pdf-to-txt-pages');
  const wordCountBadge = document.getElementById('pdf-to-txt-words');
  const charCountBadge = document.getElementById('pdf-to-txt-chars');
  const statusMsg = document.getElementById('pdf-to-txt-status');
  const progressBar = document.getElementById('pdf-to-txt-progress');
  const progressFill = document.getElementById('pdf-to-txt-progress-fill');

  if (!dropzone) return;

  setupDropzone(dropzone, fileInput, (files) => {
    const file = files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      extractTextFromPdf(file);
    } else {
      showToast('Please select a valid PDF file.', 'error');
    }
  });

  async function extractTextFromPdf(file) {
    originalPdfName = file.name.replace(/\.[^/.]+$/, "");
    if (outputEditor) outputEditor.value = '';
    extractedTextData = '';
    updateStats(0, 0, 0);

    if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Reading PDF file...';
    if (progressBar) progressBar.classList.add('active');
    if (progressFill) progressFill.style.width = '10%';

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) }).promise;
      const totalPages = pdf.numPages;

      let fullText = '';

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        if (statusMsg) statusMsg.innerHTML = `<span class="spinner"></span> Extracting text from page ${pageNum} of ${totalPages}...`;
        if (progressFill) progressFill.style.width = `${Math.round((pageNum / totalPages) * 95)}%`;

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let lastY = null;
        let pageText = `--- Page ${pageNum} ---\n`;

        for (const item of textContent.items) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n';
          }
          pageText += item.str + ' ';
          lastY = item.transform[5];
        }

        fullText += pageText.trim() + '\n\n';
      }

      extractedTextData = fullText.trim();
      if (outputEditor) outputEditor.value = extractedTextData;

      // Stats
      const words = extractedTextData ? extractedTextData.split(/\s+/).length : 0;
      const chars = extractedTextData.length;
      updateStats(totalPages, words, chars);

      if (progressFill) progressFill.style.width = '100%';
      if (progressBar) setTimeout(() => progressBar.classList.remove('active'), 400);
      if (statusMsg) statusMsg.textContent = `Extracted text from ${totalPages} page(s) successfully!`;
      showToast(`Extracted ${words.toLocaleString()} words`, 'success');

      if (copyBtn) copyBtn.disabled = false;
      if (downloadBtn) downloadBtn.disabled = false;
      if (downloadMdBtn) downloadMdBtn.disabled = false;
    } catch (err) {
      console.error(err);
      if (progressBar) progressBar.classList.remove('active');
      if (statusMsg) statusMsg.textContent = 'Failed to extract text. File might be an image-only scan or encrypted.';
      showToast('Text extraction failed. Try OCR if it is a scanned image.', 'error');
    }
  }

  function updateStats(pages, words, chars) {
    if (pageCountBadge) pageCountBadge.textContent = pages.toLocaleString();
    if (wordCountBadge) wordCountBadge.textContent = words.toLocaleString();
    if (charCountBadge) charCountBadge.textContent = chars.toLocaleString();
  }

  // Copy to clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const textToCopy = outputEditor ? outputEditor.value : '';
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast('Copied text to clipboard!', 'success');
      } catch (e) {
        if (outputEditor) {
          outputEditor.select();
          document.execCommand('copy');
          showToast('Copied text to clipboard!', 'success');
        }
      }
    });
  }

  // Download TXT
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const text = outputEditor ? outputEditor.value : '';
      if (!text) return;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      triggerDownload(blob, `${originalPdfName}_extracted.txt`);
      showToast('Downloaded .txt file', 'success');
    });
  }

  // Download Markdown
  if (downloadMdBtn) {
    downloadMdBtn.addEventListener('click', () => {
      const text = outputEditor ? outputEditor.value : '';
      if (!text) return;
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      triggerDownload(blob, `${originalPdfName}_extracted.md`);
      showToast('Downloaded .md file', 'success');
    });
  }

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query || !extractedTextData) {
        if (outputEditor) outputEditor.value = extractedTextData;
        return;
      }

      // Filter lines containing the query
      const lines = extractedTextData.split('\n');
      const matches = lines.filter(line => line.toLowerCase().includes(query) || line.startsWith('--- Page'));
      if (outputEditor) outputEditor.value = matches.join('\n');
    });
  }

  // Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (outputEditor) outputEditor.value = '';
      extractedTextData = '';
      updateStats(0, 0, 0);
      if (copyBtn) copyBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      if (downloadMdBtn) downloadMdBtn.disabled = true;
      if (statusMsg) statusMsg.textContent = 'Ready to extract text from PDF.';
      showToast('Cleared extracted text', 'info');
    });
  }

})();
