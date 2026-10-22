# Chatbot local nhận diện ngôn từ thù địch và quét ảnh

Giao diện web Flask lấy cảm hứng từ bố cục chatbot trong project Loi-is-Liem: header tối, lịch sử tin nhắn, bong bóng chat, nút xóa và bố cục co giãn cho điện thoại. Mặc định, TF-IDF + Logistic Regression phân loại câu cục bộ; Tesseract OCR đọc chữ trong ảnh rồi đưa phần chữ qua bộ phân loại. Có thể cấu hình Gemini API để gợi ý nhãn `hate`/`non_hate` cho văn bản nhập hoặc chữ OCR. Ứng dụng tra câu khớp chính xác (bỏ qua hoa/thường và khoảng trắng thừa) trong `data/samples.csv` và `data/gemini_memory.csv` trước; chỉ khi chưa có nhãn mới gọi Gemini. Khi bật Gemini, câu mới được gửi tới Google; câu và nhãn gợi ý được lưu trong `data/gemini_memory.csv` trên máy để dùng khi huấn luyện lại. Nhãn Gemini có thể sai, nên cần rà soát trước khi dùng làm dữ liệu train.

## Cài OCR tiếng Việt trên Windows

Cài chương trình Tesseract OCR cùng language data `vie` (có thể cài thêm `eng`). `pytesseract` chỉ là Python wrapper, cần Tesseract riêng. Nếu `tesseract.exe` không nằm trong PATH, đặt biến môi trường `TESSERACT_CMD` trỏ tới đường dẫn chương trình, ví dụ `C:\Program Files\Tesseract-OCR\tesseract.exe`.

## Cài và chạy trong VS Code

Mở terminal ở thư mục `hate_speech_nlp` rồi chạy:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py train
python app.py
```

Để bật Gemini (tùy chọn), đặt khóa API trong biến môi trường trước khi chạy Flask:

```powershell
$env:GEMINI_API_KEY="your-api-key"
$env:GEMINI_MODEL="gemini-flash-lite-latest"  # tùy chọn
python app.py
```

Không ghi khóa API vào mã nguồn hoặc commit lên Git. Nếu không đặt `GEMINI_API_KEY`, ứng dụng tiếp tục dùng mô hình cục bộ. Mở `http://127.0.0.1:5000` trong trình duyệt. Khung chat nhận văn bản và PNG/JPG/WebP (tối đa 10 MB). Các form được xử lý trực tiếp trên server Flask local, không có client gọi API JSON. Ảnh được OCR trong bộ nhớ; chỉ thumbnail được giữ tạm trong RAM để hiển thị cuộc trò chuyện. Lịch sử chat lưu trong RAM và biến mất khi ứng dụng dừng; nút **Xóa chat** chỉ xóa phiên hiện tại.

## Dữ liệu và giới hạn

Sửa `data/samples.csv`, giữ cột `text,label` với nhãn `hate` hoặc `non_hate`. Các nhãn Gemini được lưu riêng trong `data/gemini_memory.csv` và được nhập vào dữ liệu khi bấm **Huấn luyện mô hình**; việc ghi nhớ không làm mô hình tự cập nhật tức thời. Bộ mẫu ban đầu chỉ minh họa quy trình, không đủ để chứng minh mô hình chính xác. Hãy bổ sung dữ liệu được phép dùng, đa dạng ngữ cảnh, rà soát nhãn, rồi đánh giá precision/recall/F1 và các lỗi sai trước khi dùng thực tế. OCR có thể đọc sai chữ mờ, cách điệu hoặc ảnh có nền phức tạp. Kết quả chỉ hỗ trợ rà soát, không tự quyết định hình phạt hoặc kiểm duyệt người dùng.
