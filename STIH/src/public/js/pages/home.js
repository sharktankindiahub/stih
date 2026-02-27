// ═══════════════════════════════════════════════════════════════
// Home Page
// ═══════════════════════════════════════════════════════════════

const homePage = {
  async init() {
    const container = document.getElementById('page-home');
    if (!container) return;

    try {
      const [analytics, seasons, allPitches] = await Promise.all([
        api.getAnalytics(),
        api.getSeasons(),
        api.getPitches(),
      ]);

      const recentDeals = allPitches.filter(p => p.funded).slice(-8).reverse();

      const seasonCards = (seasons || []).map(s => `
        <div class="card" onclick="app.showSeason(${s.number})" style="cursor:pointer;border-top:3px solid var(--red);text-align:center;transition:transform 0.15s" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''">
          <div style="font-family:var(--font-bebas);font-size:72px;color:var(--red);line-height:1">${s.number}</div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:8px">${s.year || ''}</div>
          <div style="display:flex;flex-direction:column;gap:4px;font-size:12px">
            <div><span class="muted">Pitches</span> <span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--heading)">${s.totalPitches || 0}</span></div>
            <div><span class="muted">Deals</span> <span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--green)">${s.dealsClosedCount || 0}</span></div>
            <div><span class="muted">Invested</span> <span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--gold)">₹${s.investedCr ? s.investedCr.toFixed(0) : '—'}Cr</span></div>
          </div>
          ${Number(s.number) === 5 ? '<div style="margin-top:10px;font-size:11px;color:var(--gold);font-weight:600">🟡 LIVE</div>' : ''}
        </div>`).join('');

      const dealRows = recentDeals.map((p, i) => `
        <tr onclick="app.showPitch('${p.id}')" style="cursor:pointer;background:${i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'};border-bottom:1px solid rgba(255,255,255,0.06)" onmouseenter="this.style.background='rgba(232,25,44,0.07)'" onmouseleave="this.style.background='${i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'}'">
          <td class="mono" style="font-size:12px;color:rgba(255,255,255,0.4);white-space:nowrap">S${p.season}&nbsp;E${p.ep}</td>
          <td>
            <div style="display:flex;align-items:center;gap:7px;font-weight:700;color:#ffffff;font-size:14px;line-height:1.2">${p.website ? `<img src="https://www.google.com/s2/favicons?domain=${p.website.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}&sz=32" width="16" height="16" style="border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">` : ''}${p.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.38);margin-top:2px">${p.type || ''}</div>
          </td>
          <td><span class="badge badge-industry">${p.industry || '—'}</span></td>
          <td class="mono" style="font-size:12px;color:rgba(255,255,255,0.55)">${p.ask || '—'}</td>
          <td class="mono" style="font-size:13px;color:#22c55e;font-weight:600">${p.deal || '—'}</td>
          <td style="font-size:12px;color:rgba(255,255,255,0.6)">${(p.sharks || []).join(', ') || '—'}</td>
        </tr>`).join('');
//  <p class="hero-sub">Explore all ${analytics?.stats?.totalPitches || 702} pitches, deals, and sharks from all 5 seasons — with real data analytics and prep tools for founders.</p>
      container.innerHTML = `
        <div class="hero">
          <div class="hero-tag"><div class="pulse"></div> ${analytics?.stats?.totalPitches || 702} pitches · ${analytics?.stats?.totalDeals || 0} deals · ₹${(analytics?.stats?.totalInvestedCr || 0).toFixed(0)}Cr invested — all 5 seasons, every shark, zero fluff</div>
          <h1 class="hero-title">SHARK TANK<br><span>INDIA HUB</span></h1>
       
          <div class="hero-btns">
            <button class="btn-primary" onclick="app.showPage('seasons')">Explore Pitches →</button>
            <button class="btn-outline" onclick="app.showPage('learn')">📚 Prep for Your Pitch</button>
            <button class="btn-outline" onclick="app.showPage('dashboard')" style="border-color:var(--gold);color:var(--gold)">📊 Build Your Data Dashboard</button>
          </div>
        </div>

        <div class="container">
          <!-- Global stats -->
          <div class="stat-grid" style="margin-bottom:40px">
            <div class="card stat-item">
              <div class="stat-num">5</div>
              <div class="label" style="margin-top:4px">Seasons</div>
            </div>
            <div class="card stat-item">
              <div class="stat-num">${analytics?.stats?.totalPitches || 702}</div>
              <div class="label" style="margin-top:4px">Total Pitches</div>
            </div>
            <div class="card stat-item">
              <div class="stat-num" style="color:var(--green)">${analytics?.stats?.totalDeals || 0} <small style="font-size:18px">(${analytics?.stats?.dealPercentage || 0}%)</small></div>
              <div class="label" style="margin-top:4px">Deals Closed</div>
            </div>
            <div class="card stat-item">
              <div class="stat-num" style="color:var(--gold)">₹${(analytics?.stats?.totalInvestedCr || 0).toFixed(0)}Cr</div>
              <div class="label" style="margin-top:4px">Total Invested</div>
            </div>
          </div>

          <!-- Seasons grid -->
          ${seasonCards ? `
          <div style="margin-bottom:56px">
            <div style="text-align:center;margin-bottom:20px">
              <div class="display" style="font-size:32px">ALL <span style="color:var(--red)">SEASONS</span></div>
              <div style="margin-top:6px"><span style="font-size:13px;color:var(--red);cursor:pointer" onclick="app.showPage('seasons')">View all pitches →</span></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px">${seasonCards}</div>
          </div>` : ''}

          <!-- Recent deals -->
          ${dealRows ? `
          <div style="margin-bottom:56px">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:20px">
              <div class="display" style="font-size:32px">RECENT <span style="color:var(--green)">DEALS</span></div>
              <span style="font-size:13px;color:var(--red);cursor:pointer" onclick="app.showPage('seasons')">See all pitches →</span>
            </div>
            <div class="table-wrap" style="background:rgba(8,8,12,0.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
              <table>
                <thead><tr style="background:rgba(20,20,28,0.97)"><th style="background:transparent;color:rgba(255,255,255,0.5)">S/Ep</th><th style="background:transparent;color:rgba(255,255,255,0.5)">Startup</th><th style="background:transparent;color:rgba(255,255,255,0.5)">Industry</th><th style="background:transparent;color:rgba(255,255,255,0.5)">Asked</th><th style="background:transparent;color:rgba(255,255,255,0.5)">Deal</th><th style="background:transparent;color:rgba(255,255,255,0.5)">Sharks</th></tr></thead>
                <tbody>${dealRows}</tbody>
              </table>
            </div>
          </div>` : ''}

          <!-- CTA -->
          <div style="background:var(--card);border:1px solid var(--border);border-radius:20px;padding:48px;text-align:center;margin-bottom:48px;position:relative;overflow:hidden">
            <div style="position:absolute;inset:0;background:radial-gradient(ellipse 50% 80% at 50% 100%,rgba(232,25,44,0.08),transparent);pointer-events:none"></div>
            <div style="position:relative">
              <div style="font-size:36px;margin-bottom:16px">🦈</div>
              <div class="display" style="font-size:42px;margin-bottom:12px">READY TO PITCH?</div>
              <p class="muted" style="max-width:420px;margin:0 auto 28px;line-height:1.6">Practice investor questions, build your pitch outline, and learn from real Shark Tank India deals.</p>
              <button class="btn-primary" onclick="app.showPage('learn')">Start Preparing →</button>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error loading home page:', error);
      container.innerHTML = '<div class="container section"><p class="muted">Failed to load home page data</p></div>';
    }
  },
};
