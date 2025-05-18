from typing import Dict, Tuple

# -------------------------------------------------------------- #
# 0. CONSTANTS                                                   #
# -------------------------------------------------------------- #
CLASS_LABELS = ["Healthy", "Mild", "Moderate", "Severe"]

# -------------------------------------------------------------- #
# 1. WEATHER-RISK CLASSIFIER                                     #
# -------------------------------------------------------------- #
def _weather_risk(temp: float, rh: float, wet: float) -> str:
    high_classic = 25 <= temp <= 30 and rh >= 95 and wet >= 12
    high_rainsun = 22 <= temp <= 30 and rh >= 95 and wet >= 6
    if high_classic or high_rainsun:
        return "High"
    if temp < 22 or rh < 85 or wet < 6:
        return "Low"
    return "Medium"

# -------------------------------------------------------------- #
# 2. RULE, ACTION & INFO MATRICES                                #
# -------------------------------------------------------------- #
# Advice uses simple measures: tablespoons per 10-L bucket, teaspoons, etc.
_RULE_MATRIX: Dict[Tuple[str, str], str] = {
    # LOW RISK
    ("Healthy", "Low"): (
        "1. Every week, walk the orchard and pick up fallen leaves; *burn* them well away from trees.\n"
        "2. Prune a few crowded branches to let air circulate.\n"
        "3. If rain is coming, mix 2 level tablespoons of copper powder in one 10-L bucket of water; if sunny, mix 2 scoops (tablespoons) of water-dispersible copper powder.\n"
        "4. Install a simple rain gauge or moisture sensors to spot wet patches before you see spots."
    ),
    ("Mild", "Low"): (
        "1. Gently pinch off the spotted leaves; *burn* them immediately.\n"
        "2. Clean your pruner with rubbing alcohol between each cut.\n"
        "3. Mix 2 tablespoons of non-systemic copper powder per 10-L bucket and spray lightly.\n"
        "4. If spots stay after five days, mix one teaspoon of weak systemic fungicide in a bucket and repeat.\n"
        "5. Mark flagged trees with a ribbon so you can track them later."
    ),
    ("Moderate", "Low"): (
        "1. In a 10-L bucket, mix 2 tablespoons of sticker-type copper oxychloride powder; spray only the spotted areas.\n"
        "2. Cut off twigs with more than 30% spots; *burn* the cuttings.\n"
        "3. Check again in three days; if still active, mix 2 small teaspoons of mid-strength systemic fungicide in a bucket and spray.\n"
        "4. Next time, switch to a different brand or type to avoid resistance.\n"
        "5. Keep a simple diary: note date, weather, and what dose you used."
    ),
    ("Severe", "Low"): (
        "1. Cut out and *burn* all badly infected branches.\n"
        "2. Mix half a teaspoon of azoxystrobin plus 2 tablespoons of mancozeb powder in a 10-L bucket of water; spray the whole tree.\n"
        "3. Repeat this spray once a week; if you still see spots, add one extra teaspoon of systemic next time.\n"
        "4. After pruning, seal large cuts with tree wound paint (about one tablespoon).\n"
        "5. Write down the batch number from the fungicide pack so you notice if it stops working."
    ),
    # MEDIUM RISK
    ("Healthy", "Medium"): (
        "1. Fill a 10-L bucket and add 2 scoops (tablespoons) of copper hydroxide powder; spray the entire canopy lightly.\n"
        "2. Trim branches to let sun and wind dry leaves faster.\n"
        "3. If leaves stay wet, next round use the same mix but add a sticker agent (one small spoon).\n"
        "4. Keep a paper log of treatments alongside weather notes for future use."
    ),
    ("Mild", "Medium"): (
        "1. Gather fallen and diseased leaves and *burn* them.\n"
        "2. Mix 3 tablespoons of chlorothalonil powder per 10-L bucket; spray fully today.\n"
        "3. If rain is expected, add one teaspoon of sticker; if sun is fierce, add one teaspoon of sun-protectant.\n"
        "4. Next month, use a different class of fungicide to keep spores guessing.\n"
        "5. Try an organic spray like Bacillus subtilis—mix two spoons per bucket for extra help."
    ),
    ("Moderate", "Medium"): (
        "1. In 10 L water, mix one teaspoon of tebuconazole and 2 tablespoons of mancozeb; spray until runoff.\n"
        "2. Prune and *burn* any twigs with spots.\n"
        "3. In 7–10 days, use one teaspoon of higher-strength systemic if you still see spots.\n"
        "4. If rain is likely, stick with sticker powder; if not, use wettable powder under sun.\n"
        "5. Put water-sensitive test papers on leaves to see if spray covers well, then adjust nozzle if needed."
    ),
    ("Severe", "Medium"): (
        "1. Cut and *burn* heavily diseased twigs; block off the area for workers.\n"
        "2. Mix half a teaspoon of propiconazole plus 2 tablespoons of mancozeb per bucket; spray thoroughly.\n"
        "3. After five days, if spots persist, upgrade to a stronger systemic at one teaspoon per bucket.\n"
        "4. Seal cuts with tree wound paint (2 tablespoons) and add sticker or sun-protect agent as needed.\n"
        "5. If still no improvement, call an agronomist for advice."
    ),
    # HIGH RISK
    ("Healthy", "High"): (
        "1. Within 24 hours, mix 2 tablespoons of copper oxychloride and one teaspoon of sticker in a bucket; spray all wet leaves.\n"
        "2. Repeat every seven days until the rain stops.\n"
        "3. Check gutters and irrigation pipes for drips that keep leaves wet; fix leaks.\n"
        "4. Make simple rain guards or covers over young trees if you can."
    ),
    ("Mild", "High"): (
        "1. In 10 L, mix half a teaspoon of azoxystrobin plus 2 tablespoons of mancozeb; spray today.\n"
        "2. Burn removed leaves; if spots return, add one teaspoon more systemic next time.\n"
        "3. Inspect trees every three days; act fast if you see new spots.\n"
        "4. Always include one teaspoon of sticker if rain is on the forecast.\n"
        "5. Set phone alerts for weather changes to plan your sprays."
    ),
    ("Moderate", "High"): (
        "1. Prune and *burn* spotted branches immediately.\n"
        "2. Mix half a teaspoon of azoxystrobin, half a teaspoon of tebuconazole, and 2 tablespoons of mancozeb; spray thoroughly.\n"
        "3. Do this every 5–7 days; if sun is strong, switch to wettable powder next round.\n"
        "4. Change to a different systemic brand each time.\n"
        "5. Mark spray dates on a wall calendar or phone for regular care."
    ),
    ("Severe", "High"): (
        "1. Quarantine the area; only trained staff wearing gloves and masks.\n"
        "2. Burn worst 30% of leaves then mix 3 tablespoons of chlorothalonil and one teaspoon of difenoconazole; spray at once.\n"
        "3. On day five, use half a teaspoon of propiconazole plus 2 tablespoons of mancozeb; on day ten, repeat the first mix.\n"
        "4. Seal big cuts with two tablespoons of wound paint; add one teaspoon of sticker if rain comes.\n"
        "5. If spots still appear, shorten spray gap to every five days and increase dose by half a spoon.\n"
        "6. Plan major pruning when trees are resting (off-season) to remove hidden spores."
    ),
}

_ACTION_LABEL_MATRIX: Dict[Tuple[str, str], str] = {
    ("Healthy", "Low"): "Maintain",
    ("Healthy", "Medium"): "Prevent",
    ("Healthy", "High"): "Prevent",
    ("Mild", "Low"): "Prevent",
    ("Mild", "Medium"): "Prevent",
    ("Mild", "High"): "Treat",
    ("Moderate", "Low"): "Monitor / Treat",
    ("Moderate", "Medium"): "Treat",
    ("Moderate", "High"): "Intensive Treatment",
    ("Severe", "Low"): "Treat",
    ("Severe", "Medium"): "Intensive Treatment",
    ("Severe", "High"): "Emergency Action",
}

_INFO_MATRIX: Dict[Tuple[str, str], str] = {
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
    severity_label = CLASS_LABELS[severity_idx]
    risk_label     = _weather_risk(temperature, humidity, wetness)
    return {
        "severity_label": severity_label,
        "weather_risk":   risk_label,
        "action_label":   _ACTION_LABEL_MATRIX[(severity_label, risk_label)],
        "advice":         _RULE_MATRIX[(severity_label, risk_label)],
        "info":           _INFO_MATRIX[(severity_label, risk_label)],
    }
