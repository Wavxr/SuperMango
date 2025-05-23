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
  "info_tagalog": "...",
  "brands": { … }            # new section at bottom
  "brands_tagalog": { … }    # bagong seksyon sa Tagalog
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
        "1. Every week, WALK the orchard and PICK UP fallen leaves; BURN them away from trees.\n"
        "2. PRUNE a few crowded branches to let air circulate.\n"
        "3. If rain is forecast, MIX 3 to 5 tablespoons of Cupravit 85 WP (copper oxychloride protectant) in 16 L of water and SPRAY evenly; REPEAT every 7–10 days. Wait 7 days before harvest.\n"
        "4. If sunny, MIX 4 to 6 tablespoons of Serenade AS (Bacillus subtilis biocontrol) in 16 L of water and APPLY weekly; no waiting time before harvest.\n"
        "5. INSTALL a simple rain gauge or moisture sensor to spot wet patches early.\n"
        "Cheaper Alternative:\n"
        "• Replace Cupravit → Generic Copper Oxychloride 85 WP : ~₱1,278 / kg (Lazada, agri-supply)\n"
        "• Replace Serenade → Monterey Complete Disease Control (Bacillus amyloliquefaciens) : ~₱1,189 / 473 mL (online garden shops)"
    ),
    ("Mild", "Low"): (
        "1. PINCH OFF spotted leaves and BURN them immediately.\n"
        "2. DISINFECT pruning tools with alcohol between each cut.\n"
        "3. MIX 3 to 5 tablespoons of Cupravit 85 WP in 16 L of water and SPRAY lightly; REPEAT every 7–10 days. Wait 7 days before harvest.\n"
        "4. If spots remain after 5 days, you have two options:\n"
        "   a. MIX 2 to 4 tablespoons of Dithane M-45 (mancozeb contact protectant) in 16 L of water and SPRAY; REPEAT every 7–10 days. Wait 5–7 days before harvest.\n"
        "   b. Or APPLY 4 to 6 tablespoons of Serenade AS in 16 L of water weekly; no waiting time before harvest.\n"
        "5. MARK flagged trees with a ribbon to track progress.\n"
        "Cheaper Alternative:\n"
        "• Replace Cupravit → Generic Copper Oxychloride 85 WP : ~₱1,278 / kg\n"
        "• Replace Dithane → Generic Mancozeb 80 WP : ~₱315 / kg (Shopee, agri-store)\n"
        "• Replace Serenade → Monterey Complete Disease Control : ~₱1,189 / 473 mL"
    ),
    ("Moderate", "Low"): (
        "1. SPOT-SPRAY 3 to 5 tablespoons of Cupravit 85 WP in 16 L of water directly onto the spots on leaves.\n"
        "2. PRUNE any twigs that have more than 30% spots and BURN them right away to stop spread.\n"
        "3. WAIT 3 days, then MIX 1 tablespoon of Amistar 25 SC (azoxystrobin systemic fungicide) in 16 L of water and SPRAY the whole tree. REPEAT every 10–14 days, up to 6 times a season. Avoid spraying within 3 days of harvest.\n"
        "4. NEXT TIME you spray, SWITCH to a different product type, like Folicur 250 EC, to keep the fungus from getting used to one chemical.\n"
        "5. JOT DOWN the date, weather, and what you sprayed each time in a simple notebook so you can track what works best.\n"
        "Cheaper Alternative:\n"
        "• Replace Cupravit → Generic Copper Oxychloride 85 WP : ~₱1,278 / kg\n"
        "• Replace Amistar → Superstar 250 SC (azoxystrobin) : 100 mL ~₱550 (Lazada)\n"
        "• Replace Folicur → Generic Tebuconazole 250 EC : 250 mL ~₱359 (online agri-shops)"
    ),
    ("Severe", "Low"): (
        "1. REMOVE and BURN all heavily diseased branches.\n"
        "2. In a 10-L bucket, MIX 1 tablespoon of Amistar 25 SC and 2 to 4 tablespoons of Dithane M-45; SPRAY the entire canopy. REPEAT every 7 days. If spots persist, INCREASE Amistar to 1½ tablespoons. Avoid spraying within 3 days of harvest.\n"
        "3. To rotate chemicals, MIX ⅔ tablespoon of Tilt 250 EC in 16 L of water and SPRAY every 10–14 days. Wait 21 days before harvest.\n"
        "4. For an organic option, MIX 4 tablespoons of Serenade AS in 16 L of water and APPLY weekly; no waiting time before harvest.\n"
        "5. SEAL large cuts with 1 tablespoon of wound paint. KEEP a log of product names, lot numbers, dates, and weather.\n"
        "Cheaper Alternative:\n"
        "• Replace Amistar → Superstar 250 SC : 100 mL ~₱550\n"
        "• Replace Dithane → Generic Mancozeb 80 WP : ~₱315 / kg\n"
        "• Replace Tilt → Generic Propiconazole 250 EC : 1 L ~₱1,200–1,500\n"
        "• Replace Serenade → Monterey Complete Disease Control : ~₱1,189 / 473 mL"
    ),
    ("Healthy", "Medium"): (
        "1. BLANKET-SPRAY 3 to 5 tablespoons of Cupravit 85 WP in 16 L of water; SPRAY evenly and lightly; REPEAT every 7–10 days. Wait 7 days before harvest.\n"
        "2. THIN the canopy by removing a few crowded branches so leaves can dry faster after rain.\n"
        "3. NEXT ROUND, if leaves stay wet, MIX 4 to 6 tablespoons of Bravo 720 SC in 16 L of water and SPRAY. Wait 7–14 days before harvest.\n"
        "4. KEEP a paper log of treatment dates, weather conditions, products used, and dosages.\n"
        "Cheaper Alternative:\n"
        "• Replace Cupravit → Generic Copper Oxychloride 85 WP : ~₱1,278 / kg\n"
        "• Replace Bravo → Deacon SC720 / generic Chlorothalonil 720 SC : 1 L ~₱1,150 (Lazada)"
    ),
    ("Mild", "Medium"): (
        "1. COLLECT and BURN infected leaves to reduce spore sources.\n"
        "2. MIX 4 to 6 tablespoons of Bravo 720 SC (chlorothalonil contact protectant) in 16 L of water and SPRAY. REPEAT every 7 days. Wait 7–14 days before harvest.\n"
        "3. If rain is expected, ADD 1 teaspoon of spray sticker; if sunny, ADD 1 teaspoon of sun protectant.\n"
        "4. ROTATE with Serenade AS by MIXING 4 tablespoons in 16 L of water and APPLYING weekly; no waiting time before harvest.\n"
        "5. MARK each treated tree with a ribbon and KEEP a log of spray dates, weather, and results.\n"
        "Cheaper Alternative:\n"
        "• Replace Bravo → Deacon SC720 / generic Chlorothalonil : 1 L ~₱1,150\n"
        "• Replace Serenade → Monterey Complete Disease Control : ~₱1,189 / 473 mL"
    ),
    ("Moderate", "Medium"): (
        "1. MIX 1 teaspoon of Folicur 250 EC (tebuconazole, systemic fungicide) and 2 tablespoons of Dithane M-45 (mancozeb, contact fungicide) in 10 liters of water. Spray the tree until leaves are dripping wet.\n"
        "2. PRUNE and BURN infected twigs to prevent the disease from spreading.\n"
        "3. AFTER 7–10 days, if new spots appear, increase to 1½ teaspoons of Folicur 250 EC in the next spray.\n"
        "4. BEFORE expected rain, ADD 1 teaspoon of sticker solution to help the spray stick to the leaves. On sunny days, use wettable powders instead.\n"
        "5. CHECK spray coverage using water-sensitive paper (optional) or inspect leaf undersides to make sure spray reached all areas.\n"
        "Cheaper Alternative:\n"
        "• Replace Folicur → Generic Tebuconazole 250 EC : 250 mL ~₱359\n"
        "• Replace Dithane → Generic Mancozeb 80 WP : ~₱315 / kg"
    ),
    ("Severe", "Medium"): (
        "1. PRUNE and BURN all diseased twigs and quarantine the area to stop the spread.\n"
        "2. MIX 1 teaspoon of Tilt 250 EC (propiconazole systemic fungicide) and 2 tablespoons of Dithane M-45 (mancozeb protectant) in 10 liters of water. Spray thoroughly all over the tree.\n"
        "3. AFTER 5 days, if the disease continues, upgrade to 1½ teaspoons of Score 250 EC (difenoconazole systemic fungicide) in your next spray.\n"
        "4. SEAL all large cuts using 2 tablespoons of wound paint mixed with 1 teaspoon of spray sticker or sun protectant.\n"
        "5. CALL an agronomist for help if there is no improvement in 7 days.\n"
        "Cheaper Alternative:\n"
        "• Replace Tilt → Generic Propiconazole 250 EC : 1 L ~₱1,200–1,500\n"
        "• Replace Dithane → Generic Mancozeb 80 WP : ~₱315 / kg\n"
        "• Replace Score → Kevlar / Kaizen (Difenoconazole 250 EC) : 250 mL ~₱700–720"
    ),
    ("Healthy", "High"): (
        "1. WITHIN 24 hours, mix 2 tablespoons of Cupravit 85 WP (copper oxychloride protectant) and 1 teaspoon of spray sticker in 10 liters of water. Spray evenly over the tree.\n"
        "2. REPEAT the spray every 7 days while the high-risk weather continues.\n"
        "3. FIX any leaks in irrigation or drainage systems that are causing long periods of wetness.\n"
        "4. COVER young trees during heavy rain using plastic sheets or banana leaves.\n"
        "Cheaper Alternative:\n"
        "• Replace Cupravit → Generic Copper Oxychloride 85 WP : ~₱1,278 / kg"
    ),
    ("Mild", "High"): (
        "1. MIX ½ teaspoon of Amistar 25 SC (azoxystrobin systemic fungicide) and 2 tablespoons of Dithane M-45 (mancozeb protectant) in 10 liters of water. Spray today on all affected trees.\n"
        "2. BURN removed infected leaves. If new spots show up, increase Amistar 25 SC to 1 teaspoon next time.\n"
        "3. INSPECT the trees every 3 days and act fast if new signs appear.\n"
        "4. ALWAYS ADD 1 teaspoon of spray sticker if rain is expected to prevent wash-off.\n"
        "5. TURN ON weather alerts on your phone so you’re ready to spray before rain comes.\n"
        "Cheaper Alternative:\n"
        "• Replace Amistar → Superstar 250 SC : 100 mL ~₱550\n"
        "• Replace Dithane → Generic Mancozeb 80 WP : ~₱315 / kg"
    ),
    ("Moderate", "High"): (
        "1. PRUNE and BURN any branches with spots immediately.\n"
        "2. MIX ½ teaspoon of Amistar 25 SC (azoxystrobin), ½ teaspoon of Folicur 250 EC (tebuconazole), and 2 tablespoons of Dithane M-45 in 10 liters of water. Spray the full tree.\n"
        "3. REPEAT spraying every 5 to 7 days. Use wettable powder types during sunny weather.\n"
        "4. SWITCH systemic brands every spray cycle to avoid fungus resistance.\n"
        "5. MARK your calendar or phone with spray dates to stay on schedule.\n"
         "Cheaper Alternative:\n"
        "• Replace Amistar → Superstar 250 SC : 100 mL ~₱550\n"
        "• Replace Folicur → Generic Tebuconazole 250 EC : 250 mL ~₱359\n"
        "• Replace Dithane → Generic Mancozeb 80 WP : ~₱315 / kg"
    ),
    ("Severe", "High"): (
        "1. QUARANTINE the area. Only trained staff with proper protection (gloves, mask, clothing) should enter.\n"
        "2. BURN the worst 30% of affected leaves and branches. Then mix 3 tablespoons of Bravo 720 SC (chlorothalonil protectant) and 1 teaspoon of Score 250 EC (difenoconazole systemic fungicide) in 10 liters of water. Spray thoroughly.\n"
        "3. ON DAY 5, mix 1 teaspoon of Tilt 250 EC (propiconazole) and 2 tablespoons of Dithane M-45 in 10 liters and spray again. ON DAY 10, repeat the first mix.\n"
        "4. SEAL large cuts with 2 tablespoons of wound paint and 1 teaspoon of sticker if rain is expected.\n"
        "5. IF SPOTS PERSIST, continue spraying every 5 days and increase systemic dose by ½ teaspoon if needed.\n"
        "6. PLAN off-season pruning to remove any hidden spores before next growing cycle.\n"
        "Cheaper Alternative:\n"
        "• Replace Bravo → Deacon SC720 / generic Chlorothalonil : 1 L ~₱1,150\n"
        "• Replace Score → Kevlar / Kaizen (Difenoconazole 250 EC) : 250 mL ~₱700–720\n"
        "• Replace Tilt → Generic Propiconazole 250 EC : 1 L ~₱1,200–1,500\n"
        "• Replace Dithane → Generic Mancozeb 80 WP : ~₱315 / kg"
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
    ("Healthy", "Low"): "In cooler, dry weather, the anthracnose fungus doesn’t spread easily because it needs warmth and moisture to thrive. If your mango trees are healthy and the weather risk is low, you don’t need to spray anything right now. Just check your trees regularly for any black spots or signs of the disease, but usually watchful waiting is enough when conditions are this dry.\nKapag medyo malamig at tuyo ang panahon, hindi gaanong kumakalat ang fungus na sanhi ng anthracnose dahil kailangan nito ang init at halumigmig para lumago. Kung malulusog ang mga puno ng mangga mo at mababa ang tsansa ng sakit sa ganitong klima, hindi mo muna kailangang mag-spray ng anumang kemikal. Sapat na ang regular na pag-inspeksyon sa mga dahon at bunga para tingnan kung may itim na batik o ibang senyales ng sakit. Sa ganitong katuyuan, kadalasan ay sapat na ang nagbabantay lang.",

    ("Mild", "Low"): "You might see a few small anthracnose spots, so remove those infected leaves or fruits early to stop the fungus from spreading its spores. In dry weather, you can spray a copper-based fungicide on the leaves as a gentle protective measure. Copper stays on the surface and is a time-tested remedy, meaning it’s less harsh on the plant and soil than stronger chemicals. By cutting out the first signs of disease and using a mild copper spray, you can keep a small infection under control during dry times.\nKung may makita kang iilang maliliit na mantsa ng anthracnose, tanggalin mo agad ang mga apektadong dahon o bunga para hindi na kumalat ang spores ng fungus. Kapag tuyo ang panahon (tag-araw), puwede kang mag-spray ng copper-based fungicide sa mga dahon bilang banayad na pangontra. Ang copper na i-spray mo ay mananatili sa ibabaw at subok na proteksyon, kaya mas hindi ito mabigat sa halaman at lupa kumpara sa mas matatapang na kemikal. Sa pag-alis ng unang palatandaan ng sakit at paggamit ng banayad na copper spray, makokontrol mo ang kaunting impeksyon kahit tuyo ang panahon.",

    ("Moderate", "Low"): "Even with a moderate amount of anthracnose spots, if the weather is dry you can manage it with basic steps. Spraying a copper fungicide will coat the leaves and shield them from new infection. You should also prune away diseased twigs and branches to remove as much fungus as possible from the tree (this cuts down the sources of infection). It’s also wise to rotate the types of fungicide you use over time so the fungus doesn’t get used to one chemical and become resistant.\nKahit medyo marami na ang mantsa ng anthracnose, kung tuyo ang panahon ay kaya pa itong kontrolin gamit ang mga pangunahing hakbang. Mag-spray ng copper fungicide para balutin ang mga dahon at maprotektahan ang mga ito mula sa panibagong impeksyon. Mag-prune ka rin at alisin ang mga sanga o tangkay na may tama para mabawasan ang pinagmumulan ng fungus sa puno. Mainam din na magpalit-palit ka ng uri ng fungicide para laging epektibo ang gamot at hindi matuto ang fungus na labanan ito.",

    ("Severe", "Low"): "If your mango trees are badly infected but the weather is dry, you need to use a combination approach to help them recover. Spray both a systemic fungicide and a protectant: the systemic one goes inside the plant to kill the fungus hiding in the leaves, while the protectant (like a copper spray) covers the outside of leaves and fruit to stop new spores from germinating. After you prune out any badly diseased branches, be sure to paint the cut wounds with a tree wound paint or a fungicide paste to prevent anthracnose from re-entering through those fresh cuts. A severe case needs this thorough approach, even in dry weather, to give your trees a chance to bounce back.\nKung malala na ang impeksyon ng anthracnose sa mga puno pero tuyo ang panahon ngayon, kailangan mong gumamit ng kombinasyong pamamaraan para matulungan silang makabawi. Mag-spray ka ng fungicide na pumapasok sa halaman (systemic) kasabay ng isa pang fungicide na panangga sa labas (protectant tulad ng copper spray). Ang systemic na gamot ay papasok sa mga dahon at sanga para patayin ang fungus na nagtatago sa loob, habang ang protectant naman ay nagbibigay ng panangga sa labas ng dahon at bunga para hindi tumubo ang bagong spores. Pagkatapos mong putulin at alisin ang mga grabeng apektadong sanga, pinturahan mo ang sariwang hiwa ng puno gamit ang tree paint o fungicide paste para hindi mapasukan uli ng anthracnose ang mga sugat.",

    ("Healthy", "Medium"): "As humidity rises, conditions become more favorable for the anthracnose fungus to attack. Even if your mango trees are healthy now, it’s a good idea to spray a copper-based fungicide to form a protective barrier on the leaves. This copper coating will stop any fungus spores from germinating when they land on the leaves or fruit. When the weather is getting more moist, a little early prevention goes a long way to keep your trees disease-free.\nHabang tumataas ang halumigmig ng hangin, nagiging mas pabor ito sa pag-atake ng fungus na sanhi ng anthracnose. Kahit malulusog pa ang mga puno mo ngayon, mabuting mag-spray ka na ng copper-based fungicide para makabuo ng proteksyon sa ibabaw ng mga dahon. Ang copper na i-spray mo ay magsisilbing panangga na pipigil sa pagtubo ng spores ng fungus kapag dumapo ang mga ito sa dahon o bunga. Kapag papunta na sa mas basang panahon, ang maagang pag-iwas ay malaking tulong para manatiling walang sakit ang mga puno ng mangga mo.",

    ("Mild", "Medium"): "If you have a few anthracnose spots and the weather is getting humid, it’s wise to tackle it with two kinds of fungicides. First, spray a protectant fungicide (like a copper spray) to cover and ‘clean’ the leaf surfaces, so new spores can’t easily stick and germinate. Then use a systemic fungicide that goes inside the plant to cure any infection hiding in the leaves or twigs. Make sure to switch up (rotate) the fungicide products you use so the fungus doesn’t become ‘immune’ to any one chemical. This combined approach will keep a mild infection from getting worse as the weather becomes more damp.\nKung may mangilan-ngilang mantsa ng anthracnose at nagsisimula nang maging mahalumigmig ang panahon, mabuting gumamit ka ng dalawang uri ng fungicide. Mag-spray muna ng protectant fungicide (halimbawa, copper spray) para mapahiran at ‘malinis’ ang ibabaw ng mga dahon, sa paraang ito, hindi madaling makakapit at tutubo ang bagong spores. Pagkatapos, gumamit ka ng systemic na fungicide na papasok sa halaman para gamutin ang anumang impeksyong nagtatago sa loob ng dahon o sanga. Siguraduhin mo ring magpalit-palit ng fungicide na ginagamit para hindi maging ‘immune’ ang fungus sa isang kemikal lang, sa ganitong kombinasyon, maiiwasan mong lumala ang banayad na impeksyon habang pabasa nang pabasa ang panahon.",

    ("Moderate", "Medium"): "When anthracnose is moderate and humidity is fairly high, you need to hit the disease from different angles. Use a mix of fungicide types (with different ways of killing the fungus) to treat the spots on your mango leaves and fruit. For example, you might spray a protectant and a systemic together to cover both the outside and inside of the plant. Also, be sure to rotate the kinds of fungicides you use; switching chemicals prevents the fungus from becoming resistant and keeps the treatments working. Using several approaches at once will help stop the existing lesions from spreading in this kind of weather.\nKung katamtaman na ang pagdami ng anthracnose at mataas na ang halumigmig, kailangang atakehin mo ang sakit sa iba’t ibang paraan. Gumamit ka ng halo ng fungicide na magkakaiba ang aksyon sa fungus (halimbawa, sabayan ang protectant at systemic) para malunasan ang mga mantsa sa dahon at bunga. Tiyakin mo rin na nagpapalit-palit ka ng produktong fungicide na ginagamit – ang pagsasalit ng iba’t ibang kemikal ay makakaiwas sa resistensya ng fungus at mananatiling epektibo ang mga ito. Ang pagsabay-sabay ng iba't ibang pamamaraan ay tutulong mapigilan ang pagkalat ng mga umiiral na mantsa sa ganitong kalagayan ng panahon.",

    ("Severe", "Medium"): "If your orchard has a severe anthracnose outbreak and the weather is humid, you must be very thorough. Start with heavy sanitation: prune out and remove all heavily infected fruits, leaves, and branches to cut down the sources of the fungus. After pruning, treat the tree’s wounds by applying fungicide or a special tree paint on the cut surfaces so new infection can’t get in. Of course, keep up your fungicide sprays, but remember to rotate different chemicals so the fungus doesn’t come back stronger or resistant. With diligent cleaning and careful use of fungicides, you can prevent the disease from getting even worse.\nKung malala na ang pagkalat ng anthracnose sa taniman mo at mahalumigmig ang panahon, kailangan mong maging masinsin sa aksyon. Simulan mo sa masinsinang paglilinis: putulin at alisin ang lahat ng bunga, dahon, at sanga na matindi na ang impeksyon para mabawasan ang pinagmumulan ng fungus. Pagkatapos ng pruning, gamutin mo ang mga sugat ng puno sa pamamagitan ng pagpahid ng fungicide o espesyal na pintura sa mga hiwa upang hindi makapasok ang panibagong impeksyon doon. Tuloy pa rin ang pag-spray mo ng fungicide, pero huwag kalimutang magpalit-palit ng klase ng kemikal para hindi makabalik ang fungus na mas malakas o hindi na tinatablan.",

    ("Healthy", "High"): "When the weather stays wet for a long time (like during the monsoon), it creates perfect conditions for anthracnose infection. Even if your trees are healthy now, you must protect them continuously in this situation. It’s vital to spray a copper fungicide regularly to keep a constant protective coating on the leaves and fruit. In very wet conditions, be sure to re-spray after heavy rains so there’s always a copper barrier shielding your trees from the fungus.\nKapag panay ang basa ng panahon dahil sa tuloy-tuloy na ulan, pabor na pabor ang kundisyong ito para sa impeksyon ng anthracnose sa mga puno ng mangga. Kahit wala pang sakit ang mga puno mo, kailangan mong protektahan sila nang tuloy-tuloy sa ganitong sitwasyon. Napakahalaga ang regular na pag-spray ng copper fungicide para may tuluy-tuloy na proteksyon sa mga dahon at bunga. Kapag napaka-basa ng kondisyon, siguraduhing mag-spray kang muli pagkatapos ng malakas na ulan para laging may harang na copper na sasanggalang sa mga puno laban sa fungus.",

    ("Mild", "High"): "If you notice a few anthracnose spots and the weather is constantly wet, act fast with the right treatments. Use a systemic fungicide to kill the infection that has already started inside the plant’s leaves or fruit. Since heavy rains can wash off your spray, mix in a sticker (an additive that helps the fungicide stick to leaves) so the medicine stays on even when it pours. And because you’ll likely be spraying more often in these conditions, rotate different fungicide products so the fungus doesn’t become resistant from getting used to one chemical. With this approach, you can stop a small infection from exploding in high-risk rainy weather.\nKung may napansin kang kaunting mantsa ng anthracnose at palaging basa ang panahon, kailangan mong mabilis na gumamit ng tamang panglunas. Mag-spray ng systemic na fungicide para patayin ang impeksyong nagsisimula na sa loob ng halaman. Dahil sunod-sunod ang ulan at madaling mahugasan ang spray, haluan mo ng sticker ang iyong fungicide para dumikit ang gamot sa dahon kahit umuulan. At dahil malamang mas madalas kang mag-spray sa ganitong kondisyon, magpalit-palit ka ng iba't ibang fungicide para hindi maging resistant o masanay ang fungus sa isang klase ng kemikal.",

    ("Moderate", "High"): "If anthracnose is already moderate and the weather is extremely wet and warm, you have to act fast to keep it from exploding. Shorten the interval between your fungicide sprays (spray more often) so the fungus doesn’t get a chance to run wild. It’s also helpful to use fungicides with multiple active ingredients, or to mix different types in one spray, so you’re hitting the fungus in several ways at once. These frequent, combined treatments will help contain the disease’s rapid spread during heavy rains.\nKung katamtaman na ang pagkalat ng anthracnose pero sobrang basa at mainit ang panahon (matinding tag-ulan), kailangan mong maging agresibo sa pag-spray para hindi na ito tuluyang sumiklab. Paigsiin mo ang pagitan ng pag-spray ng fungicide (mas dalasan ang spraying) para hindi makabuelo ang fungus sa pagkalat. Makakatulong din ang paggamit ng fungicide na may kombinasyon ng iba't ibang sangkap, o maghalo ng iba't ibang klase ng fungicide sa iisang spray, para sabay-sabay mong atakihin ang fungus sa maraming paraan. Ang madalas at kombinadong pag-spray na ito ay tutulong pigilan ang biglaang pagdami ng sakit sa panahon ng malakas na ulan.",

    ("Severe", "High"): "When anthracnose infection is very severe and the weather is very wet, you’ll need to throw everything at the problem to save whatever yield you can. Use every method: a combination of chemical treatments, intense orchard sanitation, and wound sealing to combat the disease. This means spraying both systemic and protectant fungicides (possibly more frequently), removing and destroying all diseased fruits, leaves, and branches, and painting any cut surfaces to prevent reinfection through the wounds. Only by using chemicals, cleaning thoroughly, and sealing wounds together can you hope to salvage part of your harvest under such high disease pressure.\nKapag lubha nang malala ang anthracnose at tuloy-tuloy pa ang tag-ulan, kailangan mong gamitin ang lahat ng paraan para masalba ang kahit anong pwede pang maani. Pagsabay-sabayin mo ang paggamit ng kemikal, matinding paglilinis, at pagpipintura sa mga sugat ng puno para labanan ang sakit. Ibig sabihin, mag-spray ka ng parehong systemic at protectant na fungicide (mas dalasan pa kung kinakailangan), alisin at sirain ang lahat ng bahagi ng halaman na may impeksyon, at pinturahan ang mga pinutol na bahagi ng sanga upang hindi na makapasok muli ang fungus sa mga sugat. Sa pamamagitan ng sabay-sabay na pag-spray, masinsinang paglilinis, at pag-seal ng sugat, maaasahan mong masasalba mo pa ang bahagi ng ani mo sa ganitong katinding pagsalakay ng sakit."
}
# -------------------------------------------------------------- #
# 3. TAGALOG TRANSLATIONS MATRICES                               #
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
        "1. TUWING LINGGO, MAGLAKAD sa taniman at PULUTIN ang mga nalaglag na dahon; SUNUGIN ito sa lugar na malayo sa puno.\n"
        "2. MAGPRUN ng mga sanga na masyadong siksik para makasingaw ang hangin.\n"
        "3. KUNG MAY ULAN, IHALO ang 3 hanggang 5 kutsara ng Cupravit 85 WP (copper oxychloride protectant) sa 16 litro ng tubig at I-SPRAY nang pantay-pantay; ULITIN kada 7–10 araw. Maghintay ng 7 araw bago mag-ani.\n"
        "4. KUNG MAARAW, IHALO ang 4 hanggang 6 na kutsara ng Serenade AS (Bacillus subtilis biocontrol) sa 16 litro ng tubig at I-APLAY kada linggo; walang kailangang hintayin bago mag-ani.\n"
        "5. MAGLAGAY ng simpleng rain gauge o moisture sensor para mabilis matukoy ang mga basang bahagi.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Cupravit: Generic Copper Oxychloride 85 WP : ~₱1 278/kg (Lazada, agri-supply)\n"
        "▪ Palit sa Serenade: Monterey Complete Disease Control (Bacillus amyloliquefaciens) : ~₱1 189/473 mL (online garden shops)"
    ),
    ("Mild", "Low"): (
        "1. ALISIN agad ang mga dahong may mantsa at SUNUGIN.\n"
        "2. LINISIN ang gamit na pangputol gamit ang alkohol sa bawat hiwa.\n"
        "3. IHALO ang 3 hanggang 5 kutsara ng Cupravit 85 WP sa 16 litro ng tubig at I-SPRAY nang banayad; ULITIN kada 7–10 araw. Maghintay ng 7 araw bago mag-ani.\n"
        "4. KUNG MAY MANTSANG NATITIRA PAGKATAPOS NG 5 ARAW, may dalawang opsyon ka:\n"
        "   a. IHALO ang 2 hanggang 4 kutsara ng Dithane M-45 (mancozeb contact protectant) sa 16 litro ng tubig at I-SPRAY; ULITIN kada 7–10 araw. Maghintay ng 5–7 araw bago mag-ani.\n"
        "   b. O I-APLAY ang 4 hanggang 6 na kutsara ng Serenade AS sa 16 litro ng tubig kada linggo; walang kailangang hintayin bago mag-ani.\n"
        "5. TANDAAN ang mga punong ginamot gamit ang ribbon para madaling makita.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Cupravit: Generic Copper Oxychloride 85 WP : ~₱1 278/kg\n"
        "▪ Palit sa Dithane M-45: Generic Mancozeb 80 WP : ~₱315/kg (Shopee, agri-store)\n"
        "▪ Palit sa Serenade: Monterey Complete Disease Control : ~₱1 189/473 mL"
    ),
    ("Moderate", "Low"): (
        "1. DIREKTANG I-SPRAY ang 3 hanggang 5 kutsara ng Cupravit 85 WP sa 16 litro ng tubig sa mga dahong may mantsa.\n"
        "2. PUTULIN ang mga sanga na may higit sa 30% na mantsa at SUNUGIN agad.\n"
        "3. PAGKATAPOS NG 3 ARAW, IHALO ang 1 kutsara ng Amistar 25 SC (azoxystrobin systemic fungicide) sa 16 litro ng tubig at I-SPRAY sa buong puno. ULITIN kada 10–14 araw, hanggang 6 na beses sa isang season. Iwasang mag-spray 3 araw bago mag-ani.\n"
        "4. SA SUSUNOD NA SPRAY, GUMAMIT ng ibang klase ng produkto tulad ng Folicur 250 EC para maiwasan ang pagkasanay ng fungus sa isang kemikal.\n"
        "5. ITALA ang petsa, lagay ng panahon, at anong produkto ang ginamit sa isang notebook para madaling subaybayan kung ano ang epektibo.\n"
         "Murang Alternatibo:\n"
        "▪ Palit sa Cupravit: Generic Copper Oxychloride 85 WP : ~₱1 278/kg\n"
        "▪ Palit sa Amistar: Superstar 250 SC (azoxystrobin) : 100 mL ~₱550 (Lazada)\n"
        "▪ Palit sa Folicur: Generic Tebuconazole 250 EC : 250 mL ~₱359 (online agri-shops)"
    ),
    ("Severe", "Low"): (
        "1. ALISIN at SUNUGIN lahat ng matinding apektadong sanga.\n"
        "2. SA ISANG 10-litro na balde, IHALO ang 1 kutsara ng Amistar 25 SC at 2 hanggang 4 kutsara ng Dithane M-45; I-SPRAY sa buong puno. ULITIN kada 7 araw. Kung patuloy pa rin ang mantsa, dagdagan ng kalahating kutsara ang Amistar. Iwasan ang pag-spray 3 araw bago mag-ani.\n"
        "3. PARA SA ROTATION, IHALO ang ⅔ kutsara ng Tilt 250 EC sa 16 litro ng tubig at I-SPRAY kada 10–14 araw. Maghintay ng 21 araw bago mag-ani.\n"
        "4. PARA SA ORGANIC NA OPSYON, IHALO ang 4 na kutsara ng Serenade AS sa 16 litro ng tubig at I-APLAY kada linggo; walang kailangang hintayin bago mag-ani.\n"
        "5. TAKPAN ang malalaking hiwa gamit ang 1 kutsara ng wound paint. ITALA ang pangalan ng produkto, batch number, petsa, at lagay ng panahon.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Amistar → Superstar 250 SC (azoxystrobin) : 100 mL ~₱550\n"
        "▪ Palit sa Dithane → Generic Mancozeb 80 WP : ~₱315 / kg\n"
        "▪ Palit sa Tilt → Generic Propiconazole 250 EC : 1 L ~₱1 2-1 5 k\n"
        "▪ Palit sa Serenade → Monterey Complete Disease Control : ~₱1 189 / 473 mL"
    ),
    ("Healthy", "Medium"): (
        "1. I-SPRAY nang pantay ang 3 hanggang 5 kutsara ng Cupravit 85 WP sa 16 litro ng tubig; ULITIN kada 7–10 araw. Maghintay ng 7 araw bago mag-ani.\n"
        "2. PRUNIN ang mga masisikip na sanga para mas mabilis matuyo ang dahon kapag umulan.\n"
        "3. SA SUSUNOD NA SPRAY, KUNG BASA PA RIN ANG MGA DAHON, IHALO ang 4 hanggang 6 na kutsara ng Bravo 720 SC sa 16 litro ng tubig at I-SPRAY. Maghintay ng 7–14 araw bago mag-ani.\n"
        "4. ITALA ang petsa ng gamutan, kondisyon ng panahon, at anong produkto ang ginamit.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Cupravit → Generic Copper Oxychloride 85 WP : ~₱1 278 / kg\n"
        "▪ Palit sa Bravo → Deacon SC720 / Generic Chlorothalonil 720 SC : 1 L ~₱1 150 (Lazada)"
    ),
    ("Mild", "Medium"): (
        "1. PULUTIN at SUNUGIN ang mga dahong may mantsa para mabawasan ang pinagmumulan ng spores.\n"
        "2. IHALO ang 4 hanggang 6 na kutsara ng Bravo 720 SC (chlorothalonil contact protectant) sa 16 litro ng tubig at I-SPRAY. ULITIN kada 7 araw. Maghintay ng 7–14 araw bago mag-ani.\n"
        "3. KUNG INAASAHAN ANG ULAN, MAGDAGDAG ng 1 kutsarita ng sticker; KUNG MAARAW, MAGDAGDAG ng 1 kutsarita ng sun protectant.\n"
        "4. MAG-ROTATE sa Serenade AS sa pamamagitan ng PAGHALO ng 4 na kutsara sa 16 litro ng tubig at I-APLAY kada linggo; walang kailangang hintayin bago mag-ani.\n"
        "5. MARKAHAN ang bawat ginamot na puno gamit ang ribbon at ITALA ang petsa, lagay ng panahon, at resulta.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Bravo → Deacon SC720 / Generic Chlorothalonil : 1 L ~₱1 150\n"
        "▪ Palit sa Serenade → Monterey Complete Disease Control : ~₱1 189 / 473 mL"
    ),
        ("Moderate", "Medium"): (
        "1. IHALO ang 1 KUTSARITA ng Folicur 250 EC (tebuconazole, systemic fungicide) at 2 KUTSARA ng Dithane M-45 (mancozeb, contact fungicide) sa 10 litro ng tubig. I-SPRAY ang puno hanggang TUMULO ang likido sa mga dahon.\n"
        "2. MAGPRUN at SUNUGIN ang mga sanga na may mantsa para hindi kumalat ang sakit.\n"
        "3. PAGKATAPOS NG 7–10 ARAW, kung may bagong mantsa, dagdagan sa SUSUNOD NA SPRAY ang Folicur 250 EC at gawing 1½ KUTSARITA.\n"
        "4. BAGO UMULAN, MAGDAGDAG ng 1 KUTSARITA ng sticker solution para DUMIKIT ang spray sa dahon. Sa maaraw na panahon, gumamit ng wettable powder.\n"
        "5. TINGNAN ang mga ilalim ng dahon o gumamit ng water-sensitive paper para MA-SIGURADO na nasabuyan lahat ng bahagi.\n"
         "Murang Alternatibo:\n"
        "▪ Palit sa Folicur → Generic Tebuconazole 250 EC : 250 mL ~₱359\n"
        "▪ Palit sa Dithane → Generic Mancozeb 80 WP : ~₱315 / kg"
    ),
    ("Severe", "Medium"): (
        "1. MAGPRUN at SUNUGIN ang lahat ng sanga na may sakit at I-QUARANTINE ang lugar para hindi na kumalat.\n"
        "2. IHALO ang 1 KUTSARITA ng Tilt 250 EC (propiconazole, systemic) at 2 KUTSARA ng Dithane M-45 sa 10 litro ng tubig. I-SPRAY nang PANTAY-PANTAY sa buong puno.\n"
        "3. PAGKATAPOS NG 5 ARAW, kung wala pa ring pagbabago, gumamit ng 1½ KUTSARITA ng Score 250 EC (difenoconazole) sa susunod na spray.\n"
        "4. TAKPAN ang malalaking HIWA gamit ang 2 KUTSARA ng wound paint na may halong 1 KUTSARITA ng sticker o sun protectant.\n"
        "5. KUNG WALANG PAGBUTI sa loob ng 7 araw, TUMAWAG ng agronomist para sa payo.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Tilt → Generic Propiconazole 250 EC : 1 L ~₱1 2-1 5 k\n"
        "▪ Palit sa Dithane → Generic Mancozeb 80 WP : ~₱315 / kg\n"
        "▪ Palit sa Score → Kevlar / Kaizen (Difenoconazole 250 EC) : 250 mL ~₱700-720"
    ),
    ("Healthy", "High"): (
        "1. SA LOOB NG 24 ORAS, IHALO ang 2 KUTSARA ng Cupravit 85 WP (copper protectant) at 1 KUTSARITA ng sticker sa 10 litro ng tubig. I-SPRAY nang pantay sa buong puno.\n"
        "2. ULITIN ANG SPRAY kada 7 araw habang mataas ang panganib sa panahon.\n"
        "3. AYUSIN agad ang mga butas sa patubig o kanal na nagdudulot ng matagal na basa sa lupa.\n"
        "4. TAKPAN ang batang puno gamit ang plastic o dahon ng saging kung malakas ang ulan.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Cupravit → Generic Copper Oxychloride 85 WP : ~₱1 278 / kg"
    ),
    ("Mild", "High"): (
        "1. IHALO ang ½ KUTSARITA ng Amistar 25 SC (azoxystrobin, systemic) at 2 KUTSARA ng Dithane M-45 (protectant) sa 10 litro ng tubig. I-SPRAY agad sa mga apektadong puno.\n"
        "2. SUNUGIN ang mga tinanggal na dahong may mantsa. Kapag may bagong mantsa, dagdagan ang Amistar sa 1 KUTSARITA sa susunod na spray.\n"
        "3. INSPEKSIYUNIN ang puno kada 3 ARAW at AGAD MAG-SPRAY kung may bagong palatandaan.\n"
        "4. LAGING MAGDAGDAG ng 1 KUTSARITA ng sticker kung may paparating na ulan para hindi agad matanggal ang spray.\n"
        "5. I-ON ang WEATHER ALERTS sa cellphone para HANDA bago umulan.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Amistar → Superstar 250 SC (azoxystrobin) : 100 mL ~₱550\n"
        "▪ Palit sa Dithane → Generic Mancozeb 80 WP : ~₱315 / kg"
    ),
    ("Moderate", "High"): (
        "1. MAGPRUN at SUNUGIN agad ang mga sangang may mantsa.\n"
        "2. IHALO ang ½ KUTSARITA ng Amistar 25 SC, ½ KUTSARITA ng Folicur 250 EC, at 2 KUTSARA ng Dithane M-45 sa 10 litro ng tubig. I-SPRAY sa buong puno.\n"
        "3. ULITIN ang spray kada 5 hanggang 7 araw. Gamitin ang wettable powder sa maaraw na araw.\n"
        "4. MAGPALIT ng systemic fungicide sa bawat cycle para hindi masanay ang fungus.\n"
        "5. ITALA ang mga petsa ng pag-spray sa kalendaryo o cellphone para hindi makalimutan.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Amistar → Superstar 250 SC : 100 mL ~₱550\n"
        "▪ Palit sa Folicur → Generic Tebuconazole 250 EC : 250 mL ~₱359\n"
        "▪ Palit sa Dithane → Generic Mancozeb 80 WP : ~₱315 / kg"
    ),
    ("Severe", "High"): (
        "1. I-QUARANTINE ang lugar. Tanging mga trained staff na may PPE (gloves, mask, at damit) lang ang dapat pumasok.\n"
        "2. SUNUGIN ang 30% ng pinakagrabeng dahon at sanga. Pagkatapos, IHALO ang 3 KUTSARA ng Bravo 720 SC (chlorothalonil) at 1 KUTSARITA ng Score 250 EC sa 10 litro ng tubig. I-SPRAY nang BUONG-BUO.\n"
        "3. SA IKALIMANG ARAW, IHALO ang 1 KUTSARITA ng Tilt 250 EC at 2 KUTSARA ng Dithane M-45 sa 10 litro ng tubig at I-SPRAY muli. SA IKASAMPUNG ARAW, ulitin ang unang halo.\n"
        "4. TAKPAN ang malalaking HIWA gamit ang 2 KUTSARA ng wound paint at 1 KUTSARITA ng sticker kung may paparating na ulan.\n"
        "5. KUNG PATULOY ANG MANTSA, mag-spray kada 5 araw at dagdagan ng ½ KUTSARITA ang systemic na gamot kung kinakailangan.\n"
        "6. MAGPLANO ng off-season pruning para MAALIS ang natatagong spores bago magsimula ang bagong taniman.\n"
        "Murang Alternatibo:\n"
        "▪ Palit sa Bravo → Deacon SC720 / Generic Chlorothalonil : 1 L ~₱1 150\n"
        "▪ Palit sa Score → Kevlar / Kaizen (Difenoconazole 250 EC) : 250 mL ~₱700-720\n"
        "▪ Palit sa Tilt → Generic Propiconazole 250 EC : 1 L ~₱1 2-1 5 k\n"
        "▪ Palit sa Dithane → Generic Mancozeb 80 WP : ~₱315 / kg"
    ),
}

_INFO_MATRIX_TL: Dict[Tuple[str, str], str] = {
    ("Healthy", "Low"): "Kapag medyo malamig at tuyo ang panahon, hindi gaanong kumakalat ang fungus na sanhi ng anthracnose dahil kailangan nito ang init at halumigmig para lumago. Kung malulusog ang mga puno ng mangga mo at mababa ang tsansa ng sakit sa ganitong klima, hindi mo muna kailangang mag-spray ng anumang kemikal. Sapat na ang regular na pag-inspeksyon sa mga dahon at bunga para tingnan kung may itim na batik o ibang senyales ng sakit. Sa ganitong katuyuan, kadalasan ay sapat na ang nagbabantay lang.",

    ("Mild", "Low"): "Kung may makita kang iilang maliliit na mantsa ng anthracnose, tanggalin mo agad ang mga apektadong dahon o bunga para hindi na kumalat ang spores ng fungus. Kapag tuyo ang panahon (tag-araw), puwede kang mag-spray ng copper-based fungicide sa mga dahon bilang banayad na pangontra. Ang copper na i-spray mo ay mananatili sa ibabaw at subok na proteksyon, kaya mas hindi ito mabigat sa halaman at lupa kumpara sa mas matatapang na kemikal. Sa pag-alis ng unang palatandaan ng sakit at paggamit ng banayad na copper spray, makokontrol mo ang kaunting impeksyon kahit tuyo ang panahon.",

    ("Moderate", "Low"): "Kahit medyo marami na ang mantsa ng anthracnose, kung tuyo ang panahon ay kaya pa itong kontrolin gamit ang mga pangunahing hakbang. Mag-spray ng copper fungicide para balutin ang mga dahon at maprotektahan ang mga ito mula sa panibagong impeksyon. Mag-prune ka rin at alisin ang mga sanga o tangkay na may tama para mabawasan ang pinagmumulan ng fungus sa puno. Mainam din na magpalit-palit ka ng uri ng fungicide para laging epektibo ang gamot at hindi matuto ang fungus na labanan ito.",

    ("Severe", "Low"): "Kung malala na ang impeksyon ng anthracnose sa mga puno pero tuyo ang panahon ngayon, kailangan mong gumamit ng kombinasyong pamamaraan para matulungan silang makabawi. Mag-spray ka ng fungicide na pumapasok sa halaman (systemic) kasabay ng isa pang fungicide na panangga sa labas (protectant tulad ng copper spray). Ang systemic na gamot ay papasok sa mga dahon at sanga para patayin ang fungus na nagtatago sa loob, habang ang protectant naman ay nagbibigay ng panangga sa labas ng dahon at bunga para hindi tumubo ang bagong spores. Pagkatapos mong putulin at alisin ang mga grabeng apektadong sanga, pinturahan mo ang sariwang hiwa ng puno gamit ang tree paint o fungicide paste para hindi mapasukan uli ng anthracnose ang mga sugat.",

    ("Healthy", "Medium"): "Habang tumataas ang halumigmig ng hangin, nagiging mas pabor ito sa pag-atake ng fungus na sanhi ng anthracnose. Kahit malulusog pa ang mga puno mo ngayon, mabuting mag-spray ka na ng copper-based fungicide para makabuo ng proteksyon sa ibabaw ng mga dahon. Ang copper na i-spray mo ay magsisilbing panangga na pipigil sa pagtubo ng spores ng fungus kapag dumapo ang mga ito sa dahon o bunga. Kapag papunta na sa mas basang panahon, ang maagang pag-iwas ay malaking tulong para manatiling walang sakit ang mga puno ng mangga mo.",

    ("Mild", "Medium"): "Kung may mangilan-ngilang mantsa ng anthracnose at nagsisimula nang maging mahalumigmig ang panahon, mabuting gumamit ka ng dalawang uri ng fungicide. Mag-spray muna ng protectant fungicide (halimbawa, copper spray) para mapahiran at ‘malinis’ ang ibabaw ng mga dahon : sa paraang ito, hindi madaling makakapit at tutubo ang bagong spores. Pagkatapos, gumamit ka ng systemic na fungicide na papasok sa halaman para gamutin ang anumang impeksyong nagtatago sa loob ng dahon o sanga. Siguraduhin mo ring magpalit-palit ng fungicide na ginagamit para hindi maging ‘immune’ ang fungus sa isang kemikal lang, sa ganitong kombinasyon, maiiwasan mong lumala ang banayad na impeksyon habang pabasa nang pabasa ang panahon.",

    ("Moderate", "Medium"): "Kung katamtaman na ang pagdami ng anthracnose at mataas na ang halumigmig, kailangang atakehin mo ang sakit sa iba’t ibang paraan. Gumamit ka ng halo ng fungicide na magkakaiba ang aksyon sa fungus (halimbawa, sabayan ang protectant at systemic) para malunasan ang mga mantsa sa dahon at bunga. Tiyakin mo rin na nagpapalit-palit ka ng produktong fungicide na ginagamit – ang pagsasalit ng iba’t ibang kemikal ay makakaiwas sa resistensya ng fungus at mananatiling epektibo ang mga ito. Ang pagsabay-sabay ng iba't ibang pamamaraan ay tutulong mapigilan ang pagkalat ng mga umiiral na mantsa sa ganitong kalagayan ng panahon.",

    ("Severe", "Medium"): "Kung malala na ang pagkalat ng anthracnose sa taniman mo at mahalumigmig ang panahon, kailangan mong maging masinsin sa aksyon. Simulan mo sa masinsinang paglilinis: putulin at alisin ang lahat ng bunga, dahon, at sanga na matindi na ang impeksyon para mabawasan ang pinagmumulan ng fungus. Pagkatapos ng pruning, gamutin mo ang mga sugat ng puno sa pamamagitan ng pagpahid ng fungicide o espesyal na pintura sa mga hiwa upang hindi makapasok ang panibagong impeksyon doon. Tuloy pa rin ang pag-spray mo ng fungicide, pero huwag kalimutang magpalit-palit ng klase ng kemikal para hindi makabalik ang fungus na mas malakas o hindi na tinatablan.",

    ("Healthy", "High"): "Kapag panay ang basa ng panahon dahil sa tuloy-tuloy na ulan, pabor na pabor ang kundisyong ito para sa impeksyon ng anthracnose sa mga puno ng mangga. Kahit wala pang sakit ang mga puno mo, kailangan mong protektahan sila nang tuloy-tuloy sa ganitong sitwasyon. Napakahalaga ang regular na pag-spray ng copper fungicide para may tuluy-tuloy na proteksyon sa mga dahon at bunga. Kapag napaka-basa ng kondisyon, siguraduhing mag-spray kang muli pagkatapos ng malakas na ulan para laging may harang na copper na sasanggalang sa mga puno laban sa fungus.",

    ("Mild", "High"): "Kung may napansin kang kaunting mantsa ng anthracnose at palaging basa ang panahon, kailangan mong mabilis na gumamit ng tamang panglunas. Mag-spray ng systemic na fungicide para patayin ang impeksyong nagsisimula na sa loob ng halaman. Dahil sunod-sunod ang ulan at madaling mahugasan ang spray, haluan mo ng sticker ang iyong fungicide para dumikit ang gamot sa dahon kahit umuulan. At dahil malamang mas madalas kang mag-spray sa ganitong kondisyon, magpalit-palit ka ng iba't ibang fungicide para hindi maging resistant o masanay ang fungus sa isang klase ng kemikal.",

    ("Moderate", "High"): "Kung katamtaman na ang pagkalat ng anthracnose pero sobrang basa at mainit ang panahon (matinding tag-ulan), kailangan mong maging agresibo sa pag-spray para hindi na ito tuluyang sumiklab. Paigsiin mo ang pagitan ng pag-spray ng fungicide (mas dalasan ang spraying) para hindi makabuelo ang fungus sa pagkalat. Makakatulong din ang paggamit ng fungicide na may kombinasyon ng iba't ibang sangkap, o maghalo ng iba't ibang klase ng fungicide sa iisang spray, para sabay-sabay mong atakihin ang fungus sa maraming paraan. Ang madalas at kombinadong pag-spray na ito ay tutulong pigilan ang biglaang pagdami ng sakit sa panahon ng malakas na ulan.",

    ("Severe", "High"): "Kapag lubha nang malala ang anthracnose at tuloy-tuloy pa ang tag-ulan, kailangan mong gamitin ang lahat ng paraan para masalba ang kahit anong pwede pang maani. Pagsabay-sabayin mo ang paggamit ng kemikal, matinding paglilinis, at pagpipintura sa mga sugat ng puno para labanan ang sakit. Ibig sabihin, mag-spray ka ng parehong systemic at protectant na fungicide (mas dalasan pa kung kinakailangan), alisin at sirain ang lahat ng bahagi ng halaman na may impeksyon, at pinturahan ang mga pinutol na bahagi ng sanga upang hindi na makapasok muli ang fungus sa mga sugat. Sa pamamagitan ng sabay-sabay na pag-spray, masinsinang paglilinis, at pag-seal ng sugat, maaasahan mong masasalba mo pa ang bahagi ng ani mo sa ganitong katinding pagsalakay ng sakit."
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
        "severity_label":       severity,
        "weather_risk":         risk,
        "action_label":         _ACTION_LABEL_MATRIX[(severity, risk)],
        "advice":               _RULE_MATRIX[(severity, risk)],
        "info":                 _INFO_MATRIX[(severity, risk)],
        # Tagalog
        "action_label_tagalog": _ACTION_LABEL_MATRIX_TL[(severity, risk)],
        "advice_tagalog":       _RULE_MATRIX_TL[(severity, risk)],
        "info_tagalog":         _INFO_MATRIX_TL[(severity, risk)],
    }
