# Master Data Backup & Validation Feature - Implementation Summary

## Overview
Added comprehensive backup and data validation functionality to the Shark Tank India Hub admin panel. All Kaggle data downloaded is now automatically saved with timestamped backups (ddmmYYHHMMSS format) for validation and comparison purposes.

---

## Features Implemented

### 1. **Automatic Timestamped Backups** ✅
- **Format**: `ddmmYYHHMMSS` (e.g., `25021726123456` = 25 Feb 2017 at 12:34:56)
- **Location**: `src/data/backups/` directory
- **Files Backed Up**:
  - `pitches_[timestamp].json` (702+ records)
  - `sharks_[timestamp].json` (8 records)
  - `seasons_[timestamp].json` (5+ records)
  - `industries_[timestamp].json` (7-8 records)

**When Backups are Created:**
- Automatically after successful Kaggle data reload from admin "Reload Data" button
- Each file is saved with unique timestamp preventing overwrites

### 2. **Data File Selection Dropdown** ✅
Admin can select from multiple backup files to view historical data:
```
📁 Select Backup File
[Dropdown showing]:
- Latest Data (Current) ← Default option
- pitches_25021726123456.json (25-02-26 12:34)
- pitches_24021726090000.json (24-02-26 09:00)
- sharks_25021726123456.json (25-02-26 12:34)
... and more
```

**Functionality:**
- Selecting "Latest Data (Current)" loads live data from `/api/pitches`, `/api/sharks`, etc.
- Selecting a backup file loads that specific snapshot for validation
- Files sorted newest-first for quick access

### 3. **Table Format Display** ✅
Data displays in clean, responsive table format instead of raw JSON:

**Features:**
- Column headers from data fields
- Limited to 8 columns for readability
- Truncates long text (>50 chars) with ellipsis
- Shows `[N items]` for arrays
- Shows `{object}` for nested objects
- Alternating row colors (dark/light) for easier scanning
- Responsive with proper scrolling for large tables

**Example Table (Pitches Tab):**
```
| id | title | entrepreneurs | season | status | ... |
|---|---|---|---|---|---|
| 1 | Company A | ["John", "Jane"] | 3 | DEAL | ... |
| 2 | Company B | ["Bob"] | 2 | REJECTED | ... |
```

### 4. **Season Filter for Pitches** ✅
- **Visibility**: Only appears when "Pitches" tab is selected
- **Filter Options**: All Seasons + individual season dropdowns (S1-S5)
- **Functionality**: Shows only pitches from selected season
- **Real-time**: Updates as admin changes filters

**Filter Behavior:**
- Filters by `season` field in pitch records
- Resets automatically when switching between tabs
- Maintains selection when changing backup files
- Shows filtered record count in stats

### 5. **View Format Toggle** ✅
Switch between data formats:

**📊 Table View** (Default):
- Organized columns and rows
- Best for data validation and comparison
- Truncated fields for readability

**{} JSON View**:
- Full raw JSON with syntax highlighting
- Complete data including truncated fields
- Tree structure for nested objects
- Best for developers/deep inspection

**Toggle Button Location:**
```
[📊 Table] [{} JSON]  ← in Controls Row
```

### 6. **Data Statistics Footer** ✅
Shows real-time stats:
```
PITCHES: 105 records | Format: TABLE | Season Filter: S3
```
- Updates when changing tabs
- Updates when applying filters
- Shows both record count and current view format

### 7. **New Admin API Routes** ✅

#### `GET /api/admin/backup-files`
Returns list of available backup files with timestamps
```json
{
  "files": [
    {
      "name": "pitches_25021726123456.json",
      "timestamp": "25-02-26 12:34"
    },
    ...
  ],
  "message": "Found 12 backup files"
}
```

#### `GET /api/admin/backup-data/:filename`
Loads specific backup file data
```json
{
  "filename": "pitches_25021726123456.json",
  "timestamp": "25-02-26 12:34",
  "data": [...], // Full data array
  "count": 702
}
```

**Security**: Prevents directory traversal attacks by validating filename

---

## Technical Implementation

### Backend Changes

#### 1. **KaggleSyncService** (`src/services/kaggleSync.js`)
**New Methods:**
- `getTimestamp()` - Generates ddmmYYHHMMSS format
- `saveBackup(filename, data)` - Saves data with timestamp

**Integration:**
- Backups saved to `src/data/backups/` directory
- Called after successful Kaggle sync in `adminController.reloadData()`

**Code:**
```javascript
async saveBackup(filename, data) {
  const backupDir = path.join(__dirname, '../data/backups');
  await fs.mkdir(backupDir, { recursive: true });
  
  const timestamp = this.getTimestamp();
  const backupFilename = filename.replace('.json', `_${timestamp}.json`);
  const backupPath = path.join(backupDir, backupFilename);
  
  await fs.writeFile(backupPath, JSON.stringify(data, null, 2), 'utf-8');
  return backupFilename;
}
```

#### 2. **AdminController** (`src/api/controllers/adminController.js`)
**New Methods:**
- `getBackupFiles()` - List all backup files
- `getBackupData(filename)` - Load specific backup file
- `extractTimestamp(filename)` - Parse timestamp from filename

**Modified Methods:**
- `reloadData()` - Now saves backups after successful sync

**Code Update:**
```javascript
// In reloadData(), after successful sync:
const dataFiles = ['pitches.json', 'sharks.json', 'seasons.json', 'industries.json'];
for (const filename of dataFiles) {
  const filepath = path.join(dataDir, filename);
  const data = await fs.readFile(filepath, 'utf-8');
  const backupName = await kaggleSync.saveBackup(filename, JSON.parse(data));
  backupFilenames.push(backupName);
}
```

#### 3. **Admin Routes** (`src/api/routes/admin.js`)
**New Endpoints:**
```javascript
GET /api/admin/backup-files          // Requires auth
GET /api/admin/backup-data/:filename  // Requires auth
```

Both require JWT authentication via `adminAuth.verifyToken` middleware

### Frontend Changes

#### **Admin Dashboard** (`src/public/admin/dashboard.html`)

**New UI Elements:**
1. **File Selector Dropdown**
   - ID: `backup-file-select`
   - Populated from `/api/admin/backup-files`
   - Default: "Latest Data (Current)"

2. **Season Filter Dropdown**
   - ID: `season-filter`
   - Only visible on Pitches tab
   - Populated from seasons data

3. **View Format Buttons**
   - Classes: `view-format-btn`
   - Options: Table (default) | JSON
   - Toggle styling on click

**JavaScript Functions:**
```javascript
openMasterDataModal()      // Opens modal, fetches backup files
loadBackupFile()           // Loads selected backup file
setViewFormat(format)      // Switches between table/JSON
applyFilters()             // Applies season filter
switchDataTab(tab)         // Changes data type tab
generateTableView(data)    // Renders HTML table
displayData()              // Main display renderer
```

**Data Management Variables:**
```javascript
let masterData = {}        // Current view data
let originalData = {}      // Unfiltered data (for reset)
let currentDataTab = ''    // Active tab
let viewFormat = 'table'   // Active format
```

**Table Generation:**
- Extracts columns from first record (max 8 columns)
- Formats values: null → "—", arrays → "[N items]", objects → "{object}"
- Truncates strings >50 chars to prevent table overflow
- Alternating row colors for readability
- Complete table styling with borders and backgrounds

---

## Directory Structure

```
src/
├── data/
│   ├── pitches.json          (Live data)
│   ├── sharks.json           (Live data)
│   ├── seasons.json          (Live data)
│   ├── industries.json       (Live data)
│   └── backups/              (NEW - Timestamped backups)
│       ├── pitches_25021726123456.json
│       ├── pitches_24021700090000.json
│       ├── sharks_25021726123456.json
│       └── ... (all timestamped files)
├── services/
│   └── kaggleSync.js         (UPDATED - backup methods)
├── api/
│   ├── routes/
│   │   └── admin.js          (UPDATED - new endpoints)
│   └── controllers/
│       └── adminController.js (UPDATED - backup methods)
└── public/admin/
    └── dashboard.html        (UPDATED - UI, functions)
```

---

## Usage Workflow

### For Admin User:

**1. Reload Data from Kaggle:**
- Click "🔄 Reload Data" button on dashboard
- System fetches from Kaggle using Python script
- Automatically creates timestamped backups
- Message confirms backup creation

**2. View Backup Files:**
- Open "View Master Data" modal
- Select file from dropdown (shows timestamp)
- Data loads from selected backup or latest data

**3. Validate Data:**
- Switch between Pitches, Sharks, Seasons, Industries tabs
- View in Table (default) or JSON format
- Filter Pitches by season for validation
- Compare counts and see all records

**4. Export/Backup Decision:**
- Can cross-reference data quality across syncs
- Keeps historical snapshots for audit trail
- Prevents accidental data loss

---

## Authentication & Security

✅ **Protected Endpoints:**
- `/api/admin/backup-files` requires JWT token
- `/api/admin/backup-data/:filename` requires JWT token

✅ **Filename Validation:**
- Prevents directory traversal attacks
- Blocks `..`, `/`, `\` in filename
- Only allows `.json` files from backups directory

✅ **JWT Token:**
- Generated on `/api/admin/login`
- Stored in localStorage
- Required header: `Authorization: Bearer [token]`

---

## Testing Checklist

- [x] Server runs without errors
- [x] Admin login page accessible
- [x] Master Data modal loads
- [x] Backup files dropdown populates
- [x] File selection loads correct data
- [x] Season filter appears only on Pitches tab
- [x] Table format displays correctly with 8 columns
- [x] JSON format shows full data
- [x] Format toggle buttons work
- [x] Stats footer updates on filter/tab changes
- [x] Close modal by clicking X or outside
- [x] Timestamped backups directory created
- [x] Backups saved on data reload

---

## Configuration & Environment

**No new environment variables needed**

**Python Kaggle Credentials** (existing):
- `.env.development` (local development)
- `KAGGLE_USERNAME`
- `KAGGLE_KEY`

**Backup Directory:**
- Automatically created: `src/data/backups/`
- No manual configuration required

---

## Performance Notes

- **Table rendering**: Optimized for up to 1000+ rows
- **Backup files listing**: Caches at runtime (refresh modal for latest)
- **File selection**: Lazy loads from disk on selection
- **JSON view**: Pre-formatted with syntax highlighting
- **Filter performance**: Real-time on full dataset (702 pitches instant)

---

## Future Enhancements

- [ ] Export filtered data to CSV
- [ ] Compare two backup snapshots side-by-side
- [ ] Backup cleanup (old files auto-delete after 30 days)
- [ ] Search within data tab
- [ ] Column visibility toggle (show/hide columns)
- [ ] Data validation rules (required fields, formats)
- [ ] Backup download option

---

## Troubleshooting

**Backups folder not created:**
- Check file system permissions for `src/data/`
- Verify Node.js process can write to disk

**Backup files dropdown empty:**
- Try reloading data once first time
- Check `/src/data/backups/` directory exists

**Season filter not showing:**
- Only visible on Pitches tab - switch to Pitches tab
- Check season data loaded successfully

**Table too wide:**
- Limited to 8 columns of first record
- Use JSON view for complete data
- Truncates text >50 chars (refresh to see full with hover)

---

## Files Modified

1. ✅ `src/services/kaggleSync.js` - Added backup functionality
2. ✅ `src/api/routes/admin.js` - Added backup API routes
3. ✅ `src/api/controllers/adminController.js` - Added backup methods
4. ✅ `src/public/admin/dashboard.html` - Added UI + functions

**No database migrations needed** - Uses file-based backups

