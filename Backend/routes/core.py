
from fastapi import APIRouter, UploadFile, File, Form
from typing import List, Dict, Any
from PIL import Image
from textwrap import indent
import io, json, torch
import torchvision.models as models
import torchvision.transforms as T

# ──────────────────────────────────────────────────────────────────── #
# constants & helpers                                                 #
# ──────────────────────────────────────────────────────────────────── #

NUM_CLASSES  = 5
CLASS_LABELS = ["Healthy", "Mild", "Moderate", "Severe", "Background"]
BG_IDX       = 4
BG_THRESH    = 95.0
MODEL_PATH   = "models/best_fold_model.pt"

TRANSFORM = T.Compose([T.Resize((224, 224)), T.ToTensor()])

def load_model() -> torch.nn.Module:
    m = models.resnet50(weights=None)
    m.fc = torch.nn.Linear(m.fc.in_features, NUM_CLASSES)
    print(f"🔍 Loading model from: {MODEL_PATH}")
    m.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    m.eval()
    print("✅ Model loaded and set to eval mode")
    return m

model  = load_model()
router = APIRouter()

# ──────────────────────────────────────────────────────────────────── #
# logging helpers                                                     #
# ──────────────────────────────────────────────────────────────────── #

def log_image(idx: int, image: Image.Image) -> None:
    w, h = image.size
    print(f"🖼️  {idx:02d} | {w}×{h} | {image.mode}")

def log_prediction(idx: int, label: str, conf: float) -> None:
    print(f" • {idx:02d}  {label:<9} ({conf:6.1f} %)")

def log_override(idx: int, bg_conf: float, new_lbl: str, new_conf: float) -> None:
    print(
        f" ⚠️  {idx:02d} suspected background ({bg_conf:6.1f} %) → "
        f"{new_lbl} ({new_conf:6.1f} %)"
    )

def log_summary(preds: List[Dict[str, Any]],
                psi: float, overall: str, overall_conf: float) -> None:
    print("\n────────── Batch summary ──────────")
    for p in preds:
        print(f" • {p['idx']:02d}  {p['label']:<9} ({p['confidence']:6.1f}%)")
    print("───────────────────────────────────")
    print(f" PSI: {psi:6.2f}%   Overall: {overall:<8} "
          f"Confidence: {overall_conf:6.1f}%")
    print("───────────────────────────────────\n")

def log_response_json(resp: Dict[str, Any]) -> None:
    pretty = json.dumps(resp, indent=2, ensure_ascii=False)
    print("📤 Response JSON ↓\n" + indent(pretty, "  ") + "\n")

# ──────────────────────────────────────────────────────────────────── #
# route                                                                #
# ──────────────────────────────────────────────────────────────────── #

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

    # ——— per-image inference ——————————————————————————————— #
    for idx, file in enumerate(files):
        img_bytes = await file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # first log the basic image info
        log_image(idx, img)

        # inference
        input_tensor = TRANSFORM(img).unsqueeze(0)
        with torch.no_grad():
            probs = torch.softmax(model(input_tensor), dim=1)[0]

        values, indices = torch.topk(probs, 2)          # top-2
        top_cls, sec_cls = map(int, indices.tolist())
        top_conf, sec_conf = (float(v * 100) for v in values)

        cls, confidence = top_cls, top_conf

        # background with low confidence → override
        if top_cls == BG_IDX and top_conf < BG_THRESH:
            cls, confidence = sec_cls, sec_conf
            log_override(idx, top_conf, CLASS_LABELS[cls], confidence)

        # final per-image prediction line
        log_prediction(idx, CLASS_LABELS[cls], confidence)

        predictions.append({
            "idx":        idx,
            "class_idx":  cls,
            "label":      CLASS_LABELS[cls],
            "confidence": confidence,
        })

    # ——— confident background check ———————————————————————— #
    if any(p["class_idx"] == BG_IDX for p in predictions):
        print("\n🛑 Confident background detected – skipping analysis.\n")
        return "Some background found."

    # ——— lesion-severity workflow ——————————————————————————— #
    area = {0: 0, 1: 2, 2: 8, 3: 15}
    psi = round(sum(area[p["class_idx"]] for p in predictions)
                / len(predictions), 2)

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

    # final tidy logs
    log_summary(predictions, psi, overall_label, overall_conf)
    log_response_json(api_response)

    return api_response