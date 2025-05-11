"""
Rule-based prescription engine for SuperMango
---------------------------------------------
`get_recommendation(severity_idx, humidity, temperature, wetness) -> dict`

* `severity_idx`  : int   0-Healthy · 1-Mild · 2-Moderate · 3-Severe  
* `humidity`      : float Relative humidity in %  
* `temperature`   : float Degrees C  
* `wetness`       : float Continuous hours of leaf-wetness / rainfall

Returns
-------
{
  "severity_label" : "Moderate",
  "weather_risk"   : "High",
  "advice"         : "Apply systemic fungicide within 24 h, prune infected ..."
}
"""

from typing import Tuple

CLASS_LABELS = ["Healthy", "Mild", "Moderate", "Severe"]

# ------------------------------------------------------------------ #
# 1. WEATHER-RISK CLASSIFIER                                         #
# ------------------------------------------------------------------ #
def _weather_risk(temp: float, rh: float, wet: float) -> str:
    """Low / Medium / High risk for anthracnose given daily weather."""
    if temp < 22 or rh < 85 or wet < 6:
        return "Low"
    # NB: test *High* first so it wins ties over Medium
    if 25 <= temp <= 30 and rh >= 95 and wet >= 12:
        return "High"
    if 22 <= temp <= 30 and 85 <= rh <= 94 and 6 <= wet <= 11:
        return "Medium"
    # Fallback – conditions are mixed; treat as Medium risk
    return "Medium"

# ------------------------------------------------------------------ #
# 2. RULE MATRIX                                                     #
# ------------------------------------------------------------------ #
_RULE_MATRIX = {
    #                 Low-risk weather advice
    ("Healthy",  "Low"): "No visible infection and weather is unfavourable "
                         "for anthracnose. Keep monitoring every 3-5 days.",
    ("Mild",     "Low"): "Prune the few spotted leaves and dispose of them "
                         "away from the orchard. Resume weekly checks.",
    ("Moderate", "Low"): "Spot-apply protectant fungicide and prune infected "
                         "foliage. Re-inspect in 3 days.",
    ("Severe",   "Low"): "Severe infection detected. Begin a curative spray "
                         "programme and remove as much diseased tissue as "
                         "practical. Consider expert advice.",

    #                 Medium-risk weather advice
    ("Healthy",  "Medium"): "Begin preventive copper or mancozeb sprays at "
                            "10–14-day intervals; maintain airflow in canopy.",
    ("Mild",     "Medium"): "Prune diseased leaves and apply a protectant "
                            "fungicide now; repeat in 10 days.",
    ("Moderate", "Medium"): "Apply a systemic fungicide (e.g. azoxystrobin) "
                            "and tighten spray interval to 7–10 days.",
    ("Severe",   "Medium"): "Immediate broad-spectrum fungicide. Intensify "
                            "orchard sanitation; expect yield loss.",

    #                 High-risk weather advice
    ("Healthy",  "High"): "Weather is highly favourable for infection. Start "
                          "preventive fungicide immediately; shorten interval "
                          "to 7 days.",
    ("Mild",     "High"): "Apply curative fungicide within 24 h and prune "
                          "infected areas. Monitor every 2–3 days.",
    ("Moderate", "High"): "Urgent systemic + protectant fungicide mix, heavy "
                          "pruning, and consider fruit bagging.",
    ("Severe",   "High"): "Critical situation. Implement emergency spray "
                          "programme (5-day interval), remove and burn "
                          "infected debris, and consult an agronomist.",
}

# ------------------------------------------------------------------ #
# 3. PUBLIC API                                                      #
# ------------------------------------------------------------------ #
def get_recommendation(
    severity_idx: int,
    humidity: float,
    temperature: float,
    wetness: float
) -> dict:
    """
    Combine disease severity with real-time weather to generate an agronomic
    recommendation.
    """
    severity_label = CLASS_LABELS[severity_idx]
    risk           = _weather_risk(temperature, humidity, wetness)
    advice         = _RULE_MATRIX[(severity_label, risk)]

    return {
        "severity_label": severity_label,
        "weather_risk":   risk,
        "advice":         advice,
    }
