from fastapi import APIRouter, UploadFile, File, Form
from typing import List, Dict, Any
from PIL import Image
from textwrap import indent
import io, json, torch
import torchvision.models as models
import torchvision.transforms as T

# ------------------------------------------------------------------ #
# constants & helpers                                                #
# ------------------------------------------------------------------ #

NUM_CLASSES  = 5
CLASS_LABELS = ["Healthy", "Mild", "Moderate", "Severe", "Background"]
BG_IDX       = 4
BG_THRESH    = 95.0                      # 95 % confidence threshold
MODEL_PATH   = "models/best_fold_model.pt"

TRANSFORM = T.Compose([T.Resize((224, 224)), T.ToTensor()])

def load_model() -> torch.nn.Module:
    model = models.resnet50(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, NUM_CLASSES)
    print(f"🔍 Loading model from: {MODEL_PATH}")
    state_dict = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    print("✅ Model loaded and set to eval mode")
    return model

model  = load_model()
router = APIRouter()

# ------------------------------------------------------------------ #
# logging helpers                                                    #
# ------------------------------------------------------------------ #

def log_image(idx: int, image: Image.Image) -> None:
    w, h = image.size
    print(f"🖼️  {idx:02d} | {w}×{h} | {image.mode}")

def log_prediction(idx: int, label: str, conf: float) -> None:
    print(f" • {idx:02d}  {label:<10} ({conf:5.1f} %)")

def log_response_json(resp: Dict[str, Any]) -> None:
    pretty = json.dumps(resp, indent=2, ensure_ascii=False)
    print("📤 Response JSON ↓\n" + indent(pretty, "  ") + "\n")

# ------------------------------------------------------------------ #
# route                                                              #
# ------------------------------------------------------------------ #

@router.post("/getPrescription")
async def getPrescription(
    files:       List[UploadFile] = File(...),
    humidity:    float = Form(...),
    temperature: float = Form(...),
    wetness:     float = Form(...),
    lat:         float = Form(...),
    lon:         float = Form(...),
) -> Any:
    print(f"\n📷  Received {len(files)} image(s)")
    predictions: List[Dict[str, Any]] = []

    # -------- per-image inference ------------------------------------ #
    for idx, file in enumerate(files):
        img_bytes = await file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        log_image(idx, img)

        input_tensor = TRANSFORM(img).unsqueeze(0)
        with torch.no_grad():
            probs = torch.softmax(model(input_tensor), dim=1)[0]

        # top-2 classes and their probabilities
        values, indices = torch.topk(probs, 2)
        cls_top        = int(indices[0].item())
        conf_top       = float(values[0] * 100)

        # assume top prediction; may change below
        cls        = cls_top
        confidence = conf_top

        # Background with < 95 % ⇒ fall back to next-best class
        if cls_top == BG_IDX and conf_top < BG_THRESH:
            cls        = int(indices[1].item())
            confidence = float(values[1] * 100)
            # log the override
            print(
                f"⚠️  {idx:02d} suspected background ({conf_top:5.1f} %) → "
                f"{CLASS_LABELS[cls]} ({confidence:5.1f} %)"
            )

        label = CLASS_LABELS[cls]
        log_prediction(idx, label, confidence)

        predictions.append({
            "idx":        idx,
            "class_idx":  cls,
            "label":      label,
            "confidence": confidence,
        })

    # -------- confident background check ----------------------------- #
    if any(p["class_idx"] == BG_IDX for p in predictions):
        print("\n🛑 Confident background detected – skipping analysis.\n")
        return "Some background found."

    # ------------------------------------------------------------------#
    # No confident background → continue with severity workflow         #
    # ------------------------------------------------------------------#

    estimated_area = {0: 0, 1: 2, 2: 8, 3: 15}
    total_psi = sum(estimated_area[p["class_idx"]] for p in predictions)
    psi = round(total_psi / len(predictions), 2)

    overall_label = (
        "Healthy"  if psi == 0 else
        "Mild"     if psi <= 3 else
        "Moderate" if psi <= 12 else
        "Severe"
    )
    overall_idx  = CLASS_LABELS.index(overall_label)
    overall_conf = round(
        sum(p["confidence"] for p in predictions) / len(predictions), 2
    )

    from services.rule_service import get_recommendation
    recommendation = get_recommendation(
        severity_idx = overall_idx,
        humidity     = humidity,
        temperature  = temperature,
        wetness      = wetness,
    )

    api_response = {
        "percent_severity_index": psi,
        "overall_label":          overall_label,
        "overall_severity_index": overall_idx,
        "overall_confidence":     overall_conf,
        "weather": {
            "humidity":    humidity,
            "temperature": temperature,
            "wetness":     wetness,
            "lat":         lat,
            "lon":         lon,
        },
        "recommendation": recommendation,
        # "individual_predictions": predictions,
    }

    log_response_json(api_response)
    return api_response