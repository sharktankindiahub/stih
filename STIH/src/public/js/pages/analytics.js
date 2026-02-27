// ═══════════════════════════════════════════════════════════════
// Analytics Page — Professional Finance Dashboard
// ═══════════════════════════════════════════════════════════════

const analyticsPage = {
  _season: 'all',
  _allPitches: [],
  _globalAnalytics: null,

  // ─── Shark branding colours ────────────────────────────────
  _sharkColors: {
    'Aman':           '#F97316',
    'Namita':         '#A855F7',
    'Anupam':         '#3B82F6',
    'Peyush':         '#10B981',
    'Vineeta':        '#EC4899',
    'Ritesh':         '#F59E0B',
    'Amit':           '#6366F1',
    'Ashneer':        '#EF4444',
    'Ashneer Grover': '#EF4444',
    'Kunal Bahl':     '#06B6D4',
  },

  // ─── Industry icon map ──────────────────────────────────────
  _industryIcons: {
    // Exact names from data
    'Food and Beverage':           '🍽️',
    'Beauty/Fashion':              '💄',
    'Technology/Software':         '💻',
    'Medical/Health':              '🏥',
    'Children/Education':          '📚',
    'Fitness/Sports/Outdoors':     '🏋️',
    'Lifestyle/Home':              '🏠',
    'Agriculture':                 '🌾',
    'Manufacturing':               '🏭',
    'Electronics':                 '⚡',
    'Business Services':           '💼',
    'Entertainment':               '🎬',
    'Green/CleanTech':             '♻️',
    'Vehicles/Electrical Vehicles':'🚗',
    'Hardware':                    '🔧',
    'Animal/Pets':                 '🐾',
    'Liquor/Alcohol':              '🍷',
    'Others':                      '📦',
    // Longer one-off names
    'Ayurvedic Kids makeup brand':       '🌿',
    'Calisthenics training institute':   '💪',
    'Cannibis wellness brand':           '🌱',
    'Digital fasade company':            '🏢',
    'Gyrocopter and aircraft company':   '✈️',
    'Handcrafted jewelry and bangles':   '💍',
    'Motion based driving platform':     '🚀',
    'Pre-fabricated construction company':'🏗️',
    'Smart wellness tracking ring':      '⌚',
    'Wet waste to soil converter':       '🌍',
  },

  _indIcon(name) {
    if (this._industryIcons[name]) return this._industryIcons[name];
    // Fuzzy fallback: keyword scan
    const n = (name || '').toLowerCase();
    if (n.includes('food') || n.includes('beverage') || n.includes('drink')) return '🍽️';
    if (n.includes('beauty') || n.includes('fashion') || n.includes('cosmetic')) return '💄';
    if (n.includes('tech') || n.includes('software') || n.includes('saas') || n.includes('digital')) return '💻';
    if (n.includes('health') || n.includes('medical') || n.includes('pharma') || n.includes('wellness')) return '🏥';
    if (n.includes('edu') || n.includes('learning') || n.includes('child') || n.includes('kid')) return '📚';
    if (n.includes('fit') || n.includes('sport') || n.includes('gym') || n.includes('outdoor')) return '🏋️';
    if (n.includes('home') || n.includes('lifestyle') || n.includes('decor') || n.includes('interior')) return '🏠';
    if (n.includes('agri') || n.includes('farm') || n.includes('food')) return '🌾';
    if (n.includes('manufactur') || n.includes('factory') || n.includes('production')) return '🏭';
    if (n.includes('electric') || n.includes('electron')) return '⚡';
    if (n.includes('business') || n.includes('service') || n.includes('consult')) return '💼';
    if (n.includes('entertain') || n.includes('media') || n.includes('film') || n.includes('music')) return '🎬';
    if (n.includes('green') || n.includes('clean') || n.includes('sustain') || n.includes('eco')) return '♻️';
    if (n.includes('vehicle') || n.includes('auto') || n.includes('car') || n.includes('ev')) return '🚗';
    if (n.includes('hardware')) return '🔧';
    if (n.includes('pet') || n.includes('animal')) return '🐾';
    if (n.includes('liquor') || n.includes('alcohol') || n.includes('beer') || n.includes('wine')) return '🍷';
    if (n.includes('jewel') || n.includes('accessories')) return '💍';
    if (n.includes('construct') || n.includes('real estate') || n.includes('infrastructure')) return '🏗️';
    if (n.includes('finance') || n.includes('fintech') || n.includes('payment')) return '💳';
    return '📦';
  },

  _fmt(lakhs) {
    if (!lakhs) return '—';
    const cr = lakhs / 100;
    return cr >= 1 ? `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)}Cr` : `₹${Math.round(lakhs)}L`;
  },

  _fmtCr(cr) {
    if (cr === null || cr === undefined) return '—';
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)}Cr`;
  },

  // ─── Entry ─────────────────────────────────────────────────
  async init() {
    const container = document.getElementById('page-analytics');
    if (!container) return;

    container.innerHTML = `
      <div class="container section" style="padding-top:24px">
        <div class="an-loading">
          <div class="an-spinner"></div>
          <span style="color:var(--muted);font-size:14px;margin-top:12px">Loading analytics…</span>
        </div>
      </div>`;

    try {
      const [analytics, pitches] = await Promise.all([
        api.getAnalytics(),
        api.getPitches(),
      ]);
      this._globalAnalytics = analytics;
      this._allPitches = pitches;
      this._renderShell(container);
      this._update('all');
    } catch (err) {
      console.error('Analytics error:', err);
      container.innerHTML = `<div class="container section"><p class="muted">Failed to load analytics data.</p></div>`;
    }
  },

  // ─── Shell (static structure) ───────────────────────────────
  _renderShell(container) {
    const totalSeasons = this._globalAnalytics?.seasons?.length || 5;
    const seasonOpts = Array.from({ length: totalSeasons }, (_, i) => {
      const sNum = i + 1;
      const sData = this._globalAnalytics?.seasons?.find(s => s.number === sNum);
      const yr = sData && sData.year ? ` · ${sData.year}` : '';
      return `<option value="${sNum}">Season ${sNum}${yr}</option>`;
    }).join('');

    container.innerHTML = `
      <!-- PAGE HEADER -->
      <div class="an-header container">
        <div>
          <div class="an-eyebrow">📊 Investment Intelligence</div>
          <h1 class="an-title">ANALYTICS <span class="an-title-accent">&amp; INSIGHTS</span></h1>
          <div class="an-subtitle" id="an-subtitle">Aggregate data across all 5 Shark Tank India seasons</div>
        </div>
        <div class="an-controls">
          <label class="an-select-wrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--muted)"><polyline points="6 9 12 15 18 9"/></svg>
            <select id="season-select" class="an-select">
              <option value="all">All Seasons</option>
              ${seasonOpts}
            </select>
          </label>
          <div class="an-updated" id="an-pitch-count">702 pitches total</div>
        </div>
      </div>

      <!-- KPI ROW -->
      <div class="container" style="margin-top:8px">
        <div class="an-kpi-grid" id="an-kpi-grid"></div>
      </div>

      <!-- ROW 1: Season Bars + Deal Structure -->
      <div class="container" style="margin-top:18px">
        <div class="an-row-main">
          <div class="an-card an-card--wide">
            <div class="an-card-head">
              <div class="an-card-title">SEASON COMPARISON</div>
              <div class="an-card-sub" id="season-chart-sub">Pitches vs deals · Gold = ₹ invested</div>
            </div>
            <div style="position:relative;height:200px;margin-top:12px"><canvas id="chartSeasons"></canvas></div>
          </div>
          <div class="an-card an-card--narrow">
            <div class="an-card-head">
              <div class="an-card-title">DEAL STRUCTURE</div>
              <div class="an-card-sub">Equity · Mixed (Debt+Eq) · Royalty</div>
            </div>
            <div style="position:relative;height:170px;margin-top:8px"><canvas id="chartDealTypes"></canvas></div>
            <div id="deal-type-legend" class="an-legend" style="margin-top:10px"></div>
          </div>
        </div>
      </div>

      <!-- ROW 2: Shark Activity + Sector Deal Rate -->
      <div class="container" style="margin-top:18px">
        <div class="an-row-equal">
          <div class="an-card">
            <div class="an-card-head">
              <div class="an-card-title">SHARK ACTIVITY</div>
              <div class="an-card-sub">Deals closed per investor</div>
            </div>
            <div style="position:relative;height:230px;margin-top:12px"><canvas id="chartSharks"></canvas></div>
          </div>
          <div class="an-card">
            <div class="an-card-head">
              <div class="an-card-title">SECTOR DEAL RATE</div>
              <div class="an-card-sub">% of pitches funded by industry</div>
            </div>
            <div id="sector-rate-bars" style="margin-top:14px"></div>
          </div>
        </div>
      </div>

      <!-- INDUSTRY TABLE -->
      <div class="container" style="margin-top:18px;padding-bottom:60px">
        <div class="an-card">
          <div class="an-card-head" style="margin-bottom:16px">
            <div class="an-card-title">INDUSTRY BREAKDOWN</div>
            <div class="an-card-sub">All sectors — deal rate, funded count, and total capital deployed</div>
          </div>
          <div class="table-wrap">
            <table class="an-table">
              <thead>
                <tr>
                  <th>INDUSTRY</th>
                  <th class="text-right">PITCHES</th>
                  <th class="text-right">FUNDED</th>
                  <th style="min-width:180px">DEAL RATE</th>
                  <th class="text-right">CAPITAL DEPLOYED</th>
                </tr>
              </thead>
              <tbody id="industry-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('season-select').addEventListener('change', (e) => {
      this._season = e.target.value;
      this._update(e.target.value);
    });
  },

  // ─── Compute data for season filter ────────────────────────
  _computeData(season) {
    const pitches = season === 'all'
      ? this._allPitches
      : this._allPitches.filter(p => p.season === parseInt(season));

    const funded  = pitches.filter(p => p.funded === true || p.funded === 'true');
    const total   = pitches.length;
    const deals   = funded.length;
    const rate    = total > 0 ? Math.round((deals / total) * 100) : 0;
    const invL    = funded.reduce((s, p) => s + (p.dealAmt || 0), 0);
    const invCr   = invL / 100;
    const avgL    = deals > 0 ? invL / deals : 0;
    const maxL    = funded.length ? Math.max(...funded.map(p => p.dealAmt || 0)) : 0;

    const equity  = funded.filter(p => p.dealType === 'equity').length;
    const mixed   = funded.filter(p => p.dealType === 'mixed').length;
    const royalty = funded.filter(p => p.dealType === 'royalty').length;

    // Shark activity
    const sharkMap = {};
    pitches.forEach(p => (p.sharks || []).forEach(sh => { sharkMap[sh] = (sharkMap[sh] || 0) + 1; }));
    const sharkOrder = ['Aman','Namita','Anupam','Peyush','Vineeta','Ritesh','Amit','Kunal Bahl','Ashneer','Ashneer Grover'];
    const sharks = Object.entries(sharkMap)
      .filter(([n]) => sharkOrder.includes(n))
      .sort((a, b) => b[1] - a[1]);

    // Industry breakdown
    const iMap = {};
    pitches.forEach(p => {
      const ind = p.industry || p.type || 'Other';
      if (!iMap[ind]) iMap[ind] = { total: 0, funded: 0, invL: 0 };
      iMap[ind].total++;
      if (p.funded === true || p.funded === 'true') {
        iMap[ind].funded++;
        iMap[ind].invL += (p.dealAmt || 0);
      }
    });
    const industries = Object.entries(iMap)
      .map(([name, d]) => ({
        name,
        total:      d.total,
        funded:     d.funded,
        rate:       Math.round((d.funded / d.total) * 100),
        investedCr: d.invL / 100,
      }))
      .sort((a, b) => b.total - a.total);

    // Previous season delta
    let prevKpi = null;
    if (season !== 'all') {
      const prev = parseInt(season) - 1;
      if (prev >= 1) {
        const pp = this._allPitches.filter(p => p.season === prev);
        const pf = pp.filter(p => p.funded === true || p.funded === 'true');
        prevKpi = {
          total: pp.length,
          deals: pf.length,
          rate:  pp.length ? Math.round(pf.length / pp.length * 100) : 0,
          invCr: pf.reduce((s, p) => s + (p.dealAmt || 0), 0) / 100,
        };
      }
    }

    return {
      kpi: { total, deals, rate, invCr, avgL, maxL },
      dealTypes: { equity, mixed, royalty },
      sharks,
      industries,
      seasonBars: this._globalAnalytics?.charts?.seasons,
      selSeason: season === 'all' ? null : parseInt(season),
      prevKpi,
    };
  },

  // ─── Master update ─────────────────────────────────────────
  _update(season) {
    const data = this._computeData(season);

    // Subtitle
    const sub = document.getElementById('an-subtitle');
    if (sub) {
      if (season === 'all') {
        sub.textContent = 'Aggregate data across all 5 Shark Tank India seasons';
      } else {
        const sd = this._globalAnalytics?.seasons?.find(s => s.number === parseInt(season));
        sub.textContent = sd
          ? `Season ${season}${sd.year ? ' · ' + sd.year : ''} · ${data.kpi.total} pitches`
          : `Season ${season} · ${data.kpi.total} pitches`;
      }
    }

    // Pitch count
    const pc = document.getElementById('an-pitch-count');
    if (pc) pc.textContent = `${data.kpi.total} pitches · ${data.kpi.deals} deals`;

    this._updateKPIs(data);
    this._updateSeasonChart(data);
    this._updateDealTypesChart(data);
    this._updateSharkChart(data);
    this._updateSectorRateBars(data);
    this._updateIndustryTable(data);
  },

  // ─── KPI row ───────────────────────────────────────────────
  _updateKPIs(data) {
    const { kpi, prevKpi } = data;

    const delta = (cur, prev) => {
      if (!prevKpi || prev === undefined || prev === null) return '';
      const d   = cur - prev;
      const pct = prev > 0 ? Math.round(Math.abs(d / prev) * 100) : 0;
      if (d === 0) return `<span class="an-delta an-delta--flat">→ unchanged</span>`;
      return d > 0
        ? `<span class="an-delta an-delta--up">↑ ${pct}% vs S${parseInt(this._season)-1}</span>`
        : `<span class="an-delta an-delta--down">↓ ${pct}% vs S${parseInt(this._season)-1}</span>`;
    };

    const tiles = [
      { label:'TOTAL PITCHES',  value: kpi.total.toLocaleString(),    sub: delta(kpi.total, prevKpi?.total),    color:'var(--heading)', icon:'📋' },
      { label:'DEALS CLOSED',   value: kpi.deals.toLocaleString(),    sub: delta(kpi.deals, prevKpi?.deals),    color:'var(--green)',   icon:'🤝' },
      { label:'DEAL RATE',      value: `${kpi.rate}%`,                sub: delta(kpi.rate,  prevKpi?.rate),     color: kpi.rate >= 60 ? 'var(--green)' : kpi.rate >= 45 ? 'var(--gold)' : 'var(--red)', icon:'📈' },
      { label:'TOTAL INVESTED', value: this._fmtCr(kpi.invCr),       sub: delta(kpi.invCr, prevKpi?.invCr),   color:'var(--gold)',    icon:'💰' },
      { label:'AVG DEAL SIZE',  value: this._fmt(kpi.avgL),           sub: '',                                  color:'#60A5FA',        icon:'📊' },
      { label:'LARGEST DEAL',   value: this._fmt(kpi.maxL),           sub: '',                                  color:'#F472B6',        icon:'🏆' },
    ];

    const grid = document.getElementById('an-kpi-grid');
    if (!grid) return;
    grid.innerHTML = tiles.map(t => `
      <div class="an-kpi">
        <div class="an-kpi-icon">${t.icon}</div>
        <div class="an-kpi-label">${t.label}</div>
        <div class="an-kpi-value" style="color:${t.color}">${t.value}</div>
        <div class="an-kpi-delta">${t.sub || '&nbsp;'}</div>
      </div>`).join('');
  },

  // ─── Season chart (bar + line) ──────────────────────────────
  _updateSeasonChart(data) {
    const { seasonBars, selSeason } = data;
    const ctx = document.getElementById('chartSeasons');
    if (!ctx || !seasonBars) return;
    if (charts.instances['chartSeasons']) charts.instances['chartSeasons'].destroy();

    const pitchBg = (seasonBars.labels || []).map((_, i) =>
      selSeason && (i + 1) !== selSeason ? 'rgba(232,25,44,0.22)' : 'rgba(232,25,44,0.75)');
    const dealBg = (seasonBars.labels || []).map((_, i) =>
      selSeason && (i + 1) !== selSeason ? 'rgba(34,197,94,0.22)' : 'rgba(34,197,94,0.8)');

    charts.instances['chartSeasons'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: seasonBars.labels,
        datasets: [
          { label:'Pitches',        data: seasonBars.pitches,  backgroundColor: pitchBg, borderRadius:5, borderSkipped:false, yAxisID:'y',  order:2 },
          { label:'Deals',          data: seasonBars.deals,    backgroundColor: dealBg,  borderRadius:5, borderSkipped:false, yAxisID:'y',  order:2 },
          { label:'₹ Invested (Cr)',data: seasonBars.invested,
            type:'line', yAxisID:'y2',
            borderColor:'rgba(245,197,24,0.9)', backgroundColor:'rgba(245,197,24,0.07)',
            fill:true, tension:0.35,
            pointBackgroundColor:'#F5C518', pointBorderColor:'#fff', pointRadius:4,
            borderWidth:2, order:1 },
        ],
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins: {
          legend: { labels: { color:'rgba(255,255,255,0.5)', font:{size:11}, boxWidth:10, padding:14 } },
          tooltip: {
            backgroundColor:'rgba(8,8,20,0.95)', borderColor:'rgba(255,255,255,0.1)', borderWidth:1,
            titleColor:'#fff', bodyColor:'rgba(255,255,255,0.7)',
            callbacks: { label: c => c.dataset.label === '₹ Invested (Cr)' ? ` ₹${c.parsed.y}Cr` : ` ${c.parsed.y} ${c.dataset.label}` },
          },
        },
        scales: {
          y:  { beginAtZero:true, position:'left',  ticks:{color:'rgba(255,255,255,0.35)',font:{size:10}}, grid:{color:'rgba(255,255,255,0.05)'} },
          y2: { beginAtZero:true, position:'right', ticks:{color:'rgba(245,197,24,0.55)',font:{size:10},callback:v=>`₹${v}Cr`}, grid:{display:false} },
          x:  { ticks:{color:'rgba(255,255,255,0.55)',font:{size:11}}, grid:{display:false} },
        },
      },
    });
    const sub = document.getElementById('season-chart-sub');
    if (sub) sub.textContent = selSeason ? `Season ${selSeason} highlighted · gold line = ₹ invested` : 'Pitches vs deals · Gold line = ₹ invested per season';
  },

  // ─── Deal types doughnut ────────────────────────────────────
  _updateDealTypesChart(data) {
    const { dealTypes } = data;
    const ctx = document.getElementById('chartDealTypes');
    if (!ctx) return;
    if (charts.instances['chartDealTypes']) charts.instances['chartDealTypes'].destroy();

    const labels = ['Equity Only','Mixed (Eq+Debt)','Royalty'];
    const values = [dealTypes.equity, dealTypes.mixed, dealTypes.royalty];
    const clrs   = ['#E8192C','#3B82F6','#F5C518'];

    charts.instances['chartDealTypes'] = new Chart(ctx, {
      type:'doughnut',
      data: { labels, datasets: [{ data:values, backgroundColor:clrs.map(c=>c+'cc'), borderColor:clrs, borderWidth:2, hoverOffset:4 }] },
      options: {
        responsive:true, maintainAspectRatio:false, cutout:'65%',
        plugins: {
          legend: { display:false },
          tooltip: {
            backgroundColor:'rgba(8,8,20,0.95)', borderColor:'rgba(255,255,255,0.1)', borderWidth:1,
            titleColor:'#fff', bodyColor:'rgba(255,255,255,0.7)',
            callbacks: { label: c => { const t = c.dataset.data.reduce((a,b)=>a+b,0); return ` ${c.parsed} deals (${t>0?Math.round(c.parsed/t*100):0}%)`; } },
          },
        },
      },
    });

    const leg = document.getElementById('deal-type-legend');
    if (leg) {
      const total = values.reduce((a,b)=>a+b,0);
      leg.innerHTML = labels.map((lbl,i) => `
        <div class="an-legend-item">
          <span class="an-legend-dot" style="background:${clrs[i]}"></span>
          <span class="an-legend-lbl">${lbl}</span>
          <span class="an-legend-val">${values[i]}<span class="an-legend-pct"> ${total>0?Math.round(values[i]/total*100):0}%</span></span>
        </div>`).join('');
    }
  },

  // ─── Shark horizontal bars ──────────────────────────────────
  _updateSharkChart(data) {
    const { sharks } = data;
    const ctx = document.getElementById('chartSharks');
    if (!ctx) return;
    if (charts.instances['chartSharks']) charts.instances['chartSharks'].destroy();

    const clrs = sharks.map(([n]) => this._sharkColors[n] || '#6b6b8f');
    charts.instances['chartSharks'] = new Chart(ctx, {
      type:'bar',
      data: { labels: sharks.map(([n])=>n), datasets: [{
        label:'Deals', data: sharks.map(([,v])=>v),
        backgroundColor: clrs.map(c=>c+'aa'), borderColor: clrs, borderWidth:1.5,
        borderRadius:5, borderSkipped:false,
      }]},
      options: {
        indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins: {
          legend: { display:false },
          tooltip: {
            backgroundColor:'rgba(8,8,20,0.95)', borderColor:'rgba(255,255,255,0.1)', borderWidth:1,
            titleColor:'#fff', bodyColor:'rgba(255,255,255,0.7)',
            callbacks: { label: c => ` ${c.parsed.x} deals` },
          },
        },
        scales: {
          x: { beginAtZero:true, ticks:{color:'rgba(255,255,255,0.35)',font:{size:10}}, grid:{color:'rgba(255,255,255,0.05)'} },
          y: { ticks:{color:'rgba(255,255,255,0.75)',font:{size:12,weight:'600'}}, grid:{display:false} },
        },
      },
    });
  },

  // ─── Sector rate inline bars ────────────────────────────────
  _updateSectorRateBars(data) {
    const el = document.getElementById('sector-rate-bars');
    if (!el) return;
    const top = data.industries.slice(0, 9);
    el.innerHTML = top.map(d => {
      const c = d.rate >= 65 ? '#22C55E' : d.rate >= 50 ? '#F5C518' : d.rate >= 35 ? '#F97316' : '#EF4444';
      const icon = this._indIcon(d.name);
      return `
        <div class="an-sector-row">
          <div class="an-sector-name"><span style="margin-right:5px">${icon}</span>${d.name}</div>
          <div class="an-sector-bar-wrap">
            <div class="an-sector-bar" style="width:${d.rate}%;background:${c}22;border-left:2.5px solid ${c}"></div>
          </div>
          <div class="an-sector-rate" style="color:${c}">${d.rate}%</div>
          <div class="an-sector-count">${d.funded}/${d.total}</div>
        </div>`;
    }).join('');
  },

  // ─── Industry breakdown table ───────────────────────────────
  _updateIndustryTable(data) {
    const tbody = document.getElementById('industry-tbody');
    if (!tbody) return;
    tbody.innerHTML = data.industries.map((d, i) => {
      const c    = d.rate >= 65 ? '#22C55E' : d.rate >= 50 ? '#F5C518' : d.rate >= 35 ? '#F97316' : '#EF4444';
      const bg   = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent';
      const icon = this._indIcon(d.name);
      return `
        <tr style="background:${bg}" onmouseenter="this.style.background='rgba(232,25,44,0.07)'" onmouseleave="this.style.background='${bg}'">
          <td style="font-weight:600;color:#fff"><span style="margin-right:8px;font-size:15px">${icon}</span>${d.name}</td>
          <td class="text-right" style="color:rgba(255,255,255,0.5)">${d.total}</td>
          <td class="text-right" style="color:var(--green);font-weight:600">${d.funded}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;height:4px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden">
                <div style="height:100%;width:${d.rate}%;background:${c};border-radius:2px;transition:width 0.5s ease"></div>
              </div>
              <span style="font-size:12px;font-weight:700;color:${c};min-width:34px;text-align:right">${d.rate}%</span>
            </div>
          </td>
          <td class="text-right" style="color:var(--gold);font-weight:600">${d.investedCr > 0 ? this._fmtCr(d.investedCr) : '<span style=color:rgba(255,255,255,0.25)>—</span>'}</td>
        </tr>`;
    }).join('');
  },
};
