/**
 * OmniConvert Studio - Official Receipt & Memo Generator
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

(function() {
  const orgNameInput = document.getElementById('rcpt-org-name');
  const orgSubInput = document.getElementById('rcpt-org-sub');
  const rcptNoInput = document.getElementById('rcpt-no');
  const rcptDateInput = document.getElementById('rcpt-date');
  const payerNameInput = document.getElementById('rcpt-payer');
  const refNoInput = document.getElementById('rcpt-ref');
  const payModeSelect = document.getElementById('rcpt-pay-mode');
  const stampToggle = document.getElementById('rcpt-stamp-toggle');
  const addItemBtn = document.getElementById('rcpt-add-item-btn');
  const itemsContainer = document.getElementById('rcpt-items-container');
  const downloadPdfBtn = document.getElementById('rcpt-dl-pdf-btn');
  const previewBox = document.getElementById('rcpt-preview-card');
  const totalAmountEl = document.getElementById('rcpt-total-amount');

  if (!itemsContainer) return;

  // Set default receipt number & date
  if (rcptNoInput) {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    rcptNoInput.value = `REC-${new Date().getFullYear()}-${randomSeq}`;
  }
  if (rcptDateInput) {
    rcptDateInput.value = new Date().toISOString().split('T')[0];
  }

  // Add Item row
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
      addItemRow('', '');
      calculateTotal();
      renderReceiptPreview();
    });
  }

  function addItemRow(desc = '', amt = '') {
    const row = document.createElement('div');
    row.className = 'rcpt-item-row';
    row.innerHTML = `
      <input type="text" class="form-control rcpt-item-desc" placeholder="Item description / particulars" value="${desc}">
      <input type="number" class="form-control rcpt-item-amt" placeholder="Amount (₹)" style="width: 140px;" value="${amt}">
      <button type="button" class="btn btn-secondary rcpt-del-item" title="Remove">✕</button>
    `;

    row.querySelector('.rcpt-del-item').addEventListener('click', () => {
      if (itemsContainer.querySelectorAll('.rcpt-item-row').length > 1) {
        row.remove();
        calculateTotal();
        renderReceiptPreview();
      } else {
        showToast('At least one item is required.', 'info');
      }
    });

    row.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        calculateTotal();
        renderReceiptPreview();
      });
    });

    itemsContainer.appendChild(row);
  }

  // Initial 2 items
  addItemRow('Document Processing & Attestation Fee', '500');
  addItemRow('Verification & Administrative Charges', '250');

  function calculateTotal() {
    let sum = 0;
    const amounts = itemsContainer.querySelectorAll('.rcpt-item-amt');
    amounts.forEach(inp => {
      const val = parseFloat(inp.value) || 0;
      sum += val;
    });
    if (totalAmountEl) {
      totalAmountEl.textContent = `₹ ${sum.toLocaleString('en-IN')}`;
    }
    return sum;
  }

  function getItemsData() {
    const items = [];
    const rows = itemsContainer.querySelectorAll('.rcpt-item-row');
    rows.forEach(r => {
      const desc = r.querySelector('.rcpt-item-desc').value.trim();
      const amt = parseFloat(r.querySelector('.rcpt-item-amt').value) || 0;
      if (desc || amt > 0) {
        items.push({ desc: desc || 'Item / Particulars', amt: amt });
      }
    });
    return items;
  }

  // Listeners for live preview
  [orgNameInput, orgSubInput, rcptNoInput, rcptDateInput, payerNameInput, refNoInput, payModeSelect, stampToggle].forEach(el => {
    if (el) el.addEventListener('input', renderReceiptPreview);
    if (el && el.type === 'checkbox') el.addEventListener('change', renderReceiptPreview);
  });

  function renderReceiptPreview() {
    if (!previewBox) return;
    const org = (orgNameInput ? orgNameInput.value.trim() : '') || 'REGIONAL OFFICE, FARIDABAD';
    const sub = (orgSubInput ? orgSubInput.value.trim() : '') || 'Employees\' Provident Fund Organization';
    const no = (rcptNoInput ? rcptNoInput.value.trim() : '') || 'REC-2026-0001';
    const date = (rcptDateInput ? rcptDateInput.value : '') || new Date().toLocaleDateString();
    const payer = (payerNameInput ? payerNameInput.value.trim() : '') || 'M/s ABC Enterprises / Member Name';
    const ref = (refNoInput ? refNoInput.value.trim() : '') || 'UAN: 100987654321';
    const mode = (payModeSelect ? payModeSelect.value : 'Online/NEFT');
    const items = getItemsData();
    const total = calculateTotal();
    const hasStamp = stampToggle ? stampToggle.checked : true;

    let rowsHtml = '';
    items.forEach((it, idx) => {
      rowsHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td>${it.desc}</td>
          <td style="text-align: right; font-weight: 600;">₹ ${it.amt.toLocaleString('en-IN')}</td>
        </tr>
      `;
    });

    previewBox.innerHTML = `
      <div class="receipt-paper">
        <div class="receipt-header">
          <h2>${org}</h2>
          <p>${sub}</p>
          <span class="rcpt-badge">OFFICIAL RECEIPT / पावती</span>
        </div>

        <div class="receipt-meta-grid">
          <div><strong>Receipt No:</strong> ${no}</div>
          <div style="text-align: right;"><strong>Date:</strong> ${date}</div>
          <div><strong>Received From:</strong> ${payer}</div>
          <div style="text-align: right;"><strong>Ref / ID:</strong> ${ref}</div>
          <div><strong>Payment Mode:</strong> ${mode}</div>
          <div style="text-align: right;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">PAID / सफल</span></div>
        </div>

        <table class="receipt-items-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Particulars / विवरण</th>
              <th style="width: 130px; text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="total-row">
              <td colspan="2" style="text-align: right; font-weight: bold;">TOTAL AMOUNT:</td>
              <td style="text-align: right; font-weight: bold; font-size: 1.1rem; color: #4f46e5;">₹ ${total.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="receipt-footer">
          <div class="rcpt-note">
            <small>This is a digitally generated official receipt issued under authority of RO Faridabad.</small>
          </div>
          ${hasStamp ? `
            <div class="rcpt-stamp-box">
              <div class="rcpt-official-stamp">
                <span>OFFICIAL SEAL</span><br>
                <strong>RO FARIDABAD</strong>
              </div>
              <div class="rcpt-sig-line">
                <strong>Niraj Kumar</strong><br>
                <span>Section Supervisor, RO, Faridabad</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (downloadPdfBtn) downloadPdfBtn.disabled = false;
  }

  // Generate Official PDF
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      if (!window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const org = (orgNameInput ? orgNameInput.value.trim() : '') || 'REGIONAL OFFICE, FARIDABAD';
      const sub = (orgSubInput ? orgSubInput.value.trim() : '') || 'Employees\' Provident Fund Organization';
      const no = (rcptNoInput ? rcptNoInput.value.trim() : '') || 'REC-2026-0001';
      const date = (rcptDateInput ? rcptDateInput.value : '') || new Date().toLocaleDateString();
      const payer = (payerNameInput ? payerNameInput.value.trim() : '') || 'M/s ABC Enterprises / Member Name';
      const ref = (refNoInput ? refNoInput.value.trim() : '') || 'UAN: 100987654321';
      const mode = (payModeSelect ? payModeSelect.value : 'Online/NEFT');
      const items = getItemsData();
      const total = calculateTotal();
      const hasStamp = stampToggle ? stampToggle.checked : true;

      const pageW = 210;
      const margin = 20;
      const contentW = pageW - (margin * 2);

      // Outer border
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.5);
      pdf.rect(margin - 4, margin - 4, contentW + 8, 240);

      // Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(15, 23, 42);
      pdf.text(org.toUpperCase(), pageW / 2, margin + 8, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(sub, pageW / 2, margin + 14, { align: 'center' });

      pdf.setFillColor(79, 70, 229); // indigo-600
      pdf.rect((pageW / 2) - 30, margin + 18, 60, 7, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text('OFFICIAL RECEIPT / पावती', pageW / 2, margin + 23, { align: 'center' });

      // Metadata box
      let y = margin + 35;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);

      pdf.text(`Receipt No: ${no}`, margin, y);
      pdf.text(`Date: ${date}`, pageW - margin, y, { align: 'right' });
      y += 6;
      pdf.text(`Received From: ${payer}`, margin, y);
      pdf.text(`Ref / ID: ${ref}`, pageW - margin, y, { align: 'right' });
      y += 6;
      pdf.text(`Payment Mode: ${mode}`, margin, y);
      pdf.setTextColor(16, 185, 129);
      pdf.text(`Payment Status: PAID / सफल`, pageW - margin, y, { align: 'right' });

      y += 10;

      // Table Header
      pdf.setFillColor(30, 41, 59);
      pdf.rect(margin, y, contentW, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text('#', margin + 3, y + 5.5);
      pdf.text('Particulars / विवरण', margin + 14, y + 5.5);
      pdf.text('Amount (₹)', pageW - margin - 3, y + 5.5, { align: 'right' });

      y += 8;

      // Table Rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);

      items.forEach((it, idx) => {
        if (idx % 2 === 1) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, y, contentW, 8, 'F');
        }
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, y + 8, margin + contentW, y + 8);

        pdf.text((idx + 1).toString(), margin + 3, y + 5.5);
        pdf.text(it.desc, margin + 14, y + 5.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`₹ ${it.amt.toLocaleString('en-IN')}`, pageW - margin - 3, y + 5.5, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        y += 8;
      });

      // Total Row
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, y, contentW, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('TOTAL AMOUNT RECEIVED:', margin + 14, y + 6.5);
      pdf.setTextColor(79, 70, 229);
      pdf.text(`₹ ${total.toLocaleString('en-IN')}`, pageW - margin - 3, y + 6.5, { align: 'right' });

      y += 24;

      // Stamp & Signature
      if (hasStamp) {
        // Stamp Box
        pdf.setDrawColor(79, 70, 229);
        pdf.setLineWidth(0.8);
        pdf.rect(margin + 10, y, 40, 22);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(79, 70, 229);
        pdf.text('OFFICIAL SEAL', margin + 30, y + 9, { align: 'center' });
        pdf.setFontSize(9);
        pdf.text('RO FARIDABAD', margin + 30, y + 16, { align: 'center' });

        // Signature
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(10);
        pdf.text('Niraj Kumar', pageW - margin - 25, y + 10, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Section Supervisor, RO, Faridabad', pageW - margin - 25, y + 16, { align: 'center' });
        pdf.text('Authorized Signatory', pageW - margin - 25, y + 21, { align: 'center' });
      }

      pdf.save(`${no}_receipt.pdf`);
      showToast(`Downloaded Official Receipt "${no}.pdf"!`, 'success');
    });
  }

  // Initial render
  setTimeout(renderReceiptPreview, 100);
})();
