import torch
import logging
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)

# Đường dẫn tới mô hình
model_dir = "D:/Gundam E-commerce Website/Back_End/flaskAPI/model/phobert-toxic-model7"
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = AutoModelForSequenceClassification.from_pretrained(model_dir)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

def is_toxic(sentence):
    inputs = tokenizer(
        sentence,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )
    inputs = {key: value.to(device) for key, value in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
    probabilities = torch.softmax(outputs.logits, dim=-1)
    toxic_score = probabilities[0][1].item()
    threshold = 0.5
    return 1 if toxic_score > threshold else 0

app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        sentence = data.get("sentence", "")
        if not sentence:
            return jsonify({"error": "Text input is required"}), 400
        result = is_toxic(sentence)
        return jsonify({
            "sentence": sentence,
            "prediction": result,
            "label": "Toxic" if result == 1 else "Not Toxic"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)