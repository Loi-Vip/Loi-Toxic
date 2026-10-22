import argparse
import csv
import sys
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import FeatureUnion, Pipeline

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "samples.csv"
MODEL_PATH = ROOT / "model.joblib"


def load_data(path=DATA_PATH):
    texts, labels = [], []
    sources = [path, ROOT / "data" / "gemini_memory.csv"]
    for source in sources:
        if not source.exists():
            continue
        with source.open("r", encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                text = (row.get("text") or "").strip()
                label = (row.get("label") or "").strip()
                if text and label in {"hate", "non_hate"}:
                    texts.append(text)
                    labels.append(label)
    if len(set(labels)) < 2:
        raise ValueError("CSV cần có ít nhất một ví dụ cho mỗi nhãn hate và non_hate.")
    return texts, labels


def make_pipeline():
    # Kết hợp TF-IDF theo từ và theo ký tự để nhận ra cụm từ và biến thể chính tả.
    features = FeatureUnion([
        ("word", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)),
        ("char", TfidfVectorizer(analyzer="char", ngram_range=(2, 5), min_df=1,
                                  sublinear_tf=True, max_features=100_000)),
    ])
    return Pipeline([
        ("features", features),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ])


def train():
    texts, labels = load_data()
    if len(texts) >= 10 and min(labels.count("hate"), labels.count("non_hate")) >= 2:
        x_train, x_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.25, random_state=42, stratify=labels
        )
        evaluation_model = make_pipeline().fit(x_train, y_train)
        print("Đánh giá trên tập giữ lại:")
        print(classification_report(y_test, evaluation_model.predict(x_test),
                                    labels=["non_hate", "hate"], zero_division=0))
    else:
        print("Dữ liệu còn ít; bỏ qua đánh giá holdout. Hãy thêm ví dụ đã gán nhãn.")
    final_model = make_pipeline().fit(texts, labels)
    joblib.dump(final_model, MODEL_PATH)
    print(f"Đã lưu mô hình: {MODEL_PATH}")
    print(f"Số mẫu huấn luyện: {len(texts)}")


def predict_text(text, model=None):
    """Trả về nhãn, điểm của hai lớp và nội dung hiển thị cho giao diện."""
    if model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError("Chưa có mô hình. Hãy huấn luyện trước bằng python main.py train.")
        model = joblib.load(MODEL_PATH)
    scores = dict(zip(model.named_steps["classifier"].classes_, model.predict_proba([text])[0]))
    label = max(scores, key=scores.get)
    return {
        "label": label,
        "hate_score": float(scores.get("hate", 0.0)),
        "non_hate_score": float(scores.get("non_hate", 0.0)),
        "confidence": float(scores[label]),
        "summary": "Có dấu hiệu ngôn từ thù địch" if label == "hate" else "Chưa phát hiện dấu hiệu thù địch",
    }


def predict(text):
    try:
        result = predict_text(text)
    except FileNotFoundError as error:
        print(error)
        return 2
    print(f"Kết quả: {result['summary']}")
    print(f"Điểm của nhãn dự đoán: {result['confidence']:.1%}")
    print("Lưu ý: điểm mô hình không phải xác suất chắc chắn hay kết luận kiểm duyệt.")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Demo nhận diện ngôn từ thù địch tiếng Việt")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("train", help="Huấn luyện và đánh giá mô hình từ data/samples.csv")
    p = sub.add_parser("predict", help="Dự đoán một câu")
    p.add_argument("text", nargs="+", help="Câu cần phân tích")
    args = parser.parse_args()
    if args.command == "train":
        train()
    else:
        return predict(" ".join(args.text))


if __name__ == "__main__":
    sys.exit(main() or 0)
