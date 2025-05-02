from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PrescriptionInput(BaseModel):
    severity: int
    risk: int

@router.post("/get-prescription")
def get_prescription(data: PrescriptionInput):
    if data.severity >= 4 or data.risk == 1:
        return {"advice": "Spray fungicide and prune infected leaves."}
    elif data.severity in [2, 3]:
        return {"advice": "Monitor and prune damaged parts."}
    elif data.severity == 1:
        return {"advice": "Lightly monitor; no immediate action needed."}
    else:
        return {"advice": "No action required."}
