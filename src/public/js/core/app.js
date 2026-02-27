// ═══════════════════════════════════════════════════════════════
// App Core - Page routing and initialization
// ═══════════════════════════════════════════════════════════════

const app = {
  currentPage: 'home',
  pages: ['home', 'seasons', 'sharks', 'analytics', 'dashboard', 'learn'],

  async init() {
    console.log('🚀 STIH App Initializing...');

    // Initialize theme
    theme.init();

    // Restore page from URL hash, or default to home
    const hash = window.location.hash.replace('#', '') || '';
    await this._routeFromHash(hash);

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      const h = window.location.hash.replace('#', '') || '';
      this._routeFromHash(h);
    });

    console.log('✅ App Ready');
  },

  async _routeFromHash(hash) {
    if (!hash || hash === 'home') {
      return this.showPage('home');
    }
    // Detail routes: shark/Name, pitch/id, season/N
    const [type, ...rest] = hash.split('/');
    const val = decodeURIComponent(rest.join('/'));
    if (type === 'shark' && val) {
      // Make sure sharks page data is loaded first
      if (!this.pages.includes('sharks')) return this.showPage('home');
      await sharksPage.init();
      return sharksPage.showSharkDetail(val);
    }
    if (type === 'pitch' && val) {
      return this.showPitch(val);
    }
    if (type === 'season' && val) {
      return seasonsPage.showSeasonDetail(Number(val));
    }
    if (this.pages.includes(hash)) {
      return this.showPage(hash);
    }
    return this.showPage('home');
  },

  async showPage(pageName) {
    if (!this.pages.includes(pageName)) {
      console.warn(`Page not found: ${pageName}`);
      return;
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // Show selected page
    const pageEl = document.getElementById(`page-${pageName}`);
    if (pageEl) {
      pageEl.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
    });
    const navLink = document.getElementById(`nav-${pageName}`);
    if (navLink) {
      navLink.classList.add('active');
    }

    // Load page data
    const pageObj = {
      home: homePage,
      seasons: seasonsPage,
      sharks: sharksPage,
      analytics: analyticsPage,
      dashboard: dashboardPage,
      learn: learnPage,
    }[pageName];

    if (pageObj && pageObj.init) {
      await pageObj.init();
    }

    this.currentPage = pageName;

    // Update URL hash without triggering popstate
    const newHash = '#' + pageName;
    if (window.location.hash !== newHash) {
      history.pushState(null, '', newHash);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  },

  showSeason(id) {
    history.pushState(null, '', '#season/' + id);
    seasonsPage.showSeasonDetail(id);
  },

  showShark(name) {
    history.pushState(null, '', '#shark/' + encodeURIComponent(name));
    sharksPage.showSharkDetail(name);
  },

  async showPitch(id) {
    const container = document.getElementById('page-pitch-detail');
    if (!container) return;
    container.innerHTML = '<div class="container section"><p class="muted" style="text-align:center;padding:60px 0">Loading…</p></div>';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    container.classList.add('active');
    window.scrollTo(0, 0);
    history.pushState(null, '', '#pitch/' + encodeURIComponent(id));
    try {
      const pitches = await api.getPitches();
      const p = pitches.find(x => x.id === id);
      if (!p) {
        container.innerHTML = '<div class="container section"><p class="muted" style="text-align:center;padding:40px">Pitch not found</p></div>';
        return;
      }
      const change = p.deltaVal;
      const sharks = p.sharks || [];
      const bd = p.sharkBreakdown || {};

      // ── Shark chips (profile photo avatar) ──
      const sharkChips = sharks.map(s => {
        const sharkBd = bd[s] || {};
        const amt = sharkBd.amt ? '₹' + sharkBd.amt + 'L' : '—';
        const eq  = sharkBd.eq  ? sharkBd.eq + '%'        : '—';
        const meta = (typeof getSharkMeta === 'function') ? getSharkMeta(s)
                   : (typeof SHARK_META !== 'undefined' && SHARK_META[s]) ? SHARK_META[s]
                   : { full: s, color: '#888', photo: 'no-image.jpg' };
        const photo = meta.photo && meta.photo !== 'no-image.jpg'
          ? `/images/shark/${meta.photo}`
          : null;
        const avatar = photo
          ? `<img src="${photo}"
               alt="${meta.full}"
               style="width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${meta.color};flex-shrink:0"
               onerror="this.outerHTML='<div style=width:40px;height:40px;border-radius:50%;background:${meta.color};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0>${meta.full[0]}</div>'">`
          : `<div style="width:40px;height:40px;border-radius:50%;background:${meta.color};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0">${meta.full[0]}</div>`;
        const safeName = s.replace(/'/g, "\\'");
        return `
          <div onclick="app.showShark('${safeName}')" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:10px;background:var(--card2);margin-bottom:8px;cursor:pointer;border:1px solid transparent;transition:border-color 0.15s,background 0.15s" onmouseenter="this.style.borderColor='${meta.color}55';this.style.background='var(--card)'" onmouseleave="this.style.borderColor='transparent';this.style.background='var(--card2)'">
            <div style="display:flex;align-items:center;gap:12px">
              ${avatar}
              <span style="font-weight:600;color:var(--heading);font-size:14px">${meta.full}</span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;font-size:13px">
              <span class="mono" style="color:var(--gold);font-weight:600">${amt}</span>
              <span class="mono" style="color:var(--muted)">${eq}</span>
              <span style="color:${meta.color};font-size:12px;opacity:0.7">→</span>
            </div>
          </div>`;
      }).join('');

      // ── Ownership donut (SVG) ──
      const ownershipData = p.funded && sharks.length > 0
        ? [
            { name: 'Founders', val: parseFloat((100 - (p.dealEq || 0)).toFixed(1)), color: '#E8192C' },
            ...sharks.map((s, i) => {
              const sharkBd = bd[s] || {};
              const eq = sharkBd.eq || (p.dealEq ? parseFloat((p.dealEq / sharks.length).toFixed(1)) : 0);
              const meta = (typeof SHARK_META !== 'undefined' && SHARK_META[s]) ? SHARK_META[s] : { full: s, color: ['#F5C518','#22C55E','#3B82F6','#8B5CF6','#F97316'][i % 5] };
              return { name: meta.full, val: parseFloat(eq.toFixed(1)), color: meta.color };
            }),
          ]
        : [{ name: 'Founders', val: 100, color: '#E8192C' }];

      const donutSvg = (() => {
        const total = ownershipData.reduce((s, d) => s + d.val, 0);
        let start = -Math.PI / 2;
        const cx = 60, cy = 60, r = 44, ri = 28;
        let paths = '';
        ownershipData.forEach(d => {
          const angle = (d.val / total) * 2 * Math.PI;
          const x1 = cx + r  * Math.cos(start),           y1 = cy + r  * Math.sin(start);
          const x2 = cx + r  * Math.cos(start + angle),   y2 = cy + r  * Math.sin(start + angle);
          const xi1= cx + ri * Math.cos(start + angle),  yi1= cy + ri * Math.sin(start + angle);
          const xi2= cx + ri * Math.cos(start),           yi2= cy + ri * Math.sin(start);
          const lg = angle > Math.PI ? 1 : 0;
          paths += `<path d="M${x1},${y1} A${r},${r} 0 ${lg},1 ${x2},${y2} L${xi1},${yi1} A${ri},${ri} 0 ${lg},0 ${xi2},${yi2} Z" fill="${d.color}" opacity="0.9"/>`;
          start += angle;
        });
        return paths;
      })();

      const donutLegend = ownershipData.map(d => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:12px">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="width:10px;height:10px;border-radius:50%;background:${d.color};flex-shrink:0"></div>
            <span class="muted">${d.name}</span>
          </div>
          <span style="font-family:'JetBrains Mono',monospace;font-weight:500">${d.val.toFixed(1)}%</span>
        </div>`).join('');

      // ── Valuation bars ──
      const valBars = p.funded && p.dealVal && p.askVal ? (() => {
        const askV = p.askVal, finV = parseFloat(p.dealVal.toFixed(1));
        const max = Math.max(askV, finV) * 1.1;
        return `
          <div style="display:flex;flex-direction:column;gap:10px;font-size:12px">
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:5px"><span class="muted">Asked</span><span class="mono">₹${askV}Cr</span></div>
              <div class="pbar"><div class="pbar-fill" style="width:${(askV/max*100).toFixed(0)}%;background:var(--muted)"></div></div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:5px"><span class="muted">Agreed</span><span class="mono" style="color:var(--green)">₹${finV}Cr</span></div>
              <div class="pbar"><div class="pbar-fill green" style="width:${(finV/max*100).toFixed(0)}%"></div></div>
            </div>
          </div>`;
      })() : null;

      container.innerHTML = `
        <div class="container section">
          <div style="margin-bottom:8px"><span class="muted" style="font-size:13px;cursor:pointer" onclick="app.showPage('seasons')">← All Pitches</span></div>

          <div style="display:flex;flex-wrap:wrap;align-items:start;justify-content:space-between;gap:12px;margin-bottom:8px">
            <div>
              <div class="display" style="font-size:clamp(32px,6vw,56px);display:flex;align-items:center;gap:14px">${p.website ? `<img src="https://www.google.com/s2/favicons?domain=${p.website.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}&sz=64" width="40" height="40" style="border-radius:8px;flex-shrink:0" onerror="this.style.display='none'">` : ''}${p.name}</div>
              <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:6px">
                <span class="muted" style="font-size:13px">S${p.season} E${p.ep}</span>
                ${p.season === 5 ? '<span style="display:inline-block;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:700;background:rgba(245,197,24,0.15);color:var(--gold);border:1px solid rgba(245,197,24,0.4)">🟡 LIVE SEASON</span>' : ''}
                ${p.industry ? `<span class="muted">·</span><span class="badge badge-industry">${p.industry}</span>` : ''}
                ${p.type ? `<span class="muted">·</span><span class="muted" style="font-size:12px">${p.type}</span>` : ''}
                ${p.city ? `<span class="muted">·</span><span class="muted" style="font-size:12px">📍 ${p.city}${p.state ? ', ' + p.state : ''}</span>` : ''}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
              ${p.funded
                ? '<span class="badge badge-funded" style="font-size:13px;padding:6px 16px">✓ FUNDED</span>'
                : '<span class="badge badge-nodeal" style="font-size:13px;padding:6px 16px">✗ NO DEAL</span>'}
              ${p.website ? `<a href="${p.website}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);color:var(--text);font-size:12px;font-weight:500;text-decoration:none;transition:border-color 0.2s,background 0.2s" onmouseover="this.style.borderColor='rgba(232,25,44,0.5)';this.style.background='rgba(232,25,44,0.07)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.12)';this.style.background='rgba(255,255,255,0.05)'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${p.website.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>` : ''}
            </div>
          </div>

          ${p.type ? `<div style="border-left:3px solid var(--red);padding:10px 16px;background:rgba(232,25,44,0.05);border-radius:0 10px 10px 0;margin-bottom:24px;font-size:14px;color:var(--text);opacity:0.9">${p.type}</div>` : ''}

          <div class="detail-grid">

            <!-- ── LEFT COLUMN ── -->
            <div style="display:flex;flex-direction:column;gap:16px">

              <!-- The Pitch -->
              <div class="card">
                <div class="display" style="font-size:22px;margin-bottom:18px">THE PITCH</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
                  <div>
                    <div class="label" style="margin-bottom:10px">What they asked for</div>
                    <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
                      <div style="display:flex;justify-content:space-between"><span class="muted">Amount</span><span class="mono" style="font-weight:600">${p.ask || '—'}</span></div>
                      <div style="display:flex;justify-content:space-between"><span class="muted">For equity</span><span class="mono" style="font-weight:600">${p.askEq || '—'}%</span></div>
                      <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:8px;margin-top:4px">
                        <span class="muted">Valuation</span>
                        <span class="mono" style="font-weight:600">₹${p.askVal || '—'}Cr</span>
                      </div>
                    </div>
                  </div>
                  ${p.funded ? `
                  <div>
                    <div class="label" style="margin-bottom:10px">Final deal</div>
                    <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
                      <div style="display:flex;justify-content:space-between"><span class="muted">Amount</span><span class="mono" style="font-weight:600;color:var(--green)">${p.deal || '—'}</span></div>
                      <div style="display:flex;justify-content:space-between"><span class="muted">Equity given</span><span class="mono" style="font-weight:600;color:var(--green)">${p.dealEq || '—'}%</span></div>
                      <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:8px;margin-top:4px">
                        <span class="muted">Agreed valuation</span>
                        <span class="mono" style="font-weight:600">₹${p.dealVal ? p.dealVal.toFixed(1) : '—'}Cr</span>
                      </div>
                    </div>
                  </div>` : '<div style="display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px">✗ No deal was made</div>'}
                </div>
                ${change !== null && change !== undefined && p.funded ? `
                <div class="valuation-explainer${change >= 0 ? ' up' : ''}" style="margin-top:16px">
                  ${change < 0 ? '📉' : '📈'} They originally valued the company at ₹${p.askVal}Cr. The final deal valued it at ₹${p.dealVal ? p.dealVal.toFixed(1) : '?'}Cr — <strong>${Math.abs(change)}% ${change < 0 ? 'lower' : 'higher'}</strong> than asked.${change < -20 ? ' Sharks pushed back significantly on valuation.' : ''}
                </div>` : ''}
              </div>

              <!-- Sharks -->
              ${p.funded && sharks.length > 0 ? `
              <div class="card">
                <div class="display" style="font-size:22px;margin-bottom:14px">SHARKS IN THIS DEAL</div>
                ${sharkChips}
              </div>` : ''}

              <!-- Financials -->
              ${p.revenue > 0 ? `
              <div class="card">
                <div class="display" style="font-size:22px;margin-bottom:14px">FINANCIALS</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px">
                  <div style="text-align:center;padding:14px;background:var(--card2);border-radius:10px;border:1px solid var(--border)">
                    <div class="mono" style="font-size:22px;font-weight:600;color:var(--gold)">₹${p.revenue}Cr</div>
                    <div class="label" style="margin-top:4px;font-size:10px;letter-spacing:1px">REVENUE (ARR)</div>
                  </div>
                  ${p.margin > 0 ? `
                  <div style="text-align:center;padding:14px;background:var(--card2);border-radius:10px;border:1px solid var(--border)">
                    <div class="mono" style="font-size:22px;font-weight:600;color:var(--green)">${p.margin}%</div>
                    <div class="label" style="margin-top:4px;font-size:10px;letter-spacing:1px">GROSS MARGIN</div>
                  </div>` : ''}
                  ${p.funded && p.dealVal && p.revenue > 0 ? `
                  <div style="text-align:center;padding:14px;background:var(--card2);border-radius:10px;border:1px solid var(--border)">
                    <div class="mono" style="font-size:22px;font-weight:600;color:var(--heading)">${(p.dealVal / p.revenue).toFixed(1)}x</div>
                    <div class="label" style="margin-top:4px;font-size:10px;letter-spacing:1px">REVENUE MULTIPLE</div>
                    <div style="font-size:10px;color:var(--muted);margin-top:2px">Paid per ₹1 of revenue</div>
                  </div>` : ''}
                </div>
              </div>` : ''}

              <!-- Learn box -->
              <div style="background:rgba(245,197,24,0.06);border:1px solid rgba(245,197,24,0.25);border-radius:16px;padding:20px">
                <div style="font-weight:600;margin-bottom:8px;color:var(--heading)">💡 What you can learn for your pitch</div>
                <ul style="list-style:none;padding:0;font-size:13px;line-height:1.7;margin:0 0 10px">
                  ${p.funded
                    ? `<li>They secured a deal — study their pitch structure and how they handled shark objections.</li>
                       ${sharks.length > 1 ? '<li>Multiple sharks co-invested — often signals strong fundamentals or very competitive negotiating.</li>' : ''}
                       ${p.margin > 50 ? `<li>Strong gross margin (${p.margin}%) gave sharks confidence in the business model's scalability.</li>` : ''}
                       ${change !== null && change < -20 ? `<li>⚠ Valuation dropped ${Math.abs(change)}% — ensure your ask is defensible from the start.</li>` : ''}`
                    : `<li>No deal was made — study what objections typically arise for ${p.industry} companies.</li>
                       <li>Research valuation benchmarks in your sector before setting your ask.</li>`}
                </ul>
                <div style="font-size:12px">
                  <span style="cursor:pointer;color:var(--red)" onclick="app.showPage('learn')">→ Practice investor Q&amp;A for ${p.industry} startups</span>
                </div>
              </div>

            </div>

            <!-- ── RIGHT SIDEBAR ── -->
            <div style="display:flex;flex-direction:column;gap:14px">

              <!-- Ownership donut -->
              <div class="card">
                <div class="label" style="margin-bottom:12px">Ownership After Deal</div>
                <div style="display:flex;align-items:center;justify-content:center;margin-bottom:12px">
                  <svg viewBox="0 0 120 120" width="160" height="160">
                    ${donutSvg}
                  </svg>
                </div>
                <div style="display:flex;flex-direction:column;gap:2px">
                  ${donutLegend}
                </div>
              </div>

              <!-- Valuation bars -->
              ${valBars ? `
              <div class="card">
                <div class="label" style="margin-bottom:8px">Valuation: Asked vs Agreed</div>
                <div style="font-size:11px;color:var(--muted);margin-bottom:12px">This compares the valuation founders asked for vs what they agreed to.</div>
                ${valBars}
              </div>` : ''}

              <!-- Related -->
              <div class="card">
                <div class="label" style="margin-bottom:10px">Related</div>
                <div style="display:flex;flex-direction:column;gap:2px">
                  <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;font-size:13px" onclick="app.showPage('learn')">
                    <span>Practice investor Q&amp;A</span><span class="muted">→</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;font-size:13px" onclick="app.showPage('learn')">
                    <span>Generate pitch checklist</span><span class="muted">→</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:10px 0;cursor:pointer;font-size:13px" onclick="app.showPage('analytics')">
                    <span>${p.industry} analytics</span><span class="muted">→</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>`;
    } catch(err) {
      console.error(err);
      container.innerHTML = '<div class="container section"><p class="muted" style="text-align:center;padding:40px">Failed to load pitch details</p></div>';
    }
  },
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
