import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const WORKSPACE = "C:/Users/Loi/Desktop/Loi-Toxic";
const BUILD = path.join(WORKSPACE, ".presentation-build");
const OUT = path.join(WORKSPACE, "presentations");
const FINAL = path.join(OUT, "du-an-nhan-dien-ngon-tu-thu-dich-v2.pptx");
const SKILL = "C:/Users/Loi/.codex/plugins/cache/openai-primary-runtime/presentations/26.1020.11127/skills/presentations";
const RUNTIME_PYTHON = "C:/Users/Loi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const FONT = "Arial";
const C = {
  ink: "#151D24", ink2: "#222E37", paper: "#F4F2EC", white: "#FFFFFF",
  text: "#1C252C", muted: "#59656D", quiet: "#8A949A", line: "#D6D8D3",
  lime: "#C8E46A", teal: "#317D73", tealLight: "#DDECE6", coral: "#D66F57",
  coralLight: "#F4E1DA", pale: "#E8E6DF", yellow: "#EAC56A",
};
const W = 1280, H = 720;
const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function rect(slide, name, x, y, w, h, fill, opts = {}) {
  return slide.shapes.add({
    geometry: opts.geometry || "rect", name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: opts.stroke || "none", width: opts.stroke ? (opts.strokeWidth || 1) : 0 },
    ...(opts.radius ? { borderRadius: opts.radius } : {}),
  });
}
function text(slide, name, value, x, y, w, h, size, color = C.text, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox", name,
    position: { left: x, top: y, width: w, height: h },
    fill: "none", line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    typeface: FONT, fontSize: size, color,
    bold: Boolean(opts.bold), italic: Boolean(opts.italic),
    alignment: opts.align || "left", verticalAlignment: opts.valign || "middle",
    autoFit: "shrinkText", wrap: "square", insets: 0,
    lineSpacing: opts.lineSpacing || 1.08,
  };
  return shape;
}
function connector(slide, from, to, opts = {}) {
  return slide.shapes.connect(from, to, {
    kind: opts.kind || "straight",
    fromSide: opts.fromSide || "right",
    toSide: opts.toSide || "left",
    line: { style: "solid", fill: opts.color || C.teal, width: opts.width || 2 },
    tail: { type: "triangle", width: "sm", length: "sm" },
  });
}
function baseSlide(title, subtitle = "") {
  const slide = presentation.slides.add({ background: { fill: C.paper } });
  text(slide, "section-label", "DỰ ÁN NLP  /  NHẬN DIỆN NGÔN TỪ", 66, 35, 450, 22, 14, C.teal, { bold: true });
  text(slide, "slide-title", title, 66, 76, 1120, 62, 42, C.ink, { bold: true });
  if (subtitle) text(slide, "slide-subtitle", subtitle, 68, 139, 1100, 36, 20, C.muted);
  rect(slide, "title-rule", 66, 190, 1148, 1, C.line);
  return slide;
}
function footer(slide, n, dark = false) {
  const color = dark ? "#A9B3B9" : C.quiet;
  text(slide, "slide-number", String(n).padStart(2, "0"), 1168, 674, 48, 20, 14, color, { bold: true, align: "right" });
}
function node(slide, name, x, y, w, h, kicker, heading, body, fill = C.white, accent = C.teal) {
  const shape = rect(slide, `${name}-shape`, x, y, w, h, fill, { stroke: C.line, radius: 14 });
  rect(slide, `${name}-accent`, x, y, 7, h, accent, { radius: 6 });
  text(slide, `${name}-kicker`, kicker.toUpperCase(), x + 23, y + 18, w - 42, 20, 13, accent, { bold: true });
  text(slide, `${name}-heading`, heading, x + 23, y + 45, w - 42, 40, 23, C.ink, { bold: true });
  text(slide, `${name}-body`, body, x + 23, y + 91, w - 42, h - 108, 17, C.muted, { valign: "top", lineSpacing: 1.13 });
  return shape;
}

// 1. Cover
{
  const s = presentation.slides.add({ background: { fill: C.ink } });
  rect(s, "cover-accent", 74, 76, 70, 6, C.lime);
  text(s, "cover-eyebrow", "BÀI TẬP CUỐI KỲ  ·  XỬ LÝ NGÔN NGỮ TỰ NHIÊN", 74, 100, 760, 28, 16, C.lime, { bold: true });
  text(s, "cover-title", "Nhận diện ngôn từ\ngây thù địch", 72, 184, 790, 180, 61, C.white, { bold: true, lineSpacing: 0.98 });
  text(s, "cover-subtitle", "Chatbot văn bản và quét chữ trong ảnh", 76, 390, 780, 50, 27, "#D5DADF");
  text(s, "cover-method", "TF-IDF  +  Logistic Regression  +  Tesseract OCR", 76, 465, 760, 32, 18, "#9AA6AD");
  rect(s, "cover-divider", 918, 190, 1, 330, "#3A464D");
  text(s, "cover-step1", "01   CÂU VĂN", 970, 222, 240, 35, 19, C.white, { bold: true });
  rect(s, "cover-step-line1", 973, 274, 178, 2, C.teal);
  text(s, "cover-step2", "02   ẢNH CÓ CHỮ", 970, 310, 240, 35, 19, C.white, { bold: true });
  rect(s, "cover-step-line2", 973, 362, 178, 2, C.coral);
  text(s, "cover-step3", "03   RÀ SOÁT", 970, 398, 240, 35, 19, C.white, { bold: true });
  text(s, "cover-scope", "Phân loại cục bộ,\nkết quả để người dùng xem lại", 970, 462, 240, 62, 17, "#A9B3B9", { valign: "top" });
  text(s, "cover-footer", "Dự án học tập  ·  Mô hình baseline", 76, 653, 650, 24, 15, "#9AA6AD");
  footer(s, 1, true);
  s.speakerNotes.text = "Giới thiệu dự án nhận diện ngôn từ gây thù địch. Hệ thống nhận câu văn hoặc ảnh có chữ, trích xuất chữ bằng OCR và phân loại bằng mô hình NLP cục bộ. Đây là bản học tập, chưa phải công cụ kiểm duyệt sản phẩm.";
}

// 2. Scope
{
  const s = baseSlide("Phạm vi nhận diện", "Ragebait và ngôn từ thù địch cần được gán nhãn riêng.");
  text(s, "scope-left-label", "01  /  RAGEBAIT", 84, 232, 480, 28, 15, C.coral, { bold: true });
  text(s, "scope-left-title", "Khơi giận dữ\nđể kéo tương tác", 82, 276, 485, 112, 37, C.ink, { bold: true });
  text(s, "scope-left-body", "Có thể là phát ngôn gây tranh cãi về phim, bóng đá hay sản phẩm. Không nhất thiết nhắm vào một nhóm dân cư.", 84, 411, 465, 78, 20, C.muted, { valign: "top" });
  text(s, "scope-left-example", "Ví dụ: “Đội bóng X chỉ thắng nhờ trọng tài.”", 84, 528, 480, 50, 18, C.ink, { italic: true });
  rect(s, "scope-divider", 624, 236, 1, 365, C.line);
  text(s, "scope-right-label", "02  /  HATE SPEECH", 680, 232, 500, 28, 15, C.teal, { bold: true });
  text(s, "scope-right-title", "Công kích hoặc\nkêu gọi loại trừ", 678, 276, 510, 112, 37, C.ink, { bold: true });
  text(s, "scope-right-body", "Nhắm vào người dựa trên danh tính nhóm và có thể khuyến khích kỳ thị, thù địch hoặc bạo lực.", 680, 411, 480, 78, 20, C.muted, { valign: "top" });
  text(s, "scope-right-example", "Ví dụ minh họa: lời kêu gọi đuổi [NHÓM] khỏi nơi ở.", 680, 528, 480, 55, 18, C.ink, { italic: true });
  text(s, "scope-takeaway", "Một chủ đề gây tranh luận không tự động là thù địch.", 84, 610, 1040, 28, 20, C.teal, { bold: true });
  footer(s, 2);
  s.speakerNotes.text = "Phân biệt mục đích gây tương tác với mục tiêu và nội dung công kích. Oxford định nghĩa rage bait là nội dung trực tuyến được thiết kế để khơi phẫn nộ và tăng tương tác. Liên Hợp Quốc mô tả hate speech theo hướng công kích hoặc dùng ngôn từ miệt thị dựa trên yếu tố danh tính; incitement nhắm tới kích động phân biệt đối xử, thù địch hoặc bạo lực. Ví dụ trên slide là câu minh họa, không phải trích dẫn mạng xã hội.\nNguồn: Oxford University Press, https://corp.oup.com/word-of-the-year/\nNguồn: United Nations, https://www.un.org/en/node/165070\nNguồn: United Nations FAQs, https://www.un.org/en/hate-speech/understanding-hate-speech/faqs";
}

// 3. User flow
{
  const s = baseSlide("Luồng hội thoại", "Người dùng gửi nội dung, chatbot trả kết quả để người dùng xem lại.");
  const n1 = node(s, "flow-input", 70, 275, 238, 180, "Bước 1", "Gửi nội dung", "Nhập câu hoặc chọn ảnh PNG, JPG, WebP.", C.white, C.teal);
  const n2 = node(s, "flow-read", 348, 275, 238, 180, "Bước 2", "Đọc chữ", "Văn bản đi thẳng tới bộ phân loại. Ảnh được OCR.", C.white, C.coral);
  const n3 = node(s, "flow-model", 626, 275, 238, 180, "Bước 3", "Phân loại", "TF-IDF và Logistic Regression dự đoán nhãn.", C.white, C.teal);
  const n4 = node(s, "flow-result", 904, 275, 238, 180, "Bước 4", "Xem kết quả", "Hiện nhãn, điểm dự đoán và chữ OCR.", C.white, C.coral);
  connector(s, n1, n2, { color: C.teal });
  connector(s, n2, n3, { color: C.teal });
  connector(s, n3, n4, { color: C.teal });
  text(s, "flow-note", "Ảnh không được lưu thành tệp dự án. Lịch sử hội thoại và ảnh thu nhỏ chỉ giữ tạm trong RAM khi ứng dụng đang chạy.", 84, 524, 1080, 58, 20, C.muted);
  footer(s, 3);
  s.speakerNotes.text = "Mô tả trải nghiệm hiện tại trong Flask app.py. Người dùng gửi text hoặc ảnh qua form. Văn bản được phân loại trực tiếp; ảnh được đọc bằng Tesseract trước khi đưa chữ OCR vào cùng mô hình. Ứng dụng hiển thị kết quả và nhắc người dùng xem xét ngữ cảnh. Lịch sử lưu trong RAM và mất khi dừng tiến trình.\nNguồn: app.py, templates/index.html, README.md trong project.";
}

// 4. Architecture
{
  const s = baseSlide("Kiến trúc chạy cục bộ", "Một backend Flask điều phối OCR và bộ phân loại; không gọi dịch vụ sinh văn bản bên ngoài.");
  const browser = node(s, "arch-browser", 70, 290, 205, 136, "Giao diện", "Trình duyệt", "Form văn bản và ảnh.", C.white, C.teal);
  const flask = node(s, "arch-flask", 350, 290, 222, 136, "Backend", "Flask", "Nhận form, quản lý phiên.", C.white, C.coral);
  const model = node(s, "arch-model", 700, 195, 245, 136, "NLP", "Mô hình đã lưu", "model.joblib\nTF-IDF + Logistic Regression", C.tealLight, C.teal);
  const ocr = node(s, "arch-ocr", 700, 416, 245, 136, "OCR", "Tesseract", "Ngôn ngữ vie+eng\nĐọc chữ trong ảnh", C.coralLight, C.coral);
  const output = node(s, "arch-output", 1000, 290, 210, 136, "Phản hồi", "Kết quả chat", "Nhãn và điểm dự đoán.", C.white, C.teal);
  connector(s, browser, flask, { color: C.ink2 });
  connector(s, flask, model, { color: C.teal, kind: "elbow" });
  connector(s, flask, ocr, { color: C.coral, kind: "elbow" });
  connector(s, ocr, model, { color: C.coral, kind: "straight", fromSide: "top", toSide: "bottom" });
  connector(s, model, output, { color: C.teal, kind: "elbow" });
  text(s, "arch-caption", "Dữ liệu xử lý trong tiến trình local; OCR tạo văn bản để mô hình phân loại.", 82, 602, 1100, 30, 19, C.muted);
  footer(s, 4);
  s.speakerNotes.text = "Kiến trúc rút ra từ app.py và main.py. Flask nhận các form HTML. Nhánh ảnh gọi Pillow để chuẩn hóa hướng ảnh rồi Tesseract OCR với vie+eng. Hai nhánh cuối cùng dùng cùng một pipeline Logistic Regression đã lưu trong model.joblib. Không dùng Gemini hay API tạo câu trả lời.";
}

// 5. Classifier
{
  const s = baseSlide("Bộ phân loại văn bản", "Baseline hiện tại kết hợp tín hiệu từ cụm từ và mẫu ký tự.");
  const a = node(s, "model-words", 68, 282, 248, 176, "Đặc trưng 1", "TF-IDF theo từ", "N-gram 1–2 từ\nGiữ cụm từ thường đi cùng nhau.", C.white, C.teal);
  const b = node(s, "model-chars", 365, 282, 248, 176, "Đặc trưng 2", "TF-IDF ký tự", "N-gram 2–5 ký tự\nHỗ trợ biến thể chính tả.", C.white, C.coral);
  const c = node(s, "model-combine", 662, 282, 248, 176, "Kết hợp", "FeatureUnion", "Ghép hai biểu diễn thành véc-tơ đầu vào.", C.tealLight, C.teal);
  const d = node(s, "model-classifier", 959, 282, 248, 176, "Phân loại", "Logistic Regression", "class_weight=balanced\nHai nhãn: hate / non_hate.", C.white, C.coral);
  connector(s, a, c, { color: C.teal, kind: "elbow" });
  connector(s, b, c, { color: C.coral, kind: "elbow" });
  connector(s, c, d, { color: C.ink2 });
  text(s, "model-output-note", "Điểm predict_proba là điểm mô hình, chưa được hiệu chuẩn thành xác suất đúng.", 86, 530, 1080, 42, 20, C.muted);
  footer(s, 5);
  s.speakerNotes.text = "main.py dùng FeatureUnion ghép TfidfVectorizer theo từ với ngram_range (1,2) và theo ký tự với ngram_range (2,5), sau đó LogisticRegression(max_iter=1000, class_weight='balanced'). Lớp dự đoán là hate hoặc non_hate. Giao diện hiển thị điểm predict_proba cao nhất; không nên diễn giải điểm đó là xác suất đã hiệu chuẩn.";
}

// 6. OCR
{
  const s = baseSlide("Quét chữ trong ảnh", "OCR biến ảnh thành văn bản; bộ NLP không phân tích hình ảnh trực tiếp.");
  const img = node(s, "ocr-upload", 74, 290, 230, 178, "Đầu vào", "Ảnh", "PNG, JPG hoặc WebP\nTối đa 10 MB.", C.white, C.coral);
  const prep = node(s, "ocr-prep", 350, 290, 230, 178, "Chuẩn hóa", "Pillow", "Đọc ảnh, xoay theo EXIF, chuyển RGB.", C.white, C.teal);
  const tess = node(s, "ocr-engine", 626, 290, 230, 178, "Nhận dạng", "Tesseract OCR", "Ngôn ngữ tiếng Việt vie+eng.", C.coralLight, C.coral);
  const classify = node(s, "ocr-classify", 902, 290, 230, 178, "Sau OCR", "Phân loại chữ", "Cùng pipeline dùng cho tin nhắn văn bản.", C.white, C.teal);
  connector(s, img, prep, { color: C.coral });
  connector(s, prep, tess, { color: C.teal });
  connector(s, tess, classify, { color: C.coral });
  text(s, "ocr-warning", "Cần cài riêng Tesseract và dữ liệu ngôn ngữ vie. Chữ mờ, cách điệu hoặc nền phức tạp có thể làm OCR sai.", 82, 536, 1090, 58, 20, C.muted);
  footer(s, 6);
  s.speakerNotes.text = "Các giới hạn file và xử lý EXIF thể hiện trong app.py. pytesseract là Python wrapper, máy cần cài Tesseract riêng và dữ liệu ngôn ngữ vie. OCR chỉ trích chữ từ ảnh; sau đó chữ được xử lý bằng mô hình văn bản. Nguồn hướng dẫn wrapper: https://github.com/madmaze/pytesseract";
}

// 7. Labels and data
{
  const s = baseSlide("Nhãn dữ liệu và ngữ cảnh", "Hai nhãn hiện tại dễ dùng cho baseline nhưng chưa diễn tả hết sắc thái.");
  text(s, "labels-hate", "HATE", 82, 234, 245, 38, 18, C.coral, { bold: true });
  text(s, "labels-hate-desc", "Công kích hoặc kêu gọi phân biệt đối xử, loại trừ hay gây hại cho [NHÓM].", 82, 280, 318, 102, 24, C.ink, { bold: true, valign: "top" });
  text(s, "labels-hate-ex", "Ví dụ khung: “Đuổi [NHÓM] khỏi khu phố.”", 82, 416, 320, 62, 18, C.muted, { italic: true, valign: "top" });
  rect(s, "labels-divider1", 430, 236, 1, 305, C.line);
  text(s, "labels-clean", "NON_HATE", 477, 234, 245, 38, 18, C.teal, { bold: true });
  text(s, "labels-clean-desc", "Ragebait về phim, bóng đá hay sản phẩm không tự động là hate speech.", 477, 280, 318, 102, 24, C.ink, { bold: true, valign: "top" });
  text(s, "labels-clean-ex", "Ví dụ: “Phim này bị đánh giá quá cao.”", 477, 416, 320, 62, 18, C.muted, { italic: true, valign: "top" });
  rect(s, "labels-divider2", 828, 236, 1, 305, C.line);
  text(s, "labels-context", "CẦN XÉT", 875, 234, 245, 38, 18, C.ink2, { bold: true });
  text(s, "labels-context-desc", "Trích dẫn, phủ định, báo cáo và phản bác có thể đổi nghĩa câu.", 875, 280, 318, 102, 24, C.ink, { bold: true, valign: "top" });
  text(s, "labels-context-ex", "Không gán nhãn chỉ dựa vào một từ khóa.", 875, 416, 318, 62, 18, C.muted, { italic: true, valign: "top" });
  rect(s, "labels-bottom-rule", 82, 559, 1110, 1, C.line);
  text(s, "labels-data-note", "data/samples.csv là dữ liệu minh họa nhỏ; cần mở rộng và kiểm tra nhãn trước khi huấn luyện nghiêm túc.", 82, 582, 1090, 52, 20, C.teal, { bold: true });
  footer(s, 7);
  s.speakerNotes.text = "Project dùng CSV data/samples.csv với hai nhãn hate và non_hate. README ghi rõ bộ mẫu ban đầu chỉ minh họa. Các ví dụ trên slide là khung minh họa; nhóm gán nhãn cần xác định đối tượng, ngữ cảnh, ý phủ định và trích dẫn. ViHOS là corpus spans tiếng Việt được con người chú giải; ViHSD có ba nhãn CLEAN, OFFENSIVE, HATE, cho thấy một taxonomy ba mức có thể hữu ích hơn nhị phân.\nNguồn: ViHOS, https://aclanthology.org/2023.eacl-main.47/\nNguồn: ViHSD, https://arxiv.org/abs/2103.11528";
}

// 8. Evaluation
{
  const s = baseSlide("Đánh giá trước khi triển khai", "Mã có bước holdout, nhưng chưa có kết quả đo lường đáng tin cậy.");
  text(s, "eval-current-label", "TRONG CODE", 82, 232, 310, 25, 14, C.teal, { bold: true });
  text(s, "eval-current", "Khi có đủ mẫu, giữ lại 25%\nđể in precision, recall và F1.", 82, 276, 345, 100, 28, C.ink, { bold: true, valign: "top" });
  text(s, "eval-warning", "Tập mẫu hiện tại quá nhỏ để suy ra chất lượng thực tế.", 82, 404, 345, 74, 20, C.muted, { valign: "top" });
  rect(s, "eval-divider", 462, 230, 1, 354, C.line);
  text(s, "eval-precision", "PRECISION", 512, 242, 200, 28, 15, C.teal, { bold: true });
  text(s, "eval-precision-desc", "Trong các câu bị gắn cờ, bao nhiêu câu thật sự thuộc lớp cần xem xét?", 512, 278, 625, 54, 21, C.ink);
  rect(s, "eval-rule1", 512, 350, 622, 1, C.line);
  text(s, "eval-recall", "RECALL", 512, 372, 200, 28, 15, C.coral, { bold: true });
  text(s, "eval-recall-desc", "Trong các câu thù địch đã biết, bao nhiêu câu được phát hiện?", 512, 408, 625, 54, 21, C.ink);
  rect(s, "eval-rule2", 512, 480, 622, 1, C.line);
  text(s, "eval-f1", "F1 + PHÂN TÍCH LỖI", 512, 502, 300, 28, 15, C.ink2, { bold: true });
  text(s, "eval-f1-desc", "Xem đồng thời precision/recall; kiểm tra false positive và false negative.", 512, 538, 640, 54, 21, C.ink);
  footer(s, 8);
  s.speakerNotes.text = "main.py dùng train_test_split(test_size=0.25, stratify=labels, random_state=42) khi có ít nhất 10 mẫu và tối thiểu 2 mẫu mỗi lớp; sau đó in classification_report. Đây mới là quy trình có trong code, không phải kết quả đánh giá đã chạy. Đề xuất thêm confusion matrix, kiểm tra lỗi theo nhóm mục tiêu, dạng viết tắt, câu trích dẫn và ảnh OCR.";
}

// 9. Limitations and next steps
{
  const s = baseSlide("Giới hạn và hướng phát triển", "Bản hiện tại minh họa được quy trình end-to-end, chưa chứng minh độ chính xác.");
  text(s, "limits-label", "GIỚI HẠN HIỆN TẠI", 82, 236, 430, 28, 15, C.coral, { bold: true });
  text(s, "limits-current", "Dữ liệu nhỏ và minh họa.\nMô hình chỉ có hai nhãn.\nNgữ cảnh, mỉa mai và tiếng lóng dễ gây nhầm.\nOCR phụ thuộc chất lượng ảnh và gói ngôn ngữ.", 82, 280, 500, 244, 23, C.ink, { valign: "top", lineSpacing: 1.3 });
  rect(s, "limits-divider", 640, 238, 1, 350, C.line);
  text(s, "limits-next-label", "BƯỚC TIẾP THEO", 698, 236, 430, 28, 15, C.teal, { bold: true });
  text(s, "limits-next", "Thu thập dữ liệu có quyền sử dụng.\nViết hướng dẫn gán nhãn rõ và đo đồng thuận.\nTạo tập test riêng, kiểm tra theo nhóm và biến thể chữ.\nSo sánh baseline với PhoBERT/Transformer.", 698, 280, 500, 244, 23, C.ink, { valign: "top", lineSpacing: 1.3 });
  text(s, "limits-note", "Kết quả nên hỗ trợ người rà soát; không tự động đưa ra quyết định bất lợi.", 82, 599, 1100, 34, 20, C.teal, { bold: true });
  footer(s, 9);
  s.speakerNotes.text = "Giới hạn này xuất phát từ quy mô tập mẫu và kiến trúc trong README/main.py/app.py. Confidence hiện là giá trị predict_proba cao nhất, chưa có bước calibration. Dữ liệu ViHSD/ViHOS là các hướng nghiên cứu tham khảo; cần kiểm tra giấy phép, điều khoản và cách lấy dữ liệu trước khi dùng. Transformer/PhoBERT là hướng so sánh tương lai, không phải mô hình đang chạy.";
}

// 10. References
{
  const s = baseSlide("Tài liệu tham khảo", "Tài liệu môn học, mã nguồn project và nghiên cứu liên quan.");
  const refs = [
    ["01", "Project hiện tại", "app.py, main.py, README.md, data/samples.csv"],
    ["02", "Oxford University Press", "Oxford Word of the Year 2025: rage bait\ncorp.oup.com/word-of-the-year/"],
    ["03", "United Nations", "What is hate speech? và FAQs\nun.org/en/node/165070"],
    ["04", "ViHOS · EACL 2023", "Vietnamese Hate Speech Spans Detection\naclanthology.org/2023.eacl-main.47/"],
    ["05", "ViHSD · 2021", "A Large-scale Dataset for Hate Speech Detection on Vietnamese Social Media Texts\narxiv.org/abs/2103.11528"],
    ["06", "Tài liệu môn NLP", "Naive Bayes, phân loại văn bản, Logistic Regression, embeddings, RNN/LSTM, Transformers"],
  ];
  let y = 225;
  for (const [num, name, desc] of refs) {
    text(s, `ref-num-${num}`, num, 82, y, 48, 28, 15, C.teal, { bold: true });
    text(s, `ref-name-${num}`, name, 146, y, 340, 30, 20, C.ink, { bold: true, valign: "top" });
    text(s, `ref-desc-${num}`, desc, 500, y, 650, 46, 17, C.muted, { valign: "top", lineSpacing: 1.12 });
    y += 68;
  }
  footer(s, 10);
  s.speakerNotes.text = "Các số liệu mô tả ViHOS và ViHSD lấy từ trang bài báo. ViHOS: https://aclanthology.org/2023.eacl-main.47/ . ViHSD: https://arxiv.org/abs/2103.11528 . Định nghĩa rage bait: https://corp.oup.com/word-of-the-year/ . Tham khảo định nghĩa của Liên Hợp Quốc: https://www.un.org/en/node/165070 . Slide dùng nội dung code hiện có trong project.";
}

await fs.mkdir(path.join(BUILD, "previews"), { recursive: true });
await fs.mkdir(OUT, { recursive: true });
for (let i = 0; i < presentation.slides.items.length; i++) {
  const slide = presentation.slides.items[i];
  const png = await presentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(BUILD, "previews", `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await png.arrayBuffer()));
}
const draftPath = path.join(BUILD, "draft.pptx");
const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(draftPath);
const { finalizePresentation } = await import(pathToFileURL(path.join(SKILL, "container_tools/artifact_tool_utils.mjs")).href);
const result = await finalizePresentation({
  workspaceDir: WORKSPACE,
  candidatePath: draftPath,
  finalPath: FINAL,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
  explicitTotalSlideCount: 10,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  fontPolicy: { basis: "design", families: [FONT] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(BUILD, "validation-v2.json"),
});
console.log(JSON.stringify({ finalPath: FINAL, slideCount: presentation.slides.items.length, finalize: result }, null, 2));


