/**
 * OmniConvert Studio - CSV & Table Data to PDF Report Generator
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const dropzone = document.getElementById('csv-dropzone');
  const fileInput = document.getElementById('csv-file');
  const fileInfo = document.getElementById('csv-file-info');
  const pasteInput = document.getElementById('csv-paste-input');
  const titleInput = document.getElementById('csv-doc-title');
  const orientSelect = document.getElementById('csv-orientation');
  const fontSizeSelect = document.getElementById('csv-fontsize');
  const generatePdfBtn = document.getElementById('csv-generate-pdf-btn');
  const clearBtn = document.getElementById('csv-clear-btn');
  const tablePreview = document.getElementById('csv-table-preview');
  const statusMsg = document.getElementById('csv-status');

  let parsedHeaders = [];
  let parsedRows = [];
  let currentFileName = 'table_report';

  if (!dropzone) return;

  setupDropzone(dropzone, fileInput, (files) => {
    const file = files[0];
    if (file) {
      currentFileName = file.name.replace(/\.[^/.]+$/, "");
      if (fileInfo) {
        fileInfo.innerHTML = `<strong>Selected:</strong> ${file.name} (${formatBytes(file.size)})`;
        fileInfo.style.display = 'block';
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        parseCsvData(e.target.result);
      };
      reader.readAsText(file);
    }
  });

  if (pasteInput) {
    pasteInput.addEventListener('input', () => {
      const val = pasteInput.value.trim();
      if (val) parseCsvData(val);
    });
  }

  function parseCsvData(text) {
    if (!text || !text.trim()) return;

    // Detect separator (comma, tab, or semicolon)
    const firstLine = text.split('\n')[0];
    let sep = ',';
    if (firstLine.includes('\t')) sep = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) sep = ';';

    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return;

    parsedHeaders = splitCsvLine(lines[0], sep);
    parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
      const row = splitCsvLine(lines[i], sep);
      if (row.length > 0) {
        parsedRows.push(row);
      }
    }

    renderTablePreview();
    if (generatePdfBtn) generatePdfBtn.disabled = false;
    if (clearBtn) clearBtn.disabled = false;
    if (statusMsg) statusMsg.textContent = `Parsed ${parsedRows.length} rows and ${parsedHeaders.length} columns. Ready to generate PDF.`;
    showToast(`Loaded ${parsedRows.length} rows of data!`, 'success');
  }

  function splitCsvLine(line, sep) {
    const result = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === sep && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  function renderTablePreview() {
    if (!tablePreview) return;
    if (parsedHeaders.length === 0) {
      tablePreview.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-dim);">No data parsed yet.</div>';
      return;
    }

    let html = '<div class="table-responsive"><table class="data-table"><thead><tr>';
    html += '<th>#</th>';
    parsedHeaders.forEach(h => {
      html += `<th>${escapeHtml(h)}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Show first 50 rows for preview speed
    const maxPreview = Math.min(50, parsedRows.length);
    for (let r = 0; r < maxPreview; r++) {
      html += `<tr><td>${r + 1}</td>`;
      parsedHeaders.forEach((h, c) => {
        const val = parsedRows[r][c] || '';
        html += `<td>${escapeHtml(val)}</td>`;
      });
      html += '</tr>';
    }

    html += '</tbody></table></div>';
    if (parsedRows.length > 50) {
      html += `<div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 8px;">Showing first 50 of ${parsedRows.length} rows. All rows will be included in the exported PDF.</div>`;
    }

    tablePreview.innerHTML = html;
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Generate Vector Table PDF
  if (generatePdfBtn) {
    generatePdfBtn.addEventListener('click', () => {
      if (parsedHeaders.length === 0 || !window.jspdf) return;

      const { jsPDF } = window.jspdf;
      const orientation = orientSelect ? orientSelect.value : (parsedHeaders.length > 5 ? 'landscape' : 'portrait');
      const fontSize = parseInt(fontSizeSelect ? fontSizeSelect.value : '9', 10) || 9;
      const docTitle = (titleInput ? titleInput.value.trim() : '') || currentFileName.replace(/_/g, ' ');

      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const usableW = pageW - (margin * 2);

      // Title & metadata banner
      let currentY = margin + 4;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text(docTitle.toUpperCase(), margin, currentY);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 116, 139);
      currentY += 5;
      pdf.text(`Generated via OmniConvert Studio — Regional Office, Faridabad | Total Records: ${parsedRows.length}`, margin, currentY);

      currentY += 7;

      // Calculate column widths proportional to content
      const colWidths = calculateColumnWidths(parsedHeaders, parsedRows, usableW);

      // Header row height & padding
      const rowHeight = fontSize * 0.75 + 3.5;
      const headerH = rowHeight + 2;

      function drawHeader(y) {
        pdf.setFillColor(30, 41, 59); // slate-800
        pdf.rect(margin, y, usableW, headerH, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(fontSize);
        pdf.setTextColor(255, 255, 255);

        let curX = margin;
        for (let i = 0; i < parsedHeaders.length; i++) {
          const w = colWidths[i];
          const text = pdf.splitTextToSize(parsedHeaders[i], w - 2)[0] || '';
          pdf.text(text, curX + 2, y + (headerH / 2) + (fontSize * 0.15));
          curX += w;
        }
        return y + headerH;
      }

      currentY = drawHeader(currentY);

      // Draw Data Rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(fontSize);

      for (let r = 0; r < parsedRows.length; r++) {
        // Page overflow check
        if (currentY + rowHeight > pageH - margin - 8) {
          pdf.addPage();
          currentY = margin;
          currentY = drawHeader(currentY);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(fontSize);
        }

        // Alternating zebra striping
        if (r % 2 === 1) {
          pdf.setFillColor(248, 250, 252); // slate-50
          pdf.rect(margin, currentY, usableW, rowHeight, 'F');
        }

        // Row border bottom
        pdf.setDrawColor(226, 232, 240); // slate-200
        pdf.setLineWidth(0.2);
        pdf.line(margin, currentY + rowHeight, margin + usableW, currentY + rowHeight);

        pdf.setTextColor(30, 41, 59);
        let curX = margin;
        for (let c = 0; c < parsedHeaders.length; c++) {
          const w = colWidths[c];
          const cellVal = (parsedRows[r][c] || '').toString();
          const clipped = pdf.splitTextToSize(cellVal, w - 2)[0] || '';
          pdf.text(clipped, curX + 2, currentY + (rowHeight / 2) + (fontSize * 0.15));
          curX += w;
        }

        currentY += rowHeight;
      }

      // Add Page Numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Page ${i} of ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' });
      }

      pdf.save(`${currentFileName}_report.pdf`);
      showToast(`Exported "${currentFileName}_report.pdf"!`, 'success');
    });
  }

  function calculateColumnWidths(headers, rows, totalWidth) {
    const minW = 18;
    const weights = headers.map((h, i) => {
      let maxLen = h.length;
      for (let r = 0; r < Math.min(30, rows.length); r++) {
        if (rows[r][i]) maxLen = Math.max(maxLen, rows[r][i].length);
      }
      return Math.min(maxLen, 35);
    });

    const sumWeights = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => Math.max(minW, (w / sumWeights) * totalWidth));
  }

  // Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      parsedHeaders = [];
      parsedRows = [];
      if (fileInput) fileInput.value = '';
      if (pasteInput) pasteInput.value = '';
      if (fileInfo) fileInfo.style.display = 'none';
      if (tablePreview) tablePreview.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-dim);">No data parsed yet.</div>';
      if (generatePdfBtn) generatePdfBtn.disabled = true;
      if (clearBtn) clearBtn.disabled = true;
      if (statusMsg) statusMsg.textContent = 'Upload or paste CSV data to begin.';
      showToast('Cleared table data', 'info');
    });
  }

})();
