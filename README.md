# Shark Tank India Hub

A Node.js web application accessible at [sharktankindiahub.github.io](https://sharktankindiahub.github.io).

## CI/CD Pipeline

Every push to any branch automatically triggers the pipeline:

```
Push to branch
      │
      ▼
  [ Build ]  ──────────────────────────────────── auto
      │
      ▼
[ Deploy DEV ]  →  sharktankindiahub.github.io/dev/  ── auto
      │
      ▼  ← ⏸ Manual approval required (test environment)
[ Deploy TEST ] →  sharktankindiahub.github.io/test/ ── after approval
      │
      ▼  ← ⏸ Manual approval required (prod environment)
[ Deploy PROD ] →  sharktankindiahub.github.io/       ── after approval
```

### Environments

| Environment | URL | Deployment |
|-------------|-----|------------|
| **dev**  | `sharktankindiahub.github.io/dev/`  | Automatic on every push |
| **test** | `sharktankindiahub.github.io/test/` | Requires approval after DEV is verified |
| **prod** | `sharktankindiahub.github.io/`      | Requires approval after TEST is verified |

### One-time GitHub Setup

1. Go to **Settings → Environments** in this repository and create three environments:
   - `dev` – no protection rules (deploys automatically)
   - `test` – add **Required reviewers** (yourself or your team)
   - `prod` – add **Required reviewers** (yourself or your team)

2. Go to **Settings → Pages** and set the source to **GitHub Actions**.

That's it. After that, every push will auto-deploy to DEV and pause for your approval before promoting to TEST and then PROD.

## Local Development

```bash
npm install
npm run dev        # starts server with --watch on port 3000
npm run build      # builds static site to dist/
npm test           # runs tests
```

Set `APP_ENV=dev|test|production` to control the environment badge shown in the UI.

