#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# Kaggle Data Sync Script - Fetch & Transform Shark Tank India data
# Uses correct CSV column names from: thirumani/shark-tank-india
# ═══════════════════════════════════════════════════════════════

import json
import os
import sys
import math
from pathlib import Path

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env.development'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

try:
    import kagglehub
    import pandas as pd
except ImportError:
    print("ERROR: Required packages not installed. Run: pip install kagglehub pandas python-dotenv")
    sys.exit(1)


# ═══════════════════════════════════════════════════════════════
# Shark metadata — hardcoded (not in CSV)
# ═══════════════════════════════════════════════════════════════
SHARK_META = {
    'Namita':  {'full': 'Namita Thapar',   'title': 'Executive Director, Emcure Pharma',     'emoji': '💊', 'color': '#8B5CF6'},
    'Vineeta': {'full': 'Vineeta Singh',   'title': 'CEO & Co-founder, SUGAR Cosmetics',     'emoji': '💄', 'color': '#EC4899'},
    'Anupam':  {'full': 'Anupam Mittal',   'title': 'Founder & CEO, Shaadi.com',             'emoji': '💍', 'color': '#3B82F6'},
    'Aman':    {'full': 'Aman Gupta',      'title': 'Co-founder & CMO, boAt',                'emoji': '🎧', 'color': '#F97316'},
    'Peyush':  {'full': 'Peyush Bansal',   'title': 'Co-founder & CEO, Lenskart',            'emoji': '👓', 'color': '#10B981'},
    'Ritesh':  {'full': 'Ritesh Agarwal',  'title': 'Founder & CEO, OYO Rooms',              'emoji': '🏨', 'color': '#F59E0B'},
    'Amit':    {'full': 'Amit Jain',       'title': 'Co-founder & CEO, CarDekho',            'emoji': '🚗', 'color': '#6366F1'},
    'Ashneer': {'full': 'Ashneer Grover',  'title': 'Co-founder, BharatPe (S1-S2)',          'emoji': '💸', 'color': '#EF4444'},
    'Ashneer Grover': {'full': 'Ashneer Grover', 'title': 'Co-founder, BharatPe (S1-S2)',     'emoji': '💸', 'color': '#EF4444'},
    'Kunal Bahl':  {'full': 'Kunal Bahl',    'title': 'Co-founder & CEO, Snapdeal',           'emoji': '🛒', 'color': '#06B6D4'},
}

CORE_SHARKS = ['Namita', 'Vineeta', 'Anupam', 'Aman', 'Peyush', 'Ritesh', 'Amit']
SEASON_YEARS = {1: '2021-22', 2: '2023', 3: '2024', 4: '2025', 5: '2026'}


# ═══════════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════════
def safe_float(val, default=None):
    try:
        if val is None or (isinstance(val, float) and math.isnan(val)):
            return default
        return float(val)
    except (TypeError, ValueError):
        return default

def safe_int(val, default=None):
    f = safe_float(val)
    return int(f) if f is not None else default

def safe_bool(val):
    f = safe_float(val)
    return bool(f) if f is not None else False

def safe_str(val, default=''):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return default
    s = str(val).strip()
    return s if s and s.lower() != 'nan' else default

def fmt_currency(amt_lakhs):
    if amt_lakhs is None:
        return None
    if amt_lakhs >= 100:
        return f"Rs{amt_lakhs / 100:.1f}Cr"
    return f"Rs{int(amt_lakhs)}L"


# ═══════════════════════════════════════════════════════════════
# Credentials
# ═══════════════════════════════════════════════════════════════
def setup_kaggle_credentials():
    kaggle_username = os.getenv('KAGGLE_USERNAME')
    kaggle_key = os.getenv('KAGGLE_KEY')
    if kaggle_username and kaggle_key:
        os.environ['KAGGLE_USERNAME'] = kaggle_username
        os.environ['KAGGLE_KEY'] = kaggle_key
        print("[OK] Using Kaggle credentials from environment variables")
        return True
    kaggle_json_path = Path.home() / '.kaggle' / 'kaggle.json'
    if kaggle_json_path.exists():
        print(f"[OK] Using Kaggle credentials from {kaggle_json_path}")
        return True
    print("ERROR: Kaggle credentials not found!")
    return False

def test_kaggle_connection():
    try:
        if not setup_kaggle_credentials():
            return False
        print("Testing Kaggle API connection...")
        kagglehub.dataset_download("thirumani/shark-tank-india")
        print("[OK] Kaggle API is ONLINE and accessible")
        return True
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "Unauthorized" in error_msg:
            print(f"[FAIL] Kaggle API is OFFLINE: Invalid credentials (401 Unauthorized)")
        else:
            print(f"[FAIL] Kaggle API is OFFLINE or unreachable: {error_msg}")
        return False


# ═══════════════════════════════════════════════════════════════
# Load CSV
# ═══════════════════════════════════════════════════════════════
def load_kaggle_data():
    try:
        print("Fetching data from Kaggle...")
        dataset_path = kagglehub.dataset_download("thirumani/shark-tank-india")
        print(f"[OK] Downloaded dataset to: {dataset_path}")
        import glob
        csv_files = glob.glob(f"{dataset_path}/**/*.csv", recursive=True)
        if not csv_files:
            print("[WARN] No CSV files found in dataset")
            return None
        print(f"[OK] Loading: {csv_files[0]}")
        df = pd.read_csv(csv_files[0])
        print(f"[OK] Loaded {len(df)} records, {len(df.columns)} columns")
        return df
    except Exception as e:
        print(f"[ERROR] Failed to load Kaggle data: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


# ═══════════════════════════════════════════════════════════════
# Process pitches - full schema matching data-schema.md
# ═══════════════════════════════════════════════════════════════
def process_pitches(df):
    pitches = []
    if df is None or df.empty:
        print("[WARN] No pitch data to process")
        return pitches

    for _, row in df.iterrows():
        name = safe_str(row.get('Startup Name'), f"Pitch {len(pitches)+1}")
        pitch_id = name.lower().replace(' ', '').replace('-', '').replace("'", "")

        ask_amt = safe_float(row.get('Original Ask Amount'))
        ask_eq  = safe_float(row.get('Original Offered Equity'))
        val_req = safe_float(row.get('Valuation Requested'))
        ask_val = (val_req / 100) if val_req else None

        funded        = safe_bool(row.get('Accepted Offer'))
        recv_offer    = safe_bool(row.get('Received Offer'))
        deal_amt      = safe_float(row.get('Total Deal Amount'))
        deal_eq       = safe_float(row.get('Total Deal Equity'))
        deal_val_raw  = safe_float(row.get('Deal Valuation'))
        deal_val      = (deal_val_raw / 100) if deal_val_raw else None
        total_debt    = safe_float(row.get('Total Deal Debt'))
        debt_interest = safe_float(row.get('Debt Interest'))
        royalty_pct   = safe_float(row.get('Royalty Percentage'))
        has_cond      = safe_bool(row.get('Deal Has Conditions'))

        delta_val = None
        if deal_val and ask_val and ask_val > 0:
            delta_val = round(((deal_val - ask_val) / ask_val) * 100, 1)

        if royalty_pct and royalty_pct > 0:
            deal_type = 'royalty'
        elif total_debt and total_debt > 0:
            deal_type = 'mixed'
        else:
            deal_type = 'equity'

        shark_breakdown = {}
        sharks_list = []
        for shark in CORE_SHARKS:
            amt  = safe_float(row.get(f'{shark} Investment Amount'))
            eq   = safe_float(row.get(f'{shark} Investment Equity'))
            debt = safe_float(row.get(f'{shark} Debt Amount'))
            if amt and amt > 0:
                entry = {'amt': amt, 'eq': eq or 0}
                if debt and debt > 0:
                    entry['debt'] = debt
                shark_breakdown[shark] = entry
                sharks_list.append(shark)

        guest_name_raw = safe_str(row.get('Invested Guest Name'))
        if guest_name_raw:
            # The CSV sometimes has comma-joined names e.g. "Kunal Bahl,Mohit Yadav"
            # Split them and distribute the investment amount equally among co-investors
            guest_names = [n.strip() for n in guest_name_raw.split(',') if n.strip()]
            guest_amt = safe_float(row.get('Guest Investment Amount'))
            guest_eq  = safe_float(row.get('Guest Investment Equity'))
            if guest_amt and guest_amt > 0 and guest_names:
                split_amt = round(guest_amt / len(guest_names), 2)
                split_eq  = round((guest_eq or 0) / len(guest_names), 2) if len(guest_names) > 1 else (guest_eq or 0)
                for gn in guest_names:
                    sharks_list.append(gn)
                    shark_breakdown[gn] = {'amt': split_amt, 'eq': split_eq}

        pitch = {
            'id': pitch_id, 'name': name,
            'season': safe_int(row.get('Season Number'), 1),
            'ep': safe_int(row.get('Episode Number')),
            'pitch': safe_int(row.get('Pitch Number')),
            'industry': safe_str(row.get('Industry')),
            'type': safe_str(row.get('Business Description')),
            'summary': safe_str(row.get('Business Description')),
            'city': safe_str(row.get('Pitchers City')),
            'state': safe_str(row.get('Pitchers State')),
            'website': safe_str(row.get('Company Website')),
            'startedIn': safe_str(row.get('Started in')),
            'funded': funded, 'receivedOffer': recv_offer, 'dealType': deal_type,
            'ask': fmt_currency(ask_amt) if ask_amt else None,
            'askAmt': ask_amt, 'askEq': ask_eq,
            'askVal': round(ask_val, 2) if ask_val else None,
            'deal': fmt_currency(deal_amt) if funded and deal_amt else None,
            'dealAmt': deal_amt if funded else None,
            'dealEq': deal_eq if funded else None,
            'dealVal': round(deal_val, 2) if funded and deal_val else None,
            'finalVal': round(deal_val, 2) if funded and deal_val else None,
            'deltaVal': delta_val,
            'totalDebt': total_debt if funded else None,
            'debtInterest': debt_interest if funded else None,
            'royaltyPct': royalty_pct if funded else None,
            'hasConditions': has_cond,
            'sharks': sharks_list,
            'numSharks': safe_int(row.get('Number of Sharks in Deal'), 0) if funded else 0,
            'sharkBreakdown': shark_breakdown,
            'numPresenters': safe_int(row.get('Number of Presenters')),
            'malePresenters': safe_int(row.get('Male Presenters')),
            'femalePresenters': safe_int(row.get('Female Presenters')),
            'couplePresenters': safe_bool(row.get('Couple Presenters')),
            'pitchersAge': safe_str(row.get('Pitchers Average Age')),
            'revenue': safe_float(row.get('Yearly Revenue')),
            'margin': safe_float(row.get('Gross Margin')),
            'ebitda': safe_float(row.get('EBITDA')),
            'cashBurn': safe_str(row.get('Cash Burn')),
            'skus': safe_int(row.get('SKUs')),
            'hasPatents': safe_bool(row.get('Has Patents')),
            'bootstrapped': safe_str(row.get('Bootstrapped')),
        }
        pitches.append(pitch)

    print(f"[OK] Processed {len(pitches)} pitches")
    return pitches


# ═══════════════════════════════════════════════════════════════
# Process sharks
# ═══════════════════════════════════════════════════════════════
def process_sharks(df):
    shark_stats = {s: {'deals': 0, 'invested_lakhs': 0.0, 'seasons': set(), 'industries': {}} for s in CORE_SHARKS}

    if df is not None and not df.empty:
        for _, row in df.iterrows():
            if not safe_bool(row.get('Accepted Offer')):
                continue
            season   = safe_int(row.get('Season Number'), 0)
            industry = safe_str(row.get('Industry'))
            for shark in CORE_SHARKS:
                amt = safe_float(row.get(f'{shark} Investment Amount'))
                if amt and amt > 0:
                    shark_stats[shark]['deals'] += 1
                    shark_stats[shark]['invested_lakhs'] += amt
                    if season: shark_stats[shark]['seasons'].add(season)
                    if industry: shark_stats[shark]['industries'][industry] = shark_stats[shark]['industries'].get(industry, 0) + 1

    sharks = []
    for i, shark in enumerate(CORE_SHARKS):
        meta  = SHARK_META[shark]
        stats = shark_stats[shark]
        top_ind = sorted(stats['industries'].items(), key=lambda x: -x[1])
        sharks.append({
            'id': i+1, 'name': shark, 'fullName': meta['full'],
            'title': meta['title'], 'emoji': meta['emoji'], 'color': meta['color'],
            'deals': stats['deals'],
            'investedCr': round(stats['invested_lakhs'] / 100, 1),
            'topIndustries': [ind for ind, _ in top_ind[:3]],
            'seasons': sorted(stats['seasons']),
        })

    # Guest sharks — dynamically tally all non-core investors from 'Invested Guest Name'
    guest_stats = {}  # name -> {deals, invested_lakhs, seasons, industries}
    if df is not None and not df.empty:
        for _, row in df.iterrows():
            if not safe_bool(row.get('Accepted Offer')):
                continue
            guest_name_raw = safe_str(row.get('Invested Guest Name'))
            if not guest_name_raw:
                continue
            guest_names = [n.strip() for n in guest_name_raw.split(',') if n.strip()]
            guest_amt_total = safe_float(row.get('Guest Investment Amount'))
            if not (guest_amt_total and guest_amt_total > 0):
                continue
            split_amt = round(guest_amt_total / len(guest_names), 2)
            season   = safe_int(row.get('Season Number'), 0)
            industry = safe_str(row.get('Industry'))
            for gn in guest_names:
                if gn not in guest_stats:
                    guest_stats[gn] = {'deals': 0, 'invested_lakhs': 0.0, 'seasons': set(), 'industries': {}}
                guest_stats[gn]['deals'] += 1
                guest_stats[gn]['invested_lakhs'] += split_amt
                if season: guest_stats[gn]['seasons'].add(season)
                if industry: guest_stats[gn]['industries'][industry] = guest_stats[gn]['industries'].get(industry, 0) + 1

    for i, (gn, gstats) in enumerate(sorted(guest_stats.items(), key=lambda x: -x[1]['deals'])):
        meta = SHARK_META.get(gn) or SHARK_META.get(gn.split()[0]) or {'full': gn, 'title': 'Guest Shark', 'emoji': '🦈', 'color': '#888888'}
        top_ind = sorted(gstats['industries'].items(), key=lambda x: -x[1])
        sharks.append({
            'id': len(CORE_SHARKS) + 1 + i,
            'name': gn, 'fullName': meta.get('full', gn),
            'title': meta.get('title', 'Guest Shark'),
            'emoji': meta.get('emoji', '🦈'),
            'color': meta.get('color', '#888888'),
            'deals': gstats['deals'],
            'investedCr': round(gstats['invested_lakhs'] / 100, 1),
            'topIndustries': [ind for ind, _ in top_ind[:3]],
            'seasons': sorted(gstats['seasons']),
        })

    print(f"[OK] Processed {len(sharks)} sharks")
    return sharks


# ═══════════════════════════════════════════════════════════════
# Process seasons
# ═══════════════════════════════════════════════════════════════
def process_seasons(df):
    seasons = []
    for num in range(1, 6):
        year = SEASON_YEARS.get(num, str(num))
        if df is not None and not df.empty and 'Season Number' in df.columns:
            s_df = df[df['Season Number'] == num]
            total     = len(s_df)
            funded    = int(s_df['Accepted Offer'].apply(safe_bool).sum())
            deal_rate = round(funded / total * 100) if total > 0 else 0
            invested_lakhs = s_df['Total Deal Amount'].apply(lambda v: safe_float(v, 0)).sum()
            invested_cr = round(invested_lakhs / 100, 1)
            episodes  = int(s_df['Episode Number'].max()) if total > 0 else 0
            start_date = safe_str(s_df['Season Start'].iloc[0]) if total > 0 else ''
            end_date   = safe_str(s_df['Season End'].iloc[0]) if total > 0 else ''
        else:
            total = funded = deal_rate = episodes = 0
            invested_cr = 0.0
            start_date = end_date = ''

        seasons.append({
            'id': num, 'number': num, 'name': f'Season {num}',
            'year': year, 'startDate': start_date, 'endDate': end_date,
            'totalPitches': total, 'dealsClosedCount': funded,
            'dealRate': deal_rate, 'investedCr': invested_cr, 'episodes': episodes,
        })

    print(f"[OK] Processed {len(seasons)} seasons")
    return seasons


# ═══════════════════════════════════════════════════════════════
# Process industries
# ═══════════════════════════════════════════════════════════════
def process_industries(df):
    industries = []
    if df is None or df.empty or 'Industry' not in df.columns:
        return industries
    for ind, group in df.groupby('Industry'):
        total  = len(group)
        funded = int(group['Accepted Offer'].apply(safe_bool).sum())
        deal_rate = round(funded / total * 100) if total > 0 else 0
        invested_lakhs = group['Total Deal Amount'].apply(lambda v: safe_float(v, 0)).sum()
        industries.append({
            'name': str(ind), 'total': total, 'funded': funded,
            'dealRate': deal_rate, 'investedCr': round(invested_lakhs / 100, 1),
        })
    industries.sort(key=lambda x: -x['total'])
    print(f"[OK] Processed {len(industries)} industries")
    return industries


# ═══════════════════════════════════════════════════════════════
# Save raw CSV
# ═══════════════════════════════════════════════════════════════
def save_raw_csv(df):
    try:
        from datetime import datetime
        data_dir = Path(__file__).parent.parent / 'src' / 'data' / 'raw'
        data_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%d%m%y%H%M%S')
        filename  = f'kaggle_raw_{timestamp}.csv'
        df.to_csv(data_dir / filename, index=False, encoding='utf-8')
        df.to_csv(data_dir / 'kaggle_raw_latest.csv', index=False, encoding='utf-8')
        print(f"[SUCCESS] Saved raw CSV: {filename} ({len(df)} records, {len(df.columns)} columns)")
        print(f"[SUCCESS] Updated latest raw CSV snapshot")
        return True, filename
    except Exception as e:
        print(f"[ERROR] Failed to save raw CSV: {str(e)}")
        return False, None


# ═══════════════════════════════════════════════════════════════
# Save JSON
# ═══════════════════════════════════════════════════════════════
def save_json(filename, data):
    try:
        data_dir = Path(__file__).parent.parent / 'src' / 'data'
        data_dir.mkdir(parents=True, exist_ok=True)
        filepath = data_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"[SUCCESS] Saved {filename} ({len(data)} records)")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to save {filename}: {str(e)}")
        return False


# ═══════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════
def main():
    print('=' * 60)
    print('SHARK TANK INDIA - KAGGLE DATA SYNC')
    print('=' * 60)

    if not setup_kaggle_credentials():
        print('\nFAILED: Kaggle credentials not configured')
        return False

    df = load_kaggle_data()
    if df is None:
        print('ERROR: Failed to load Kaggle data')
        return False

    print('\n' + '=' * 60)
    print('SAVING RAW DATA')
    print('=' * 60)
    save_raw_csv(df)

    print('\n' + '=' * 60)
    print('PROCESSING AND SAVING DATA')
    print('=' * 60)
    all_success = True

    pitches = process_pitches(df)
    if not save_json('pitches.json', pitches): all_success = False

    sharks = process_sharks(df)
    if not save_json('sharks.json', sharks): all_success = False

    seasons = process_seasons(df)
    if not save_json('seasons.json', seasons): all_success = False

    industries = process_industries(df)
    if not save_json('industries.json', industries): all_success = False

    sync_log = [{'lastSyncAt': pd.Timestamp.now().isoformat(), 'status': 'success' if all_success else 'partial',
                 'recordsImported': {'pitches': len(pitches), 'sharks': len(sharks), 'seasons': len(seasons), 'industries': len(industries)}}]
    save_json('sync-log.json', sync_log)

    print('=' * 60)
    if all_success:
        print(f'[SUCCESS] SYNC DONE: {len(pitches)} pitches, {len(sharks)} sharks, {len(seasons)} seasons, {len(industries)} industries')
        return True
    else:
        print('[WARN] SYNC COMPLETED WITH ERRORS')
        return False


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        sys.exit(0 if test_kaggle_connection() else 1)
    else:
        sys.exit(0 if main() else 1)
