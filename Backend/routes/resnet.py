from fastapi import APIRouter, UploadFile, File
from typing import List
from PIL import Image
import io
import torch
import torchvision.models as models
import torchvision.transforms as transforms

router = APIRouter()

# Load model
num_classes = 4
model = models.resnet50(weights=None)
num_ftrs = model.fc.in_features
model.fc = torch.nn.Linear(num_ftrs, num_classes)
model_path = "models/resnet50_fold_3.pt"
print(f"🔍 Loading model from: {model_path}")
state_dict = torch.load(model_path, map_location=torch.device("cpu"))
model.load_state_dict(state_dict)
model.eval()
print("✅ Model loaded and set to eval mode")

@router.post("/predict-batch")
async def predict_batch(files: List[UploadFile] = File(...)):
    print(f"📷 Received {len(files)} images")

    predictions = []
    for idx, file in enumerate(files):
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        print(f"🖼 Image {idx} loaded with size: {image.size}, mode: {image.mode}")

        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
        ])
        input_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            output = model(input_tensor)
            severity = torch.argmax(output, dim=1).item()
            predicted_label = ["Healthy", "Mild", "Moderate", "Severe"][severity]

        predictions.append({"idx": idx, "severity": severity, "label": predicted_label})

    avg_severity = sum(p["severity"] for p in predictions) / len(predictions)
    overall_label = ["Healthy", "Mild", "Moderate", "Severe"][int(avg_severity)]

    return {
        "individual_predictions": predictions,
        "overall_severity": int(avg_severity),
        "overall_label": overall_label
    }