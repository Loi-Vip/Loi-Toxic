import base64
import io
import os
import secrets
import threading
from pathlib import Path

import joblib
import pytesseract
from flask import Flask, flash, redirect, render_template, request, session, url_for
from PIL import Image, ImageOps, UnidentifiedImageError
from werkzeug.exceptions import RequestEntityTooLarge

from main import MODEL_PATH, predict_text, train
from gemini_classifier import (
    GeminiClassificationError, classify_and_remember, find_saved_label, gemini_enabled,
)

BASE_DIR = Path(__file__).resolve().parent
MAX_IMAGE_BYTES = 10 * 1024 * 1024
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or secrets.token_hex(32)
app.config["MAX_CONTENT_LENGTH"] = MAX_IMAGE_BYTES + 256 * 1024

# Chỉ lưu hội thoại trong RAM của tiến trình; ảnh chỉ giữ thumbnail để hiển thị.
conversations = {}
conversations_lock = threading.Lock()
model_cache = {"mtime": None, "model": None}
model_lock = threading.Lock()


def current_messages():
    sid = session.get("sid")
    with conversations_lock:
        return list(conversations.get(sid, []))


def add_message(role, text="", image_data=None, image_name=None):
    sid = session.get("sid")
    message = {"role": role, "text": text, "image_data": image_data, "image_name": image_name}
    with conversations_lock:
        conversations.setdefault(sid, []).append(message)
        # Giới hạn bộ nhớ cho mỗi phiên.
        conversations[sid] = conversations[sid][-80:]


def get_model():
    if not MODEL_PATH.exists():
        return None
    mtime = MODEL_PATH.stat().st_mtime
    with model_lock:
        if model_cache["model"] is None or model_cache["mtime"] != mtime:
            model_cache["model"] = joblib.load(MODEL_PATH)
            model_cache["mtime"] = mtime
        return model_cache["model"]


def make_thumbnail(image):
    image.thumbnail((640, 480))
    output = io.BytesIO()
    image.save(output, format="JPEG", quality=78, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(output.getvalue()).decode("ascii")


def scan_image(raw_bytes):
    if len(raw_bytes) > MAX_IMAGE_BYTES:
        raise ValueError("Ảnh vượt quá giới hạn 10 MB.")
    try:
        image = Image.open(io.BytesIO(raw_bytes))
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.load()
    except (UnidentifiedImageError, OSError) as error:
        raise ValueError("Không đọc được ảnh. Hãy gửi ảnh PNG, JPG hoặc WebP hợp lệ.") from error

    custom_tesseract = os.environ.get("TESSERACT_CMD")
    if custom_tesseract:
        pytesseract.pytesseract.tesseract_cmd = custom_tesseract
    try:
        extracted_text = pytesseract.image_to_string(image, lang="vie+eng").strip()
    except pytesseract.pytesseract.TesseractNotFoundError as error:
        raise RuntimeError(
            "Chưa tìm thấy Tesseract OCR. Hãy cài Tesseract và dữ liệu ngôn ngữ tiếng Việt (vie). "
            "Nếu chưa có trong PATH, đặt TESSERACT_CMD trỏ đến tesseract.exe."
        ) from error
    except pytesseract.TesseractError as error:
        raise RuntimeError(
            "Tesseract chưa có dữ liệu OCR tiếng Việt (vie). Hãy cài gói ngôn ngữ tiếng Việt rồi thử lại."
        ) from error
    return image, extracted_text


def analyze(text, model, source):
    label = find_saved_label(text)
    if label is None and gemini_enabled():
        try:
            label, _reason = classify_and_remember(text)
        except GeminiClassificationError:
            return f"{source}\nChưa thể phân loại nội dung. Vui lòng thử lại sau."
    elif label is None:
        result = predict_text(text, model)
        label = result["label"]

    verdict = "⚠️ Có dấu hiệu ngôn từ thù địch" if label == "hate" else "✅ Chưa phát hiện dấu hiệu thù địch"
    return f"{source}\n{verdict}"


@app.before_request
def ensure_conversation_id():
    if "sid" not in session:
        session["sid"] = secrets.token_urlsafe(24)


@app.get("/")
def index():
    return render_template(
        "index.html",
        messages=current_messages(),
        has_model=MODEL_PATH.exists(),
        gemini_enabled=gemini_enabled(),
    )


@app.post("/chat")
def chat():
    text = request.form.get("message", "").strip()[:5000]
    uploaded = request.files.get("image")
    raw = uploaded.read() if uploaded and uploaded.filename else b""
    image_data = None
    image_name = None
    image_text = ""
    image_problem = None

    if raw:
        try:
            image, image_text = scan_image(raw)
            image_data = make_thumbnail(image)
            image_name = uploaded.filename[:120]
        except (ValueError, RuntimeError) as error:
            image_problem = str(error)

    if not text and not raw:
        flash("Hãy nhập câu hoặc chọn một ảnh để quét.", "notice")
        return redirect(url_for("index"))

    user_parts = []
    if text:
        user_parts.append(text)
    if raw and image_name:
        user_parts.append(f"Đã gửi ảnh: {image_name}")
    if raw and not image_name:
        user_parts.append("Đã gửi ảnh để quét.")
    add_message("user", "\n".join(user_parts), image_data, image_name)

    model = None if gemini_enabled() else get_model()
    if model is None and not gemini_enabled():
        add_message("bot", "Chưa có mô hình cục bộ. Huấn luyện mô hình hoặc cấu hình GEMINI_API_KEY rồi gửi lại nhé.")
        return redirect(url_for("index"))

    if text:
        add_message("bot", analyze(text, model, "Phân tích nội dung bạn nhập:"))
    if raw:
        if image_problem:
            add_message("bot", f"Không quét được ảnh: {image_problem}")
        elif not image_text:
            add_message("bot", "OCR không tìm thấy chữ rõ ràng trong ảnh.")
        else:
            add_message(
                "bot",
                analyze(image_text, model, "Kết quả quét ảnh:") + "\n\nVăn bản OCR:\n" + image_text,
            )
    return redirect(url_for("index"))


@app.post("/clear")
def clear():
    sid = session.get("sid")
    with conversations_lock:
        conversations.pop(sid, None)
    flash("Đã xóa cuộc trò chuyện hiện tại.", "notice")
    return redirect(url_for("index"))


@app.post("/train")
def train_model():
    try:
        train()
        with model_lock:
            model_cache["model"] = None
            model_cache["mtime"] = None
        flash("Đã huấn luyện mô hình từ data/samples.csv.", "success")
    except Exception as error:
        flash(f"Huấn luyện thất bại: {error}", "error")
    return redirect(url_for("index"))


@app.errorhandler(RequestEntityTooLarge)
def too_large(_error):
    flash("Tệp tải lên quá lớn. Giới hạn ảnh là 10 MB.", "error")
    return redirect(url_for("index")), 413


if __name__ == "__main__":
    print("Mở chatbot tại http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
