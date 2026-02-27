# Kaggle API Setup Guide

This application fetches Shark Tank India data from Kaggle. To use the data synchronization feature, you need to set up your Kaggle API credentials.

## Step 1: Get Your Kaggle API Key

1. Go to https://www.kaggle.com/settings/account
2. Scroll to "API" section
3. Click **"Create New API Token"**
4. Download the `kaggle.json` file (it contains your credentials)

## Step 2: Install Credentials

### Option A: Using kaggle.json File (Recommended for Development)

**Windows:**
```
1. Create folder: C:\Users\<YourUsername>\.kaggle
2. Place downloaded kaggle.json inside that folder
3. File path should be: C:\Users\<YourUsername>\.kaggle\kaggle.json
```

**Mac/Linux:**
```bash
mkdir -p ~/.kaggle
cp ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

### Option B: Using Environment Variables (Recommended for Production)

Add to your `.env.development` or `.env.production`:

```env
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_api_key_here
```

Or set as system environment variables:

**Windows (PowerShell):**
```powershell
$env:KAGGLE_USERNAME = "your_username"
$env:KAGGLE_KEY = "your_api_key"
```

**Windows (Command Prompt):**
```cmd
set KAGGLE_USERNAME=your_username
set KAGGLE_KEY=your_api_key
```

**Mac/Linux (Bash):**
```bash
export KAGGLE_USERNAME=your_username
export KAGGLE_KEY=your_api_key
```

## Step 3: Install Python Dependencies

```bash
pip install -r scripts/requirements.txt
# or
pip install kagglehub pandas
```

## Step 4: Test the Setup

Run the Python script manually:

```bash
python scripts/fetch_kaggle_data.py
```

**Expected Output:**
```
============================================================
SHARK TANK INDIA - KAGGLE DATA SYNC
============================================================
✓ Using Kaggle credentials from C:\Users\...\.kaggle\kaggle.json
Fetching data from Kaggle...
Successfully loaded 702 records from Kaggle
✅ Saved pitches.json (702 records)
...
✅ DATA SYNC COMPLETED SUCCESSFULLY
```

## Step 5: Use Admin Panel

1. Start the server: `npm run dev`
2. Go to http://localhost:3000/admin
3. Login with admin credentials
4. Click "🔄 Reload Data from Kaggle"

---

## Troubleshooting

### "ERROR: Kaggle credentials not found!"

**Solution:** Make sure you've done one of:
- Placed `kaggle.json` in the correct directory
- Set `KAGGLE_USERNAME` and `KAGGLE_KEY` environment variables
- Restarted your terminal after setting environment variables

### "ModuleNotFoundError: No module named 'kagglehub'"

**Solution:**
```bash
pip install kagglehub pandas
```

### "401 Unauthorized"

**Solution:** 
- Check that your API key is correct in `kaggle.json` or environment variables
- Generate a new API token from https://www.kaggle.com/settings/account
- Make sure you have access to the dataset: https://www.kaggle.com/datasets/thirumani/shark-tank-india

### "Dataset not found"

**Solution:**
- Verify the dataset exists: https://www.kaggle.com/datasets/thirumani/shark-tank-india
- Make sure your Kaggle account has access to public datasets
- Check your internet connection

---

## Where Data Goes

After successful sync, data is saved to:
- `src/data/pitches.json` - All 702 pitches
- `src/data/sharks.json` - Shark profiles
- `src/data/seasons.json` - Season information
- `src/data/industries.json` - Industry statistics
- `src/data/sync-log.json` - Last sync timestamp

## Security Notes

🔒 **Never commit `kaggle.json` or environment variables with keys to Git:**

```bash
# Add to .gitignore
echo ".kaggle/" >> .gitignore
echo ".env.*.local" >> .gitignore
```

---

That's it! Your Shark Tank data sync is ready to use. 🚀
