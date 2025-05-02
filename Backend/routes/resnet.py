from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io
import torch
import torchvision.models as models
import torchvision.transforms as transforms

router = APIRouter()


num_classes = 4
model = models.resnet50(weights=None)
num_ftrs = model.fc.in_features
model.fc = torch.nn.Linear(num_ftrs, num_classes)

model_path = "models/resnet50_fold_3.pt"
state_dict = torch.load(model_path, map_location=torch.device("cpu"))
model.load_state_dict(state_dict)

model.eval()

@router.post("/predict-severity")
async def predict_severity(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    input_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)
        severity = torch.argmax(output, dim=1).item()

    return {"severity": severity}
