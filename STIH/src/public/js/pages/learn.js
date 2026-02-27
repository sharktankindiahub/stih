// ═══════════════════════════════════════════════════════════════
// Learn Page
// ═══════════════════════════════════════════════════════════════

const learnPage = {
  async init() {
    const container = document.getElementById('page-learn');
    if (!container) return;

    container.innerHTML = `
      <div class="container section">
        <div style="text-align:center;margin-bottom:48px">
          <div class="hero-tag" style="display:inline-flex;margin-bottom:20px">📚 For founders</div>
          <div class="display" style="font-size:clamp(40px,7vw,72px)">GET READY FOR<br><span style="color:var(--red)">SHARK TANK</span></div>
          <p class="muted" style="max-width:480px;margin:14px auto 0;font-size:16px;line-height:1.6">Learn from real pitches, practice investor questions, and build your pitch structure — step by step.</p>
        </div>

        <!-- Stage selector -->
        <div style="margin-bottom:40px">
          <div class="label" style="text-align:center;margin-bottom:14px">Where are you today?</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
            <div class="card" style="cursor:pointer;padding:18px;text-align:left" onclick="learnPage.selectStage('idea')">
              <div style="font-weight:600;margin-bottom:4px;color:var(--heading)">Idea Stage</div>
              <div style="font-size:12px;color:var(--muted)">Pre-revenue, still validating</div>
            </div>
            <div class="card" style="cursor:pointer;padding:18px;text-align:left" onclick="learnPage.selectStage('early')">
              <div style="font-weight:600;margin-bottom:4px;color:var(--heading)">Early Revenue</div>
              <div style="font-size:12px;color:var(--muted)">₹0–₹50L revenue, finding PMF</div>
            </div>
            <div class="card" style="cursor:pointer;padding:18px;text-align:left" onclick="learnPage.selectStage('scaling')">
              <div style="font-weight:600;margin-bottom:4px;color:var(--heading)">Scaling</div>
              <div style="font-size:12px;color:var(--muted)">₹50L+ revenue, ready to grow</div>
            </div>
          </div>
        </div>

        <!-- Practice tools -->
        <div class="sec-header"><div class="sec-title">PRACTICE TOOLS</div></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:40px">
          <div class="card" onclick="learnPage.showTab('mock')" style="cursor:pointer">
            <div style="font-size:28px;margin-bottom:10px">💬</div>
            <div style="font-weight:600;margin-bottom:5px;color:var(--heading)">Mock Q&A</div>
            <div class="muted" style="font-size:13px">Practice answering real investor questions by category and difficulty.</div>
            <div style="margin-top:12px;font-size:12px;color:var(--red)">Start →</div>
          </div>
          <div class="card" onclick="learnPage.showTab('checklist')" style="cursor:pointer">
            <div style="font-size:28px;margin-bottom:10px">✅</div>
            <div style="font-weight:600;margin-bottom:5px;color:var(--heading)">Pitch Checklist</div>
            <div class="muted" style="font-size:13px">Get a personalised list of questions you need to be ready for.</div>
            <div style="margin-top:12px;font-size:12px;color:var(--gold)">Generate →</div>
          </div>
          <div class="card" onclick="learnPage.showTab('outline')" style="cursor:pointer">
            <div style="font-size:28px;margin-bottom:10px">📝</div>
            <div style="font-weight:600;margin-bottom:5px;color:var(--heading)">Pitch Outline Builder</div>
            <div class="muted" style="font-size:13px">Build your pitch structure section by section and download it.</div>
            <div style="margin-top:12px;font-size:12px;color:var(--green)">Build →</div>
          </div>
          <div class="card" onclick="window.open('/training.html','_blank')" style="cursor:pointer;border-top:3px solid var(--red);position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;background:var(--red);font-size:9px;font-weight:700;color:#fff;padding:3px 10px;border-radius:0 0 0 10px;letter-spacing:0.5px">NEW</div>
            <div style="font-size:28px;margin-bottom:10px">🎓</div>
            <div style="font-weight:600;margin-bottom:5px;color:var(--heading)">Training Academy</div>
            <div class="muted" style="font-size:13px">4-level structured course: unit economics, projections, growth strategy, investor Q&A mastery.</div>
            <div style="margin-top:12px;font-size:12px;color:var(--red);font-weight:600">Open Academy ↗</div>
          </div>
        </div>

        <!-- Tab content -->
        <div id="learn-tabs" style="display:none">
          <p class="muted">Tab content coming soon</p>
        </div>
      </div>
    `;
  },

  selectStage(stage) {
    console.log('Selected stage:', stage);
    // Will update based on selected stage
  },

  showTab(tab) {
    console.log('Showing tab:', tab);
    // Will show tab content
  },
};
