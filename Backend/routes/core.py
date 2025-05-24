"""
routes/resnet.py
FastAPI route for batch severity prediction on mango-leaf images.
Includes weather + location metadata (humidity, temperature, wetness, lat, lon)
received from the mobile app.
"""

from fastapi import APIRouter, UploadFile, File, Form
from typing import List, Dict, Any
from PIL import Image
from textwrap import indent
from services.rule_service import get_recommendation
import io
import torch
import torchvision.models as models
import torchvision.transforms as T
import json

# --------------------------------------------------------------------- #
# constants & helpers                                                   #
# --------------------------------------------------------------------- #

NUM_CLASSES        = 4
CLASS_LABELS       = ["Healthy", "Mild", "Moderate", "Severe"]
MAX_SEVERITY_SCORE = NUM_CLASSES - 1            # 0-based classes → 3
MODEL_PATH         = "models/best_model.pt"

# single resize / tensor transform reused for every image
TRANSFORM = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
])

def load_model() -> torch.nn.Module:
    """Load a ResNet-50, attach new FC head, and set to eval on CPU."""
    model = models.resnet50(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, NUM_CLASSES)

    print(f"🔍 Loading model from: {MODEL_PATH}")
    state_dict = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    print("✅ Model loaded and set to eval mode")
    return model

model = load_model()
router = APIRouter()

# --------------------------------------------------------------------- #
# logging helpers                                                       #
# --------------------------------------------------------------------- #

def log_image(idx: int, image: Image.Image) -> None:
    w, h = image.size
    print(f"🖼️  {idx:02d} | {w}×{h} | {image.mode}")

def log_summary(preds: List[Dict[str, Any]], psi: float, overall: str) -> None:
    print("\n────────── Batch summary ──────────")
    for p in preds:
        print(f" • {p['idx']:02d}  {p['label']:<8}  (class={p['severity']})")
    print("───────────────────────────────────")
    print(f" PSI: {psi:6.2f}%   Overall: {overall}")
    print("───────────────────────────────────\n")

def log_response_json(resp: Dict[str, Any]) -> None:
    pretty = json.dumps(resp, indent=2, ensure_ascii=False)
    print("📤 Response JSON ↓\n" + indent(pretty, "  ") + "\n")

# --------------------------------------------------------------------- #
# route                                                                 #
# --------------------------------------------------------------------- #

@router.post("/getPrescription")
async def getPrescription(
    files:       List[UploadFile] = File(...),
    # weather + coords (sent as simple form fields)
    humidity:    float = Form(...),
    temperature: float = Form(...),
    wetness:     float = Form(...),
    lat:         float = Form(...),
    lon:         float = Form(...),
) -> Dict[str, Any]:
    print(f"\n📷  Received {len(files)} image(s)")

    predictions: List[Dict[str, Any]] = []
    severity_sum = 0

    # ------------- per-image inference --------------------------------
    for idx, file in enumerate(files):
        img_bytes = await file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        log_image(idx, img)

        input_tensor = TRANSFORM(img).unsqueeze(0)

        with torch.no_grad():
            severity = int(torch.argmax(model(input_tensor), dim=1).item())
            label = CLASS_LABELS[severity]

        predictions.append({"idx": idx, "severity": severity, "label": label})
        severity_sum += severity

    # ------------- batch metrics --------------------------------------
    estimated_area_by_class = {
        0: 0,    # Healthy
        1: 2,    # Mild: midpoint of 1–3%
        2: 8,    # Moderate: midpoint of 4–12%
        3: 15,   # Severe: baseline estimate (can go higher, but conservative)
    }

    # Compute PSI by summing estimated lesion % across leaves
    total_psi = sum(estimated_area_by_class[p["severity"]] for p in predictions)
    psi = round(total_psi / len(predictions), 2)  # PSI = avg lesion %

    # Use RRL-based thresholds for label assignment
    if psi == 0:
        overall_label = "Healthy"
    elif psi <= 3:
        overall_label = "Mild"
    elif psi <= 12:
        overall_label = "Moderate"
    else:
        overall_label = "Severe"

    overall_idx = CLASS_LABELS.index(overall_label)

    # ------------- recommendation ----------------------------------------
    recommendation = get_recommendation(
        severity_idx = overall_idx,
        humidity     = humidity,
        temperature  = temperature,
        wetness      = wetness,
    )
    
    # ------------- craft response -------------------------------------
    api_response = {
        "percent_severity_index": psi,
        "overall_label":          overall_label,
        "overall_severity_index": overall_idx,
        "weather": {
            "humidity":    humidity,
            "temperature": temperature,
            "wetness":     wetness,
            "lat":         lat,
            "lon":         lon,
        },
        "recommendation": recommendation
        # "individual_predictions": predictions,  
    }

    # ------------- logging --------------------------------------------
    log_summary(predictions, psi, overall_label)
    log_response_json(api_response)

    return api_response
