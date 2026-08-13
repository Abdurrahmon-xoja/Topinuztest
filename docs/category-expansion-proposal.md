# topin.uz — Category Expansion Proposal

*Draft — research date 2026-08-05. All shop/subcategory counts are read directly from `backend/database.sqlite`. All demand figures are live listing counts read from the named source on 2026-08-05; where a number could not be verified it is marked "not verified".*

---

## Summary of the recommendation

topin.uz today is an **interior-and-finish-materials** catalogue wearing the label of a **home-and-renovation** catalogue. Its 11 categories cover what you *see* at the end of a renovation (furniture, lighting, decor, wall/floor/stone finishes, sanitaryware) and almost nothing of what you *buy during* one.

The four structural holes, in order of size:

1. **No Doors & Windows, no Ceilings, no Climate/Heating.** A Tashkent flat renovation replaces PVC windows, hangs interior doors, installs a stretch ceiling and mounts a split-system air conditioner. On OLX.uz the "windows, glass, mirrors" subcategory alone holds **8,847** live listings and "heating" **4,608** — topin.uz has *four* shops across the whole area and no category to put them in. `Potolok Uz`, a stretch-ceiling installer, is currently filed under **Lighting**.
2. **`Other` is not a category, it is two categories in a bag.** Its 20 shops are cleanly 10 smart-home/security firms (Aqara, Sonoff, Intellhouse, Easy Home, ELEVE, Lumen LUX, MiOnline, Jabb, Eletron, Texnomart) and 10 furniture/door-hardware suppliers (Hettich Eman, DTC, BRASS, Muller, LUMINOR, INFINITY by Eman, Nobel Premium, Yechim by Eman, Aluframe, Alkan Group). Both are real, well-supplied Tashkent trades. Promoting them costs **zero shop recruitment**.
3. **Several existing categories are mislabelled rather than empty.** `Plants` is a category of *florists and live-plant nurseries* (Bahor Gullari, Cveti Tashkent, Mega Flowers Uz, Azalea Garden, Fitomir, Green Town Studio) whose only subcategory is "Artificial plants". `real-estate` is the slug for a category displayed as "Eksteryer / Экстерьер". `Specialists` has 8 subcategories and 1 shop.
4. **The densest trade in Tashkent is the most buried on the site.** Ceramic tile has more suppliers than any other category researched here (≥45 companies on top.uz, 1,322 offers on prom.uz, an exact-match domain at kafel.uz). topin.uz splits it across `walls/wall-tiles` (6 shops) and `floor/floor-tiles` (7 shops) — two of its smallest leaves. Maxidom, by contrast, makes Плитка a top-level category in its own right.

For scale: **stroyvitrina.uz**, a Tashkent site running the same products-plus-companies model, has **52 top-level categories to topin.uz's 11** — including Двери, Окна, Отопление, Кондиционеры и вентиляция, Инструменты, Крепеж, Электрика, Кровля and Сухие строительные смеси, none of which topin.uz has any home for. **stroyka.uz** files Потолки inside Отделочные материалы alongside Гипсокартон, Кафель and Обои. This is not a theoretical gap; the local competition has already closed it.

**The recommended sequence is therefore: fix and re-cut what the 431 shops already support (free), then add the 3–4 categories with the strongest verified local demand, then recruit.** Nine of the twelve proposals below can be filled — at least partly — from shops already in the database today. A category with no shops behind it is a dead page, and topin.uz already has nine of those: `other/acoustics`, `stone/format`, and seven of the eight `specialists` subcategories all return zero shops — 9 of 51 subcategories, 18% of the tree.

**Highest-leverage single finding:** the largest opportunity is not a product category at all. "Qurilish / ta'mirlash / usta" (construction, finishing, tradespeople) is the **largest services rubric on OLX.uz — 38,967 listings nationally, 31,653 in Tashkent region**. topin.uz's equivalent, `Specialists`, has one shop. That is the gap worth the most.

---

## Evidence base

Because Uzbek-language category naming is where most taxonomies for this market go wrong, every Uzbek and Russian name proposed below is **taken from a live Uzbek commercial site**, not translated by hand. The two sources used as the terminology authority are:

- **tovar.uz** — an Uzbek B2B/B2C catalogue with a fully parallel Uzbek/Russian construction taxonomy (~150 nodes under "Qurilish / Строительство"). URL pattern: `https://tovar.uz/uz/categories/<id>_<ru_slug>` and `https://tovar.uz/categories/<id>_<ru_slug>` for the Russian mirror — the slug itself carries the Russian term, so every node gives a verified UZ↔RU pair.
- **OLX.uz** — the dominant Uzbek classifieds site, bilingual, and the only source found that publishes **live listing counts per category**, which is the closest thing to hard demand evidence available for this market.

Listing counts below were read on 2026-08-05 and will drift.

### OLX.uz "Uy va bog' / Дом и сад" — top level

| Subsection | Listings |
|---|---|
| Mebel / Мебель | 90,321 |
| Qurilish / ta'mirlash uchun tovarlar / Товары для строительства и ремонта | 58,874 |
| Idish-tovoq, oshxona anjomlari / Посуда, кухонная утварь | 26,209 |
| Interyer jihozlari / Предметы интерьера | 20,759 |
| Jihozlar / Инструменты | 15,788 |
| Bog'-tomorqa / Сад-огород | 14,598 |
| Xo'jalik jihozlari / Хозяйственный инвентарь | 11,406 |
| Uy uchun boshqa mahsulotlar / Прочие товары для дома | 7,819 |
| Bog' anjomlari / Садовый инвентарь | 4,149 |
| Kanstovarlar / Канцтовары | 3,772 |
| Xona o'simliklari / Комнатные растения | 3,065 |
| Basseynlar / Бассейны | 1,762 |

Tashkent region accounts for 194,015 of these listings.

### OLX.uz "Qurilish / ta'mirlash uchun tovarlar" — where topin.uz has no category at all

| Subsection | Listings | Covered by topin.uz today? |
|---|---|---|
| Metalloprokat-armatura / Металлопрокат, арматура | 9,065 | No |
| **Derazalar-oynalar / Окна, стекло, зеркала** | **8,847** | **No** |
| Santexnika / Сантехника | 8,692 | Yes (Bathroom) |
| Boshqa qurilish materiallari / Прочие стройматериалы | 6,967 | No |
| G'isht, beton, penobloklar / Кирпич, бетон, пеноблоки | 5,462 | No |
| **Isitish / Отопление** | **4,608** | **No** |
| Pardozlash materiallari / Отделочные материалы | 3,653 | Partly (Walls, Floor) |
| Arra materiallari / Пиломатериалы | 3,379 | No |
| **Elektrika / Электрика** | **3,255** | **No** |
| Plastik / polikarbonat / list materiallar | ~3,100 | No |
| Lak-bo'yoq materiallari / Лакокрасочные | 779 | Yes (Walls → Bo'yoqlar) |
| Biriktirish elementlari / Элементы крепежа | 700 | Partly (Other → Furnitura) |
| Ventilyatsiya / Вентиляция | 214 | No |

### OLX.uz "Interyer jihozlari / Предметы интерьера"

| Subsection | Listings | Covered by topin.uz today? |
|---|---|---|
| **Derazalar dekori / Декор окон** (curtains, blinds, cornices) | **5,828** | **No** |
| Tekstil / Текстиль | 3,282 | Yes (Art & Decor → Tekstil) |
| Iные предметы интерьера | 3,129 | — |
| Chiroqlar / Светильники | 3,046 | Yes (Lighting) |
| Gilamlar / Ковры | 2,924 | Yes (Floor → Gilamlar) |
| Rasm, poster va ramkalar / Картины, постеры, рамки | 846 | Partly (Devor dekori) |
| Vazalar va sun'iy gullar / Вазы, искусственные цветы | 747 | Yes (Plants) |
| Bayramona bezaklar / Праздничный декор | 782 | No |
| Saqlash buyumlari / Предметы хранения | 117 | No |
| Uy uchun aromatlar va shamlar / Ароматы и свечи | 58 | No |

Note that **window decor is the single largest interior-items subcategory on OLX.uz — larger than lighting, textiles or carpets combined with any one of them** — and topin.uz has no home for it.

### OLX.uz "Mebel / Мебель"

| Subsection | Listings | Covered? |
|---|---|---|
| Mehmonxona uchun mebel / Мебель для гостиной | 24,594 | Partly |
| Yotoqxona uchun mebel / Мебель для спальни | 17,982 | Yes |
| Maxsus mebel / Специализированная мебель | 14,449 | No |
| Mebel na zakaz / Мебель на заказ | 10,910 | No |
| **Ofis mebeli / Офисная мебель** | **10,252** | **No** |
| Oshxona mebeli / Кухонная мебель | 6,304 | Yes |
| Bog' mebeli / Садовая мебель | 3,170 | Yes |
| Dahliz uchun mebel / Мебель для прихожей | 2,313 | No |
| Vannaxona mebeli / Мебель для ванной | 347 | Yes |

### OLX.uz services — the Specialists opportunity

"Qurilish / ta'mirlash / usta" (Строительство, отделка, ремонт) — **38,967 listings**, the largest of 23 service rubrics on OLX.uz. Tashkent region: **31,653**.

| Sub-rubric | Listings |
|---|---|
| Qurilish xizmatlari / Строительные услуги | 13,763 |
| Tayyor qurilmalar / Готовые конструкции | 5,798 |
| Pardozlash, ta'mirlash / Отделка, ремонт | 5,394 |
| Santexnika-kommunikatsiyalar / Сантехника, коммуникации | 4,858 |
| Oyna va eshiklarni yasash / Окна, двери, балконы | 4,026 |
| Elektrik xizmatlar / Электрика | 2,298 |
| Dizayn, arxitektura / Дизайн, архитектура | 1,614 |
| Ventilyatsiya-konditsionerlar / Вентиляция, кондиционирование | 463 |
| Boshqa / Другое | 753 |

OLX's own promoted search terms inside this rubric include **натяжные потолки** (stretch ceilings), **gipsakarton**, **kafel teramiz** (tiling), **травертин**, **решетки на окна** and **навес** — a direct readout of what Tashkent users search for when renovating.

### Direct competitors in Tashkent — and what they already have that topin.uz does not

topin.uz is not first to this idea. Three Uzbek sites run the same product-catalogue-plus-company-directory model, and their category spines are the most relevant benchmark in this document.

**stroyvitrina.uz** — the closest structural analogue found. Identical three-axis model: **Товары** (`/categories`), **Услуги** (`/services`), **Компании** (`/rubrics`), with RU / Ўзб / Oʻz locales. It has **52 top-level product categories** where topin.uz has 11. The ones topin.uz lacks entirely: Двери · Окна, стекло · Системы отопления и обогрева · Кондиционеры и вентиляция · Сухие строительные смеси · Строительные материалы · Инструменты · Крепеж · Электрика и электрооборудование · Инженерная сантехника · Инженерные системы · Безопасность · Кровля · Металл и металлические изделия · Пиломатериалы · Панели · Фасадные системы · Аксессуары для печей и каминов · Лифты. Its second level is deep and well-cut — **Двери** alone has 18 children (Алюминиевые, Ворота, Входные, Двери купе, Деревянные, Замки, Межкомнатные, Межкомнатные перегородки, Офисные перегородки, Пластиковые, Раздвижные, Стальные, Стеклянные, Фурнитура, Шпонированные…), **Сантехника** has 24, **Финишные материалы для стен** has 10.

Critically, stroyvitrina.uz also maintains a **company-rubric axis separate from the product axis** — a shop-*type* taxonomy: Магазины строительных инструментов · **Строительные рынки** · Интернет-магазины · Производители мебели · **Студии дизайна** · Ремонт под ключ · Электромонтажные организации · Архитектурные организации · Клининг услуги, and ~40 more. This is the same pattern Houzz uses (see S1 below) and it is the single most transferable idea for fixing topin.uz's `Specialists` problem.

**stroyka.uz** — the best-balanced spine of any source in this research, 11 top-level nodes covering both goods and works: Строительные материалы · Отделочные материалы · **Двери. Окна. Перегородки** · **Отопление и инженерные системы** · Сантехника и комплектующие · Строительная техника и оборудование · Ремонтно-отделочные работы · Сантехнические работы · Строительно-монтажные работы · Электромонтажные работы · **Архитектура и дизайн** · Аренда. Note that it puts **Потолки** (with a separate "Комплектующие для потолков") inside Отделочные материалы, alongside Гипсокартон, Кафель, Керамогранит, Натуральный камень, Обои and Напольные покрытия — independent confirmation of the Ceilings gap. It also runs a room-filed interior project gallery (Спальня · Гостинная · Кухня · Кабинет · Детская · Ландшафт), which is the Houzz "Photos" axis in miniature.

**top.uz** — a Tashkent business directory with visible company counts and, most importantly, **district-level sub-pages for every section**: `/section/stroitelnye-materialy/chilanzar`, `/yunusabad`, `/mirzo-ulugbek`, `/sergeli`, `/yakkasaray`, `/yashnabad`, `/almazar`, `/bektemir`, `/mirabad`, `/uchtepa`, `/shayxantahur`, `/yangihayot`, plus `/uz/` locale mirrors.

Others worth noting: **24stroy.uz** (36 top-level nodes, the deepest three-level materials tree found locally, including *Гипсокартон и комплектующие*, *Утеплители и шумоизоляция*, *Блоки, цемент, кирпич*, *Огнезащитные материалы*); **glotr.uz** (national B2B catalogue whose `<rubric>-v-tashkente` URL convention is a clean local-SEO model, and whose "Товары для ремонта" rubric explicitly contains **Потолки**, **Двери**, **Окна и подоконники**); **goldenpages.uz** (multi-tag company model — one firm carries "Building stores" + "Paints, varnishes" + "Putty" + "Gypsum cardboard" simultaneously); **prom.uz**; **domtut.uz**, a property portal that publishes editorial roundups such as "Топ-10 мебельных магазинов в Ташкенте" and "Магазины освещения в Ташкенте" — those articles are direct SEO competitors for topin.uz's category pages.

**One competitor has left the field:** `mebel.uz`, historically the Uzbek furniture portal, now serves only a domain-sale parking page with an expired TLS certificate. Its archived December 2024 tree (via the Wayback Machine) is nonetheless the cleanest room-based furniture taxonomy found anywhere in this research and is worth borrowing: Мебель для гостиной (Стенки · Модульные гостиные · Тумбы под телевизор · Журнальные столики) · Мебель для детской · **Мебель на заказ** (Кухни на заказ · Шкафы-купе на заказ · Стенки на заказ) · Офисная мебель · Мягкая мебель (Диваны · Кресла · Пуфы и банкетки · Кресла-груши) · Мебель для спальни · Шкафы и стеллажи (Шкафы распашные · Шкафы-купе · Стеллажи · Гардеробные) · Столы и стулья · Кухонная мебель · Мебель для прихожей (Прихожие · Вешалки · Комоды · Зеркала · Обувницы · Пуфы) · Сад и дача · Товары для дома.

Two additional recommendations fall out of this competitor scan, both orthogonal to the category tree:

- **District filtering.** Only top.uz does it, and Tashkent buyers genuinely shop by district — nobody in Yunusabad drives to Sergeli for a tap. topin.uz's `Shops` table already stores `location`, `latitude` and `longitude`, so `/categories/<cat>/<district>` pages are close to free and would open a large local-SEO surface in two languages.
- **Retail type.** No Uzbek source distinguishes showroom from warehouse from bazaar stall, and none tags the large Tashkent building-materials markets (Куйлюк, Себзор). For a directory of 431 physical shops that is an open differentiator.

### Verified Uzbek↔Russian category terminology from Uzum Market

Uzum (uzum.uz) is the largest Uzbek marketplace and publishes a fully parallel UZ/RU tree, which corroborates the tovar.uz terminology used throughout this document. Its **Qurilish va taʼmirlash / Строительство и ремонт** section has 17 second-level nodes:

| Uzbek | Russian |
|---|---|
| Asboblar | Инструменты |
| Qurilish-pardoz materiallari | Отделочные материалы |
| Santexnika | Сантехника |
| Yoritish | Освещение |
| Elektrika | Электрика |
| Uy va bogʻ uchun suv taʼminoti | Водоснабжение для дома и сада |
| Materiallar va jihozlar | Расходные материалы и оснастка |
| Qurilish uskunalari | Строительное оборудование |
| Mahkamlagichlar va armatura | Крепеж и фурнитура |
| Shaxsiy himoya vositalari | Средства индивидуальной защиты |
| **Isitish** | **Отопление** |
| **Ventilyatsiya** | **Вентиляция** |
| Boʻyoq va lak materiallari | Лакокрасочные материалы |
| Qurilish materiallari | Строительные материалы |
| **Eshiklar, derazalar va butlovchi qismlar** | **Двери, окна и комплектующие** |

Uzum's Отделочные материалы branch contains **Подвесные потолки и комплектующие** — a third independent local source placing ceilings inside finish materials. Its Отопление branch contains **Теплые полы** (underfloor heating), and its Бытовая техника → **Климатическая техника** branch contains Кондиционеры и сплит-системы, Водонагреватели и котлы отопления, Обогреватели, Вентиляторы, Очистители воздуха.

*A note on the Uzbek names in this document:* every Uzbek term proposed below was taken from a live Uzbek commercial site (tovar.uz, OLX.uz or Uzum), not translated by hand. That said, Uzbek-language category labelling is thin across the commercial web generally — a large share of Uzbek-language trade in these categories runs through Instagram and Telegram rather than catalogued websites. **Have a native Uzbek speaker in the trade review the final list before it ships**, particularly the compound terms.

### Supplier density in Tashkent, by candidate category

Assessed by counting dedicated supplier domains, distinct companies on directory listing pages, and product offers on prom.uz. **These are supplier-count signals, not market sizes** — the underlying pages paginate inconsistently, so treat them as ordinal, not cardinal. No revenue or market-size figure for any of these categories could be verified, and none is claimed here.

| Candidate | Dedicated supplier sites observed | Distinct companies seen on directory pages | Verdict |
|---|---|---|---|
| Tiles / kafel | 3 (incl. an exact-match domain, kafel.uz) | ≥45 on top.uz | **Dense — the densest of all** |
| Chandeliers & light fittings | 5 | ≥48 on top.uz | **Dense** (topin.uz already covers this well: 50 shops) |
| Interior doors | 5 | 19 on prom.uz page 1 | **Dense** |
| Made-to-order kitchens | 7, most claiming own production | ≥39 on top.uz | **Dense** |
| **Stretch ceilings** | 8–9 | 26 distinct companies on prom.uz page 1 — the highest per-supplier density observed | **Dense** |
| Dry mixes / cement | 6, incl. 3 domestic manufacturers (Eleron, Megamix, Ventum) | ≥40 + ≥35 for cement | **Dense** |
| Marble / granite | 5 | ≥38 on top.uz, split into granite (23) and marble (24) | **Dense** (topin.uz already covers: 50 shops) |
| PVC windows | 8–9 | brand-concentrated (AKFA, IMZO, Ekopen, Engelberg) | **Dense in dealers, concentrated in brands** |
| Wrought iron / gates | 4 plus heavy Instagram presence | ≥35 on top.uz | **Dense in businesses, thin on the web** — much of this trade is Instagram-only |
| Air conditioners | 6 | dominated by general electronics retail | **Dense listings, moderate specialists** |
| Underfloor heating | 4 dedicated domains | — | **Moderate–dense** — belongs under Climate, not as a top-level |
| Fitted wardrobes (shkaf-kupe) | 6, **none exclusive** | 23 on top.uz | **Moderate** — same firms as kitchens |
| Fireplaces | 3 (incl. exact-match kamin.uz) | 25 on top.uz | **Moderate**, and overlaps Stone |
| Drywall / gipsokarton | **0 dedicated** | 9 companies, brand-led (KNAUF) | **Thin** — sold by generalist yards, not specialists |

Two consequences for the proposals:

1. **Ceilings (#2) is the best-supplied of the genuinely new categories** — 8–9 dedicated stretch-ceiling domains and the highest observed company-per-page density. It is also the cheapest to justify structurally. This raises it in the priority order.
2. **Wrought iron / gates is dense in businesses but nearly invisible on the web.** That makes Stairs & Metalwork (#12) *more* attractive for a directory, not less — a directory's value is highest exactly where suppliers have no websites of their own. But it also means recruitment must happen through Instagram, not by scraping.

Three naming decisions confirmed by the density research:

- **"Кафель" beats "керамическая плитка"** as the user-facing Russian term; stroyka.uz hedges with the slug `keramicheskaya-plitka-kafel`. Carry both as synonyms in search.
- **Doors split interior vs entrance on every serious source** — RU Межкомнатные / Входные, UZ Ichki eshiklar / Kirish eshiklari. Do not use a single "Doors" leaf.
- **Kitchens and fitted wardrobes are the same businesses.** Model both as children of a "Made-to-order furniture / Buyurtma mebel / Мебель на заказ" parent, as top.uz and the archived mebel.uz tree both do — not as unrelated leaves.

### A Russian DIY chain for comparison — Maxidom

Most large Russian home retailers (lemanapro.ru/leroymerlin.ru, petrovich.ru, obi.ru, hoff.ru) refuse automated requests from outside Russia and could not be read; nothing is attributed to them in this document. **Maxidom** was readable and serves as the Russian-market comparator. Its 25 top-level catalogue categories:

Товары для сада и отдыха · **Плитка** · Напольные покрытия · Интерьер · **Двери, окна, лестницы** · Краска и малярный инструмент · Сантехника · Строительные материалы · Строительное оборудование · Электроинструмент · Ручной инструмент · **Скобяные изделия** · Мебель · **Кухни** · **Посуда** · **Электротовары** · Освещение · Товары для дома и декора · Красота и здоровье · Бытовая техника · Аудио-Видео · Автотовары · Канцтовары · Товары для животных · Прочие товары

Four of these directly corroborate proposals in this document:

- **Плитка is its own top-level category**, separate from both Напольные покрытия and any wall category — supporting fix **F9** (topin.uz currently splits tile across `walls/wall-tiles` and `floor/floor-tiles`, 6 and 7 shops).
- **Кухни is its own top-level**, separate from Мебель — supporting proposal **#3**.
- **Двери, окна, лестницы** is one top-level node covering doors, windows *and* stairs — supporting proposals **#1** and **#12**, and suggesting they could ship as one category rather than two.
- **Скобяные изделия** (ironmongery) is a top-level — supporting proposal **#6**.

Note also that Maxidom, like Home Depot and Screwfix, keeps **Электротовары** separate from **Освещение**, which supports splitting Electrical (#10) from Lighting rather than merging them.

### Climate justification

Tashkent has a Mediterranean climate (Köppen Csa) with humid-continental influences (Dsa): per Wikipedia, "cold and often snowy winters — not typically associated with most Mediterranean climates — and long, hot, and dry summers", summers lasting May to September and "extremely hot, particularly during July and August". Population 3.1 million+ (as of 1 July 2025). This is a market that must buy **both** cooling and heating — which is why OLX carries 4,608 heating listings and tovar.uz maintains separate "Iqlim uskunalari / Климатическая техника" and "Isitish uskunalari / Отопительное оборудование" branches. topin.uz carries neither.

---

## Proposed new top-level categories

Slugs follow the existing convention (lowercase, hyphenated, English).

| # | English | Uzbek (Latin) | Russian | Slug | Why it fits this market | Evidence of demand | Who has it |
|---|---|---|---|---|---|---|---|
| 1 | Doors & Windows | Eshik va derazalar | Двери и окна | `doors-windows` | The first hard purchase in any Tashkent flat or house renovation. PVC window replacement and interior-door fitting are near-universal; balcony glazing is a distinct local trade. Currently topin.uz has no home for `DoorHan` (filed under Real Estate) or the door range at `MAFF` (filed under Floor). | OLX "Derazalar-oynalar" **8,847** listings; OLX service rubric "Oyna va eshiklarni yasash" **4,026**; tovar.uz maintains a full branch "Derazalar, eshiklar, teshiklarni loyihalashtirish / Окна, двери, оформление проемов" | **stroyvitrina.uz** (Двери — 18 children; Окна, стекло), **stroyka.uz** (Двери. Окна. Перегородки — a top-level), **uzum.uz** (Eshiklar, derazalar va butlovchi qismlar), glotr.uz, tovar.uz, OLX.uz, birbir.uz, domplan.uz; Home Depot, Archiproducts, Screwfix, Houzz UK |
| 2 | Ceilings | Shiftlar | Потолки | `ceilings` | topin.uz has Walls and Floor but no Ceilings — a structural hole in any renovation taxonomy. Stretch ceilings (натяжные потолки) are a dominant Tashkent renovation product with a dedicated installer trade. `Potolok Uz` is currently mis-filed under **Lighting**. | tovar.uz has a dedicated "Shiftlar / Потолки" branch with 5 children (натяжные, подвесные Грильято, реечные, потолочная плитка, потолочные панели); "натяжные потолки" is a promoted search term inside OLX's renovation-services rubric | **stroyka.uz** (Отделочные материалы → Потолки + Комплектующие для потолков), **uzum.uz** (Подвесные потолки и комплектующие), **glotr.uz** (Товары для ремонта → Потолки), tovar.uz; Archiproducts ("Suspended ceilings", explicitly including stretch ceilings), Home Depot (Building Materials → Ceilings) |
| 3 | Kitchens & Built-in Appliances | Oshxonalar va o'rnatiladigan texnika | Кухни и встраиваемая техника | `kitchens` | The single highest-ticket item in a renovation and a made-to-order trade, not a shelf product — it deserves its own browse path rather than sitting as one of nine Furniture subcategories. **24 shops are already tagged `kitchen-furniture` today.** | OLX "Oshxona mebeli" **6,304** + "Mebel na zakaz" **10,910**; topin.uz's own 24 shops | IKEA (**Kitchen & Appliances**, top-level), **Maxidom** (**Кухни**, its own top-level), B&Q, Home Depot and Archiproducts all treat Kitchens as top-level |
| 4 | Climate & Heating | Iqlim va isitish | Климат и отопление | `climate` | Tashkent needs both AC and heating (Köppen Csa/Dsa; hot May–Sept summers, snowy winters). Split-system installation, gas boilers, radiators and underfloor heating are mass-market renovation purchases with a dense installer base. | OLX "Isitish" **4,608** + "Ventilyatsiya" **214**; OLX service "Ventilyatsiya-konditsionerlar" **463**; tovar.uz carries "Iqlim uskunalari", "Isitish uskunalari", "Suv, gaz, issiqlik ta'minoti" as separate branches | **stroyvitrina.uz** (Системы отопления и обогрева; Кондиционеры и вентиляция), **stroyka.uz** (Отопление и инженерные системы — a top-level, incl. Котлы газовые, Печи и камины, Оборудование для саун и хамамов), **uzum.uz** (Isitish; Ventilyatsiya; Климатическая техника), idea.uz (the only local source with Газовые котлы), tovar.uz, OLX.uz; Home Depot, Screwfix, Wayfair, Houzz US |
| 5 | Smart Home & Security | Aqlli uy va xavfsizlik | Умный дом и безопасность | `smart-home` | **Promotion, not creation.** Ten shops already sit in `Other` doing exactly this — Aqara (official UZ distributor), Sonoff, Intellhouse, Easy Home, ELEVE (smart home + solar), Lumen LUX Engineering, MiOnline (Xiaomi), Jabb, Eletron, Texnomart. Video surveillance, intercoms and alarms are a natural adjacency Tashkent buyers already shop together. | 10 shops in the database today; tovar.uz groups "Aqlli uy / Умный дом" with видеонаблюдение, домофоны and охранные системы под "Uy va bog'" | tovar.uz, texnomart.uz, idea.uz; Houzz, Wayfair, B&Q |
| 6 | Hardware & Fittings | Furnitura va mahkamlagichlar | Фурнитура и крепёж | `hardware` | **Promotion, not creation.** The other ten `Other` shops are a coherent, premium, well-supplied Tashkent trade: Hettich Eman, DTC, BRASS, Muller, LUMINOR, INFINITY by Eman, Nobel Premium (Italian door hardware), Yechim by Eman, Aluframe, Alkan Group. Furniture and door hardware is a B2B-leaning segment that fits a directory better than a marketplace. | 10 shops today; OLX "Biriktirish elementlari" 700; tovar.uz has "Mahkamlash elementlari" (14 children) plus "Eshiklar uchun furnitura" and "Derazalar va eshiklar uchun aksessuarlar va furnitura" | tovar.uz; Screwfix/B&Q "ironmongery"; Archiproducts |
| 7 | Textiles & Window Decor | To'qimachilik va deraza dekori | Текстиль и декор окон | `textiles` | Curtains, tulle, blinds and cornices are a made-to-measure trade with its own showrooms — and the **largest interior-goods segment in the market**. Splitting it out also rescues Art & Decor's `Tekstil` subcategory, which is currently a grab-bag containing tableware and even clothing shops. | OLX "Derazalar dekori" **5,828** — the largest single interior-items subcategory on OLX.uz — plus "Tekstil" 3,282. topin.uz already has Home Textille, Super Textile, Perohouse among its 20 `textile`-tagged shops | tovar.uz ("Derazalar va eshiklar uchun jalyuzi"), OLX.uz, **uzum.uz** (Шторы и карнизы), **Maxidom** (Текстиль → Шторы); IKEA (**Window Treatments**, top-level), Home Depot (**Blinds & Window Treatments**), Houzz UK (Curtains, Blinds & Shutters) |
| 8 | Building Materials | Qurilish materiallari | Строительные материалы | `building-materials` | topin.uz's Walls/Floor/Stone cover only *finish* layers. Everything underneath — blocks, dry mixes, drywall, insulation, waterproofing, lumber, rebar — has no home, and this is by volume the biggest thing Uzbeks buy. Also unlocks house-building, not just flat-decorating. | OLX construction goods total **58,874**; within it Metalloprokat-armatura 9,065, G'isht/beton/penobloklar 5,462, Boshqa stroymateriallar 6,967, Arra materiallari 3,379. tovar.uz's construction tree is dominated by these nodes | **stroyvitrina.uz**, **stroyka.uz**, **24stroy.uz**, tovar.uz, qurilishmart.uz, wert.uz, qbazar.uz; **Maxidom** (Строительные материалы), Home Depot, B&Q, Archiproducts |
| 9 | Home Goods & Tableware | Uy buyumlari va idishlar | Товары для дома и посуда | `homeware` | **Partly a fix.** Inspection of the 20 shops tagged `art-decor → textile` shows most are homeware/tableware/gift showrooms (Art House "изысканная посуда, сувениры", Mudo "посуда", DecorHome "IKEA, посуда, декор", home&you, Scandi Home, Galeria, Status), and two are clothing shops (Suzani Store, Teplo Store) that do not belong in a home directory at all. | OLX "Idish-tovoq, oshxona anjomlari" **26,209** — second-largest in Дом и сад; tovar.uz has a large "Idishlar / Посуда" branch under Uy va bog' | tovar.uz, OLX.uz, uzum.uz, **Maxidom** (**Посуда** + Товары для дома и декора, two top-levels); IKEA (**Cookware & Tableware**, top-level), Wayfair |
| 10 | Electrical | Elektrika | Электрика | `electrical` | Cable, switchgear, sockets, distribution boards and lighting-adjacent electrics are a distinct trade from Smart Home. `Eletron` (industrial transformers to designer fittings) currently has nowhere sensible to sit. Consider merging into Smart Home & Security at launch and splitting later. | OLX "Elektrika" **3,255**; OLX service "Elektrik xizmatlar" 2,298 | tovar.uz, OLX.uz; every DIY chain |
| 11 | Tools & Equipment | Asboblar va uskunalar | Инструменты и оборудование | `tools` | Completeness for a renovation portal, but a **different audience** from topin.uz's interior-design core, and Uzbek competitors (wert.uz, qurilishmart.uz, qbazar.uz) already own this intent. **Defer.** | OLX "Jihozlar" **15,788** (Elektr jihozlar 9,382, Qo'l jihozlari 3,619, Payvandlash 823) | OLX.uz, tovar.uz, wert.uz, ikarvon.uz, **stroyvitrina.uz**; **Maxidom** (Электроинструмент + Ручной инструмент, two top-levels), Screwfix, Home Depot, B&Q |
| 12 | Stairs & Metalwork | Zinapoyalar va temir ishlari | Лестницы и металлоконструкции | `stairs-metalwork` | Wrought-iron gates, railings, window grilles, canopies and staircases are a visible, traditional Tashkent trade with dedicated workshops, and they cut across the current Exterior/Furniture boundary. Lower confidence than 1–9. | tovar.uz has "Bolg'alab yasalgan badiiy asarlar / Художественная ковка" and "Bolg'alab yasalgan narvon, panjaralar / Кованые лестницы, перила"; OLX promoted searches inside renovation services include "решетки на окна" and "навес" | tovar.uz; not a standard category on Western sites — this is a local-specific addition |

---

## Proposed new subcategories under existing categories

Names in this table are taken from tovar.uz / OLX.uz wherever a matching node exists there.

### Furniture (`furniture`) — 50 shops

| English | Uzbek (Latin) | Russian | Slug | Why | Evidence | Who has it |
|---|---|---|---|---|---|---|
| Office furniture | Ofis mebeli | Офисная мебель | `office-furniture` | Tashkent's office-fit-out market is served by the same showrooms; `ERGO`, `KANO`, `Rich House` already describe office ranges | OLX **10,252** listings; tovar.uz "Ofis mebellari" | OLX.uz, tovar.uz, uzum.uz; IKEA (top-level), Archiproducts (**Office**, top-level), Screwfix |
| Made-to-order furniture | Buyurtma mebel | Мебель на заказ | `custom-furniture` | The dominant local buying mode; distinguishes a workshop from a retailer, which is exactly what a directory should surface | OLX **10,910** listings | OLX.uz |
| Children's furniture | Bolalar mebeli | Детская мебель | `kids-furniture` | Standard everywhere, absent here | tovar.uz "Bolalar mebeli"; OLX groups under "Maxsus mebel" 14,449 | tovar.uz, uzum.uz; IKEA (**Baby & Kids**, top-level), Wayfair, Home Depot, Houzz UK |
| Hallway & wardrobes | Daxliz mebeli va garderob | Прихожие и гардеробные | `hallway-wardrobes` | Fitted wardrobes (шкаф-купе) are a distinct Tashkent trade; "shkaf" is a top OLX search term | OLX "Dahliz uchun mebel" **2,313**; tovar.uz "Daxlizlar uchun mebel" | tovar.uz, OLX.uz, uzum.uz (Шкафы и гардеробы), archived mebel.uz (Шкафы и стеллажи → Шкафы-купе, Гардеробные); IKEA (Storage & Organization), Divan.ru |
| Mattresses | Matraslar | Матрасы | `mattresses` | High-margin standalone segment usually split from bedroom furniture | Not separately counted on OLX — folded into bedroom (17,982). Demand not independently verified | IKEA, **Divan.ru** (Кровати и матрасы → Все матрасы), uzum.uz (Кровати и матрасы) |
| Home office | Uyda ishlash uchun mebel | Мебель для работы дома | `home-office` | Post-2020 standard category | tovar.uz "Uyda ishlash uchun mebel" | tovar.uz, IKEA, Wayfair |

### Lighting (`lighting`) — 50 shops

| English | Uzbek (Latin) | Russian | Slug | Why | Evidence | Who has it |
|---|---|---|---|---|---|---|
| Chandeliers | Qandillar | Люстры | `chandeliers` | Currently buried in "Shiftdagi chiroqlar" (48 shops — the most overloaded subcategory on the site). Chandeliers are a distinct, culturally significant purchase in Uzbek homes | tovar.uz "Chiroqlar, qandillar / Светильники"; 48/50 lighting shops share one subcategory today | tovar.uz ("Chiroqlar, qandillar"), uzum.uz, **Maxidom** (Освещение) |
| LED strip & profile | LED lenta va profil | LED-лента и профиль | `led-strip` | The workhorse of contemporary Tashkent interiors, always sold alongside stretch ceilings | Not separately counted; inferred from the stretch-ceiling trade. **Not verified** | uzum.uz (Освещение → **Светодиодные ленты**), Archiproducts |
| Track & spot systems | Trek va spot tizimlari | Трековые и споты | `track-lighting` | Currently unaddressed by "Texnik yoritish" (11 shops) | Not separately counted. **Not verified** | Archiproducts (Lighting → **Track-Lights**), uzum.uz (Встраиваемые светильники) |
| Smart lighting | Aqlli yoritish | Умный свет | `smart-lighting` | Bridges to the new Smart Home category; ELEVE and Lumen LUX already straddle both | 10 smart-home shops in DB | tovar.uz, Houzz, Wayfair |

### Art & Decor (`art-decor`) — 50 shops

| English | Uzbek (Latin) | Russian | Slug | Why | Evidence | Who has it |
|---|---|---|---|---|---|---|
| Mirrors | Ko'zgular (oynalar) | Зеркала | `mirrors` | A genuine standalone trade, currently unfindable | tovar.uz has "Oynalar / Зеркала" as its own node; OLX bundles mirrors into "Derazalar-oynalar" 8,847 | tovar.uz (**Oynalar / Зеркала**, its own node), OLX.uz, uzum.uz (Декор и интерьер → Зеркала), archived mebel.uz (Прихожая → Зеркала); IKEA (Bathroom → Mirrors) |
| Paintings, posters & frames | Rasm, poster va ramkalar | Картины, постеры и рамки | `art-frames` | Splits the overloaded "Devor dekori" (26 shops) | OLX **846** listings | OLX.uz, Houzz, Wayfair |
| Uzbek crafts (suzani, ganch, ceramics) | Milliy hunarmandchilik (so'zana, ganch, sopol) | Национальные ремёсла (сюзане, ганч, керамика) | `uzbek-crafts` | **Local-specific and defensible.** `Suzani Store`, `Human House`, `Bright Gallery`, `Uni Art` and `Tokcha Decor` are already in the database and have no accurate home. No node on any of the fourteen international or Russian comparators reviewed maps to this — it is topin.uz's clearest differentiator | Shops present in the DB today; no listing-count source found. Demand size **not verified** | No competitor equivalent found |
| Candles & home fragrance | Shamlar va uy aromatlari | Свечи и ароматы для дома | `candles-fragrance` | Small but standard | OLX 58 listings — small. Include only as a low-priority leaf | OLX.uz, tovar.uz, Wayfair |
| Holiday decor | Bayramona bezaklar | Праздничный декор | `holiday-decor` | Seasonal traffic driver (Navruz, New Year) | OLX **782** listings; tovar.uz "Bayramona yoritish" | OLX.uz, tovar.uz |

### Walls (`walls`) — 50 shops

| English | Uzbek (Latin) | Russian | Slug | Why | Evidence | Who has it |
|---|---|---|---|---|---|---|
| Decorative plaster | Dekorativ suvoq | Декоративная штукатурка | `decorative-plaster` | A major Tashkent finish, distinct from paint; travertine-look plaster is a promoted OLX search term ("травертин") | tovar.uz "Suvoq / Штукатурка"; OLX promoted search | tovar.uz ("Suvoq / Штукатурка"), **stroyvitrina.uz** (Финишные материалы для стен → Декоративные покрытия), **Maxidom** (Краска и малярный инструмент) |
| Mouldings & cornices | Molding va lepnina | Молдинги и лепнина | `mouldings` | Classical interiors remain strong locally | tovar.uz "Bezak materiallari va elementlari / Декоративные материалы и элементы" | tovar.uz |
| Drywall systems | Gipsokarton va profil | Гипсокартон и профиль | `drywall` | "gipsakarton" is a promoted OLX search term inside renovation services | tovar.uz "Gipsokarton ishlari uchun materiallar"; OLX promoted search | tovar.uz, **24stroy.uz** (**Гипсокартон и комплектующие**, a top-level), **stroyka.uz** (Отделочные материалы → Гипсокартон), Home Depot (Building Materials → Drywall), B&Q |
| 3D & acoustic panels | 3D va akustik panellar | 3D- и акустические панели | `3d-acoustic-panels` | Gives the orphaned `Acoustics` subcategory (0 shops) a real home | tovar.uz "Ovoz o'tkazmaydigan materiallar / Звукоизоляционные материалы" | tovar.uz, Archiproducts |

### Floor (`floor`) — 40 shops

| English | Uzbek (Latin) | Russian | Slug | Why | Evidence | Who has it |
|---|---|---|---|---|---|---|
| SPC / quartz-vinyl | SPC va kvarts-vinil | SPC и кварцвинил | `spc-vinyl` | Currently merged with laminate (29 shops); the fastest-growing floor product | Not separately counted on OLX. **Not verified** — but the existing `laminate` subcategory is the second-largest on the site | **Maxidom** (Напольные покрытия), **stroyka.uz** (Отделочные материалы → Ламинат), Archiproducts (Finishes → Floor covering) |
| Skirting & profiles | Plintus va profillar | Плинтусы и профили | `skirting` | Always bought with flooring; tovar.uz gives it its own node | tovar.uz "Plintuslar va ularga aksessuarlar" | tovar.uz, **Maxidom** (Напольные покрытия), Archiproducts (Finishes → **Skirting boards**) |
| Screed & underlay | Styajka va tagliklar | Стяжка и подложка | `screed-underlay` | The prep layer no current category covers | tovar.uz "Polni tekislash uchun quruq aralashmalar" | tovar.uz, Archiproducts (**Screeds and base layers for flooring**) |
| Commercial & sports flooring | Tijorat va sport qoplamalari | Коммерческие и спортивные покрытия | `commercial-flooring` | `Bravo` (carpet tile for offices) and `ERGO` already serve this and are mis-shelved as residential | Shops present in DB | Archiproducts |

### Stone (`stone`) — 50 shops

| English | Uzbek (Latin) | Russian | Slug | Why | Evidence | Who has it |
|---|---|---|---|---|---|---|
| Worktops | Stol usti (stoleshnitsalar) | Столешницы | `worktops` | The main commercial use of engineered stone; ties Stone to the new Kitchens category. 87 of the site's 118 products are already artificial-stone items | topin.uz product data; tovar.uz "Tabiiy tosh va undan tayyorlangan buyumlar" | IKEA (Kitchen → **Kitchen countertops**), uzum.uz (Мебель для кухни → **Столешницы для кухни**), stroyvitrina.uz, glotr.uz (Мебель → Столешницы) |
| Windowsills & stair treads | Deraza tokchalari va zina qadamlari | Подоконники и ступени | `sills-treads` | Standard second use of the same slabs | tovar.uz "Granit", "Naturalnyy kamen" branches | tovar.uz |
| Mosaic | Mozaika | Мозаика | `mosaic` | Bathroom/kitchen adjacency | tovar.uz "Bezak plitkalari / Плитка отделочная" | tovar.uz ("Bezak plitkalari"), **Maxidom** (**Плитка**, its own top-level), stroyka.uz (Керамогранит) |
| Paving & kerbs | Bruschatka va bordyurlar | Тротуарная плитка и бордюры | `paving` | "брусчатка"/"bruschatka" are promoted OLX search terms; belongs with Exterior or Stone | OLX promoted searches; tovar.uz "Aerodrom, yo'l, yulkalar plitalari" | tovar.uz, OLX.uz |

### Bathroom (`bathroom`) — 50 shops

| English | Uzbek (Latin) | Russian | Slug | Why | Evidence | Who has it |
|---|---|---|---|---|---|---|
| Pipes & fittings | Quvurlar va fitinglar | Трубы и фитинги | `pipes-fittings` | The rough-in half of plumbing, entirely absent | tovar.uz "Suv, gaz, issiqlik ta'minoti" branch; OLX Santexnika 8,692 covers both | tovar.uz ("Suv, gaz, issiqlik ta'minoti"), **stroyka.uz** (Трубы · Фитинги · Запорная арматура · Канализация), **Maxidom** (Сантехника), Screwfix, Home Depot |
| Water heaters | Suv isitgichlar | Водонагреватели | `water-heaters` | Gas column / boiler is near-universal in Tashkent housing | tovar.uz "Suv isitgichlari, isitish qozonlari, suv isitish kolonkalari" | tovar.uz, texnomart.uz |
| Bathroom accessories | Hammom aksessuarlari | Аксессуары для ванной | `bathroom-accessories` | Standard leaf, missing | tovar.uz; OLX | Everyone |
| Sauna & hammam | Sauna va hammom | Сауны и хаммамы | `sauna-hammam` | Culturally relevant; pairs with the existing Pools subcategory | tovar.uz "Dalahovli vanna va hojatxonalari"; demand size **not verified** | tovar.uz |
| Water filtration | Suv filtrlari | Фильтры для воды | `water-filters` | Water quality is a real local purchase driver | tovar.uz "Maishiy gaz filtrlari" and related; demand **not verified** | tovar.uz |

### Exterior (currently `real-estate`) — 50 shops

| English | Uzbek (Latin) | Russian | Slug | Why | Evidence | Who has it |
|---|---|---|---|---|---|---|
| Canopies & gazebos | Soyabonlar va shiyponlar | Навесы и беседки | `canopies-gazebos` | "навес" is a promoted OLX renovation search; a standard courtyard-house purchase | tovar.uz "Shiyponlar va soyabonlar"; OLX promoted search | tovar.uz |
| Gate automation | Darvoza avtomatikasi | Автоматика для ворот | `gate-automation` | `DoorHan` is already in the DB selling exactly this and is currently only reachable via "Devorlar va darvozalar" (4 shops) | tovar.uz "Darvozalar uchun avtomatlashtirish"; shop present in DB | tovar.uz |
| Decking | Terrasa taxtasi (dekking) | Террасная доска | `decking` | Standard for the pool/landscape adjacency already present | tovar.uz "Arralangan materiallar"; demand **not verified** | tovar.uz, Archiproducts |
| Drainage & stormwater | Drenaj va yomg'ir suvi tizimlari | Дренаж и ливнёвка | `drainage` | Separates from roofing where it is currently hidden | tovar.uz "Drenaj tizimlari va jihozlari", "Jala suvini qabul qiluvchi quvurlar" | tovar.uz, **stroyka.uz**, Screwfix (Guttering & Drainage), Home Depot (**Gutter Systems**) |
| Paving | Bruschatka va yo'lka plitalari | Тротуарная плитка | `paving-exterior` | See Stone above — assign to one parent only | OLX promoted searches "брусчатка"/"bruschatka" | tovar.uz, OLX.uz |

### Plants (`plants`) — 20 shops — see also Fixes

| English | Uzbek (Latin) | Russian | Slug | Why | Evidence | Who has it |
|---|---|---|---|---|---|---|
| Live plants | Jonli o'simliklar | Живые растения | `live-plants` | **The category's actual content.** 20 shops are florists and nurseries; the only subcategory says "artificial" | OLX "Xona o'simliklari" **3,065**; tovar.uz "Jonli o'simliklar / Живые растения" | tovar.uz, OLX.uz |
| Flowers & bouquets | Gullar va guldastalar | Цветы и букеты | `flowers` | Bahor Gullari, Cveti Tashkent, Mega Flowers Uz, Decor Flowers, DecoFlowers are literally florists | Shops in DB; "gullar" is a top OLX search term in Дом и сад | OLX.uz |
| Planters & soil | Gultuvaklar va tuproq | Кашпо и грунты | `planters-soil` | The consumable half of the trade | tovar.uz "Bog' o'simliklari va tuproqlari" | tovar.uz |
| Phytodesign & green walls | Fitodizayn va vertikal bog'lar | Фитодизайн и вертикальное озеленение | `phytodesign` | `Fitomir Company`, `Green Town Studio`, `Infinity Green`, `Greeen` are studios, not shops | Shops in DB | Houzz (as a Pro type) |

### Specialists (`specialists`) — 1 shop

Add, once there is anyone to put in them (see Prioritisation):

| English | Uzbek (Latin) | Russian | Slug | Evidence |
|---|---|---|---|---|
| Turnkey renovation | Kalit topshirish ta'miri | Ремонт под ключ | `turnkey-renovation` *(exists, 0 shops)* | OLX "Pardozlash, ta'mirlash" 5,394 |
| Stretch-ceiling fitters | Shift ustalari (natyajnoy) | Мастера натяжных потолков | `ceiling-fitters` | "натяжные потолки" promoted OLX search |
| Window & door fitters | Deraza va eshik ustalari | Установка окон и дверей | `window-door-fitters` | OLX **4,026** |
| AC & ventilation installers | Konditsioner o'rnatuvchilar | Монтаж кондиционеров и вентиляции | `hvac-installers` | OLX **463** |
| Furniture assembly & joinery | Mebel yig'uvchilar | Сборка мебели, столярка | `furniture-assembly` | OLX "Mebel na zakaz" 10,910 |
| Metalwork & welding | Payvandchilar va temirchilar | Сварка и металлоконструкции | `metalwork` | OLX promoted "решетки на окна" |
| Landscapers | Landshaft ustalari | Ландшафтные работы | `landscapers` | topin.uz already has 8 landscape shops |
| General builders | Quruvchilar | Строительные услуги | `builders` | OLX **13,763** — the largest sub-rubric |

---

## Fixes to the existing taxonomy

### F1. `real-estate` is the wrong slug — rename to `exterior` (high priority, cheap)

The category is *displayed* as "Eksteryer" / "Экстерьер" (`frontend/js/config.js` lines ~72 and ~212, and again in `frontend/js/editorAdmin.js` ~line 456) but its slug, its URL and its English name are all "Real Estate". Its contents are facade materials, roofing, landscape, pools, fences and architectural lighting — no real estate whatsoever.

Three separate costs:
- **SEO:** `/categories/real-estate` competes for property-search intent in a market where uybor.uz and olx.uz own it completely. topin.uz will never win that query and gains nothing from ranking for it.
- **Internal:** admins assigning shops read "Real Estate" in the admin UI and mis-file.
- **API consumers** see a field that means the opposite of what it says.

Rename slug to `exterior`, name to "Exterior / Eksteryer / Экстерьер", and 301-redirect `/categories/real-estate`.

### F2. Dissolve `Other` (high priority, cheap, zero recruitment)

`Other` holds 20 shops in three subcategories:

| Subcategory | Shops | Recommendation |
|---|---|---|
| `smart-home` — Aqlli uy / Умный дом | 10 | Promote to top-level **Smart Home & Security** |
| `furniture-fittings` — Furnitura / Фурнитура | 10 | Promote to top-level **Hardware & Fittings** |
| `acoustics` — Akustika / Акустика | **0** | Delete; fold the concept into `walls → 3d-acoustic-panels` and/or Smart Home |

Note also that `smart-home`'s Uzbek name in `seed_subcats.js` is `'Texnika'` ("appliances") while the DB row now reads `Aqlli uy` — the seed file and the live data have drifted. Worth reconciling before any migration.

After this, `Other` has nothing left and should be removed rather than left as an attractor for future mis-filing. A directory should have no "Other": every shop that lands there is a shop the user cannot find.

### F3. `Plants` describes the opposite of its contents (high priority, cheap)

One subcategory, `artificial-plants` (20 shops). But the shops are `Bahor Gullari`, `Cveti Tashkent`, `Mega Flowers Uz`, `Azalea Garden`, `Fitomir Company`, `Green Town Studio`, `Botanicals`, `DecoFlowers`, `Decor Flowers`, `Greeen`, `Green Style`, `Infinity Green`, `Flowers Plants Uzbekistan` — overwhelmingly live-plant and florist businesses. Only `SUNIY GULLAR` ("artificial flowers") unambiguously matches the label.

Add `live-plants`, `flowers`, `planters-soil`, `phytodesign` and re-tag. Rename the category to **Plants & Flowers / O'simliklar va gullar / Растения и цветы**. This is a re-tagging job on 20 existing shops with no recruitment cost, and it fixes a page that currently lies to the user.

### F4. `Specialists` — 8 subcategories, 1 shop, 6 with no Russian name (high priority, decision required)

Current state: `architects` has 1 shop (Sardor Yakubov). All seven others — `turnkey-renovation`, `design-studios`, `plumbers`, `electricians`, `painters`, `tile-workers`, `carpenters` — have **zero**. Six of the eight rows have `name_ru = NULL`, so Russian-language users see Uzbek text on a bilingual site.

This is simultaneously the site's worst-executed area and its largest opportunity — the equivalent rubric on OLX.uz is the biggest service category on the platform (38,967 listings; 31,653 in Tashkent region), and Houzz's entire business is built on the Pro directory sitting alongside the product catalogue.

Two things must happen, in this order:
1. **Immediately:** hide subcategories with zero shops from the public UI (a `count > 0` filter, applied site-wide — it also hides `acoustics` and `stone/format`). Nine dead-end pages is a worse signal to both users and search engines than a smaller menu.
2. **Then:** treat Specialists as a recruitment programme, not a taxonomy problem. Fill `turnkey-renovation`, `design-studios` and the new `window-door-fitters` / `ceiling-fitters` first — these map to the three highest-volume OLX sub-rubrics.

Also populate `name_ru` for all eight existing rows regardless.

### F5. `Categories` has no `name_ru` / `name_en` — translations are hardcoded in the frontend (blocking, fix before expansion)

`SubCategories` has `name`, `name_ru` and `name_en` columns. **`Categories` has only `name`.** Category names are translated by a slug-keyed literal map duplicated in:

- `frontend/js/config.js` — Uzbek map (~line 66) and Russian map (~line 206)
- `frontend/js/editorAdmin.js` (~line 452)

and consumed in `frontend/js/admin.js`, `frontend/js/adminShops.js` and `frontend/js/home.js` via `i18n[currentLang].cat[slug]`.

Consequence: **adding a single category requires a frontend code change in three files and a deploy**, and any category added through the admin UI renders with its raw English `name` in both languages. Adding 8–12 categories on top of this is not viable. Add `name_ru` and `name_en` to `Categories`, backfill from the existing maps, serve them from the API, and delete the maps. This is the one prerequisite item on the list.

### F6. Slug convention is inconsistent

Most subcategory slugs are English (`soft-furniture`, `ceiling-lighting`, `wall-decor`). Three are Uzbek: `divonlar` (Divanlar), `mebellar` (Umumiy mebel), `kreslolar` (Kreslolar). Normalise to `sofas`, `general-furniture`, `armchairs` with redirects, or the URL space becomes unpredictable for anyone building against it.

### F7. `Furniture → Umumiy mebel / Общая мебель` (32 shops) is a second dumping ground

A "General furniture" subcategory inside Furniture holding 32 of 50 shops means the subcategory level is not doing its job — a user filtering to it learns nothing. Combined with `Divanlar` (41) and `Kreslolar` (22) overlapping `Yumshoq mebel` (42), the Furniture subtree has three near-synonymous soft-furniture nodes. Recommend: keep `soft-furniture` as the parent concept, keep `sofas` and `armchairs` as leaves, retire `Umumiy mebel` by re-tagging its shops onto real leaves.

### F8. Subcategory tagging is thin in the materials categories

| Category | Shops (primary) | Total shop↔subcategory links |
|---|---|---|
| Walls | 50 | 53 |
| Stone | 50 | 53 |
| Real Estate | 50 | 62 |
| Furniture | 50 | 290 |
| Bathroom | 50 | 151 |

Furniture shops carry ~5.8 subcategory tags each; Walls and Stone shops carry ~1.06. Every shop is tagged at least once except one shop in Walls, which has none at all — so this is not missing data, it is *shallow* data. Either the materials shops genuinely sell one thing each, or — far more likely, given that the shop counts per category are suspiciously round (50/50/50/50/50/50/50/40/20/20) and suggest capped bulk imports — they were imported with a single tag apiece.

Before adding subcategories to Walls and Stone, audit whether the existing ones are being used. New subcategories on a shallowly-tagged parent produce empty pages. The `ShopSubCategories` join table already supports many-to-many, so this is a data-entry problem, not a schema one.

### F9. Tiles are split across two parents

`walls → wall-tiles` (6 shops) and `floor → floor-tiles` (7 shops) divide a trade that in Tashkent is one shop selling both — and tile is, by the supplier-density research above, **the single densest supplier category in Tashkent** (≥45 companies on top.uz, 1,322 offers on prom.uz, plus an exact-match domain kafel.uz). Thirteen shops across two buried leaves is a serious under-representation of the biggest trade on the site.

Every comparator that takes tile seriously gives it one home: **Maxidom makes Плитка its own top-level category**, separate from Напольные покрытия; uzum.uz has "Плитка и керамогранит" as a single node; stroyka.uz uses the slug `keramicheskaya-plitka-kafel`, carrying both terms.

Recommendation: create a single **Tiles & Ceramics / Kafel va keramogranit / Плитка и керамогранит** node — most defensibly as a top-level, given the density — and cross-list existing tile shops into it. The `ShopSubCategories` join table already supports many-to-many, so cross-listing is a data-entry task, not a schema change. Carry **кафель** and **керамическая плитка** as search synonyms; "кафель" is the term users actually type.

### F10. Zero-shop subcategories to retire or fill

`other → acoustics` (0), `stone → format` "Katta format / Крупный формат" (0), and seven of the eight `specialists` children (0 — only `architects` has a shop). **Nine of topin.uz's 51 subcategories return no shops at all.** Each is a live page a user can reach and find nothing on.

---

## Structural moves worth copying (and two warnings)

These come from reading how the best-designed comparators actually organise the same problem. They are not extra categories — they change what the category tree has to carry.

### S1. Houzz has stopped selling products entirely — and models shops *as* professionals

`houzz.com/products` now returns *"Purchasing on Shop Houzz, operated by Cart.com, is no longer available"* and offers only three paths: **Find Professionals · Browse Photos · Explore Houzz Pro**. `houzz.co.uk/products` 301-redirects to Photos. The company that defined this category has converged on **inspiration + a business directory**, dropping the product catalogue.

More usefully for topin.uz: **Houzz does not have a separate "shops" section and a separate "pros" section.** Its UK professional tree contains a group literally called **"Suppliers"** — Tiles & Worktops, Carpet & Flooring, Cabinet Makers, Windows & Glazing, Lighting, Kitchen & Bathroom Suppliers, Doors, Garage Doors, Smart Home Specialists, Furniture & Home Accessories, Curtains/Blinds & Shutters, Paint & Wall Coverings — sitting alongside "Design & Renovation", "Specialist Contractors" and "Outdoor Services". Houzz US does the same with dealer-type nodes (Carpet Dealers, Door Dealers, Window Dealers, Glass & Shower Door Dealers, Building Supplies, Garden & Landscape Supplies) inside its "Renovation" and "Outdoor" groups.

**Implication for topin.uz's broken `Specialists` category:** the fix may not be "recruit shops into a weak eleventh category". It may be to stop treating a shop and a tradesperson as different objects. Both are businesses with a location, a phone number, a portfolio and a category. `Specialists` then becomes a *group label* over trade-type nodes in the same tree, not an orphan branch with eight empty children. topin.uz's `Shops` table already has everything needed (name, location, phone, rating, images) — a `businessType` enum (`supplier` | `contractor` | `studio`) would be a smaller change than building a parallel section.

### S2. Houzz separates "what they sell" from "what they do" — and makes the second a *facet*, not a branch

Houzz UK's `/services` is a **flat A–Z of roughly 450 service names** that resolve into facet URLs on professional categories (`/professionals/<slug>/project-type-<service>-probr1-bo~t_<ID>~sv_<ID>`). So *Wallpaper Removal*, *Radiator Bleeding*, *Damp Proofing*, *Insulation Installation*, *Fuse Box Installation & Repair*, *Smoke Alarm Installation* and *Locksmith* all get their own landing page and long-tail search surface **without a second taxonomy to maintain**.

The vocabulary deliberately pairs supply with work: *Fence Installation* / *Fencing Supplies*; *Flooring Supplies*; *Concrete Supplies*; *Cladding Supplies*; *Boiler Installation* / *Boiler Repair* / *Boiler Servicing*.

**Implication:** topin.uz should not model "stretch-ceiling fitters" as a subcategory competing with "stretch ceilings" the product. It should model *natyajnoy shift o'rnatish / монтаж натяжных потолков* as a **service tag** on businesses in the Ceilings category. That is how one dataset serves both "where do I buy it" and "who installs it" — the two questions an Uzbek renovator actually asks — without doubling the tree. It is also the cheapest available SEO surface for a bilingual site: every service term generates a UZ and a RU landing page.

### S3. Archiproducts runs two *contexts* over one category pool

Archiproducts has a header toggle between **Interior** (`?context=interior`) and **Building** (`?context=building`). The same product categories re-root under different top-level bins:

- **Interior:** Furniture · Bathroom · Kitchen · Lighting · Outdoor · Office · Decor · Finishes · Contract · Construction · Lifestyle
- **Building:** Structures · Construction materials · Stairs · Building envelope · Insulation · Waterproofing · Finishes · Doors and windows · **Suspended ceilings** · Dry systems · Bathroom · Screeds and base layers · Glues and chemical anchors · Seals and foams · Hardware and fasteners · Systems (heating and air conditioning) · Home automation and electrical systems · Safety · Theft protection · Tools · Construction site

Shared nodes — **Doors and windows, Finishes, Stairs, Bathroom** — appear deliberately in both.

**Implication:** this is the only pattern found that serves a homeowner choosing a sofa and a contractor buying insulation from one dataset without duplicating it. It is directly relevant to the biggest judgement call in this proposal — whether to add **Building Materials** (#8) and **Tools** (#11) at all. Adding them as flat siblings of Furniture and Art & Decor would dilute topin.uz's interior-design identity. Adding them behind an "Interior / Qurilish" context switch would not. If topin.uz intends to go beyond finish materials, adopt the context switch *before* adding the categories, not after.

### S4. Warning — an SEO facet explosion is not a taxonomy

Divan.ru (Russia's largest furniture e-tailer, readable where the other RU chains were not) exposes **331 distinct `/category/` URLs from its homepage alone**. Almost none are taxonomy: they are facet landing pages — *Кровати 160x200 см*, *Шкафы глубиной 40 см для одежды*, *Диваны без подлокотников*, *Ковры в стиле бохо*, *Кровати для подростка мальчика*, *Шкафы под потолок*. Its actual top level is small: Диваны · Кресла · Кровати и матрасы · Шкафы и стеллажи · Столы и стулья · Ковры и текстиль · Декор · Кухня · Детская · Сад · Офис.

The lesson for topin.uz: **do not let SEO landing pages leak into the category table.** Dimensions, colours, styles, rooms and price bands belong in a facet/tag layer over shops and products, not as `Categories` or `SubCategories` rows — otherwise the admin dropdown becomes unusable and every shop needs re-tagging when a facet is added. Archiproducts makes the same separation explicitly, keeping style (Minimalist, Scandinavian, Japandi, Luxury…) on a `/topics/` axis that never touches the category branch.

### S5. Warning — do not clone a Western tree wholesale

Two of the comparators are near-mirror images: **Screwfix has no furniture, no decor and no textiles at all**; **Wayfair's "Home Improvement" is a single department** under thirteen furnishing ones. Neither is the right shape for topin.uz, which sits between them. And several standard Western nodes have no obvious Uzbek analogue worth building today (Pets, Laundry & Cleaning, Automotive, Holiday Decorations at Home Depot's scale). Conversely, the strongest local addition proposed here — **Uzbek crafts (suzani, ganch, ceramics)** — appears on *none* of the international comparators. Copy the structure, not the contents.

### Independent validation of the proposals above

Several proposals are confirmed as top-level categories on the international comparators, which raises confidence that they are structural rather than fashionable:

| topin.uz proposal | Confirmed as a top-level or major node at |
|---|---|
| **Ceilings** | Archiproducts ("Suspended ceilings", explicitly including stretch ceilings); Home Depot (Building Materials → **Ceilings**) |
| **Textiles & Window Decor** | IKEA (**Window Treatments**, top-level #15); Home Depot (**Blinds & Window Treatments**, a department); Houzz UK (**Curtains, Blinds & Shutters**); Archiproducts (Decor → Curtains & blinds) |
| **Smart Home & Security** | IKEA (**Smart Home**, top-level #17); Home Depot (**Smart Home**, a department); Screwfix (Electrical → Smart Homes); Houzz UK (**Smart Home Specialists**); Archiproducts (Home automation and electrical systems) |
| **Doors & Windows** | Home Depot (**Doors & Windows**, a department); Archiproducts (**Doors and windows**, present in *both* contexts); Screwfix (Building & Doors); Houzz UK (**Doors**, **Windows & Glazing**) |
| **Hardware & Fittings** | Home Depot (**Hardware**, a department); Screwfix (**Security & Ironmongery**, **Screws Nails & Fixings**); Wayfair (Doors & Door Hardware, Hardware); Archiproducts (**Hardware and fasteners** → Furniture components and hardware) |
| **Kitchens & Built-in Appliances** | IKEA (**Kitchen & Appliances**, top-level #6); B&Q (**Kitchen & Appliances**); Home Depot (**Kitchen**, **Appliances**); Archiproducts (Kitchen) |
| **Climate & Heating** | Home Depot (**Heating, Venting & Cooling**); Wayfair (Heating, Cooling & Air Quality); Screwfix (**Heating & Plumbing**); Houzz US (**Air Conditioning & Heating**) |
| **Plants & Flowers** (the `Plants` fix) | IKEA (**Plants & Planters**, top-level #16); Home Depot (**Garden Center**) |
| **Home Goods & Tableware** | IKEA (**Cookware & Tableware**, top-level #8); Wayfair (Kitchen); Archiproducts (Kitchen → Tableware) |
| **Electrical** | Home Depot (**Electrical**); Screwfix (**Electrical & Lighting**); B&Q (**Lighting & Electrical**) |
| **Building Materials** | Home Depot (**Building Materials** + **Lumber & Composites**, two departments); B&Q (Building & Hardware); Archiproducts (**Construction materials**) |
| **Tools & Equipment** | Screwfix (**Tools**, its first department); Home Depot (**Tools**); B&Q (**Tools & Equipment**); Archiproducts (**Tools**) |
| **Stairs & Metalwork** | Archiproducts (**Stairs**, a top-level in the Building context); Houzz US (Staircases & Railings, **Ironwork**); Houzz UK (Staircases & Balustrades, **Wrought Iron Workers**) |
| Furniture → **Office furniture** | IKEA (Desks & Desk Chairs, top-level #5); Archiproducts (**Office**, a top-level); Screwfix (Storage & Ladders → Office Furniture) |
| Furniture → **Children's furniture** | IKEA (**Baby & Kids**, top-level #7); Wayfair (Baby & Kids); Home Depot (Baby & Kids); Houzz UK (Kids & Nursery) |
| Furniture → **Hallway & wardrobes** | IKEA (**Storage & Organization**, top-level #1 — includes hallway furniture and shoe cabinets); Wayfair (**Organization**, a department); Houzz US (Custom Closet Designers) |
| Walls → **3D & acoustic panels** | Archiproducts (**Acoustic felts and panels**, Office acoustic panels); IKEA (Sound absorbing acoustic panels) |

Two gaps flagged by the international comparators that this proposal does **not** cover, and that are worth a deliberate decision rather than an oversight:

- **Storage & Organisation.** IKEA gives it *two* top-level slots (#1 and #14); Wayfair and Home Depot both make it a department. topin.uz has nothing. It is proposed here only as a Furniture subcategory (`hallway-wardrobes`) plus a Homeware leaf — that may be under-weighted, but no Uzbek listing-count evidence was found to justify more (OLX "Saqlash buyumlari" is only 117 listings, which argues *against* it locally).
- **Sealants, adhesives and screeds.** Screwfix has a whole department; Archiproducts has three branches. Folded here into Building Materials. Fine at this stage, but it is a real trade in Tashkent (montaj ko'pigi, germetiklar — tovar.uz carries both) and would eventually justify its own node.

---

## Prioritisation

The binding constraint is **431 shops, not 431 categories' worth of shops**. A new category is only worth shipping if either (a) shops already in the database can fill it on day one, or (b) demand is large enough to justify a recruitment sprint. Product data is not a factor: the database holds only 118 products, 87 of them from a single stone supplier — this is a shop directory in practice, so "filling a category" means recruiting or re-tagging *shops*.

### Tier 0 — ship first: pure re-organisation, zero recruitment

Every item here is filled by shops already in the database.

| Action | Shops available today | Cost |
|---|---|---|
| **F5** — add `name_ru`/`name_en` to `Categories`, delete the hardcoded frontend maps | — | Prerequisite for everything below |
| **F1** — rename `real-estate` → `exterior` + 301 | 50 | One migration |
| **F2** — promote **Smart Home & Security** out of `Other` | 10 | Re-parent |
| **F2** — promote **Hardware & Fittings** out of `Other` | 10 | Re-parent |
| **F3** — fix **Plants → Plants & Flowers**, add live-plant subcategories | 20 | Re-tag |
| **New cat. #3 — Kitchens** | 24 (already tagged `kitchen-furniture`) | Re-parent |
| **New cat. #9 — Home Goods & Tableware** | ~10 mis-shelved under `art-decor → textile` | Re-tag |
| **F4 step 1** — hide zero-shop subcategories site-wide | — | One query filter |
| **F10** — retire `acoustics`, `stone/format` | — | Delete |
| **F9** — unify **Tiles & Ceramics** out of `walls/wall-tiles` + `floor/floor-tiles` | 13 (plus cross-listing candidates from the other 87 walls/floor/stone shops) | Re-tag + cross-list |
| **F6/F7** — normalise slugs, retire `Umumiy mebel` | 32 re-tagged | Migration |

This alone takes the site from 11 categories to roughly 15 real ones, eliminates every empty page, and requires **no new shops at all**.

The Tiles item deserves emphasis: tile is the densest supplier trade in Tashkent by every measure gathered here, and topin.uz currently exposes it as two buried leaves holding 6 and 7 shops. Fixing that is pure upside with no recruitment cost, and it is probably the highest-value single line in this table after F5.

### Tier 1 — highest demand-to-effort ratio; needs modest recruitment

| Category | Demand evidence | Supplier density | Shops today | Why now |
|---|---|---|---|---|
| **Ceilings** | Dedicated branch on tovar.uz, Uzum and stroyka.uz; promoted OLX search term | **Dense** — 8–9 dedicated stretch-ceiling domains; 26 distinct companies on one prom.uz page, the highest observed | 2 (Potolok Uz — currently mis-filed under **Lighting**; Tom Markazi) | Cheapest structural fix on the list. Walls + Floor + Ceilings is the complete set, the supplier base is the densest of any new category, and it is easy to enumerate |
| **Textiles & Window Decor** | OLX 5,828 — largest interior-goods subcategory in the market | Not separately assessed | ~4 partial (Home Textille, Super Textile, Perohouse) | Biggest verified demand gap that the existing shop base partly covers; curtain showrooms are easy to recruit because they already advertise on OLX with contact details |
| **Doors & Windows** | OLX 8,847 products + 4,026 services; Uzum and stroyvitrina.uz both give it a top-level node | **Dense** — 5 dedicated interior-door sites, 8–9 PVC window sites (brand-concentrated: AKFA, IMZO, Ekopen, Engelberg) | 4 (DoorHan, MAFF, Nobel Premium, Aluframe — all currently mis-filed) | Second-largest verified gap; four shops already need somewhere to go. Split interior vs entrance doors from day one — every serious local source does |

### Tier 2 — real recruitment required, but strategically important

| Category | Demand evidence | Shops today | Note |
|---|---|---|---|
| **Specialists rebuild** | OLX 38,967 / 31,653 Tashkent — the largest services rubric on the platform | 1 | The largest single opportunity on this list. It is a business-development project, not a taxonomy project. Do not expand its subcategory list until shops exist |
| **Climate & Heating** | OLX 4,608 + 463 services; climate makes it non-discretionary | 0 | Needs a cold start, but the supplier base (split-system dealers, boiler distributors) is concentrated and easy to find |
| **Building Materials** | OLX 58,874 across the parent rubric | Partial overlap with Walls/Floor/Stone | Large but competes directly with qurilishmart.uz, wert.uz and qbazar.uz, who already serve this intent with prices and delivery. Enter deliberately or not at all |
| **Electrical** | OLX 3,255 + 2,298 services | 1 (Eletron) | Consider launching merged into Smart Home & Security and splitting once it has 10+ shops |

### Tier 3 — defer

| Category | Why defer |
|---|---|
| **Tools & Equipment** | OLX 15,788 listings is real demand, but it is a tradesperson audience, not topin.uz's interior-design audience, and wert.uz / qurilishmart.uz / qbazar.uz already own the intent. Zero shops today |
| **Stairs & Metalwork** | Genuine local trade, but small and better served initially as a Specialists sub-rubric (`metalwork`) than as a product category |
| Most Tier-1 subcategory additions to **Walls** and **Stone** | See F8 — those parents are barely tagged today. Fix the tagging before deepening the tree |

### A rule to adopt alongside this

**Do not create a category before there are shops for it.** Of topin.uz's 51 subcategories, 9 currently return zero shops — 18% of the tree is dead weight, and the pattern (Specialists: 8 subcategories, 1 shop) suggests the tree was designed aspirationally and never reconciled with the shop base. The proposals above are ordered specifically to avoid repeating that. Gate publication of any new node on `shop_count >= 3`.

---

## Sources

Primary sources consulted for taxonomy structure, Uzbek/Russian terminology and demand evidence. All fetched 2026-08-05.

**Uzbek / Central Asian market**
- OLX.uz — Home & Garden: https://www.olx.uz/oz/dom-i-sad/
- OLX.uz — Construction & repair goods: https://www.olx.uz/oz/dom-i-sad/tovari-dlya-stroitelstva-remonta/
- OLX.uz — Interior items: https://www.olx.uz/oz/dom-i-sad/predmety-interera/
- OLX.uz — Furniture: https://www.olx.uz/oz/dom-i-sad/mebel/
- OLX.uz — Tools: https://www.olx.uz/oz/dom-i-sad/instrumenty/
- OLX.uz — Services index: https://www.olx.uz/oz/uslugi/
- OLX.uz — Construction, finishing & repair services: https://www.olx.uz/oz/uslugi/stroitelstvo-otdelka-remont/
- tovar.uz — Construction (top level): https://tovar.uz/uz/categories/2_stroitelstvo
- tovar.uz — Building materials: https://tovar.uz/uz/categories/3_stroitelnye_materialy
- tovar.uz — Ceilings ("Shiftlar / Потолки"): https://tovar.uz/uz/categories/464_potolki
- tovar.uz — Water, gas & heat supply: https://tovar.uz/uz/categories/241_vodo_gazo_teploobespechenie
- tovar.uz — Home & garden: https://tovar.uz/uz/categories/594_dom_i_sad
- tovar.uz — Windows, doors & openings: https://tovar.uz/uz/categories/4_okna_dveri_oformlenie_proemov
- tovar.uz — Fasteners: https://tovar.uz/uz/categories/3496_krepejnye_izdeliya
- tovar.uz — Live plants: https://tovar.uz/uz/categories/220_jivye_rasteniya
- tovar.uz — Smart home: https://tovar.uz/uz/categories/917_umnyy_dom
- birbir.uz — Windows, doors & glass, Tashkent: https://birbir.uz/uz/toshkent/cat/qurilish-va-tamirlash/qurilish-tamirlash-uchun-mahsulotlar/derazalar-eshiklar-oynalar
- wert.uz (MODERN DELIVERY) — construction materials: https://uz.wert.uz/ and https://uz.wert.uz/magazin/folder/deraza-va-eshiklar
- qurilishmart.uz — construction marketplace: https://qurilishmart.uz/ *(JavaScript-rendered; category tree not readable without a browser)*
- qbazar.uz — construction goods delivery: https://qbazar.uz/
- domplan.uz — doors & windows: https://shop.domplan.uz/uz/eshik-va-romlar
- Uzum Market — Construction & repair: https://uzum.uz/ru/category/stroitelstvo-i-remont-10016 *(Yandex SmartCaptcha; read via browser)*

**Direct Tashkent competitors**
- stroyvitrina.uz — products / services / companies: https://stroyvitrina.uz/categories, https://stroyvitrina.uz/services, https://stroyvitrina.uz/rubrics
- stroyka.uz — construction & interior portal: https://stroyka.uz/
- top.uz — Tashkent business directory with district sub-pages: https://top.uz/section/stroitelnye-materialy/ (e.g. `/chilanzar`, `/yunusabad`)
- 24stroy.uz — three-level construction materials tree: https://24stroy.uz/
- glotr.uz — national B2B catalogue, `<rubric>-v-tashkente` URL pattern: https://glotr.uz/stroymateriali-v-tashkente/
- goldenpages.uz — multi-tag company directory: https://goldenpages.uz/
- prom.uz — product catalogue with company profiles: https://prom.uz/
- ikarvon.uz — tools & electrics: https://ikarvon.uz/
- domtut.uz — property portal publishing "Топ-10 мебельных магазинов в Ташкенте"-style roundups: https://domtut.uz/
- mebel.uz — **now a domain-sale parking page**; archived tree: http://web.archive.org/web/20241216210615id_/https://mebel.uz/
- Appliance retailers checked for climate/smart-home taxonomy: https://idea.uz/ (category API at `api.idea.uz/api/categories`), https://mediapark.uz/, https://texnomart.uz/, https://asaxiy.uz/
- Checked and found irrelevant or defunct: uybor.uz (property only), mymarket.uz (parked), zoodmall.uz (defunct), qurilish.uz (HTTP 503), mahalla.uz (does not resolve), sprav.uz (hosting panel only). `sotib-ol.uz` does not exist in DNS under that spelling.

**Context**
- Tashkent climate and population: https://en.wikipedia.org/wiki/Tashkent

**topin.uz internal**
- `backend/database.sqlite` — shop, category and subcategory counts
- `backend/seed_subcats.js` — original subcategory definitions
- `frontend/js/config.js`, `frontend/js/editorAdmin.js` — hardcoded category translation maps

**Western / international comparators**
- Houzz US — professional directory: https://www.houzz.com/professionals
- Houzz UK — professional directory: https://www.houzz.co.uk/professionals
- Houzz UK — services A–Z vocabulary: https://www.houzz.co.uk/services
- Houzz Shop product tree (archived, before shutdown): http://web.archive.org/web/20240101103223/https://www.houzz.com/products
- Archiproducts — Interior/Building contexts: https://www.archiproducts.com/en/products
- IKEA — full category tree: https://www.ikea.com/us/en/cat/products-products/
- Screwfix: https://www.screwfix.com/
- Home Depot (archived 2026-08-05): https://web.archive.org/web/20260805023240/https://www.homedepot.com/
- Wayfair (archived 2026-08-04): https://web.archive.org/web/20260804064625/https://www.wayfair.com/
- B&Q / diy.com (archived 2026-07-07): https://web.archive.org/web/20260707173608/https://www.diy.com/
- MaterialDistrict — material taxonomy: https://materialdistrict.com/sitemap/
- Divan.ru — category/facet URL inventory: https://www.divan.ru/
- Maxidom (Russia) — full catalogue top level: https://www.maxidom.ru/catalog/

**Sites that could not be read** (HTTP 401/403, geo-block or bot-wall). **No category is attributed to any of these in this document** — they are listed so the gap is explicit rather than silently filled in: lemanapro.ru (ex-leroymerlin.ru), petrovich.ru, obi.ru, hoff.ru, architonic.com, materialbank.com, qurilishmart.uz. Maxidom was substituted as the readable Russian DIY comparator. Houzz, Wayfair, Home Depot, B&Q and Uzum were read via a browser or Wayback captures as noted above.

**On numbers in this document:** every count is either a row count from `backend/database.sqlite` or a listing count rendered by the source site itself on 2026-08-05. No market size, revenue, growth rate or share figure is given anywhere, because none could be verified for these categories in Uzbekistan. Rows marked "**Not verified**" are proposals justified by structure or by international precedent, not by local demand data — treat them accordingly.
