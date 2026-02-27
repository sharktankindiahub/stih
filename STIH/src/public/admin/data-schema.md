# Shark Tank India Hub — Data Schema Reference

This document maps every CSV column to its JavaScript key and explains how the data is transformed. Use this as the contract when splitting the data layer from the HTML.

---

## 1. `PITCHES` array  
One object per pitch (702 total). Each object is a transformed + enriched row from the CSV.

### Identifiers
| JS key | CSV column | Type | Notes |
|--------|-----------|------|-------|
| `id` | `Startup Name` | `string` | Lowercase, spaces stripped. e.g. `"bluepinefoods"` |
| `name` | `Startup Name` | `string` | Original casing |
| `season` | `Season Number` | `number` | `1–5` |
| `ep` | `Episode Number` | `number` | Episode within season |
| `pitch` | `Pitch Number` | `number` | Global pitch number across all seasons |

### Company info
| JS key | CSV column | Type | Notes |
|--------|-----------|------|-------|
| `industry` | `Industry` | `string` | e.g. `"Food and Beverage"` |
| `type` | `Business Description` | `string` | Short product/service description |
| `summary` | `Business Description` | `string` | Same as `type` (used as display summary) |
| `city` | `Pitchers City` | `string` | |
| `state` | `Pitchers State` | `string` | |
| `website` | `Company Website` | `string \| ""` | Full URL. Empty string if not available (~50 pitches) |
| `startedIn` | `Started in` | `string` | Year founded |

### Deal status
| JS key | CSV column | Type | Notes |
|--------|-----------|------|-------|
| `funded` | `Accepted Offer` | `boolean` | `"1"` → `true` |
| `receivedOffer` | `Received Offer` | `boolean` | `"1"` → `true` |
| `dealType` | derived | `"equity" \| "mixed" \| "royalty"` | `"royalty"` if `Royalty Percentage > 0`; `"mixed"` if `Total Deal Debt > 0`; else `"equity"` |

### Ask (original pitch request)
| JS key | CSV column | Type | Notes |
|--------|-----------|------|-------|
| `ask` | derived | `string` | Formatted display string e.g. `"₹50L"` or `"₹1.0Cr"` |
| `askAmt` | `Original Ask Amount` | `number` | In lakhs |
| `askEq` | `Original Offered Equity` | `number` | Percentage |
| `askVal` | `Valuation Requested` | `number` | In crores (computed: `askAmt / askEq / 100 * 100`) |

### Final deal
| JS key | CSV column | Type | Notes |
|--------|-----------|------|-------|
| `deal` | derived | `string \| null` | Formatted e.g. `"₹75L"`. `null` if no deal |
| `dealAmt` | `Total Deal Amount` | `number \| null` | In lakhs |
| `dealEq` | `Total Deal Equity` | `number \| null` | Percentage |
| `dealVal` | `Deal Valuation` | `number \| null` | In crores |
| `finalVal` | `Deal Valuation` | `number \| null` | Same as `dealVal` |
| `deltaVal` | derived | `number \| null` | `((finalVal - askVal) / askVal) * 100` — valuation change % |
| `totalDebt` | `Total Deal Debt` | `number \| null` | In lakhs |
| `debtInterest` | `Debt Interest` | `number \| null` | Interest rate % |
| `royaltyPct` | `Royalty Percentage` | `number \| null` | |
| `hasConditions` | `Deal Has Conditions` | `boolean` | |

### Sharks
| JS key | CSV column | Type | Notes |
|--------|-----------|------|-------|
| `sharks` | derived | `string[]` | Array of shark first names who invested. Guest sharks use full name e.g. `"Ashneer Grover"` |
| `numSharks` | `Number of Sharks in Deal` | `number` | |
| `sharkBreakdown` | derived | `object` | Per-shark amounts. Key = shark first name. See structure below |

#### `sharkBreakdown` structure
```json
{
  "Vineeta": { "amt": 25.0, "eq": 5.33 },
  "Aman":    { "amt": 25.0, "eq": 5.33, "debt": 10.0 }
}
```
- `amt` — investment in lakhs
- `eq`  — equity percentage taken
- `debt` — debt component in lakhs (only present if applicable)
- Core sharks: `Namita`, `Vineeta`, `Anupam`, `Aman`, `Peyush`, `Ritesh`, `Amit`
- Guest sharks: stored under `Invested Guest Name` in CSV. Their amount is in `Guest Investment Amount` / `Guest Investment Equity`. **They do NOT get a key in `sharkBreakdown`** — their contribution is calculated as `dealAmt − sum(core shark amounts)`.

### Presenters
| JS key | CSV column | Type | Notes |
|--------|-----------|------|-------|
| `numPresenters` | `Number of Presenters` | `number` | |
| `malePresenters` | `Male Presenters` | `number` | |
| `femalePresenters` | `Female Presenters` | `number` | |
| `couplePresenters` | `Couple Presenters` | `boolean` | `"1"` → `true` |
| `pitchersAge` | `Pitchers Average Age` | `"Young" \| "Middle" \| "Old"` | |

### Financials (pitcher-reported)
| JS key | CSV column | Type | Notes |
|--------|-----------|------|-------|
| `revenue` | `Yearly Revenue` | `number \| null` | In lakhs |
| `margin` | `Gross Margin` | `number \| null` | Percentage |
| `ebitda` | `EBITDA` | `number \| null` | In lakhs |
| `cashBurn` | `Cash Burn` | `string` | Raw string, often empty |
| `skus` | `SKUs` | `number \| null` | Number of SKUs |
| `hasPatents` | `Has Patents` | `boolean` | |
| `bootstrapped` | `Bootstrapped` | `string` | Raw string |

---

## 2. `SEASON_STATS` array
One object per season (5 total). Pre-aggregated.

```js
{
  season:   1,           // number: 1–5
  year:     "2021–22",   // string: display year
  pitches:  152,         // number: total pitches that season
  funded:   70,          // number: deals closed
  episodes: 37,          // number: episodes aired
  dealRate: 46,          // number: percentage (funded/pitches * 100, rounded)
  invested: 40.2         // number: total invested in crores
}
```

---

## 3. `INDUSTRY_STATS` object
Keys are industry names, values are aggregated stats. 10 industries total.

```js
{
  "Food and Beverage": {
    total:      154,   // number: total pitches
    funded:     90,    // number: deals closed
    dealRate:   58,    // number: percentage
    investedCr: 64.9   // number: total invested in crores
  },
  // ... 9 more industries
}
```

Industry keys used:
- `"Food and Beverage"`
- `"Beauty/Fashion"`
- `"Technology/Software"`
- `"Medical/Health"`
- `"Manufacturing"`
- `"Lifestyle/Home"`
- `"Business Services"`
- `"Children/Education"`
- `"Vehicles/Electrical Vehicles"`
- `"Agriculture"`

---

## 4. Units reference
| Unit | Meaning | Example |
|------|---------|---------|
| Lakhs (L) | ₹ 100,000 | `askAmt: 50` = ₹50L = ₹50,00,000 |
| Crores (Cr) | ₹ 10,000,000 | `invested: 40.2` = ₹40.2Cr |
| Display string | Pre-formatted | `"₹50L"`, `"₹1.0Cr"`, `"₹2.5Cr"` |

---

## 5. Derived / computed fields
These are NOT in the CSV — they are calculated during data transformation:

| Field | Formula |
|-------|---------|
| `id` | `Startup Name.toLowerCase().replace(/\s+/g, '')` |
| `ask` | `askAmt >= 100 ? "₹" + (askAmt/100).toFixed(1) + "Cr" : "₹" + askAmt + "L"` |
| `deal` | Same formula applied to `dealAmt`. `null` if not funded |
| `askVal` | `(askAmt / askEq) / 100` (crores) |
| `deltaVal` | `((finalVal - askVal) / askVal) * 100` |
| `dealType` | `royaltyPct > 0 → "royalty"` / `totalDebt > 0 → "mixed"` / else `"equity"` |
| `sharks` | Array built from `[Namita/Vineeta/.../Amit] Investment Amount > 0` + `Invested Guest Name` |
| `sharkBreakdown` | Object built from per-shark `Investment Amount`, `Investment Equity`, `Debt Amount` columns |
| `funded` | `Accepted Offer === "1"` |

---

## 6. Shark metadata (`SHARK_META`)
Hardcoded in JS — not from CSV. Used for display on the Sharks page.

```js
{
  'Namita':  { full: 'Namita Thapar',       title: 'Executive Director, Emcure Pharma', emoji: '💊', color: '#8B5CF6' },
  'Vineeta': { full: 'Vineeta Singh',        title: 'CEO & Co-founder, SUGAR Cosmetics', emoji: '💄', color: '#EC4899' },
  'Anupam':  { full: 'Anupam Mittal',        title: 'Founder & CEO, Shaadi.com',         emoji: '💍', color: '#3B82F6' },
  'Aman':    { full: 'Aman Gupta',           title: 'Co-founder & CMO, boAt',            emoji: '🎧', color: '#F97316' },
  'Peyush':  { full: 'Peyush Bansal',        title: 'Co-founder & CEO, Lenskart',        emoji: '👓', color: '#10B981' },
  'Ritesh':  { full: 'Ritesh Agarwal',       title: 'Founder & CEO, OYO Rooms',          emoji: '🏨', color: '#F59E0B' },
  'Amit':    { full: 'Amit Jain',            title: 'Co-founder & CEO, CarDekho',        emoji: '🚗', color: '#6366F1' },
  'Ashneer': { full: 'Ashneer Grover',       title: 'Co-founder, BharatPe (S1–S2)',      emoji: '💸', color: '#EF4444' }
}
```

---

## 7. Splitting data from HTML — recommended approach

When separating, export `PITCHES`, `SEASON_STATS`, and `INDUSTRY_STATS` to a `data.js` file and load it before your main script:

```html
<script src="data.js"></script>   <!-- const PITCHES = [...]; const SEASON_STATS = [...]; etc. -->
<script src="app.js"></script>    <!-- all functions that reference the above -->
```

Or as JSON if you prefer a fetch-based approach:
```js
fetch('pitches.json')
  .then(r => r.json())
  .then(data => { window.PITCHES = data; init(); });
```

The `SHARK_META` object and all helper functions (`faviconUrl`, `websiteChip`, etc.) stay in `app.js`.
