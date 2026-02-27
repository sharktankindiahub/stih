// ═══════════════════════════════════════════════════════════════
// Dashboard Page
// ═══════════════════════════════════════════════════════════════

const dashboardPage = {
  async init() {
    const container = document.getElementById('page-dashboard');
    if (!container) return;

    container.innerHTML = `
      <div class="container section">
        <div style="text-align:center;margin-bottom:48px">
          <div class="hero-tag" style="display:inline-flex;margin-bottom:16px">💡 Investor View</div>
          <div class="display" style="font-size:clamp(40px,7vw,72px)">BUILD YOUR<br><span style="color:var(--red)">DASHBOARD</span></div>
          <p class="muted" style="max-width:480px;margin:14px auto 0;font-size:16px;line-height:1.6">Customize metrics and create personalized reports.</p>
        </div>

        <div class="card" style="padding:32px">
          <div class="card-title" style="font-size:18px;margin-bottom:20px">Dashboard Coming Soon</div>
          <p class="muted">Interactive dashboard features are being prepared. You will be able to:</p>
          <ul style="margin-top:16px;margin-left:20px;color:var(--text)">
            <li>Build custom reports by season, industry, or investor</li>
            <li>Export data as CSV or JSON</li>
            <li>Save personalized views</li>
            <li>Create pitch-specific analytics</li>
          </ul>
        </div>
      </div>
    `;
  },
};
