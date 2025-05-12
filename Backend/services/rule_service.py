"""
SuperMango Rule-Based Prescription Engine
=========================================
get_recommendation(severity_idx, humidity, temperature, wetness) -> dict

Returns
-------
{
    "severity_label": "Moderate",
    "weather_risk"  : "High",
    "advice"        : "1. ... 2. ...",
    "info"          : "Why these steps work – background physiology / epidemiology."
}

How it works in simple terms
----------------------------
1.  **Severity label**  
    Our vision model gives a number (0‒3).  
    We translate it to a word: 0 = Healthy, 1 = Mild, 2 = Moderate, 3 = Severe.

2.  **Weather risk**  
    Anthracnose loves warm, humid, wet spells.  
    • *High* if either  
        – Classic textbook rule: 25–30 °C, ≥ 95 % RH, ≥ 12 h wetness, **or**  
        – Farmer rule: 22–30 °C, ≥ 95 % RH, ≥ 6 h wetness (the “rain-then-sun” pattern).  
    • *Low* if it’s cool, dry, or leaves dry quickly (< 6 h).  
    • Everything in-between is *Medium*.

3.  **Look up the prescription**  
    We pair the severity with the risk and pull two short texts:  
       – `advice` → a numbered to-do list  
       – `info` → one line explaining the science behind the advice  
    Those texts fold in lessons from the interviews (rotate fungicides, burn debris, seal pruning wounds, act within 24 h when risk is high, use organics first when pressure is low).

4.  **Return a small JSON**  
    The phone app pastes that JSON straight onto the screen or reads it aloud.

That’s it—no fancy libraries, just a neat decision tree in Python.
"""

from typing import Dict

# -------------------------------------------------------------- #
# 0. CONSTANTS                                                   #
# -------------------------------------------------------------- #

CLASS_LABELS = ["Healthy", "Mild", "Moderate", "Severe"]

# -------------------------------------------------------------- #
# 1. WEATHER-RISK CLASSIFIER                                     #
# -------------------------------------------------------------- #
def _weather_risk(temp: float, rh: float, wet: float) -> str:
    """
    Decide whether today's weather creates Low, Medium, or High
    risk for anthracnose.

    High  →  (A) 25–30 °C, RH ≥ 95 %, wet ≥ 12 h
          OR (B) 22–30 °C, RH ≥ 95 %, wet ≥ 6 h
          (B) is the “rain-then-sun” spike farmers say wipes them out
          in 24 h.

    Low   →  temp < 22 °C  OR  RH < 85 %  OR  wet < 6 h

    Medium → everything else.
    """
    high_classic = 25 <= temp <= 30 and rh >= 95 and wet >= 12
    high_rainsun = 22 <= temp <= 30 and rh >= 95 and wet >= 6

    if high_classic or high_rainsun:
        return "High"
    if temp < 22 or rh < 85 or wet < 6:
        return "Low"
    return "Medium"

# -------------------------------------------------------------- #
# 2. RULE & INFO MATRICES                                        #
# -------------------------------------------------------------- #

_RULE_MATRIX: Dict[tuple[str, str], str] = {
    # --------------------------- LOW RISK --------------------------- #
    ("Healthy", "Low"): (
        "1. Inspect a few trees every 5 days for new spots.\n"
        "2. Prune crossing shoots so air flows freely.\n"
        "3. Keep fertiliser balanced; avoid excess nitrogen."
    ),
    ("Mild", "Low"): (
        "1. Pluck leaves with lesions and discard them far from the block.\n"
        "2. Disinfect pruning tools between trees.\n"
        "3. Give one coat of *non-systemic* copper or mancozeb (2 g L⁻¹).\n"
        "4. Save systemic fungicides for later if pressure stays low."
    ),
    ("Moderate", "Low"): (
        "1. Spot-spray copper oxychloride 2 g L⁻¹ on clusters with lesions.\n"
        "2. Prune twigs with > 30 % infected leaves.\n"
        "3. Re-check in 3 days; if spots expand, move up to a systemic.\n"
        "4. Rotate fungicide group on the next spray."
    ),
    ("Severe", "Low"): (
        "1. Remove heavily infected branches and *burn* them off-site.\n"
        "2. Spray azoxystrobin 0.2 mL L⁻¹ + mancozeb 2 g L⁻¹ over the canopy.\n"
        "3. Flag these trees for weekly follow-up.\n"
        "4. Seal big cuts with wound paint to block reinfection."
    ),

    # -------------------------- MEDIUM RISK ------------------------- #
    ("Healthy", "Medium"): (
        "1. Blanket-spray copper hydroxide 2 g L⁻¹.\n"
        "2. Thin the crowded interior so leaves dry faster.\n"
        "3. Book a second copper round in 12 days."
    ),
    ("Mild", "Medium"): (
        "1. Collect and remove infected foliage.\n"
        "2. Spray chlorothalonil 3 g L⁻¹ today.\n"
        "3. Follow with azoxystrobin 0.2 mL L⁻¹ after 7 days.\n"
        "4. **Rotate** to a different fungicide class next spray."
    ),
    ("Moderate", "Medium"): (
        "1. Mix tebuconazole 0.2 mL L⁻¹ + mancozeb 2 g L⁻¹; spray to runoff.\n"
        "2. Prune and burn infected twigs.\n"
        "3. Repeat systemic in 7–10 days if lesions stay active.\n"
        "4. Switch fungicide class at the next application."
    ),
    ("Severe", "Medium"): (
        "1. Lop off fruiting twigs with lesions; burn them.\n"
        "2. Spray propiconazole 0.25 mL L⁻¹ + mancozeb 2 g L⁻¹.\n"
        "3. Re-inspect in 5 days; keep rotating systemics until new growth is clean.\n"
        "4. Seal pruning wounds to stop fresh spores entering."
    ),

    # --------------------------- HIGH RISK -------------------------- #
    ("Healthy", "High"): (
        "1. Within 24 h spray copper oxychloride 2 g L⁻¹.\n"
        "2. Keep a 7-day copper schedule until weather calms.\n"
        "3. Improve drainage and avoid overhead irrigation."
    ),
    ("Mild", "High"): (
        "1. Within 24 h spray azoxystrobin 0.2 mL L⁻¹ + mancozeb 2 g L⁻¹.\n"
        "2. Remove reachable infected leaves only if canopy loss < 10 %.\n"
        "3. Check lesions every 3 days; keep a 7-day spray interval.\n"
        "4. Rotate fungicide class each cycle."
    ),
    ("Moderate", "High"): (
        "1. Prune branches with heavy spotting before spraying.\n"
        "2. Within 24 h tank-mix azoxystrobin 0.2 mL L⁻¹ + tebuconazole 0.25 mL L⁻¹ + mancozeb 2 g L⁻¹.\n"
        "3. Spray every 5–7 days until wetness hours drop below 6 h.\n"
        "4. Rotate fungicide class every round."
    ),
    ("Severe", "High"): (
        "1. Quarantine the block—essential staff only.\n"
        "2. Destroy the worst 30 % of foliage and burn it down-wind.\n"
        "3. Start a 3-spray rotation: day 0 difenoconazole 0.3 mL L⁻¹ + chlorothalonil 3 g L⁻¹;\n"
        "   day 5 propiconazole + mancozeb; day 10 repeat day 0 mix.\n"
        "4. Seal all pruning cuts with wound paint.\n"
        "5. Keep rotating fungicides every 5 days."
    ),
}

_INFO_MATRIX: Dict[tuple[str, str], str] = {
    ("Healthy", "Low"): (
        "Cool, dry weather slows spores—watchful waiting is enough."
    ),
    ("Mild", "Low"): (
        "Early lesion removal cuts the spore load; non-systemic copper is gentle on soil life."
    ),
    ("Moderate", "Low"): (
        "Copper shields the surface; pruning lowers inoculum; rotation avoids resistance."
    ),
    ("Severe", "Low"): (
        "Systemic + protectant reaches hidden infections; wound paint blocks new entry points."
    ),

    ("Healthy", "Medium"): (
        "Weather is turning friendly to the fungus; copper barrier stops spores from germinating."
    ),
    ("Mild", "Medium"): (
        "Protectant cleans the leaf, systemic cures hidden spots; alternating classes prevents immunity."
    ),
    ("Moderate", "Medium"): (
        "Mixed modes of action tackle established lesions; FRAC rotation keeps chemistry effective."
    ),
    ("Severe", "Medium"): (
        "Heavy sanitation plus wound care remove reservoirs while rotating fungicides holds the line."
    ),

    ("Healthy", "High"): (
        "Prolonged wet, humid spells are perfect for infection—continuous copper barrier is vital."
    ),
    ("Mild", "High"): (
        "Curative systemic freezes the fungus; protectant stops new spread; strict rotation fights resistance."
    ),
    ("Moderate", "High"): (
        "Rapid spread needs multiple actives and short intervals; rotation + sanitation contain the 24-h threat."
    ),
    ("Severe", "High"): (
        "When canopy infection meets perfect weather, only combined chemical, sanitation, and wound-sealing can salvage any yield."
    ),
}

# -------------------------------------------------------------- #
# 3. PUBLIC API                                                  #
# -------------------------------------------------------------- #
def get_recommendation(
    severity_idx: int,
    humidity: float,
    temperature: float,
    wetness: float,
) -> Dict[str, str]:
    """
    Decide what a mango grower should do *today*.

    Parameters
    ----------
    severity_idx : int    0 = Healthy … 3 = Severe (from the ResNet model)
    humidity     : float  Relative humidity (%)
    temperature  : float  °C
    wetness      : float  Hours leaf surface stayed wet

    Returns
    -------
    dict with keys
        severity_label – text version of the index
        weather_risk   – Low / Medium / High
        advice         – numbered action steps
        info           – one-liner science behind those steps
    """
    severity_label = CLASS_LABELS[severity_idx]
    risk_label     = _weather_risk(temperature, humidity, wetness)

    return {
        "severity_label": severity_label,
        "weather_risk":   risk_label,
        "advice":         _RULE_MATRIX[(severity_label, risk_label)],
        "info":           _INFO_MATRIX[(severity_label, risk_label)],
    }
