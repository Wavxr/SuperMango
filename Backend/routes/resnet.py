from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io
import torch
import torchvision.models as models
import torchvision.transforms as transforms

router = APIRouter()

# Model Setup
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

# Route
@router.post("/predict-severity")
async def predict_severity(file: UploadFile = File(...)):
    print(f"\n📩 Received file: {file.filename}")

    # Read and convert image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    print(f"🖼 Image loaded: {image.size} - Mode: {image.mode}")

    # Transform
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    input_tensor = transform(image).unsqueeze(0)
    print(f"📦 Input tensor shape: {input_tensor.shape}")

    # Inference
    with torch.no_grad():
        output = model(input_tensor)
        severity = torch.argmax(output, dim=1).item()
        print(f"🔍 Model output: {output}")
        print(f"🎯 Predicted severity class: {severity}")

    # Map to readable label
    severity_labels = ["Healthy", "Mild", "Moderate", "Severe"]
    predicted_label = severity_labels[severity]

    # ✅ Return both severity and severity_class
    return {
        "severity": severity,
        "severity_class": predicted_label
    }

