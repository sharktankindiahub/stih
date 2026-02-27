// ═══════════════════════════════════════════════════════════════
// Sharks Page
// ═══════════════════════════════════════════════════════════════

const SHARK_META = {
  'Namita':         { full: 'Namita Thapar',    title: 'Executive Director, Emcure Pharma',  emoji: '💊', color: '#8B5CF6', photo: 'Namita_Thapar_Emcure_headshot.jpg',   linkedin: 'https://www.linkedin.com/in/namita-thapar-61705a14/', web: 'https://www.emcure.com' },
  'Vineeta':        { full: 'Vineeta Singh',     title: 'CEO & Co-founder, SUGAR Cosmetics',  emoji: '💄', color: '#EC4899', photo: 'Vineeta_Singh_Sugar_headshot.jpg',      linkedin: 'https://www.linkedin.com/in/vineetasingh/',            web: 'https://www.sugarcosmetics.com' },
  'Anupam':         { full: 'Anupam Mittal',     title: 'Founder & CEO, Shaadi.com',          emoji: '💍', color: '#3B82F6', photo: 'Anupam_Mittal_Shaadi_headshot.jpg',     linkedin: 'https://www.linkedin.com/in/anupammittal/',            web: 'https://www.shaadi.com' },
  'Aman':           { full: 'Aman Gupta',         title: 'Co-founder & CMO, boAt',             emoji: '🎧', color: '#F97316', photo: 'Aman_Gupta_boAt_headshot.jpg',          linkedin: 'https://www.linkedin.com/in/aman-gupta-boat/',         web: 'https://www.boat-lifestyle.com' },
  'Peyush':         { full: 'Peyush Bansal',      title: 'Co-founder & CEO, Lenskart',         emoji: '👓', color: '#10B981', photo: 'Peyush_Bansal_Lenskart_headshot.jpg',   linkedin: 'https://www.linkedin.com/in/peyushbansal/',            web: 'https://www.lenskart.com' },
  'Ritesh':         { full: 'Ritesh Agarwal',     title: 'Founder & CEO, OYO Rooms',           emoji: '🏨', color: '#F59E0B', photo: 'Ritesh_Agarwal_OYO_headshot.jpg',       linkedin: 'https://www.linkedin.com/in/ritesh-agarwal-oyo/',      web: 'https://www.oyorooms.com' },
  'Amit':           { full: 'Amit Jain',           title: 'Co-founder & CEO, CarDekho',         emoji: '🚗', color: '#6366F1', photo: 'no-image.jpg',                         linkedin: 'https://www.linkedin.com/in/amit-jain-cardekho/',      web: 'https://www.cardekho.com' },
  'Ashneer':        { full: 'Ashneer Grover',      title: 'Co-founder, BharatPe (S1-S2)',       emoji: '💸', color: '#EF4444', photo: 'no-image.jpg',                         linkedin: 'https://www.linkedin.com/in/ashneer-grover/',          web: 'https://bharatpe.com' },
  'Ashneer Grover': { full: 'Ashneer Grover',      title: 'Co-founder, BharatPe (S1-S2)',       emoji: '💸', color: '#EF4444', photo: 'no-image.jpg',                         linkedin: 'https://www.linkedin.com/in/ashneer-grover/',          web: 'https://bharatpe.com' },
  'Kunal Bahl':     { full: 'Kunal Bahl',           title: 'Co-founder & CEO, Snapdeal',         emoji: '🛒', color: '#06B6D4', photo: 'Kunal_Bahl_Snapdeal_headshot.jpg',      linkedin: 'https://www.linkedin.com/in/kunal-bahl/',              web: 'https://www.snapdeal.com' },
};

function getSharkMeta(name) {
  return SHARK_META[name] || { full: name, title: 'Guest Shark', emoji: '🦈', color: '#888888', photo: 'no-image.jpg' };
}

function sharkPhotoUrl(meta) {
  return '/images/shark/' + (meta.photo || 'no-image.jpg');
}

const sharksPage = {
  async init() {
    const container = document.getElementById('page-sharks');
    if (!container) return;
    try {
      const pitches = await api.getPitches();
      const stats = {};
      pitches.forEach(pitch => {
        (pitch.sharks || []).forEach(sharkName => {
          if (!stats[sharkName]) stats[sharkName] = { deals: 0, invested: 0, industries: {}, seasons: new Set() };
          stats[sharkName].deals++;
          stats[sharkName].seasons.add(pitch.season);
          if (pitch.sharkBreakdown && pitch.sharkBreakdown[sharkName]) {
            stats[sharkName].invested += pitch.sharkBreakdown[sharkName].amt || 0;
          }
          if (pitch.industry) stats[sharkName].industries[pitch.industry] = (stats[sharkName].industries[pitch.industry] || 0) + 1;
        });
      });

      const coreOrder = ['Aman','Namita','Anupam','Peyush','Vineeta','Ritesh','Amit','Kunal Bahl','Ashneer Grover','Ashneer'];
      const allSharks = Object.keys(stats).sort((a, b) => {
        const ai = coreOrder.indexOf(a), bi = coreOrder.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1; if (bi !== -1) return 1;
        return stats[b].deals - stats[a].deals;
      }).filter(sh => stats[sh].deals >= 3);

      const sharkCards = allSharks.map(sharkName => {
        const s = stats[sharkName];
        const meta = getSharkMeta(sharkName);
        const topInd = Object.entries(s.industries).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]).join(', ') || '—';
        const investedCr = s.invested > 0 ? (s.invested / 100).toFixed(1) : null;
        const seasonsStr = Array.from(s.seasons).sort().map(n => 'S'+n).join(', ') || '—';
        return `
          <div class="card" onclick="app.showShark('${sharkName.replace(/'/g, "\\'")}')" style="cursor:pointer;border-top:3px solid ${meta.color};transition:transform 0.15s" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
              <img src="${sharkPhotoUrl(meta)}" alt="${meta.full}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid ${meta.color}50;flex-shrink:0" onerror="this.src='/images/shark/no-image.jpg'">
              <div>
                <div style="font-weight:700;font-size:15px;color:var(--heading)">${meta.full}</div>
                <div class="muted" style="font-size:11px;line-height:1.4">${meta.title}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;margin-bottom:12px">
              <div style="background:var(--card2);border-radius:8px;padding:8px 10px">
                <div class="muted" style="font-size:10px;margin-bottom:2px">DEALS</div>
                <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:${meta.color};font-size:20px">${s.deals}</div>
              </div>
              <div style="background:var(--card2);border-radius:8px;padding:8px 10px">
                <div class="muted" style="font-size:10px;margin-bottom:2px">INVESTED</div>
                <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--gold);font-size:16px">${investedCr ? '₹'+investedCr+'Cr' : '—'}</div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:4px">Top sectors: <span style="color:var(--text)">${topInd}</span></div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:12px">Seasons: <span style="color:var(--text)">${seasonsStr}</span></div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              ${meta.linkedin ? `<a href="${meta.linkedin}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;background:rgba(10,102,194,0.15);border:1px solid rgba(10,102,194,0.35);color:#4a9fd4;font-size:11px;font-weight:600;text-decoration:none">💼 LinkedIn</a>` : ''}
              ${meta.web ? `<a href="${meta.web}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:var(--muted);font-size:11px;font-weight:600;text-decoration:none">🌐 Website</a>` : ''}
              <span style="font-size:12px;color:${meta.color};margin-left:auto">View profile →</span>
            </div>
          </div>`;
      }).join('');

      container.innerHTML = `
        <div class="container section">
          <div style="text-align:center;margin-bottom:48px">
            <div class="hero-tag" style="display:inline-flex;margin-bottom:20px">🦈 Meet the Sharks</div>
            <div class="display" style="font-size:clamp(40px,7vw,72px)">THE <span style="color:var(--red)">SHARKS</span></div>
            <p class="muted" style="max-width:480px;margin:14px auto 0;font-size:16px;line-height:1.6">Explore investor profiles, investment patterns, and deal histories.</p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">${sharkCards}</div>
        </div>`;
    } catch (error) {
      console.error('Error loading sharks page:', error);
      document.getElementById('page-sharks').innerHTML = '<div class="container section"><p class="muted">Failed to load sharks</p></div>';
    }
  },

  async showSharkDetail(sharkName) {
    const detailContainer = document.getElementById('page-shark-detail');
    if (!detailContainer) return;
    detailContainer.innerHTML = '<div class="container section"><p class="muted" style="text-align:center;padding:60px 0">Loading...</p></div>';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    detailContainer.classList.add('active');
    window.scrollTo(0, 0);
    history.pushState(null, '', '#shark/' + encodeURIComponent(sharkName));

    try {
      const pitches = await api.getPitches();
      const meta = getSharkMeta(sharkName);
      const deals = pitches.filter(p => p.funded && (p.sharks || []).includes(sharkName));
      let totalInvested = 0;
      const industries = {}, seasons = {}, dealTypes = { equity: 0, mixed: 0, royalty: 0 };

      deals.forEach(p => {
        const bd = p.sharkBreakdown && p.sharkBreakdown[sharkName];
        const amt = (bd && bd.amt) ? bd.amt : 0;
        if (amt) totalInvested += amt;
        industries[p.industry] = (industries[p.industry] || 0) + 1;
        if (!seasons[p.season]) seasons[p.season] = { deals: 0, invested: 0 };
        seasons[p.season].deals++;
        seasons[p.season].invested += amt;
        if (p.dealType) dealTypes[p.dealType] = (dealTypes[p.dealType] || 0) + 1;
      });

      const topInd = Object.entries(industries).sort((a,b) => b[1]-a[1]).slice(0,5);
      const maxInd = topInd[0]?.[1] || 1;
      const investedCr = totalInvested > 0 ? (totalInvested / 100).toFixed(1) : null;
      const avgDeal = deals.length && totalInvested > 0 ? (totalInvested / deals.length).toFixed(1) : null;

      const seasonBadges = [1,2,3,4,5].map(s => {
        const ok = !!seasons[s];
        if (!ok) return `<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:var(--card2);color:var(--muted);border:1px solid var(--border)">S${s}</span>`;
        const live = s === 5;
        return `<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:${live?'rgba(245,197,24,0.12)':'rgba(34,197,94,0.12)'};color:${live?'var(--gold)':'var(--green)'};border:1px solid ${live?'rgba(245,197,24,0.4)':'rgba(34,197,94,0.3)'}">S${s} ✓${live?' 🟡':''}</span>`;
      }).join('');

      detailContainer.innerHTML = `
        <div class="container section">
          <div style="margin-bottom:16px"><span class="muted" style="font-size:13px;cursor:pointer" onclick="app.showPage('sharks')">← All Sharks</span></div>
          <div style="display:flex;flex-wrap:wrap;align-items:start;justify-content:space-between;gap:24px;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid var(--border)">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:20px">
              <div style="width:80px;height:80px;border-radius:50%;background:${meta.color}20;border:3px solid ${meta.color}60;display:flex;align-items:center;justify-content:center;font-size:40px;flex-shrink:0">${meta.emoji}</div>
              <div>
                <div class="display" style="font-size:clamp(28px,5vw,52px)">${meta.full.toUpperCase()}</div>
                <div class="muted" style="font-size:14px;margin-top:4px">${meta.title}</div>
                <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:10px">${seasonBadges}</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
                  ${meta.linkedin ? `<a href="${meta.linkedin}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:8px;background:rgba(10,102,194,0.15);border:1px solid rgba(10,102,194,0.4);color:#4a9fd4;font-size:13px;font-weight:600;text-decoration:none">💼 LinkedIn Profile</a>` : ''}
                  ${meta.web ? `<a href="${meta.web}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:var(--text);font-size:13px;font-weight:600;text-decoration:none">🌐 ${meta.web.replace('https://www.','').replace('https://','').split('/')[0]}</a>` : ''}
                </div>
              </div>
            </div>
            <div style="flex-shrink:0">
              <img
                src="${sharkPhotoUrl(meta)}"
                alt="${meta.full}"
                style="width:160px;height:180px;object-fit:cover;object-position:top center;border-radius:16px;border:2px solid ${meta.color}40;box-shadow:0 8px 24px rgba(0,0,0,0.3)"
                onerror="this.src='/images/shark/no-image.jpg'"
              >
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:28px">
            ${[['Deals Closed',deals.length,meta.color],['Total Invested',investedCr?'₹'+investedCr+'Cr':'—','var(--gold)'],['Avg Deal',avgDeal?'₹'+avgDeal+'L':'—','var(--text)'],['Sectors',Object.keys(industries).length,'var(--text)']].map(([lbl,val,col])=>`
            <div class="card stat-item" style="padding:16px">
              <div class="stat-num" style="font-size:28px;color:${col}">${val}</div>
              <div class="label" style="margin-top:4px">${lbl}</div>
            </div>`).join('')}
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:28px">
            <div class="card">
              <div class="display" style="font-size:18px;margin-bottom:14px">TOP SECTORS</div>
              ${topInd.map(([ind, cnt]) => `
                <div style="margin-bottom:10px">
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${ind}</span><span style="font-family:'JetBrains Mono',monospace;color:${meta.color};font-weight:600">${cnt}</span></div>
                  <div class="pbar"><div class="pbar-fill" style="width:${Math.round(cnt/maxInd*100)}%;background:${meta.color}"></div></div>
                </div>`).join('')}
            </div>
            <div class="card">
              <div class="display" style="font-size:18px;margin-bottom:14px">DEAL TYPES</div>
              ${[['Equity',dealTypes.equity,'var(--red)'],['Mixed',dealTypes.mixed,'var(--gold)'],['Royalty',dealTypes.royalty,'var(--green)']].filter(x=>x[1]>0).map(([lbl,cnt,col])=>`
              <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px">
                <span class="muted">${lbl}</span><span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:${col}">${cnt}</span>
              </div>`).join('')}
            </div>
            <div class="card">
              <div class="display" style="font-size:18px;margin-bottom:14px">BY SEASON</div>
              ${Object.entries(seasons).sort().map(([s,d])=>`
              <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px">
                <span style="font-weight:600;color:var(--heading)">Season ${s}${Number(s)===5?' 🟡':''}</span>
                <div style="display:flex;gap:14px"><span class="muted">${d.deals} deals</span><span style="font-family:'JetBrains Mono',monospace;color:var(--gold)">${d.invested>0?'₹'+(d.invested/100).toFixed(1)+'Cr':'—'}</span></div>
              </div>`).join('')}
            </div>
          </div>

          ${deals.length > 0 ? `
          <div class="card">
            <div class="display" style="font-size:18px;margin-bottom:16px">RECENT DEALS</div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>S/Ep</th><th>Startup</th><th>Industry</th><th>Deal</th><th>Equity</th></tr></thead>
                <tbody>
                  ${[...deals].reverse().slice(0,10).map(p=>{
                    const bd = p.sharkBreakdown && p.sharkBreakdown[sharkName];
                    const amt = bd && bd.amt ? '₹'+bd.amt+'L' : (p.deal || '—');
                    const eq = bd && bd.eq ? bd.eq+'%' : '—';
                    return `<tr onclick="app.showPitch('${p.id}')" style="cursor:pointer">
                      <td class="mono muted" style="font-size:12px">S${p.season} E${p.ep}</td>
                      <td><div style="display:flex;align-items:center;gap:7px;font-weight:600;color:var(--heading)">${p.website ? `<img src="https://www.google.com/s2/favicons?domain=${p.website.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}&sz=32" width="16" height="16" style="border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">` : ''}${p.name}</div><div class="muted" style="font-size:11px">${p.type||''}</div></td>
                      <td><span class="badge badge-industry">${p.industry}</span></td>
                      <td class="mono" style="color:var(--green);font-size:13px">${amt}</td>
                      <td class="mono" style="font-size:13px">${eq}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>` : ''}
        </div>`;
    } catch(err) {
      console.error(err);
      detailContainer.innerHTML = '<div class="container section"><p class="muted">Failed to load shark profile</p></div>';
    }
  },
};
