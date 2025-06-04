from fastapi            import FastAPI, APIRouter, UploadFile, File, Form
from fastapi.responses  import JSONResponse
from typing             import List, Dict, Any
from PIL                import Image
from textwrap           import indent
import io, os, json, requests, torch
import torchvision.models     as models
import torchvision.transforms as T

from services.rule_service import get_recommendation

# ────────────────────── Pl@ntNet input validator ─────────────────────
PLANTNET_API_KEY = os.getenv("PLANTNET_API_KEY", "2b10p7W1flrJ7h045oF5cDmzou")
PLANTNET_URL     = "https://my-api.plantnet.org/v2/identify/all"
MANGO_KEYWORDS   = ("mango", "mangifera")

def simple_name(species: Dict[str, Any]) -> str:
    commons = species.get("commonNames", [])
    return commons[0] if commons else species.get("scientificName", "Unknown").split()[0]

def is_mango_leaf(img_bytes: bytes) -> tuple[bool, str | None]:
    files = [
        ('images', ('upload.jpg', io.BytesIO(img_bytes), 'image/jpeg')),
        ('organs', (None, 'leaf')),
    ]
    try:
        r = requests.post(PLANTNET_URL, files=files,
                          params={'api-key': PLANTNET_API_KEY}, timeout=12)

        if r.status_code == 404:
            return False, "NOT_A_PLANT"
        r.raise_for_status()

        results = r.json().get("results", [])
        if not results:
            return False, "NOT_A_PLANT"

        for res in results[:5]:
            sp = res.get("species", {})
            sci = (sp.get("scientificName") or "").lower()
            com = " ".join(sp.get("commonNames", [])).lower()
            if any(k in sci or k in com for k in MANGO_KEYWORDS):
                return True, None

        return False, simple_name(results[0].get("species", {}))

    except requests.exceptions.HTTPError as e:
        return False, f"API_ERROR:{e.response.status_code}"
    except Exception as e:
        return False, f"REQUEST_FAILED:{str(e)}"

# ───────────────────── ResNet-50 severity model ──────────────────────
CLASS_LABELS = ["Healthy", "Mild", "Moderate", "Severe"]
MODEL_PATH   = "models/resnet50_fold_3.pt"

TRANSFORM = T.Compose([T.Resize((224, 224)), T.ToTensor()])

def load_model() -> torch.nn.Module:
    m = models.resnet50(weights=None)
    m.fc = torch.nn.Linear(m.fc.in_features, len(CLASS_LABELS))
    m.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    m.eval()
    return m
model = load_model()

# ─────────────────────────── FastAPI setup ───────────────────────────
app    = FastAPI(title="SuperMango API")
router = APIRouter()

# --------------------------------------------------------------------- #
# logging helpers (keep verbatim)                                       #
# --------------------------------------------------------------------- #
def log_image(idx: int, image: Image.Image) -> None:
    w, h = image.size
    print(f"🖼️  {idx:02d} | {w}×{h} | {image.mode}")

def log_summary(preds: List[Dict[str, Any]], psi: float, overall: str, _overall_conf: float) -> None:
    print("\n────────── Batch summary ──────────")
    for p in preds:
        print(f" • {p['idx']:02d}  {p['label']}")
    print("───────────────────────────────────")
    print(f" PSI: {psi:6.2f}%   Overall: {overall}")
    print("───────────────────────────────────\n")

def log_response_json(resp: Dict[str, Any] | str) -> None:
    print("📤 Response JSON ↓\n" + indent(json.dumps(resp, indent=2), "  ") + "\n")

# ───────────────────────────── API route ─────────────────────────────
@router.post("/getPrescription")
async def getPrescription(
    files:       List[UploadFile] = File(...),
    humidity:    float           = Form(...),
    temperature: float           = Form(...),
    wetness:     float           = Form(...),
    lat:         float           = Form(...),
    lon:         float           = Form(...),
    verify_first: bool           = Form(False),    # ← optional, defaults to False
):
    print(f"\n📷  Received {len(files)} image(s) | verify_first={verify_first}")

    batch_bytes: List[bytes] = []
    for idx, upload in enumerate(files):
        data = await upload.read()
        img  = Image.open(io.BytesIO(data)).convert("RGB")
        log_image(idx, img)

        if verify_first:
            ok, info = is_mango_leaf(data)
            if not ok:
                reason = "NOT_A_PLANT" if info == "NOT_A_PLANT" else f"NOT_MANGO: {info}"
                print(f"⛔ {reason}")
                log_response_json("RETAKE_PHOTO_AGAIN")
                return JSONResponse(content="RETAKE_PHOTO_AGAIN")
            print("✅ Mango leaf")
        else:
            print("⚠️  Skipped verification")

        batch_bytes.append(data)

    # ───────────────── severity inference ────────────────────────────
    preds: List[Dict[str, Any]] = []
    for idx, b in enumerate(batch_bytes):
        img = Image.open(io.BytesIO(b)).convert("RGB")
        probs = torch.softmax(model(TRANSFORM(img).unsqueeze(0)), dim=1)[0]
        sev   = int(torch.argmax(probs))
        preds.append({"idx": idx, "label": CLASS_LABELS[sev], "severity": sev})

    # ───────────────── PSI & overall ─────────────────────────────────
    area = {0: 0, 1: 2, 2: 8, 3: 15}
    psi  = round(sum(area[p["severity"]] for p in preds) / len(preds), 2)
    overall = ("Healthy" if psi == 0 else
               "Mild"    if psi <= 3 else
               "Moderate"if psi <= 12 else "Severe")
    overall_idx = CLASS_LABELS.index(overall)

    recommendation = get_recommendation(
        severity_idx=overall_idx,
        humidity=humidity,
        temperature=temperature,
        wetness=wetness,
    )

    response: Dict[str, Any] = {
        "percent_severity_index": psi,
        "overall_label":          overall,
        "overall_severity_index": overall_idx,
        "weather": {
            "humidity": humidity, "temperature": temperature,
            "wetness":  wetness,  "lat": lat, "lon": lon,
        },
        "recommendation": recommendation,
    }

    log_summary(preds, psi, overall, 0.0)
    log_response_json(response)
    return response

app.include_router(router)