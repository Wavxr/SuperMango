"""
Rule-based prescription engine for SuperMango (concise steps + side info)
-----------------------------------------------------------------------
get_recommendation(severity_idx, humidity, temperature, wetness) -> dict

Returns
-------
{
  "severity_label": "Moderate",
  "weather_risk"  : "High",
  "advice"        : "1. ... 2. ...",
  "info"          : "Why these steps work – background physiology / epidemiology."
}
"""

from typing import Dict

CLASS_LABELS = ["Healthy", "Mild", "Moderate", "Severe"]

# ------------------------------------------------------------------ #
# 1. WEATHER-RISK CLASSIFIER                                         #
# ------------------------------------------------------------------ #

def _weather_risk(temp: float, rh: float, wet: float) -> str:
    """Low / Medium / High risk for anthracnose given daily weather."""
    if temp < 22 or rh < 85 or wet < 6:
        return "Low"
    if 25 <= temp <= 30 and rh >= 95 and wet >= 12:
        return "High"
    return "Medium"

# ------------------------------------------------------------------ #
# 2. RULE & INFO MATRICES                                            #
# ------------------------------------------------------------------ #

_RULE_MATRIX: Dict[tuple[str, str], str] = {
    # -------------------------- LOW RISK ---------------------------
    ("Healthy", "Low"): (
        "1. Inspect representative trees every 5 days for new spots.\n"
        "2. Prune crossing shoots to keep the canopy airy.\n"
        "3. Maintain balanced fertilisation; avoid excess nitrogen."
    ),
    ("Mild", "Low"): (
        "1. Remove leaves showing lesions and dispose of them away from the block.\n"
        "2. Disinfect pruning tools between trees.\n"
        "3. Apply a single coat of protectant fungicide (mancozeb 2.5 g L⁻¹) over the affected row."
    ),
    ("Moderate", "Low"): (
        "1. Spot‑spray copper oxychloride 2 g L⁻¹ on clusters with visible lesions.\n"
        "2. Prune twigs with >30 % infected leaves.\n"
        "3. Re‑check lesions in 3 days; if spread continues, escalate to systemic fungicide."
    ),
    ("Severe", "Low"): (
        "1. Remove heavily infected branches and destroy off‑site.\n"
        "2. Apply a tank‑mix of azoxystrobin 0.2 mL L⁻¹ + mancozeb 2 g L⁻¹ over the whole canopy.\n"
        "3. Post spray, mark trees for weekly follow‑up."
    ),

    # ------------------------ MEDIUM RISK --------------------------
    ("Healthy", "Medium"): (
        "1. Spray protectant fungicide (copper hydroxide 2 g L⁻¹) on the entire block.\n"
        "2. Thin interior shoots to lower humidity pockets.\n"
        "3. Schedule a second protectant pass in 12 days."
    ),
    ("Mild", "Medium"): (
        "1. Collect and remove infected foliage.\n"
        "2. Apply chlorothalonil 3 g L⁻¹ today.\n"
        "3. Follow with systemic azoxystrobin 0.2 mL L⁻¹ after 7 days."
    ),
    ("Moderate", "Medium"): (
        "1. Tank‑mix tebuconazole 0.2 mL L⁻¹ + mancozeb 2 g L⁻¹; spray to runoff.\n"
        "2. Prune infected twigs and burn debris.\n"
        "3. Repeat systemic spray in 7–10 days based on lesion check."
    ),
    ("Severe", "Medium"): (
        "1. Remove fruiting twigs with lesions.\n"
        "2. Apply propiconazole 0.25 mL L⁻¹ + mancozeb 2 g L⁻¹.\n"
        "3. Re‑evaluate canopy in 5 days; continue systemic rotation until new growth is clean."
    ),

    # ------------------------- HIGH RISK ---------------------------
    ("Healthy", "High"): (
        "1. Apply copper oxychloride 2 g L⁻¹ immediately.\n"
        "2. Repeat every 7 days while high‑risk conditions persist.\n"
        "3. Improve drainage and avoid overhead irrigation to cut wetness hours."
    ),
    ("Mild", "High"): (
        "1. Spray azoxystrobin 0.2 mL L⁻¹ + mancozeb 2 g L⁻¹ within 24 h.\n"
        "2. Remove easily reachable infected leaves only if canopy loss <10 %.\n"
        "3. Monitor lesions every 3 days; maintain 7‑day spray interval."
    ),
    ("Moderate", "High"): (
        "1. Prune branches with heavy spotting before spraying.\n"
        "2. Tank‑mix azoxystrobin 0.2 mL L⁻¹ + tebuconazole 0.25 mL L⁻¹ + mancozeb 2 g L⁻¹.\n"
        "3. Repeat spray every 5–7 days until wetness hours fall below 6 h."
    ),
    ("Severe", "High"): (
        "1. Quarantine the block to essential staff only.\n"
        "2. Destroy the most infected 30 % foliage immediately.\n"
        "3. Implement a 3‑spray rotation: difenoconazole 0.3 mL L⁻¹ + chlorothalonil 3 g L⁻¹, followed by propiconazole + mancozeb in 5 days, then repeat first mix after another 5 days."
    ),
}

_INFO_MATRIX: Dict[tuple[str, str], str] = {
    ("Healthy", "Low"): "Low humidity and cool temperatures inhibit spore germination; routine monitoring is sufficient.",
    ("Mild", "Low"): "Early lesion removal lowers inoculum; protectant barrier stops superficial infections.",
    ("Moderate", "Low"): "Copper provides surface protection; pruning reduces spore sources before systemic treatment is justified.",
    ("Severe", "Low"): "Systemic + protectant mix reaches latent infections while pruning rapidly cuts down the spore load.",

    ("Healthy", "Medium"): "Conducive weather can trigger latent infections; a protectant spray pre‑empts spore germination.",
    ("Mild", "Medium"): "Sequential protectant and systemic sprays deal with existing lesions and any new infections during conducive weather.",
    ("Moderate", "Medium"): "Combining modes of action prevents resistance and protects new foliage during moderate spread.",
    ("Severe", "Medium"): "Aggressive sanitation plus systemic rotation limits further yield loss under sustained risk.",

    ("Healthy", "High"): "High humidity and long wetness hours create ideal conditions for infection; continuous barrier protection is essential.",
    ("Mild", "High"): "Curative systemic halts mycelial growth; protectant prevents secondary spread during peak risk.",
    ("Moderate", "High"): "Multiple active ingredients and short intervals are required to outpace rapid disease expansion.",
    ("Severe", "High"): "Severe canopy infection plus perfect weather needs combined chemical, cultural, and access‑control measures to salvage the crop.",
}

# ------------------------------------------------------------------ #
# 3. PUBLIC API                                                      #
# ------------------------------------------------------------------ #

def get_recommendation(
    severity_idx: int,
    humidity: float,
    temperature: float,
    wetness: float,
) -> Dict[str, str]:
    """Return actionable steps plus side info explaining the rationale."""
    severity_label = CLASS_LABELS[severity_idx]
    risk_label     = _weather_risk(temperature, humidity, wetness)

    return {
        "severity_label": severity_label,
        "weather_risk":   risk_label,
        "advice":         _RULE_MATRIX[(severity_label, risk_label)],
        "info":           _INFO_MATRIX[(severity_label, risk_label)],
    }
