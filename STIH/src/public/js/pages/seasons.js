// ═══════════════════════════════════════════════════════════════
// Seasons Page — All Pitches Browser
// ═══════════════════════════════════════════════════════════════

const seasonsPage = {
  _pitches: null,
  _filters: { season: 'all', industry: 'all', deal: 'all' },
  _sort: { col: null, dir: 'asc' },
  _detailPitches: null,
  _detailSort: { col: 'ep', dir: 'asc' },
  _initialized: false,

  async init() {
    const container = document.getElementById('page-seasons');
    if (!container) return;

    if (!this._initialized) {
      container.innerHTML = `
        <div class="container section">
          <div class="sec-header" style="margin-bottom:24px">
            <div>
              <div class="display" style="font-size:48px">ALL PITCHES</div>
              <div class="muted" style="margin-top:4px">Browse every startup from Shark Tank India</div>
            </div>
          </div>

          <!-- Search -->
          <div style="margin-bottom:16px;position:relative">
            <input type="text" id="pitch-search"
              placeholder="Search startups, industry, city, description…"
              oninput="seasonsPage._render()"
              style="width:100%;padding:10px 16px 10px 40px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:14px;font-family:'DM Sans',sans-serif;box-sizing:border-box" />
            <span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none">🔍</span>
          </div>

          <!-- Filters -->
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:20px">
            <div class="chips" id="season-filter">
              <div class="chip active"   onclick="seasonsPage._setFilter('season','all',this)">All Seasons</div>
              <div class="chip" onclick="seasonsPage._setFilter('season',1,this)">S1 2022</div>
              <div class="chip" onclick="seasonsPage._setFilter('season',2,this)">S2 2023</div>
              <div class="chip" onclick="seasonsPage._setFilter('season',3,this)">S3 2024</div>
              <div class="chip" onclick="seasonsPage._setFilter('season',4,this)">S4 2025</div>
              <div class="chip" onclick="seasonsPage._setFilter('season',5,this)">S5 2026</div>
            </div>
            <div class="chips" id="industry-filter">
              <div class="chip active" onclick="seasonsPage._setFilter('industry','all',this)">All Industries</div>
              <div class="chip" onclick="seasonsPage._setFilter('industry','Food and Beverage',this)">Food &amp; Bev</div>
              <div class="chip" onclick="seasonsPage._setFilter('industry','Children/Education',this)">EdTech</div>
              <div class="chip" onclick="seasonsPage._setFilter('industry','Beauty/Fashion',this)">Beauty</div>
              <div class="chip" onclick="seasonsPage._setFilter('industry','Animal/Pets',this)">Pets</div>
            </div>
            <div class="chips" id="deal-filter">
              <div class="chip active" onclick="seasonsPage._setFilter('deal','all',this)">All</div>
              <div class="chip" onclick="seasonsPage._setFilter('deal','funded',this)">✓ Funded</div>
              <div class="chip" onclick="seasonsPage._setFilter('deal','nodeal',this)">✗ No Deal</div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-wrap" style="background:rgba(8,8,12,0.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
            <table>
              <thead>
                <tr style="background:rgba(20,20,28,0.97)">
                  <th onclick="seasonsPage._setSort('ep')" style="background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;user-select:none;white-space:nowrap">S/EP <span id="sort-ep" style="font-size:10px">↕</span></th>
                  <th style="background:transparent;color:rgba(255,255,255,0.5)">STARTUP</th>
                  <th style="background:transparent;color:rgba(255,255,255,0.5)">INDUSTRY</th>
                  <th onclick="seasonsPage._setSort('ask')" style="background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;user-select:none;white-space:nowrap">ASK <span id="sort-ask" style="font-size:10px">↕</span></th>
                  <th onclick="seasonsPage._setSort('deal')" style="background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;user-select:none;white-space:nowrap">FINAL DEAL <span id="sort-deal" style="font-size:10px">↕</span></th>
                  <th style="background:transparent;color:rgba(255,255,255,0.5)">SHARKS</th>
                  <th style="background:transparent;color:rgba(255,255,255,0.5)">STATUS</th>
                </tr>
              </thead>
              <tbody id="pitches-tbody"><tr><td colspan="7" style="text-align:center;padding:40px;color:rgba(255,255,255,0.4)">Loading…</td></tr></tbody>
            </table>
          </div>
          <div id="pitch-count" class="muted" style="font-size:12px;margin-top:10px"></div>
        </div>`;
      this._initialized = true;
    }

    if (!this._pitches) {
      try {
        this._pitches = await api.getPitches();
      } catch (e) {
        document.getElementById('pitches-tbody').innerHTML =
          '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">Failed to load pitches</td></tr>';
        return;
      }
    }
    this._render();
  },

  _setFilter(key, val, el) {
    this._filters[key] = val;
    el.closest('.chips').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    this._render();
  },

  _setSort(col) {
    if (this._sort.col === col) {
      this._sort.dir = this._sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      this._sort.col = col;
      this._sort.dir = 'asc';
    }
    this._render();
  },

  _setDetailSort(col) {
    if (this._detailSort.col === col) {
      this._detailSort.dir = this._detailSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      this._detailSort.col = col;
      this._detailSort.dir = 'asc';
    }
    this._renderDetail();
  },

  _renderDetail() {
    const tbody = document.getElementById('detail-tbody');
    if (!tbody || !this._detailPitches) return;
    const { col, dir } = this._detailSort;
    const mult = dir === 'asc' ? 1 : -1;
    const sorted = [...this._detailPitches].sort((a, b) => {
      if (col === 'ep')   return mult * (a.ep - b.ep);
      if (col === 'ask')  return mult * ((a.askVal || 0) - (b.askVal || 0));
      if (col === 'deal') return mult * ((a.dealVal || 0) - (b.dealVal || 0));
      return 0;
    });
    ['ep','ask','deal'].forEach(c => {
      const el = document.getElementById('detail-sort-' + c);
      if (el) el.textContent = col === c ? (dir === 'asc' ? '↑' : '↓') : '↕';
    });
    tbody.innerHTML = sorted.map((p, i) => {
      const rowBg = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent';
      return `<tr onclick="app.showPitch('${p.id}')" style="cursor:pointer;background:${rowBg};border-bottom:1px solid rgba(255,255,255,0.06)" onmouseenter="this.style.background='rgba(232,25,44,0.07)'" onmouseleave="this.style.background='${rowBg}'">
        <td class="mono" style="font-size:12px;color:rgba(255,255,255,0.4);white-space:nowrap">E${p.ep}</td>
        <td>
          <div style="display:flex;align-items:center;gap:7px;font-weight:700;color:#ffffff;font-size:14px;line-height:1.2">${p.website ? `<img src="https://www.google.com/s2/favicons?domain=${p.website.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}&sz=32" width="16" height="16" style="border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">` : ''}${p.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.38);margin-top:2px">${p.type || ''}</div>
        </td>
        <td><span class="badge badge-industry">${p.industry}</span></td>
        <td class="mono" style="font-size:12px;color:rgba(255,255,255,0.55)">${p.ask || '—'} / ${p.askEq || '—'}%</td>
        <td class="mono" style="font-size:13px;font-weight:600;color:${p.funded ? '#22c55e' : 'rgba(255,255,255,0.3)'}">
          ${p.funded ? (p.deal || '—') + ' / ' + (p.dealEq || '—') + '%' : '—'}
        </td>
        <td style="font-size:12px;color:rgba(255,255,255,0.6)">${(p.sharks || []).join(', ') || '—'}</td>
        <td>${p.funded ? '<span class="badge badge-funded">✓ Funded</span>' : '<span class="badge badge-nodeal">✗ No Deal</span>'}</td>
      </tr>`;
    }).join('');
  },

  _render() {
    if (!this._pitches) return;
    const q = (document.getElementById('pitch-search')?.value || '').toLowerCase().trim();
    const { season, industry, deal } = this._filters;

    const filtered = this._pitches.filter(p => {
      if (season !== 'all' && p.season !== Number(season)) return false;
      if (industry !== 'all' && p.industry !== industry) return false;
      if (deal === 'funded' && !p.funded) return false;
      if (deal === 'nodeal' && p.funded) return false;
      if (q) {
        const hay = [p.name, p.industry, p.type, p.city, p.state, ...(p.sharks || [])].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    // Apply sort
    const { col, dir } = this._sort;
    if (col) {
      const mult = dir === 'asc' ? 1 : -1;
      filtered.sort((a, b) => {
        if (col === 'ep')   return mult * ((a.season * 1000 + a.ep) - (b.season * 1000 + b.ep));
        if (col === 'ask')  return mult * ((a.askVal || 0) - (b.askVal || 0));
        if (col === 'deal') return mult * ((a.dealVal || 0) - (b.dealVal || 0));
        return 0;
      });
    }
    ['ep','ask','deal'].forEach(c => {
      const el = document.getElementById('sort-' + c);
      if (el) el.textContent = col === c ? (dir === 'asc' ? '↑' : '↓') : '↕';
    });

    const tbody = document.getElementById('pitches-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">No pitches match your filters</td></tr>';
    } else {
      tbody.innerHTML = filtered.map((p, i) => {
        const isLive = p.season === 5;
        const rowBg = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent';
        return `<tr onclick="app.showPitch('${p.id}')" style="cursor:pointer;background:${rowBg};border-bottom:1px solid rgba(255,255,255,0.06)" onmouseenter="this.style.background='rgba(232,25,44,0.07)'" onmouseleave="this.style.background='${rowBg}'">
          <td class="mono" style="font-size:12px;color:rgba(255,255,255,0.4);white-space:nowrap">S${p.season}&nbsp;E${p.ep}${isLive ? ' 🟡' : ''}</td>
          <td>
            <div style="display:flex;align-items:center;gap:7px;font-weight:700;color:#ffffff;font-size:14px;line-height:1.2">${p.website ? `<img src="https://www.google.com/s2/favicons?domain=${p.website.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}&sz=32" width="16" height="16" style="border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">` : ''}${p.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.38);margin-top:2px">${p.type || ''}</div>
          </td>
          <td><span class="badge badge-industry">${p.industry}</span></td>
          <td class="mono" style="font-size:12px;color:rgba(255,255,255,0.55)">${p.ask || '—'} / ${p.askEq || '—'}%</td>
          <td class="mono" style="font-size:13px;font-weight:600;color:${p.funded ? '#22c55e' : 'rgba(255,255,255,0.3)'}">
            ${p.funded ? (p.deal || '—') + ' / ' + (p.dealEq || '—') + '%' : '—'}
          </td>
          <td style="font-size:12px;color:rgba(255,255,255,0.6)">${(p.sharks || []).join(', ') || '—'}</td>
          <td>${p.funded ? '<span class="badge badge-funded">✓ Funded</span>' : '<span class="badge badge-nodeal">✗ No Deal</span>'}</td>
        </tr>`;
      }).join('');
    }

    const countEl = document.getElementById('pitch-count');
    if (countEl) countEl.textContent = `Showing ${filtered.length} of ${this._pitches.length} pitches${q ? ` matching "${q}"` : ''}`;
  },

  async showSeasonDetail(seasonNum) {
    const container = document.getElementById('page-season-detail');
    if (!container) return;
    container.innerHTML = '<div class="container section"><p class="muted" style="text-align:center;padding:60px 0">Loading…</p></div>';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    container.classList.add('active');
    window.scrollTo(0, 0);
    history.pushState(null, '', '#season/' + seasonNum);

    try {
      const allPitches = this._pitches || await api.getPitches();
      if (!this._pitches) this._pitches = allPitches;
      const seasons = await api.getSeasons();
      const pitches = allPitches.filter(p => p.season === Number(seasonNum));
      const deals = pitches.filter(p => p.funded);
      const seasonMeta = seasons.find(s => s.number === Number(seasonNum)) || {};
      const investedCr = deals.reduce((sum, p) => sum + (p.dealVal || 0), 0);
      const dealRate = pitches.length ? Math.round((deals.length / pitches.length) * 100) : 0;

      this._detailPitches = pitches;
      this._detailSort = { col: 'ep', dir: 'asc' };

      container.innerHTML = `
        <div class="container section">
          <div style="margin-bottom:8px"><span class="muted" style="cursor:pointer;font-size:13px" onclick="app.showPage('seasons')">← All Pitches</span></div>
          <div style="display:flex;align-items:end;gap:16px;margin-bottom:28px">
            <div>
              <div class="label">Season</div>
              <div class="display" style="font-size:80px;color:var(--red);line-height:1">${seasonNum}</div>
            </div>
            <div class="muted" style="padding-bottom:10px">
              ${seasonMeta.year ? `<div style="font-size:15px">${seasonMeta.year}</div>` : ''}
              <div>${pitches.length} pitches · ${deals.length} deals</div>
              ${Number(seasonNum) === 5 ? '<div style="color:var(--gold);font-size:12px;margin-top:4px">🟡 Currently Airing</div>' : ''}
            </div>
          </div>

          <div class="stat-grid" style="margin-bottom:28px">
            <div class="card stat-item"><div class="stat-num">${pitches.length}</div><div class="label" style="margin-top:4px">Pitches</div></div>
            <div class="card stat-item"><div class="stat-num" style="color:var(--green)">${deals.length}</div><div class="label" style="margin-top:4px">Deals</div></div>
            <div class="card stat-item"><div class="stat-num">${dealRate}%</div><div class="label" style="margin-top:4px">Deal Rate</div></div>
            <div class="card stat-item"><div class="stat-num" style="color:var(--gold)">₹${investedCr.toFixed(0)}Cr</div><div class="label" style="margin-top:4px">Invested</div></div>
          </div>

          <div class="table-wrap" style="background:rgba(8,8,12,0.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
            <table>
              <thead>
                <tr style="background:rgba(20,20,28,0.97)">
                  <th onclick="seasonsPage._setDetailSort('ep')" style="background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;user-select:none;white-space:nowrap">EP <span id="detail-sort-ep" style="font-size:10px">↑</span></th>
                  <th style="background:transparent;color:rgba(255,255,255,0.5)">STARTUP</th>
                  <th style="background:transparent;color:rgba(255,255,255,0.5)">INDUSTRY</th>
                  <th onclick="seasonsPage._setDetailSort('ask')" style="background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;user-select:none;white-space:nowrap">ASK <span id="detail-sort-ask" style="font-size:10px">↕</span></th>
                  <th onclick="seasonsPage._setDetailSort('deal')" style="background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;user-select:none;white-space:nowrap">FINAL DEAL <span id="detail-sort-deal" style="font-size:10px">↕</span></th>
                  <th style="background:transparent;color:rgba(255,255,255,0.5)">SHARKS</th>
                  <th style="background:transparent;color:rgba(255,255,255,0.5)">STATUS</th>
                </tr>
              </thead>
              <tbody id="detail-tbody"></tbody>
            </table>
          </div>
        </div>`;
      this._renderDetail();
    } catch (error) {
      console.error('Error loading season detail:', error);
      container.innerHTML = '<div class="container section"><p class="muted">Failed to load season</p></div>';
    }
  },
};
