# STIH - Shark Tank India Hub (Refactored)

A **modular, maintainable Node.js + Vanilla JavaScript** full-stack application for Shark Tank India data analysis, with admin panel, Kaggle integration, and interactive analytics.

## 🚀 Quick Start

### Setup Kaggle Credentials (Required for Data)
👉 **[KAGGLE_QUICK_START.txt](KAGGLE_QUICK_START.txt)** - 2-minute setup guide  
👉 **[KAGGLE_SETUP.md](KAGGLE_SETUP.md)** - Complete troubleshooting guide

### Install & Run
```bash
npm install
node setup-admin.js          # Set admin password (one-time)
npm run dev                  # Start server on http://localhost:3000
```

### Access the App
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:3000/api/*

---

## Project Structure

```
STIH/
├── src/
│   ├── index.js                 # Express server entry point
│   ├── config.js                # Configuration management
│   ├── config.test.js           # Config tests
│   ├── utils/
│   │   └── logger.js            # Logging utility
│   ├── public/                  # Frontend (Vanilla JS SPA)
│   │   ├── index.html           # Single-page application
│   │   ├── css/
│   │   │   ├── variables.css    # Color palette & CSS variables
│   │   │   ├── base.css         # Typography, nav, grid
│   │   │   ├── components.css   # Buttons, cards, forms
│   │   │   ├── pages.css        # Page-specific layouts
│   │   │   └── theme.css        # Light/dark mode
│   │   ├── js/
│   │   │   ├── core/
│   │   │   │   ├── app.js       # SPA router & initializer
│   │   │   │   ├── api.js       # HTTP client with auth
│   │   │   │   └── theme.js     # Theme toggle (light/dark)
│   │   │   ├── pages/
│   │   │   │   ├── home.js      # Dashboard & stats
│   │   │   │   ├── seasons.js   # Season listing
│   │   │   │   ├── sharks.js    # Shark profiles
│   │   │   │   ├── analytics.js # Charts & insights
│   │   │   │   ├── dashboard.js # Custom dashboard builder
│   │   │   │   └── learn.js     # Learning tools
│   │   │   ├── components/
│   │   │   │   ├── charts.js    # Chart.js wrappers
│   │   │   │   ├── filters.js   # Filter chips
│   │   │   │   └── forms.js     # Form helpers
│   │   │   └── utils/
│   │   │       └── helpers.js   # Formatting & utilities
│   │   └── admin/
│   │       ├── login.html       # Admin login page
│   │       ├── dashboard.html   # Kaggle sync dashboard
│   │       └── css/admin.css    # Admin styling
│   ├── api/
│   │   ├── routes/
│   │   │   ├── index.js         # Route registry
│   │   │   ├── seasons.js       # GET /api/seasons
│   │   │   ├── pitches.js       # GET /api/pitches
│   │   │   ├── sharks.js        # GET /api/sharks
│   │   │   ├── analytics.js     # GET /api/analytics
│   │   │   └── admin.js         # POST /admin/login, /admin/reload
│   │   ├── controllers/
│   │   │   └── adminController.js  # Login & reload logic
│   │   └── middleware/
│   │       ├── adminAuth.js     # JWT token verification
│   │       └── errorHandler.js  # Error handling
│   ├── services/
│   │   ├── dataService.js       # JSON caching & aggregation
│   │   └── kaggleSync.js        # Kaggle data fetching
│   ├── config/
│   │   └── admin-settings.json  # Admin credentials (hashed)
│   └── data/
│       ├── seasons.json         # Season records
│       ├── pitches.json         # Pitch/deal records
│       ├── sharks.json          # Shark profiles
│       ├── industries.json      # Industry taxonomy
│       └── sync-log.json        # Data sync history
├── scripts/
│   ├── fetch_kaggle_data.py     # Python: Kaggle data fetcher
│   └── requirements.txt         # Python dependencies
├── .env.example                 # Environment variables template
├── KAGGLE_QUICK_START.txt       # Quick Kaggle setup (2 min)
├── KAGGLE_SETUP.md              # Full Kaggle guide
├── jest.config.js               # Test configuration
├── setup-admin.js               # Admin credential setup CLI
├── package.json                 # Node dependencies
└── README.md                    # This file
```


---

## Features

### 🎯 Frontend (Vanilla JavaScript SPA)
- **Responsive Design**: Mobile-first, works on all devices
- **Light/Dark Mode**: User preference persisted in localStorage
- **Interactive Charts**: Chart.js bar charts, doughnut charts, animated transitions
- **Smart Filtering**: Season, industry, status, and full-text search
- **Data Aggregation**: Instant calculations (total deals, capital, success rate, etc.)

### 🔐 Admin Panel
- **Secure Login**: Username/password with bcrypt hashing
- **JWT Tokens**: Stateless authentication for all API calls
- **Manual Data Reload**: Trigger Kaggle sync without code
- **Sync Status**: Real-time progress bar, logging, last sync timestamp
- **System Info**: Node version, environment, Python availability

### 📊 Backend API (Express.js)
- **Seasons API**: GET /api/seasons, /api/seasons/:id
- **Pitches API**: GET /api/pitches with season/industry/status/search filters
- **Sharks API**: GET /api/sharks, /api/sharks/:id
- **Analytics API**: Aggregated stats, metrics, chart data
- **Admin Routes**: Login, data reload, status (JWT protected)

### 🔄 Kaggle Integration
- **Automated Sync**: Python subprocess fetches from Kaggle
- **Credential Control**: Environment variables or ~/.kaggle/kaggle.json file
- **Error Handling**: Helpful messages if credentials missing
- **Logging**: Track all sync operations in sync-log.json
- **Manual Trigger**: Admin panel button to reload on-demand

### 💾 Data Storage
- **JSON Files**: No database needed, easy to version control
- **Caching**: DataService caches in memory for fast queries
- **Aggregation**: Pre-computed analytics, filters on-demand
- **Sync Logging**: Track when and what was synced

---

## Prerequisites

- **Node.js** v16 or higher → [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Python** 3.8+ (for Kaggle sync)
- **Kaggle Account** → [Free signup](https://www.kaggle.com/)

---

## Installation

1. Clone or navigate to project:
   ```bash
   cd STIH
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install -r scripts/requirements.txt
   ```

4. Set admin password (one-time setup):
   ```bash
   node setup-admin.js
   ```
   Follow prompts to set admin username & password (will be bcrypt hashed)

5. Configure Kaggle credentials:
   - **Option A (Recommended)**: Download `kaggle.json` from https://www.kaggle.com/settings/account
     - Windows: Save to `C:\Users\<YourName>\.kaggle\kaggle.json`
     - Mac/Linux: Save to `~/.kaggle/kaggle.json`
   
   - **Option B**: Set environment variables in `.env.development`:
     ```env
     KAGGLE_USERNAME=your_username
     KAGGLE_KEY=your_api_key
     JWT_SECRET=your_jwt_secret_here
     ```
   
   👉 **[KAGGLE_QUICK_START.txt](KAGGLE_QUICK_START.txt)** for detailed steps

---

## Running the Application

### Development Mode
```bash
npm run dev
```
Starts server on **http://localhost:3000** with auto-reload support.

**Visit:**
- SPA: http://localhost:3000
- Admin: http://localhost:3000/admin (login with admin credentials)
- API: http://localhost:3000/api/seasons (example endpoint)

### Running Tests
```bash
npm run test
```

### Production Mode
```bash
npm run prod
```
Optimized for deployment on port 8080.

---

## Admin Panel Workflow

1. **Start Server**: `npm run dev`
2. **Login**: Visit http://localhost:3000/admin
   - Enter admin username & password (set via `setup-admin.js`)
3. **Reload Data**: Click "🔄 Reload Data from Kaggle" button
   - Python script fetches latest data from Kaggle
   - Progress bar shows sync status
   - Console shows detailed logs
4. **Verification**: 
   - Check JSON files updated: `ls -la src/data/`
   - Refresh main app: http://localhost:3000 to see populated data

---

## Environment Variables

Create `.env.development` in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Admin
JWT_SECRET=your-super-secret-jwt-key-change-this

# Kaggle (Option 1: environment variables)
# KAGGLE_USERNAME=your_username
# KAGGLE_KEY=your_api_key

# Or use ~/.kaggle/kaggle.json file (Option 2, recommended)
```

👉 See `.env.example` for all available settings.

---

## API Endpoints

### Public Endpoints (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/seasons` | All seasons |
| GET | `/api/seasons/:id` | Single season by ID |
| GET | `/api/pitches` | All pitches (with optional filters) |
| GET | `/api/pitches/:id` | Single pitch by ID |
| GET | `/api/sharks` | All sharks |
| GET | `/api/sharks/:id` | Single shark by ID |
| GET | `/api/analytics` | Aggregated stats & metrics |

### Admin Endpoints (Require JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | Login (returns JWT token) |
| POST | `/admin/reload` | Trigger Kaggle data sync |
| GET | `/admin/status` | Last sync status & logs |

**Login Example:**
```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'

# Returns: {"token":"eyJhbGciOiJIUzI1NiIs..."}
```

**Using Token:**
```bash
curl http://localhost:3000/admin/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Kaggle Setup Troubleshooting

If Kaggle sync fails:

1. **Check Kaggle Credentials**:
   ```bash
   python scripts/fetch_kaggle_data.py
   ```
   Should show: `✓ Using Kaggle credentials from ...`

2. **Verify Dataset Access**:
   Visit https://www.kaggle.com/datasets/thirumani/shark-tank-india
   (Must be accessible from your account)

3. **Check Python Dependencies**:
   ```bash
   pip install kagglehub pandas
   ```

4. **View Detailed Logs**:
   - Admin dashboard shows real-time sync logs
   - Or check `src/data/sync-log.json`

👉 **[KAGGLE_SETUP.md](KAGGLE_SETUP.md)** for comprehensive troubleshooting.

---

## File Storage & Data Format

### Seasons (`src/data/seasons.json`)
```json
[
  {
    "id": "S01",
    "name": "Season 1",
    "year": 2015,
    "episodeCount": 30,
    "pitchCount": 150
  }
]
```

### Pitches (`src/data/pitches.json`)
```json
[
  {
    "id": "P001",
    "title": "Company Name",
    "seasonId": "S01",
    "entrepreneurs": ["Name1", "Name2"],
    "industry": "Technology",
    "askAmount": 50000000,
    "dealAmount": 25000000,
    "dealSharcks": ["Shark1", "Shark2"],
    "status": "SUCCESS"
  }
]
```

### Sharks (`src/data/sharks.json`)
```json
[
  {
    "id": "SH01",
    "name": "Shark Name",
    "title": "Investment Banker",
    "dealsCount": 145,
    "totalInvestment": 5000000000
  }
]
```

---

## Code Architecture

### Frontend Architecture (Vanilla JS)
```
public/
├── index.html              # Minimal HTML skeleton
├── js/
│   ├── core/
│   │   ├── app.js         # Router, page lifecycle
│   │   ├── api.js         # HTTP + JWT token management
│   │   └── theme.js       # Light/dark mode logic
│   ├── pages/             # Each page = separate module
│   ├── components/        # Reusable UI components
│   └── utils/             # Helpers (format, calculate, etc.)
└── css/                   # Modular CSS files
```

**How Pages Work:**
1. User navigates → `app.js` router detects URL change
2. Router calls page module (e.g., `pages/home.js`)
3. Page module:
   - Fetches data via `api.js`
   - Renders HTML via DOM manipulation
   - Attaches event listeners
4. Built-in loading states & error handling

### Backend Architecture (Express.js)
```
api/
├── routes/          # Endpoint definitions
├── controllers/     # Business logic
├── middleware/      # Auth, errors
└── services/        # Data operations
```

**Request Flow:**
1. HTTP request → Express router
2. Router maps to controller
3. Controller calls service
4. Service loads/transforms data
5. Response sent as JSON

### Service Layer
- **dataService**: Loads JSON, applies filters, aggregates analytics
- **kaggleSync**: Spawns Python process, handles sync lifecycle
- **adminAuth**: JWT token creation & verification

---

## Common Tasks

### ✏️ Add a New Page
1. Create `src/public/js/pages/newpage.js`
2. Export async `load()` function that returns HTML
3. Add route in `src/public/js/core/app.js`
4. Add link to navigation in `index.html`

### 🎨 Add New Styling
1. Edit relevant CSS file in `src/public/css/`
2. Use CSS custom properties from `variables.css` (colors, fonts)
3. Mobile-first: design small screens first, then add tablets/desktops

### 📊 Modify Data Format
1. Export from Kaggle as new format
2. Update `scripts/fetch_kaggle_data.py` to parse new format
3. Update TypeScript/documentation with new schema

### 🔐 Change Admin Password
```bash
node setup-admin.js
```

---

## Dependencies

**Node (Backend)**:
- `express@4.18.2` - Web framework
- `bcryptjs@2.4.3` - Password hashing
- `jsonwebtoken@9.0.2` - JWT authentication
- `cross-env@7.0.3` - Environment management
- `chart.js@4.4.1` - Data visualization library

**Python (Kaggle Sync)**:
- `kagglehub` - Kaggle API client
- `pandas` - Data processing

**Dev**:
- `jest` - Testing framework
- `nodemon` - Auto-reload in development

---

## Performance Tips

1. **Data Caching**: DataService caches JSON files in memory (set TTL in code)
2. **Compression**: Enable gzip in production (Express middleware)
3. **Lazy Loading**: Load page data only when page is visited
4. **Query Optimization**: Filters run in-memory on cached data (fast for dataset size)
5. **CSS**: Uses CSS Grid, CSS variables (modern browsers, fast rendering)

---

## Deployment

### Heroku
```bash
npm run prod
```
Set environment variables in Heroku dashboard → Config Vars

### Azure App Service
Create `.deployment` file, set `NODE_ENV=production`

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && pip install -r scripts/requirements.txt
CMD ["npm", "run", "prod"]
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Kill process: `npx kill-port 3000` or change PORT in `.env` |
| Kaggle: 401 Unauthorized | Regenerate API token at kaggle.com/settings/account |
| Admin login fails | Run `node setup-admin.js` to reset password |
| Empty data on frontend | Run admin panel reload or check `src/data/` JSON files |
| "Cannot find module" | Run `npm install` again, delete `node_modules/` and retry |

---

## Browser Support

- ✅ Chrome/Edge: Latest 2 versions
- ✅ Safari: Latest 2 versions  
- ✅ Firefox: Latest 2 versions
- ⚠️ IE11: Not supported (uses modern JS)

---

## License

MIT - Feel free to use this project for learning and personal projects.

---

## Contact & Support

Questions? Check the relevant guide:
- **Kaggle Setup**: [KAGGLE_SETUP.md](KAGGLE_SETUP.md)
- **Quick Start**: [KAGGLE_QUICK_START.txt](KAGGLE_QUICK_START.txt)
- **Code Issues**: Check relevant file in `src/`
