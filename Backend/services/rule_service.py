"""
SuperMango Rule-Based Prescription Engine with Tagalog Translations
===================================================================
get_recommendation(severity_idx, humidity, temperature, wetness) -> dict

Returns
-------
{
  "severity_label": "Moderate",
  "weather_risk": "Low",
  "action_label": "Monitor / Treat",
  "advice": "...",
  "info": "...",
  "action_label_tagalog": "Bantayan/Gamutin",
  "advice_tagalog": "...",
  "info_tagalog": "..."
}
"""
from typing import Dict, Tuple

# -------------------------------------------------------------- #
# 0. CONSTANTS                                                   #
# -------------------------------------------------------------- #
CLASS_LABELS = ["Healthy", "Mild", "Moderate", "Severe"]

# -------------------------------------------------------------- #
# 1. WEATHER-RISK CLASSIFIER                                     #
# -------------------------------------------------------------- #
def _weather_risk(temp: float, rh: float, wet: float) -> str:
    """
    Classify today's anthracnose risk based on weather.
    """
    high_classic = 25 <= temp <= 30 and rh >= 95 and wet >= 12
    high_rainsun = 22 <= temp <= 30 and rh >= 95 and wet >= 6
    if high_classic or high_rainsun:
        return "High"
    if temp < 22 or rh < 85 or wet < 6:
        return "Low"
    return "Medium"

# -------------------------------------------------------------- #
# 2. ENGLISH RULE, ACTION & INFO MATRICES                        #
# -------------------------------------------------------------- #
_RULE_MATRIX: Dict[Tuple[str, str], str] = {
    ("Healthy", "Low"): (
        "1. Every week, walk the orchard and pick up fallen leaves; *burn* them away from trees.\n"
        "2. Prune a few crowded branches to let air circulate.\n"
        "3. If rain is forecast, mix 2 level tablespoons of copper powder in a 10‑L bucket; if sunny, mix 2 tablespoons of water‑dispersible copper powder.\n"
        "4. Install a simple rain gauge or moisture sensor to spot wet patches early."
    ),
    ("Mild", "Low"): (
        "1. Pinch off spotted leaves and *burn* them immediately.\n"
        "2. Disinfect pruning tools with alcohol between each cut.\n"
        "3. Mix 2 tablespoons of non‑systemic copper powder per 10‑L bucket and spray lightly.\n"
        "4. If spots remain after 5 days, mix 1 teaspoon of weak systemic fungicide per bucket and repeat.\n"
        "5. Mark flagged trees with a ribbon to track progress."
    ),
    ("Moderate", "Low"): (
        "1. Spot‑spray sticker‑type copper oxychloride (2 Tbsp in 10‑L) on lesions.\n"
        "2. Prune and *burn* twigs with >30% infection.\n"
        "3. Check in 3 days; if active, use 2 tsp of mid‑strength systemic fungicide per bucket.\n"
        "4. Rotate to a different fungicide class next time.\n"
        "5. Keep a simple log of dates, weather, and dosages."
    ),
    ("Severe", "Low"): (
        "1. Remove and *burn* all heavily diseased branches.\n"
        "2. Mix 0.5 tsp azoxystrobin + 2 Tbsp mancozeb per 10‑L bucket; spray canopy.\n"
        "3. Repeat weekly; increase dose by 0.5 tsp if spots persist.\n"
        "4. Seal large cuts with 1 Tbsp of wound paint.\n"
        "5. Record fungicide batch numbers to monitor resistance."
    ),
    ("Healthy", "Medium"): (
        "1. Blanket‑spray 2 Tbsp copper hydroxide per 10‑L bucket; start light.\n"
        "2. Thin canopy for faster drying.\n"
        "3. Next round, add 1 tsp sticker if leaves stay wet.\n"
        "4. Keep a paper log of treatments and weather."
    ),
    ("Mild", "Medium"): (
        "1. Collect and *burn* infected leaves.\n"
        "2. Spray 3 Tbsp chlorothalonil per 10‑L bucket; revisit in 7 days.\n"
        "3. If rain is expected add 1 tsp sticker; in sun, add 1 tsp sun protectant.\n"
        "4. Rotate fungicide class each cycle.\n"
        "5. Consider organic biocontrol (e.g., 2 spoons Bacillus subtilis per bucket)."
    ),
    ("Moderate", "Medium"): (
        "1. Mix 1 tsp tebuconazole + 2 Tbsp mancozeb per 10‑L; spray to runoff.\n"
        "2. Prune and *burn* infected twigs.\n"
        "3. In 7–10 days, escalate to stronger systemic (1.5 tsp).\n"
        "4. Use sticker‑type before rain or wettable powders in sun.\n"
        "5. Use water‑sensitive paper to check spray coverage."
    ),
    ("Severe", "Medium"): (
        "1. Lop and *burn* diseased twigs; quarantine area.\n"
        "2. Mix 0.5 tsp propiconazole + 2 Tbsp mancozeb per bucket; spray thoroughly.\n"
        "3. After 5 days, upgrade to 1 tsp systemic if needed.\n"
        "4. Seal cuts with 2 Tbsp wound paint + sticker/sun protectant.\n"
        "5. Call an agronomist if no improvement in 7 days."
    ),
    ("Healthy", "High"): (
        "1. Within 24h, spray 2 Tbsp copper oxychloride + 1 tsp sticker per bucket.\n"
        "2. Repeat every 7 days until risk drops.\n"
        "3. Fix gutter/irrigation leaks that prolong wetness.\n"
        "4. Cover young trees during heavy rain if possible."
    ),
    ("Mild", "High"): (
        "1. Mix 0.5 tsp azoxystrobin + 2 Tbsp mancozeb in 10‑L; spray today.\n"
        "2. Burn removed leaves; if spots return, add 1 tsp more systemic.\n"
        "3. Inspect every 3 days; act fast on new spots.\n"
        "4. Always include 1 tsp sticker when rain is forecast.\n"
        "5. Set phone alerts for weather updates."
    ),
    ("Moderate", "High"): (
        "1. Prune and *burn* spotted branches immediately.\n"
        "2. Mix 0.5 tsp azoxystrobin + 0.5 tsp tebuconazole + 2 Tbsp mancozeb; spray.\n"
        "3. Repeat every 5–7 days; use wettable powders in sun.\n"
        "4. Change systemic brand each round.\n"
        "5. Mark spray dates in calendar or phone."
    ),
    ("Severe", "High"): (
        "1. Quarantine area; only trained staff with PPE.\n"
        "2. Burn worst 30% foliage; mix 3 Tbsp chlorothalonil + 1 tsp difenoconazole and spray.\n"
        "3. Day 5: 0.5 tsp propiconazole + 2 Tbsp mancozeb; Day 10: repeat initial mix.\n"
        "4. Seal cuts with 2 Tbsp wound paint + 1 tsp sticker if rain comes.\n"
        "5. If spots persist, spray every 5 days and increase dose by 0.5 tsp.\n"
        "6. Plan off‑season pruning to remove hidden spores."
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
    ("Healthy", "Low"): "Cool, dry weather slows spores—watchful waiting is enough.",
    ("Mild", "Low"): "Early lesion removal cuts spore load; non‑systemic copper is gentle on soil.",
    ("Moderate", "Low"): "Copper protects leaf surface; pruning lowers inoculum; rotation avoids resistance.",
    ("Severe", "Low"): "Systemic + protectant penetrates hidden spots; wound paint blocks reinfection.",
    ("Healthy", "Medium"): "Rising humidity favors fungus; copper barrier stops germination.",
    ("Mild", "Medium"): "Protectant cleans leaves; systemic cures hidden spots; rotation prevents immunity.",
    ("Moderate", "Medium"): "Mixed modes tackle lesions; FRAC rotation keeps chemistry effective.",
    ("Severe", "Medium"): "Heavy sanitation + wound care remove reservoirs; rotation holds line.",
    ("Healthy", "High"): "Extended wetness perfects infection—continuous copper barrier is vital.",
    ("Mild", "High"): "Curative systemic kills fungus; sticker prevents wash‑off; rotation fights resistance.",
    ("Moderate", "High"): "Short intervals + multi‑actives contain rapid spread.",
    ("Severe", "High"): "Combined chemical, sanitation & sealing are needed to salvage yield.",
}

# -------------------------------------------------------------- #
# 3. TAGALOG TRANSLATIONS MATRICES                                #
# -------------------------------------------------------------- #
_ACTION_LABEL_MATRIX_TL: Dict[Tuple[str, str], str] = {
    ("Healthy", "Low"): "Panatilihin",
    ("Healthy", "Medium"): "Iwasan",
    ("Healthy", "High"): "Iwasan",
    ("Mild", "Low"): "Iwasan",
    ("Mild", "Medium"): "Iwasan",
    ("Mild", "High"): "Gamutin",
    ("Moderate", "Low"): "Bantayan/Gamutin",
    ("Moderate", "Medium"): "Gamutin",
    ("Moderate", "High"): "Masinsinang Gamutan",
    ("Severe", "Low"): "Gamutin",
    ("Severe", "Medium"): "Masinsinang Gamutan",
    ("Severe", "High"): "Agad na Aksyon",
}

_RULE_MATRIX_TL: Dict[Tuple[str, str], str] = {
    ("Healthy", "Low"): (
        "1. Bawat linggo, maglakad sa taniman at pulutin ang nahulog na dahon; *sunugin* nang malayo sa puno.\n"
        "2. Gunting nang kaunti ang siksik na sanga para makahinga ang hangin.\n"
        "3. Kung uulan, ihalo 2 kutsara ng copper sa 10‑litro balde; kung maaraw, gumamit ng 2 kutsarang pulbos.\n"
        "4. Maglagay ng rain gauge o moisture sensor para maagap ang pagsubaybay."
    ),
    ("Mild", "Low"): (
        "1. Alisin ang may mantsang dahon at *sunugin* agad.\n"
        "2. Linisin ang pruning tool gamit rubbing alcohol bawat gupit.\n"
        "3. Ihalo 2 kutsarang non‑systemic copper sa 10‑litro balde at ispray nang banayad.\n"
        "4. Kung may mantsa pa pagkatapos ng 5 araw, ihalo 1 kutsarita ng systemic at ulitin.\n"
        "5. Lagyan ng ribbon ang puno para madali itong makita." 
    ),
    ("Moderate", "Low"): (
        "1. Sa 10‑litro balde, ihalo 2 kutsarang sticker‑type copper oxychloride; ispray lang ang may mantsa.\n"
        "2. Putulin at *sunugin* ang sanga na may higit sa 30% mantsa.\n"
        "3. Tingnan muli sa 3 araw; kung may mantsa pa, ihalo 2 kutsarita ng mid‑strength systemic at ispray.\n"
        "4. Sa susunod, palitan ang brand para maiwasan ang resistance.\n"
        "5. Itala sa diary ang petsa, panahon, at dami ng ginamit."    
    ),
    ("Severe", "Low"): (
        "1. Putulin lahat ng malalubhang apektadong sanga at *sunugin*.\n"
        "2. Ihalo 0.5 kutsarita azoxystrobin + 2 kutsara mancozeb sa 10‑litro balde; ispray ang buong puno.\n"
        "3. Ulitin lingguhan; dagdagan ng 0.5 kutsarita kung may mantsa pa.\n"
        "4. Takpan ang malalaking hiwa ng 1 kutsara ng wound paint.\n"
        "5. Itala ang batch number ng fungicide para sa monitoring."     
    ),
    ("Healthy", "Medium"): (
        "1. I‑spray ang buong puno gamit 2 kutsara copper hydroxide sa 10‑litro balde.\n"
        "2. Gunting para mas mabilis matuyo ang dahon.\n"
        "3. Sa susunod, magdagdag ng 1 kutsarita sticker kung basa ang dahon.\n"
        "4. Itala sa papel ang gamitan at lagay ng weather notes."    
    ),
    ("Mild", "Medium"): (
        "1. Pulutin at *sunugin* ang nahulog na dahon.\n"
        "2. Ihalo 3 kutsara chlorothalonil sa 10‑litro balde; ispray ngayon.\n"
        "3. Kung uulan, magdagdag ng 1 kutsarita sticker; kung maaraw, 1 kutsaritang sun protectant.\n"
        "4. Susunod na buwan, gamitin ibang class ng fungicide.\n"
        "5. Subukan ang organic spray (2 kutsara Bacillus subtilis)."    
    ),
    ("Moderate", "Medium"): (
        "1. Sa 10‑litro tubig, ihalo 1 kutsarita tebuconazole + 2 kutsara mancozeb; ispray hanggang tumakbo.\n"
        "2. Gunting at *sunugin* ang may mantsang sanga.\n"
        "3. Sa 7–10 araw, gumamit ng 1 kutsarita ng mas malakas na systemic kung may mantsa pa.\n"
        "4. Kung uulan, sticker powder; kung hindi, wettable powder sa araw.\n"
        "5. Gamitin ang water‑sensitive paper para macheck ang spray coverage."    
    ),
    ("Severe", "Medium"): (
        "1. Putulin at *sunugin* ang malalaking bahagi; bakuran ang area.\n"
        "2. Ihalo 0.5 kutsarita propiconazole + 2 kutsara mancozeb; ispray nang maayos.\n"
        "3. Pagkatapos ng 5 araw, gumamit ng 1 kutsarita strong systemic kung kailangan.\n"
        "4. Takpan ang hiwa ng 2 kutsara wound paint + sticker/sun protectant.\n"
        "5. Kung walang pagbabago, tumawag sa agronomist."    
    ),
    ("Healthy", "High"): (
        "1. Sa loob ng 24h, ispray 2 kutsara copper oxychloride + 1 kutsarita sticker.\n"
        "2. Ulitin bawat 7 araw hanggang humupa ang ulan.\n"
        "3. Ayusin ang tubuhan at irrigation na tumutulo.\n"
        "4. Takpan ang batang puno sa malakas na ulan."    
    ),
    ("Mild", "High"): (
        "1. Ihalo 0.5 kutsarita azoxystrobin + 2 kutsara mancozeb sa 10‑litro; ispray ngayon.\n"
        "2. Sunugin ang mantsang dahon; kung bumalik, dagdagan ng 1 kutsarita systemic.\n"
        "3. Suriin bawat 3 araw; agad aksiyon sa bagong mantsa.\n"
        "4. Laging magdagdag ng 1 kutsarita sticker kung uulan.\n"
        "5. Gumamit ng weather alert sa telepono."    
    ),
    ("Moderate", "High"): (
        "1. Gunting at *sunugin* ang mantsang sanga agad.\n"
        "2. Ihalo 0.5 kutsarita azoxystrobin + 0.5 kutsarita tebuconazole + 2 kutsara mancozeb; ispray nang mabuti.\n"
        "3. Ulitin bawat 5–7 araw; wettable powder sa araw.\n"
        "4. Palitan ang systemic brand tuwing susunod.\n"
        "5. Ituon ang petsa ng spray sa kalendaryo."    
    ),
    ("Severe", "High"): (
        "1. Bakuran ang lugar; trained staff lang na may PPE.\n"
        "2. Sunugin ang 30% pinakamasamang bahagi; ihalo 3 kutsara chlorothalonil + 1 kutsarita difenoconazole at ispray.\n"
        "3. Araw 5: 0.5 kutsarita propiconazole + 2 kutsara mancozeb; Araw 10: ulitin unang halo.\n"
        "4. Takpan ang hiwa ng 2 kutsara wound paint + 1 kutsarita sticker kung uulan.\n"
        "5. Kung may mantsa pa, ispray tuwing 5 araw at dagdag 0.5 kutsarita.\n"
        "6. Magplano ng off‑season pruning para alisin ang natitirang spore."
    ),
}

_INFO_MATRIX_TL: Dict[Tuple[str, str], str] = {
    ("Healthy", "Low"): "Pinapabagal ng tuyong panahon ang pagkalat ng spore—pwede munang bantayan lang.",
    ("Mild", "Low"): "Pag-alis ng mantsang dahon ay bawas spore load; magaan sa lupa ang non-systemic copper.",
    ("Moderate", "Low"): "Pinoprotektahan ng copper ang dahon; ang pruning ay nagpapababa ng impeksyon; rotation ay pumipigil sa resistance.",
    ("Severe", "Low"): "Systemic at protectant ay umaabot sa nakatagong impeksyon; wound paint ay pumipigil sa bagong spore.",
    ("Healthy", "Medium"): "Pabor ang lumilinas na panahon sa fungus; humahadlang ang copper barrier.",
    ("Mild", "Medium"): "Tinutunaw ng protectant ang spores; nagpapagaling ang systemic; rotation ay pumipigil sa immunity.",
    ("Moderate", "Medium"): "Aksyon mula sa iba't ibang mode ay sumisira sa mantsa; rotation ay nagpapanatili ng bisa.",
    ("Severe", "Medium"): "Malawakang sanitation at wound care ay nag-aalis ng pinanggagalingan; rotation ay nagpapatatag.",
    ("Healthy", "High"): "Ang mahabang tag-ulan ay perpekto para sa impeksyon—kailangan ng tuloy-tuloy na copper barrier.",
    ("Mild", "High"): "Pumatay ang systemic sa fungus; pumipigil ang sticker sa paghuhugas; rotation ay pumipigil sa resistance.",
    ("Moderate", "High"): "Kailangan ng madalas at kombinadong kemikal para masupil ang mabilis na pagkalat.",
    ("Severe", "High"): "Kinakailangan ang kombinadong kemikal, sanitation, at sealing para maisalba ang ani."
}

# -------------------------------------------------------------- #
# 4. PUBLIC API                                                  #
# -------------------------------------------------------------- #
def get_recommendation(
    severity_idx: int,
    humidity: float,
    temperature: float,
    wetness: float,
) -> Dict[str, str]:
    """
    Returns a dict with both English and Tagalog fields.
    """
    severity = CLASS_LABELS[severity_idx]
    risk     = _weather_risk(temperature, humidity, wetness)
    return {
        # English
        "severity_label":     severity,
        "weather_risk":       risk,
        "action_label":       _ACTION_LABEL_MATRIX[(severity, risk)],
        "advice":             _RULE_MATRIX[(severity, risk)],
        "info":               _INFO_MATRIX[(severity, risk)],
        # Tagalog
        "action_label_tagalog": _ACTION_LABEL_MATRIX_TL[(severity, risk)],
        "advice_tagalog":       _RULE_MATRIX_TL[(severity, risk)],
        "info_tagalog":         _INFO_MATRIX_TL[(severity, risk)],
    }
