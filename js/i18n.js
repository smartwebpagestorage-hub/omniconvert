/**
 * OmniConvert Studio - Internationalization (i18n) Module
 * Supports English & Hindi (हिंदी)
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

const TRANSLATIONS = {
  en: {
    // App Header & Branding
    brandTitle: "OmniConvert",
    brandSubtitle: "Universal Offline Converter Suite",
    brandTag: "PRO",
    creatorBadge: "Niraj Kumar • Section Supervisor, RO, Faridabad",
    privacyBadge: "100% Offline Software",
    aboutBtn: "About",

    // Navigation Tabs
    tabPdfToImg: "PDF ➔ Image",
    tabImgToPdf: "Image ➔ PDF",
    tabTextToImg: "Text ➔ Image",
    tabTextToPdf: "Text ➔ PDF",
    tabPdfToTxt: "PDF ➔ Text",
    tabImgToTxt: "Image ➔ Text (OCR)",
    tabPdfSplit: "PDF ➔ Split",
    tabImgSplit: "Image ➔ Split",
    tabPdfImgMerge: "PDF + Image ➔ Merge",
    tabImgConvert: "Image ➔ Convert",

    // Tool 1: PDF to Image
    pdfToImgTitle: "PDF ➔ Image Converter",
    pdfToImgDesc: "Render any PDF document into crisp images. Download individual pages as PNG, JPEG, or WebP, or download all pages in a single ZIP archive.",
    pdfToImgCardUpload: "Upload & Render Settings",
    pdfToImgDropTitle: "Choose or Drag & Drop a PDF",
    pdfToImgDropSubtitle: "Supports multi-page or single-page PDF files",
    pdfToImgLblFormat: "Output Image Format",
    pdfToImgLblScale: "Render Resolution / DPI",
    scaleStandard: "1x (Standard Screen, Fast)",
    scaleHd: "2x (High Definition, Crisp 150-192 DPI)",
    scaleUltra: "3x (Ultra Print Resolution, 300 DPI)",
    pdfToImgLblQuality: "Compression Quality",
    btnConvertPages: "Convert Pages",
    btnDownloadAllZip: "Download All (ZIP)",
    pdfToImgCardPreview: "Converted Page Previews",
    pdfToImgNoPages: "No converted pages yet. Upload a PDF and click Convert to see page thumbnails here.",
    pdfToImgReadyStatus: "Select a PDF file above to begin.",

    // Tool 2: Image to PDF
    imgToPdfTitle: "Image ➔ PDF Converter",
    imgToPdfDesc: "Combine multiple images (PNG, JPG, WebP, SVG) into a single, clean PDF document. Reorder pages and customize layout settings.",
    imgToPdfCardUpload: "Upload Images",
    imgToPdfDropTitle: "Choose or Drag & Drop Images",
    imgToPdfDropSubtitle: "Supports multiple JPG, PNG, WebP, and GIF files",
    imgToPdfLblSize: "Page Size",
    sizeA4: "A4 (Standard)",
    sizeLetter: "US Letter",
    sizeFit: "Fit Page to Image Dimensions",
    imgToPdfLblOrientation: "Orientation",
    orientAuto: "Auto (Based on Image)",
    orientPortrait: "Portrait",
    orientLandscape: "Landscape",
    imgToPdfLblMargin: "Page Margins",
    marginNone: "No Margin (Full Page)",
    marginSmall: "Small (10mm)",
    marginNormal: "Normal (20mm)",
    imgToPdfLblFit: "Image Scaling",
    fitKeepAspect: "Fit (Keep Aspect Ratio)",
    fitFillPage: "Fill Entire Page Area",
    imgToPdfLblFilename: "Output PDF Filename",
    targetSizeLabel: "Target File Size",
    sizeNoLimit: "Original / No Limit",
    size500Kb: "Under 500 KB",
    size1Mb: "Under 1 MB",
    size2Mb: "Under 2 MB",
    size4Mb: "Under 4 MB",
    sizeCustom: "Custom Size (MB)...",
    customSizeLabel: "Max Size (MB)",
    btnGeneratePdf: "Generate & Save PDF",
    btnClear: "Clear",
    imgToPdfCardPreview: "Page Order & Thumbnails",
    imgToPdfOrderHint: "Use the arrow buttons to reorder pages in your PDF.",
    imgToPdfNoImages: "No images uploaded yet. Drop some images to preview and reorder pages.",
    imgToPdfReadyStatus: "Select or drop images above to begin.",

    // Tool 3: Text to Image
    textToImgTitle: "Text ➔ Image Studio",
    textToImgDesc: "Turn quotes, announcements, code snippets, or notes into shareable graphics with custom typography, modern gradients, and glassmorphic styling.",
    textToImgCardControls: "Graphic Controls",
    btnLoadQuote: "Load Quote",
    textToImgLblContent: "Your Text / Message",
    textToImgLblAuthor: "Author / Subtitle (Optional)",
    textToImgLblRatio: "Aspect Ratio",
    ratioSquare: "1:1 Square",
    ratioBanner: "16:9 Banner",
    ratioStory: "9:16 Story / Reel",
    ratioPortrait: "4:5 Portrait",
    textToImgLblFont: "Font Family",
    textToImgLblAlign: "Text Alignment",
    alignCenter: "Center",
    alignLeft: "Left",
    alignRight: "Right",
    textToImgLblFontSize: "Font Size",
    textToImgLblTheme: "Background Theme",
    textToImgGlassToggle: "Enable Frosted Glass Card Container",
    btnDownloadPng: "Download PNG",
    btnDownloadJpg: "Download JPG",
    textToImgCardPreview: "Live Canvas Preview",

    // Tool 4: Text to PDF
    textToPdfTitle: "Text ➔ PDF Document Generator",
    textToPdfDesc: "Type or paste your text or upload a .txt file, format page margins and typography, and export clean, multi-page PDFs with automatic pagination.",
    textToPdfCardContent: "Document Content",
    btnImportTxt: "Import .txt / .md",
    textToPdfLblTitle: "Document Title (Header)",
    textToPdfLblBody: "Document Body",
    statWords: "Words",
    statChars: "Characters",
    textToPdfCardSettings: "Layout & Page Settings",
    textToPdfLblPageSize: "Page Size",
    textToPdfLblFont: "Font Family",
    textToPdfLblFontSize: "Font Size",
    textToPdfLblSpacing: "Line Spacing",
    spacingTight: "1.2 (Tight)",
    spacingStandard: "1.5 (Standard)",
    spacingSpacious: "1.8 (Spacious)",
    textToPdfPageNumToggle: "Include 'Page X of Y' Footer Numbering",
    textToPdfLblFilename: "Output Filename",
    btnExportPdf: "Export as PDF",

    // Tool 5: PDF to Text
    pdfToTxtTitle: "PDF ➔ Text Extractor",
    pdfToTxtDesc: "Extract selectable plain text from any PDF document page by page. Filter, search, copy to clipboard, or export to TXT and Markdown.",
    pdfToTxtCardUpload: "Upload PDF",
    pdfToTxtDropTitle: "Choose or Drag & Drop a PDF File",
    pdfToTxtDropSubtitle: "Extracts readable text layers from all pages instantly",
    pdfToTxtReadyStatus: "Upload a PDF to extract text.",
    statPages: "Pages",
    pdfToTxtCardExtracted: "Extracted Content",
    searchPlaceholder: "Search text...",
    btnCopyText: "Copy Text",
    btnDownloadTxt: "Download .txt",
    btnDownloadMd: "Download .md",

    // Tool 6: Image to Text (OCR)
    imgToTxtTitle: "Image ➔ Text (Optical Character Recognition)",
    imgToTxtDesc: "Extract editable text from scanned documents, photos, book pages, and screenshots right in your browser using optical character recognition.",
    imgToTxtCardUpload: "Upload Image for OCR",
    imgToTxtDropTitle: "Choose or Drag & Drop Image",
    imgToTxtDropSubtitle: "Supports PNG, JPG, WebP photos & screenshots",
    imgToTxtReadyStatus: "Select an image above to start OCR.",
    statWordsRecognized: "Words Recognized",
    imgToTxtCardOutput: "Recognized Text Output",

    // Tool 7: PDF Page Split
    pdfSplitTitle: "PDF Page Splitter",
    pdfSplitDesc: "Split multi-page PDF documents into individual single-page files or extract custom page ranges effortlessly.",
    pdfSplitCardUpload: "Upload & Split Settings",
    pdfSplitDropTitle: "Choose or Drag & Drop a PDF",
    pdfSplitDropSubtitle: "Supports multi-page PDF documents",
    pdfSplitLblMode: "Split Mode",
    pdfSplitModeAll: "Split into Single Pages (ZIP)",
    pdfSplitModeRange: "Extract Custom Page Range",
    pdfSplitLblRange: "Page Range (e.g. 1-3, 5, 8-10)",
    btnSplitPdf: "Split PDF",
    pdfSplitCardPreview: "Document Pages Preview",

    // Tool 8: Image Split
    imgSplitTitle: "Image Splitter & Slicer",
    imgSplitDesc: "Slice images into social media grids (2x2, 3x3), horizontal sections, or vertical panels with instant ZIP download.",
    imgSplitCardUpload: "Upload Image to Split",
    imgSplitDropTitle: "Choose or Drag & Drop Image",
    imgSplitDropSubtitle: "Supports JPG, PNG, and WebP images",
    imgSplitLblGrid: "Split Layout",
    imgSplitGrid2x2: "2x2 Grid (4 Parts)",
    imgSplitGrid3x3: "3x3 Grid (9 Parts)",
    imgSplitGrid1x3: "1x3 Vertical Strips (3 Parts)",
    imgSplitGrid3x1: "3x1 Horizontal Panels (3 Parts)",
    imgSplitGridCustom: "Custom Grid (Rows x Cols)",
    btnSplitImg: "Split Image",
    btnDownloadAllTiles: "Download All (ZIP)",
    imgSplitCardCutPreview: "Cut Lines Preview",
    imgSplitCardTilesPreview: "Sliced Tiles",

    // Tool 9: PDF & Image Add / Merge
    pdfImgMergeTitle: "PDF & Image Combined Merger",
    pdfImgMergeDesc: "Combine multiple PDF documents and Images together into a single unified PDF file. Reorder pages freely.",
    pdfImgMergeCardUpload: "Upload PDFs & Images",
    pdfImgMergeDropTitle: "Choose or Drag & Drop PDFs and Images",
    pdfImgMergeDropSubtitle: "Supports multi-page PDFs, JPG, PNG, WebP simultaneously",
    btnMergePdfImg: "Merge Everything into Single PDF",
    pdfImgMergeCardPreview: "Unified Page Storyboard",

    // Tool 10: Image Format Converter
    imgConvTitle: "Image Format Converter & Compressor",
    imgConvDesc: "Convert images between PNG, JPEG, and WebP formats with adjustable compression quality to reduce file sizes.",
    imgConvCardUpload: "Upload Images",
    imgConvDropTitle: "Choose or Drag & Drop Images",
    imgConvDropSubtitle: "Supports multiple images simultaneously",
    imgConvLblFormat: "Target Image Format",
    imgConvLblQuality: "Compression Quality",
    btnConvertImages: "Convert Images",
    imgConvCardPreview: "Converted Images Preview",

    // Sidebar Categories
    sidebarCompress: "Compress",
    sidebarConvert: "Convert",
    sidebarOrganize: "Organize",
    sidebarEdit: "Edit",
    sidebarSign: "Sign",
    sidebarMore: "More",

    // Organize Menu
    menuMerge: "Merge PDF & Images",
    menuSplit: "Split PDF",
    menuRotate: "Rotate Pages",
    menuDeletePages: "Delete Pages",
    menuExtractPages: "Extract Pages",

    // Edit Menu
    menuAnnotate: "Annotate & Redact",
    menuWatermark: "Watermark",
    menuNumberPages: "Number Pages",

    // Sign Menu
    menuSign: "Sign PDF",

    // More Menu
    menuProtect: "Protect (Password)",
    menuUnlock: "Unlock PDF",
    menuFlatten: "Flatten PDF",

    // Tool: Compress PDF
    compressTitle: "PDF Document Compressor",
    compressDesc: "Reduce PDF file size by setting exact target limits (500 KB, 1 MB, 2 MB, 4 MB, or Custom MB) with high visual clarity.",

    // Tool: Rotate Pages
    rotateTitle: "Rotate PDF Pages",
    rotateDesc: "Rotate specific pages or all pages clockwise or counter-clockwise (90°, 180°, 270°) and save permanently.",

    // Tool: Delete Pages
    deletePagesTitle: "Delete PDF Pages",
    deletePagesDesc: "Select and remove unwanted pages from any PDF document with instant visual thumbnail confirmation.",

    // Tool: Extract Pages
    extractPagesTitle: "Extract PDF Pages",
    extractPagesDesc: "Extract selected pages or custom page ranges into a brand new, independent PDF file.",

    // Tool: Watermark
    watermarkTitle: "PDF Watermark Studio",
    watermarkDesc: "Stamp custom text or image watermarks with precise opacity, rotation angle, font size, and color controls.",

    // Tool: Number Pages
    numberPagesTitle: "PDF Page Numbering",
    numberPagesDesc: "Add automatic header or footer page numbers across your PDF with customizable formatting and placement.",

    // Tool: Annotate & Redact
    annotateTitle: "Annotate & Redact PDF",
    annotateDesc: "Blackout confidential information (Redaction), highlight key text, or draw freehand notes directly onto document pages.",

    // Tool: Sign PDF
    signTitle: "PDF Digital Signature Studio",
    signDesc: "Draw your signature, type your name, or upload a signature image, then position and burn it securely onto any page.",

    // Tool: Protect PDF
    protectTitle: "Password Protect PDF",
    protectDesc: "Encrypt your PDF document with strong password protection so only authorized recipients can open it.",

    // Tool: Unlock PDF
    unlockTitle: "Unlock & Decrypt PDF",
    unlockDesc: "Remove password protection from any PDF file by entering its password, making it permanently unlocked.",

    // Tool: Flatten PDF
    flattenTitle: "Flatten PDF Forms & Layers",
    flattenDesc: "Flatten interactive fillable form fields and annotation layers into non-editable static PDF pages.",

    // New Office & Productivity Tools
    sidebarOffice: "Office",
    sidebarFormsHub: "Forms Hub",
    topbarFormsHub: "Fillable Forms Hub",
    menuPassportPhoto: "Passport & ID Studio",
    menuQrBarcode: "QR & Barcode Studio",
    menuCsvToPdf: "CSV / Table to PDF",
    menuReceiptGen: "Receipt & Challan Maker",
    menuBatchRenamer: "Batch File Renamer",
    menuMetaCleaner: "Metadata & Privacy Cleaner",

    passportTitle: "Passport Photo & ID Card Studio",
    passportDesc: "Generate standard 3.5×4.5 cm passport photo sheets (8, 16, 24, 32 prints) with cutting guides and merge Front & Back ID cards (Aadhaar / PAN) on single A4 sheets.",
    qrTitle: "QR Code & Barcode Studio",
    qrDesc: "100% offline generator for high-resolution QR codes (URLs, text, EPFO tracking, vCards) and standard Code 39 / 128 barcodes with instant PDF & PNG exports.",
    csvTitle: "CSV / Table Data to PDF Report Generator",
    csvDesc: "Transform raw CSV, TSV, or spreadsheet tables into beautifully styled, striped multi-page PDF documents with custom headers and page numbering.",
    receiptTitle: "Official Receipt & Challan Generator",
    receiptDesc: "Create and print official government/office receipts, fee challans, and payment vouchers with auto-numbering, totals in INR, and official RO Faridabad seal.",
    renamerTitle: "Multi-File Bulk Renamer",
    renamerDesc: "Instantly rename dozens of files with smart prefixes, suffixes, date-stamps, find-and-replace, and sequential numbering, exported in a single clean ZIP archive.",
    metaTitle: "Document & Photo Metadata Cleaner",
    metaDesc: "Inspect hidden EXIF, camera, GPS location, and PDF metadata. Strip sensitive data with 1-click for guaranteed privacy compliance.",

    // Offline Modal
    offlineModalTitle: "Internet Connection Required",
    offlineModalDesc: "The 'All Type Fillable Form' portal is hosted online on GitHub. An active internet connection is required to access this web service. Please verify your network connection and try again.",
    offlineModalRetry: "Retry Connection",
    offlineModalClose: "Close Window",

    // Footer
    footerText: "Created & Developed by Niraj Kumar, Section Supervisor, RO, Faridabad",
    footerSubtext: "100% Offline Software for Windows 10 & 11 • Private & Secure",

    // Modal
    modalCreatorTag: "Software Creator",
    modalCreatorName: "Niraj Kumar",
    modalCreatorRole: "Section Supervisor",
    modalCreatorOffice: "Regional Office (RO), Faridabad",
    modalFeat1: "100% Offline: No internet connection required.",
    modalFeat2: "Complete Privacy: Zero cloud upload; files stay strictly on your PC.",
    modalFeat3: "Compatible: Built for Windows 10 & Windows 11.",
    modalClose: "Close"
  },

  hi: {
    // App Header & Branding
    brandTitle: "ओमनीकन्वर्ट",
    brandSubtitle: "सार्वभौमिक ऑफ़लाइन कन्वर्टर सुइट",
    brandTag: "प्रो",
    creatorBadge: "नीरज कुमार • अनुभाग पर्यवेक्षक, क्षेत्रीय कार्यालय, फरीदाबाद",
    privacyBadge: "100% ऑफ़लाइन सॉफ़्टवेयर",
    aboutBtn: "परिचय",

    // Navigation Tabs
    tabPdfToImg: "पीडीएफ ➔ इमेज",
    tabImgToPdf: "इमेज ➔ पीडीएफ",
    tabTextToImg: "टेक्स्ट ➔ इमेज",
    tabTextToPdf: "टेक्स्ट ➔ पीडीएफ",
    tabPdfToTxt: "पीडीएफ ➔ टेक्स्ट",
    tabImgToTxt: "इमेज ➔ टेक्स्ट (OCR)",
    tabPdfSplit: "पीडीएफ ➔ स्प्लिट",
    tabImgSplit: "इमेज ➔ स्प्लिट",
    tabPdfImgMerge: "पीडीएफ + इमेज विलय",
    tabImgConvert: "इमेज ➔ कनवर्टर",

    // Tool 1: PDF to Image
    pdfToImgTitle: "पीडीएफ ➔ इमेज कनवर्टर",
    pdfToImgDesc: "किसी भी पीडीएफ दस्तावेज़ को उच्च गुणवत्ता वाली छवियों में बदलें। प्रत्येक पृष्ठ को PNG, JPEG, या WebP के रूप में डाउनलोड करें, या एक साथ ZIP फ़ाइल में डाउनलोड करें।",
    pdfToImgCardUpload: "अपलोड एवं रेंडर सेटिंग्स",
    pdfToImgDropTitle: "पीडीएफ फ़ाइल चुनें या यहाँ खींचें",
    pdfToImgDropSubtitle: "मल्टी-पेज या सिंगल-पेज पीडीएफ समर्थित है",
    pdfToImgLblFormat: "आउटपुट इमेज प्रारूप",
    pdfToImgLblScale: "रेंडर रिज़ॉल्यूशन / डीपीआई (DPI)",
    scaleStandard: "1x (सामान्य स्क्रीन, तेज़)",
    scaleHd: "2x (उच्च गुणवत्ता, क्रिस्प 150-192 DPI)",
    scaleUltra: "3x (अल्ट्रा प्रिंट रिज़ॉल्यूशन, 300 DPI)",
    pdfToImgLblQuality: "कम्प्रेशन गुणवत्ता",
    btnConvertPages: "पृष्ठों को कन्वर्ट करें",
    btnDownloadAllZip: "सभी पृष्ठ डाउनलोड करें (ZIP)",
    pdfToImgCardPreview: "परिवर्तित पृष्ठ पूर्वावलोकन",
    pdfToImgNoPages: "अभी कोई पृष्ठ परिवर्तित नहीं हुआ है। पूर्वावलोकन देखने के लिए पीडीएफ अपलोड करें और कन्वर्ट पर क्लिक करें।",
    pdfToImgReadyStatus: "आरंभ करने के लिए ऊपर एक पीडीएफ फ़ाइल चुनें।",

    // Tool 2: Image to PDF
    imgToPdfTitle: "इमेज ➔ पीडीएफ कनवर्टर",
    imgToPdfDesc: "विभिन्न छवियों (PNG, JPG, WebP, SVG) को मिलाकर एक स्वच्छ, पेशेवर पीडीएफ दस्तावेज़ बनाएं। पृष्ठों का क्रम बदलें और लेआउट सेटिंग्स अनुकूलित करें।",
    imgToPdfCardUpload: "चित्र अपलोड करें",
    imgToPdfDropTitle: "चित्र चुनें या यहाँ खींचें",
    imgToPdfDropSubtitle: "एक साथ कई JPG, PNG, WebP और GIF फ़ाइलें समर्थित हैं",
    imgToPdfLblSize: "पृष्ठ का आकार",
    sizeA4: "A4 (मानक)",
    sizeLetter: "यूएस लेटर (US Letter)",
    sizeFit: "छवि के आकार के अनुसार पृष्ठ सेट करें",
    imgToPdfLblOrientation: "ओरिएंटेशन (दिशा)",
    orientAuto: "स्वचालित (छवि के अनुसार)",
    orientPortrait: "सीधा (Portrait)",
    orientLandscape: "आड़ा (Landscape)",
    imgToPdfLblMargin: "पृष्ठ मार्जिन",
    marginNone: "कोई मार्जिन नहीं (पूर्ण पृष्ठ)",
    marginSmall: "छोटा (10 मिमी)",
    marginNormal: "सामान्य (20 मिमी)",
    imgToPdfLblFit: "इमेज स्केलिंग",
    fitKeepAspect: "अनुपात बनाए रखें (Fit)",
    fitFillPage: "पूरे पृष्ठ पर भरें (Fill)",
    imgToPdfLblFilename: "आउटपुट पीडीएफ का नाम",
    targetSizeLabel: "लक्षित फ़ाइल का आकार (Target Size)",
    sizeNoLimit: "मूल आकार / कोई सीमा नहीं",
    size500Kb: "500 KB से कम",
    size1Mb: "1 MB से कम",
    size2Mb: "2 MB से कम",
    size4Mb: "4 MB से कम",
    sizeCustom: "कस्टम आकार (MB)...",
    customSizeLabel: "अधिकतम आकार (MB)",
    btnGeneratePdf: "पीडीएफ बनाएं और सहेजें",
    btnClear: "हटाएं (Clear)",
    imgToPdfCardPreview: "पृष्ठ क्रम और थंबनेल",
    imgToPdfOrderHint: "पीडीएफ में पृष्ठों का क्रम बदलने के लिए तीर बटनों का उपयोग करें।",
    imgToPdfNoImages: "अभी तक कोई छवि अपलोड नहीं हुई है। पृष्ठ क्रम देखने के लिए चित्र जोड़ें।",
    imgToPdfReadyStatus: "आरंभ करने के लिए ऊपर चित्र चुनें या ड्रैग करें।",

    // Tool 3: Text to Image
    textToImgTitle: "टेक्स्ट ➔ इमेज स्टूडियो",
    textToImgDesc: "अनमोल विचारों, घोषणाओं, कोट्स, या नोट्स को सुंदर ग्राफिक्स में बदलें। आकर्षक ग्रेडिएंट बैकग्राउंड, हिंदी/अंग्रेजी फॉन्ट और आधुनिक स्टाइलिंग।",
    textToImgCardControls: "ग्राफ़िक सेटिंग्स",
    btnLoadQuote: "सुविचार लोड करें",
    textToImgLblContent: "आपका टेक्स्ट / संदेश",
    textToImgLblAuthor: "लेखक / उपशीर्षक (वैकल्पिक)",
    textToImgLblRatio: "आकार अनुपात (Aspect Ratio)",
    ratioSquare: "1:1 वर्ग (Square)",
    ratioBanner: "16:9 बैनर",
    ratioStory: "9:16 स्टोरी / रील",
    ratioPortrait: "4:5 पोर्ट्रेट",
    textToImgLblFont: "फ़ॉन्ट चयन",
    textToImgLblAlign: "टेक्स्ट संरेखण (Alignment)",
    alignCenter: "मध्य (Center)",
    alignLeft: "बाएँ (Left)",
    alignRight: "दाएँ (Right)",
    textToImgLblFontSize: "फ़ॉन्ट का आकार",
    textToImgLblTheme: "पृष्ठभूमि थीम (Gradient)",
    textToImgGlassToggle: "फ़्रॉस्टेड ग्लास कार्ड कंटेनर सक्षम करें",
    btnDownloadPng: "PNG डाउनलोड करें",
    btnDownloadJpg: "JPG डाउनलोड करें",
    textToImgCardPreview: "लाइव कैनवास पूर्वावलोकन",

    // Tool 4: Text to PDF
    textToPdfTitle: "टेक्स्ट ➔ पीडीएफ दस्तावेज़ जनरेटर",
    textToPdfDesc: "अपना टेक्स्ट टाइप या पेस्ट करें या .txt फ़ाइल अपलोड करें, लेआउट सेट करें और स्वचालित पृष्ठ संख्या के साथ साफ़-सुथरा पीडीएफ निर्यात करें।",
    textToPdfCardContent: "दस्तावेज़ सामग्री",
    btnImportTxt: ".txt / .md आयात करें",
    textToPdfLblTitle: "दस्तावेज़ का शीर्षक (हेडर)",
    textToPdfLblBody: "दस्तावेज़ का मुख्य पाठ",
    statWords: "कुल शब्द",
    statChars: "कुल अक्षर",
    textToPdfCardSettings: "लेआउट एवं पृष्ठ सेटिंग्स",
    textToPdfLblPageSize: "पृष्ठ का आकार",
    textToPdfLblFont: "फ़ॉन्ट",
    textToPdfLblFontSize: "फ़ॉन्ट का आकार",
    textToPdfLblSpacing: "पंक्ति रिक्ति (Line Spacing)",
    spacingTight: "1.2 (सघन)",
    spacingStandard: "1.5 (मानक)",
    spacingSpacious: "1.8 (खुला)",
    textToPdfPageNumToggle: "नीचे 'पृष्ठ X का Y' पृष्ठ संख्या जोड़ें",
    textToPdfLblFilename: "आउटपुट फ़ाइल का नाम",
    btnExportPdf: "पीडीएफ के रूप में निर्यात करें",

    // Tool 5: PDF to Text
    pdfToTxtTitle: "पीडीएफ ➔ टेक्स्ट निष्कर्षण (Extractor)",
    pdfToTxtDesc: "किसी भी पीडीएफ दस्तावेज़ से पठनीय टेक्स्ट पृष्ठ-दर-पृष्ठ निकालें। खोजें, कॉपी करें, या TXT और Markdown फ़ाइल में डाउनलोड करें।",
    pdfToTxtCardUpload: "पीडीएफ अपलोड करें",
    pdfToTxtDropTitle: "पीडीएफ फ़ाइल चुनें या खींचें",
    pdfToTxtDropSubtitle: "सभी पृष्ठों से टेक्स्ट तुरंत निकाला जाता है",
    pdfToTxtReadyStatus: "टेक्स्ट निकालने के लिए पीडीएफ अपलोड करें।",
    statPages: "कुल पृष्ठ",
    pdfToTxtCardExtracted: "निकाला गया टेक्स्ट",
    searchPlaceholder: "टेक्स्ट खोजें...",
    btnCopyText: "टेक्स्ट कॉपी करें",
    btnDownloadTxt: ".txt डाउनलोड करें",
    btnDownloadMd: ".md डाउनलोड करें",

    // Tool 6: Image to Text (OCR)
    imgToTxtTitle: "इमेज ➔ टेक्स्ट (ऑप्टिकल कैरेक्टर रिकॉग्निशन - OCR)",
    imgToTxtDesc: "स्कैन किए गए दस्तावेज़ों, फ़ोटो, किताबों के पन्नों और स्क्रीनशॉट से संपादन योग्य टेक्स्ट सीधे अपने ब्राउज़र में निकालें।",
    imgToTxtCardUpload: "OCR के लिए छवि अपलोड करें",
    imgToTxtDropTitle: "छवि चुनें या यहाँ खींचें",
    imgToTxtDropSubtitle: "PNG, JPG, WebP तस्वीरें और स्क्रीनशॉट समर्थित हैं",
    imgToTxtReadyStatus: "OCR शुरू करने के लिए ऊपर एक छवि चुनें।",
    statWordsRecognized: "पहचाने गए शब्द",
    imgToTxtCardOutput: "पहचाना गया टेक्स्ट परिणाम",

    // Tool 7: PDF Page Split
    pdfSplitTitle: "पीडीएफ पृष्ठ स्प्लिटर (Split)",
    pdfSplitDesc: "मल्टी-पेज पीडीएफ दस्तावेज़ों को अलग-अलग एकल-पृष्ठ फ़ाइलों में विभाजित करें या मनचाहे पृष्ठ निकालें।",
    pdfSplitCardUpload: "अपलोड एवं विभाजन सेटिंग्स",
    pdfSplitDropTitle: "पीडीएफ फ़ाइल चुनें या यहाँ खींचें",
    pdfSplitDropSubtitle: "मल्टी-पेज पीडीएफ दस्तावेज़ समर्थित हैं",
    pdfSplitLblMode: "विभाजन प्रकार",
    pdfSplitModeAll: "सभी पृष्ठों को अलग करें (ZIP)",
    pdfSplitModeRange: "कस्टम पृष्ठ सीमा निकालें",
    pdfSplitLblRange: "पृष्ठ सीमा (उदा. 1-3, 5, 8-10)",
    btnSplitPdf: "पीडीएफ विभाजित करें",
    pdfSplitCardPreview: "दस्तावेज़ पृष्ठ पूर्वावलोकन",

    // Tool 8: Image Split
    imgSplitTitle: "इमेज स्प्लिटर एवं स्लाइसर",
    imgSplitDesc: "छवियों को सोशल मीडिया ग्रिड (2x2, 3x3), क्षैतिज खंडों, या लंबवत पैनलों में विभाजित करें और तुरंत ZIP डाउनलोड करें।",
    imgSplitCardUpload: "विभाजित करने के लिए छवि अपलोड करें",
    imgSplitDropTitle: "छवि चुनें या खींचें",
    imgSplitDropSubtitle: "JPG, PNG और WebP चित्र समर्थित हैं",
    imgSplitLblGrid: "ग्रिड लेआउट",
    imgSplitGrid2x2: "2x2 ग्रिड (4 भाग)",
    imgSplitGrid3x3: "3x3 ग्रिड (9 भाग)",
    imgSplitGrid1x3: "1x3 लंबवत पट्टियाँ (3 भाग)",
    imgSplitGrid3x1: "3x1 क्षैतिज पैनल (3 भाग)",
    imgSplitGridCustom: "कस्टम ग्रिड (पंक्तियाँ x स्तंभ)",
    btnSplitImg: "इमेज स्प्लिट करें",
    btnDownloadAllTiles: "सभी भाग डाउनलोड करें (ZIP)",
    imgSplitCardCutPreview: "कटिंग गाइडलाइन पूर्वावलोकन",
    imgSplitCardTilesPreview: "विभाजित भाग (Tiles)",

    // Tool 9: PDF & Image Add / Merge
    pdfImgMergeTitle: "पीडीएफ एवं इमेज संयुक्त विलय (Merge)",
    pdfImgMergeDesc: "विभिन्न पीडीएफ दस्तावेज़ों और छवियों को एक साथ मिलाकर एक एकल एकीकृत पीडीएफ फ़ाइल बनाएं। पृष्ठों का क्रम स्वतंत्रतापूर्वक बदलें।",
    pdfImgMergeCardUpload: "पीडीएफ और इमेज जोड़ें",
    pdfImgMergeDropTitle: "पीडीएफ और इमेज चुनें या खींचें",
    pdfImgMergeDropSubtitle: "मल्टी-पेज पीडीएफ, JPG, PNG, WebP एक साथ समर्थित हैं",
    btnMergePdfImg: "सभी को एक पीडीएफ में जोड़ें",
    pdfImgMergeCardPreview: "एकीकृत पृष्ठ क्रम (Storyboard)",

    // Tool 10: Image Format Converter
    imgConvTitle: "इमेज प्रारूप कनवर्टर एवं कम्प्रेशर",
    imgConvDesc: "छवियों को PNG, JPEG, और WebP प्रारूपों में बदलें तथा फ़ाइल आकार कम करने के लिए कम्प्रेशन सेट करें।",
    imgConvCardUpload: "छवियां अपलोड करें",
    imgConvDropTitle: "चित्र चुनें या खींचें",
    imgConvDropSubtitle: "एक साथ कई चित्र समर्थित हैं",
    imgConvLblFormat: "लक्षित इमेज प्रारूप",
    imgConvLblQuality: "कम्प्रेशन गुणवत्ता",
    btnConvertImages: "छवियां कन्वर्ट करें",
    imgConvCardPreview: "कन्वर्ट की गई छवियों का पूर्वावलोकन",

    // Sidebar Categories
    sidebarCompress: "कंप्रेस",
    sidebarConvert: "कन्वर्ट",
    sidebarOrganize: "व्यवस्थित",
    sidebarEdit: "संपादित",
    sidebarSign: "हस्ताक्षर",
    sidebarMore: "अन्य",

    // Organize Menu
    menuMerge: "पीडीएफ और इमेज विलय",
    menuSplit: "पीडीएफ स्प्लिट करें",
    menuRotate: "पृष्ठ घुमाएं (Rotate)",
    menuDeletePages: "पृष्ठ हटाएं (Delete)",
    menuExtractPages: "पृष्ठ निकालें (Extract)",

    // Edit Menu
    menuAnnotate: "एनोटेट और छिपाएं (Redact)",
    menuWatermark: "वाटरमार्क लगाएं",
    menuNumberPages: "पृष्ठ संख्या जोड़ें",

    // Sign Menu
    menuSign: "पीडीएफ पर हस्ताक्षर (Sign)",

    // More Menu
    menuProtect: "पासवर्ड सुरक्षा (Encrypt)",
    menuUnlock: "पासवर्ड हटाएं (Unlock)",
    menuFlatten: "फ़ॉर्म फ़्लैटन करें",

    // Tool: Compress PDF
    compressTitle: "पीडीएफ दस्तावेज़ कंप्रेसर",
    compressDesc: "लक्षित सीमा (500 KB, 1 MB, 2 MB, 4 MB, या कस्टम MB) सेट करके पीडीएफ फ़ाइल का आकार बुद्धिमानी से घटाएं।",

    // Tool: Rotate Pages
    rotateTitle: "पीडीएफ पृष्ठ घुमाएं (Rotate)",
    rotateDesc: "विशिष्ट पृष्ठों या सभी पृष्ठों को दक्षिणावर्त या वामावर्त (90°, 180°, 270°) घुमाएं और स्थायी रूप से सहेजें।",

    // Tool: Delete Pages
    deletePagesTitle: "पीडीएफ पृष्ठ हटाएं (Delete)",
    deletePagesDesc: "किसी भी पीडीएफ दस्तावेज़ से अनचाहे पृष्ठों को थंबनेल पूर्वावलोकन के साथ आसानी से हटाएं।",

    // Tool: Extract Pages
    extractPagesTitle: "पीडीएफ पृष्ठ निकालें (Extract)",
    extractPagesDesc: "चयनित पृष्ठों या मनचाही पृष्ठ सीमा को एक नए, स्वतंत्र पीडीएफ में निकालें।",

    // Tool: Watermark
    watermarkTitle: "पीडीएफ वाटरमार्क स्टूडियो",
    watermarkDesc: "सटीक पारदर्शिता, कोण, फ़ॉन्ट और रंगों के साथ कस्टम टेक्स्ट या लोगो वाटरमार्क लगाएं।",

    // Tool: Number Pages
    numberPagesTitle: "पीडीएफ पृष्ठ संख्या (Pagination)",
    numberPagesDesc: "अनुकूलित प्रारूप और स्थिति के साथ अपने पीडीएफ में स्वचालित शीर्षलेख या पादलेख पृष्ठ संख्या जोड़ें।",

    // Tool: Annotate & Redact
    annotateTitle: "एनोटेट एवं छिपाएं (Redact)",
    annotateDesc: "गोपनीय जानकारी को ब्लैकआउट (काले रंग से छिपाएं), मुख्य वाक्यों को हाइलाइट करें या चित्र बनाएं।",

    // Tool: Sign PDF
    signTitle: "पीडीएफ डिजिटल हस्ताक्षर स्टूडियो",
    signDesc: "हस्ताक्षर बनाएं, नाम टाइप करें या छवि अपलोड करें और दस्तावेज़ के किसी भी पृष्ठ पर आसानी से लगाएं।",

    // Tool: Protect PDF
    protectTitle: "पासवर्ड से सुरक्षित करें (Protect)",
    protectDesc: "मजबूत पासवर्ड एन्क्रिप्शन के साथ अपने पीडीएफ को सुरक्षित करें ताकि केवल अधिकृत व्यक्ति ही इसे खोल सकें।",

    // Tool: Unlock PDF
    unlockTitle: "पासवर्ड हटाएं एवं अनलॉक करें",
    unlockDesc: "पासवर्ड दर्ज करके किसी भी पीडीएफ से सुरक्षा प्रतिबंध हटाएं और उसे हमेशा के लिए अनलॉक करें।",

    // Tool: Flatten PDF
    flattenTitle: "पीडीएफ फ़ॉर्म फ़्लैटन करें",
    flattenDesc: "संपादन योग्य फ़ॉर्म फ़ील्ड्स और एनोटेशन परतों को स्थायी रूप से स्थिर पृष्ठों में बदलें।",

    // New Office & Productivity Tools (Hindi)
    sidebarOffice: "कार्यालय टूल्स",
    sidebarFormsHub: "ऑनलाइन फॉर्म्स",
    topbarFormsHub: "फॉर्म्स पोर्टल (Forms)",
    menuPassportPhoto: "पासपोर्ट एवं आईडी स्टूडियो",
    menuQrBarcode: "क्यूआर एवं बारकोड स्टूडियो",
    menuCsvToPdf: "सीएसवी / डेटा तालिका से पीडीएफ",
    menuReceiptGen: "रसीद एवं चालान जेनरेटर",
    menuBatchRenamer: "एक साथ फ़ाइल रीनेमर (Bulk)",
    menuMetaCleaner: "मेटाडेटा एवं गोपनीयता क्लीनर",

    passportTitle: "पासपोर्ट फोटो एवं आईडी कार्ड स्टूडियो",
    passportDesc: "मानक 3.5×4.5 सेमी पासपोर्ट फोटो शीट (8, 16, 24, 32 फोटो ग्रिड) कटिंग गाइड के साथ बनाएं और आधार/पैन कार्ड के आगे और पीछे के भाग को एक ही A4 शीट पर प्रिंट करें।",
    qrTitle: "क्यूआर कोड एवं बारकोड स्टूडियो (100% ऑफ़लाइन)",
    qrDesc: "वेबसाइट लिंक, टेक्स्ट, ईपीएफओ ट्रैकिंग नंबर और vCard के लिए उच्च रिज़ॉल्यूशन क्यूआर कोड एवं मानक बारकोड बनाएं और तुरंत पीडीएफ या पीएनजी में डाउनलोड करें।",
    csvTitle: "सीएसवी / तालिका डेटा से पीडीएफ रिपोर्ट जेनरेटर",
    csvDesc: "कच्चे सीएसवी या एक्सेल डेटा को सुंदर, धारीदार बहु-पृष्ठीय पीडीएफ तालिकाओं में बदलें, शीर्षक और पृष्ठ संख्या के साथ।",
    receiptTitle: "आधिकारिक रसीद एवं चालान जेनरेटर",
    receiptDesc: "स्वचालित क्रम संख्या, भारतीय रुपये में कुल राशि और आरओ फरीदाबाद की आधिकारिक मुहर के साथ आधिकारिक कार्यालय रसीदें, चालान और वाउचर बनाएं।",
    renamerTitle: "मल्टी-फ़ाइल बल्क रीनेमर (Batch Renamer)",
    renamerDesc: "एक साथ दर्जनों फ़ाइलों को स्मार्ट उपसर्ग, प्रत्यय, दिनांक, खोजें-और-बदलें तथा क्रम संख्या के साथ तुरंत नाम बदलें और एक ज़िप (ZIP) फ़ाइल में डाउनलोड करें।",
    metaTitle: "दस्तावेज़ एवं फोटो मेटाडेटा क्लीनर",
    metaDesc: "छवियों और पीडीएफ में छिपे EXIF, कैमरा मॉडल, जीपीएस लोकेशन और निजी मेटाडेटा का निरीक्षण करें और 1-क्लिक में हटाकर पूर्ण गोपनीयता सुनिश्चित करें।",

    // Offline Modal (Hindi)
    offlineModalTitle: "सक्रिय इंटरनेट कनेक्शन आवश्यक है",
    offlineModalDesc: "'All Type Fillable Form' पोर्टल गिटहब (GitHub) पर ऑनलाइन होस्ट किया गया है। इसे खोलने के लिए इंटरनेट कनेक्शन आवश्यक है। कृपया अपना वाई-फाई या नेटवर्क जांचें और पुनः प्रयास करें।",
    offlineModalRetry: "पुनः प्रयास करें",
    offlineModalClose: "खिड़की बंद करें",

    // Footer
    footerText: "रचना एवं विकास: नीरज कुमार, अनुभाग पर्यवेक्षक, क्षेत्रीय कार्यालय, फरीदाबाद",
    footerSubtext: "Windows 10 एवं 11 के लिए 100% ऑफ़लाइन सॉफ़्टवेयर • सुरक्षित एवं निजी",

    // Modal
    modalCreatorTag: "सॉफ़्टवेयर निर्माता",
    modalCreatorName: "नीरज कुमार",
    modalCreatorRole: "अनुभाग पर्यवेक्षक",
    modalCreatorOffice: "क्षेत्रीय कार्यालय (RO), फरीदाबाद",
    modalFeat1: "100% ऑफ़लाइन: किसी इंटरनेट कनेक्शन की आवश्यकता नहीं है।",
    modalFeat2: "पूर्ण गोपनीयता: शून्य क्लाउड अपलोड; आपकी फ़ाइलें केवल आपके पीसी पर रहती हैं।",
    modalFeat3: "पूर्ण अनुकूलता: विशेष रूप से Windows 10 और Windows 11 के लिए निर्मित।",
    modalClose: "बंद करें"
  }
};

let currentLanguage = localStorage.getItem('omni-lang') || 'en';

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLanguage = lang;
  localStorage.setItem('omni-lang', lang);

  const dict = TRANSLATIONS[lang];

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) {
          el.placeholder = dict[key];
        }
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Update elements with data-i18n-html (for HTML content)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Update language toggle button text
  const langToggleBtn = document.getElementById('lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.innerHTML = lang === 'en' 
      ? '<span style="font-weight:700;">🌐 हिंदी</span>' 
      : '<span style="font-weight:700;">🌐 English</span>';
  }

  // Update Document title
  document.title = lang === 'en'
    ? "OmniConvert Studio - Developed by Niraj Kumar, Section Supervisor, RO, Faridabad"
    : "ओमनीकन्वर्ट स्टूडियो - निर्माता: नीरज कुमार, अनुभाग पर्यवेक्षक, क्षेत्रीय कार्यालय, फरीदाबाद";
}

function getTranslation(key) {
  return (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key]) || key;
}

function initLanguage() {
  const langToggleBtn = document.getElementById('lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const nextLang = currentLanguage === 'en' ? 'hi' : 'en';
      setLanguage(nextLang);
      if (typeof showToast === 'function') {
        showToast(nextLang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है' : 'Language switched to English', 'info', 1800);
      }
    });
  }

  setLanguage(currentLanguage);
}

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
});
