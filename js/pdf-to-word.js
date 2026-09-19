/**
 * OmniConvert Studio - PDF to Word (.docx) Converter Module (100% Offline)
 * Converts PDF documents into editable Microsoft Word (.docx) files using pure client-side OpenXML generation.
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const dropzone = document.getElementById('pdf-to-word-dropzone');
  const fileInput = document.getElementById('pdf-to-word-file');
  const fileInfoEl = document.getElementById('pdf-to-word-file-info');
  const outputEditor = document.getElementById('pdf-to-word-output');
  const downloadDocxBtn = document.getElementById('pdf-to-word-dl-docx');
  const downloadTxtBtn = document.getElementById('pdf-to-word-dl-txt');
  const copyBtn = document.getElementById('pdf-to-word-copy-btn');
  const clearBtn = document.getElementById('pdf-to-word-clear-btn');
  const statsPages = document.getElementById('pdf-to-word-pages');
  const statsWords = document.getElementById('pdf-to-word-words');
  const statsChars = document.getElementById('pdf-to-word-chars');
  const statusMsg = document.getElementById('pdf-to-word-status');
  const progressBar = document.getElementById('pdf-to-word-progress');
  const progressFill = document.getElementById('pdf-to-word-progress-fill');

  let originalPdfName = 'converted_document';
  let documentPagesData = []; // Array of { pageNum, lines: [] }

  if (!dropzone) return;

  if (typeof setupDropzone === 'function') {
    setupDropzone(dropzone, fileInput, (files) => {
      const file = files[0];
      if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
        convertPdfToWord(file);
      } else {
        showToast('Please select a valid PDF file.', 'error');
      }
    });
  }

  async function convertPdfToWord(file) {
    originalPdfName = file.name.replace(/\.[^/.]+$/, "");
    if (fileInfoEl) {
      fileInfoEl.innerHTML = `<strong>Selected:</strong> ${file.name} (${formatBytes(file.size)})`;
      fileInfoEl.style.display = 'block';
    }

    if (outputEditor) outputEditor.value = '';
    documentPagesData = [];
    updateStats(0, 0, 0);

    if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Loading PDF document...';
    if (progressBar) progressBar.classList.add('active');
    if (progressFill) progressFill.style.width = '10%';

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Configure PDF.js worker fallback for offline file:/// protocol
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library is not loaded.');
      }

      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) }).promise;
      const totalPages = pdf.numPages;

      let fullFormattedText = '';

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pct = Math.round((pageNum / totalPages) * 92);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (statusMsg) statusMsg.innerHTML = `<span class="spinner"></span> Converting page ${pageNum} of ${totalPages} to Word format...`;

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Group items into lines based on Y coordinate
        const lineMap = new Map();
        for (const item of textContent.items) {
          if (!item.str || item.str.trim() === '') continue;
          // Round Y coordinate to nearest 4 points to group same-line items
          const yKey = Math.round(item.transform[5] / 4) * 4;
          if (!lineMap.has(yKey)) {
            lineMap.set(yKey, []);
          }
          lineMap.get(yKey).push({
            x: item.transform[4],
            str: item.str,
            height: item.height || 12
          });
        }

        // Sort lines from top of page to bottom (descending Y)
        const sortedYKeys = Array.from(lineMap.keys()).sort((a, b) => b - a);
        const pageLines = [];

        for (const y of sortedYKeys) {
          const items = lineMap.get(y);
          // Sort items left to right (ascending X)
          items.sort((a, b) => a.x - b.x);
          const lineStr = items.map(it => it.str).join(' ');
          if (lineStr.trim()) {
            pageLines.push(lineStr.trim());
          }
        }

        documentPagesData.push({
          pageNum: pageNum,
          lines: pageLines
        });

        fullFormattedText += `[--- Page ${pageNum} ---]\n` + pageLines.join('\n') + '\n\n';
      }

      if (outputEditor) {
        outputEditor.value = fullFormattedText.trim();
      }

      const allWords = fullFormattedText.trim() ? fullFormattedText.trim().split(/\s+/).length : 0;
      const allChars = fullFormattedText.length;
      updateStats(totalPages, allWords, allChars);

      if (progressFill) progressFill.style.width = '100%';
      if (progressBar) setTimeout(() => progressBar.classList.remove('active'), 500);

      if (downloadDocxBtn) downloadDocxBtn.disabled = false;
      if (downloadTxtBtn) downloadTxtBtn.disabled = false;
      if (copyBtn) copyBtn.disabled = false;
      if (clearBtn) clearBtn.disabled = false;

      if (statusMsg) {
        statusMsg.textContent = `Successfully processed ${totalPages} page(s). Click "Download Word (.docx)" to save!`;
      }
      showToast(`Ready to export Word document (${totalPages} pages, ${allWords.toLocaleString()} words)`, 'success');

    } catch (err) {
      console.error('PDF to Word extraction error:', err);
      if (progressBar) progressBar.classList.remove('active');
      if (statusMsg) {
        statusMsg.textContent = 'Conversion failed: ' + err.message + '. (If scanned document, try Image to Text OCR).';
      }
      showToast('Failed to convert PDF: ' + err.message, 'error');
    }
  }

  function updateStats(pages, words, chars) {
    if (statsPages) statsPages.textContent = pages.toLocaleString();
    if (statsWords) statsWords.textContent = words.toLocaleString();
    if (statsChars) statsChars.textContent = chars.toLocaleString();
  }

  // Escape XML entities for OpenXML Word documents
  function escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Generate genuine OpenXML .docx file using JSZip
  async function generateDocxBlob(title, pagesData) {
    if (!window.JSZip) {
      throw new Error('JSZip library is not loaded. Cannot generate .docx file.');
    }

    const zip = new JSZip();

    // 1. [Content_Types].xml
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
    zip.file('[Content_Types].xml', contentTypesXml);

    // 2. _rels/.rels
    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
    zip.folder('_rels').file('.rels', relsXml);

    // 3. word/_rels/document.xml.rels
    const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`;
    zip.folder('word').folder('_rels').file('document.xml.rels', docRelsXml);

    // 4. word/styles.xml
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Arial"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:color w:val="222222"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:b/>
      <w:sz w:val="32"/>
      <w:color w:val="1E3A8A"/>
    </w:rPr>
  </w:style>
</w:styles>`;
    zip.folder('word').file('styles.xml', stylesXml);

    // 5. word/settings.xml
    const settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:zoom w:percent="100"/>
  <w:defaultTabStop w:val="720"/>
</w:settings>`;
    zip.folder('word').file('settings.xml', settingsXml);

    // 6. docProps/core.xml & app.xml
    const nowIso = new Date().toISOString();
    const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>OmniConvert Studio - Niraj Kumar, Section Supervisor, RO, Faridabad</dc:creator>
  <cp:lastModifiedBy>OmniConvert Studio</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:modified>
</cp:coreProperties>`;
    zip.folder('docProps').file('core.xml', coreXml);

    const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>OmniConvert Studio</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
</Properties>`;
    zip.folder('docProps').file('app.xml', appXml);

    // 7. word/document.xml (Build body paragraphs with formatting & page breaks)
    let bodyXml = '';

    // If user modified text in editor, parse that; otherwise use original pagesData
    const editorText = outputEditor ? outputEditor.value.trim() : '';
    
    if (editorText) {
      const editorParagraphs = editorText.split('\n');
      for (let i = 0; i < editorParagraphs.length; i++) {
        const line = editorParagraphs[i].trim();
        if (line.startsWith('[--- Page ') && line.endsWith(' ---]')) {
          if (i > 0) {
            // Page break
            bodyXml += `    <w:p><w:r><w:br w:type="page"/></w:r></w:p>\n`;
          }
          continue;
        }

        if (!line) {
          bodyXml += `    <w:p/>\n`;
          continue;
        }

        bodyXml += `    <w:p>
      <w:r>
        <w:t xml:space="preserve">${escapeXml(line)}</w:t>
      </w:r>
    </w:p>\n`;
      }
    } else {
      // Use structured pages
      for (let p = 0; p < pagesData.length; p++) {
        if (p > 0) {
          bodyXml += `    <w:p><w:r><w:br w:type="page"/></w:r></w:p>\n`;
        }
        for (const line of pagesData[p].lines) {
          bodyXml += `    <w:p>
      <w:r>
        <w:t xml:space="preserve">${escapeXml(line)}</w:t>
      </w:r>
    </w:p>\n`;
        }
      }
    }

    // A4 Page Setup (11906 x 16838 dxa = 210 x 297 mm), Margins: 1440 dxa = 1 inch
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
    zip.folder('word').file('document.xml', documentXml);

    return await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }

  // Download Word (.docx) Button
  if (downloadDocxBtn) {
    downloadDocxBtn.addEventListener('click', async () => {
      const text = outputEditor ? outputEditor.value.trim() : '';
      if (!text) {
        showToast('No document content to export.', 'error');
        return;
      }

      if (statusMsg) statusMsg.innerHTML = '<span class="spinner"></span> Assembling Word (.docx) file...';

      try {
        const docxBlob = await generateDocxBlob(originalPdfName, documentPagesData);
        const fileName = `${originalPdfName}.docx`;
        
        if (typeof triggerDownload === 'function') {
          triggerDownload(docxBlob, fileName);
        } else {
          const url = URL.createObjectURL(docxBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        if (statusMsg) statusMsg.textContent = `Generated and downloaded "${fileName}" successfully!`;
        showToast(`Downloaded Word file: "${fileName}"!`, 'success');

      } catch (err) {
        console.error('Word file generation error:', err);
        if (statusMsg) statusMsg.textContent = 'Failed to generate Word document: ' + err.message;
        showToast('Error creating Word file: ' + err.message, 'error');
      }
    });
  }

  // Download Plain Text (.txt)
  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener('click', () => {
      const text = outputEditor ? outputEditor.value : '';
      if (!text) return;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      triggerDownload(blob, `${originalPdfName}_text.txt`);
      showToast('Downloaded text document (.txt)', 'success');
    });
  }

  // Copy to Clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = outputEditor ? outputEditor.value : '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied Word document content to clipboard!', 'success');
      } catch (e) {
        if (outputEditor) {
          outputEditor.select();
          document.execCommand('copy');
          showToast('Copied to clipboard!', 'success');
        }
      }
    });
  }

  // Clear Button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (outputEditor) outputEditor.value = '';
      if (fileInfoEl) fileInfoEl.style.display = 'none';
      if (fileInput) fileInput.value = '';
      documentPagesData = [];
      updateStats(0, 0, 0);
      if (downloadDocxBtn) downloadDocxBtn.disabled = true;
      if (downloadTxtBtn) downloadTxtBtn.disabled = true;
      if (copyBtn) copyBtn.disabled = true;
      if (clearBtn) clearBtn.disabled = true;
      if (statusMsg) statusMsg.textContent = 'Select a PDF document above to convert to Word.';
      showToast('Cleared document', 'info');
    });
  }

})();
