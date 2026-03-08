# Quick File Reference - Where to Find What

## 🎯 Active Page Files (in `/public`)

| Feature | File | Purpose |
|---------|------|---------|
| **Home** | `index.html` | Landing page |
| **Login** | `login.html` | Username + password login |
| **Sign-Up** | `signup.html` | New account creation |
| **Dashboard** | `dashboard.html` | Main farmer dashboard |
| **Profile** | `profile.html` | Profile with photo upload |
| **Market** | `market.html` | Market prices |
| **Market Trends** | `market-trends.html` | Price trends |
| **Recommendations** | `recommendations.html` | Crop recommendations |
| **Settings** | `settings.html` | User settings |
| **Community** | `community.html` | Community feed |
| **Community Market** | `community-market.html` | Community marketplace |
| **Feedback** | `feedback.html` | Feedback form |
| **Crop Prediction** | `crop-prediction.html` | ML crop prediction |
| **Crop Details** | `crop-details.html` | Detailed crop info |
| **USSD Simulator** | `ussd-simulator.html` | USSD testing tool |

## 🛠 Support Files (in `/public`)

| File | Purpose |
|------|---------|
| `language-utils.js` | Multilingual support |
| `sw.js` | Service worker (PWA) |
| `manifest.json` | PWA manifest |
| `fahamu-logo.png` | App logo |

## 📚 Documentation (in `/docs`)

### Quick Start Guides
- `START_HERE.md` - Begin here
- `QUICK_START.md` - Quick reference
- `QUICKSTART.md` - Alternative quickstart

### Authentication
- `LOGIN_QUICK_REFERENCE.md`
- `OTP_DOCUMENTATION_INDEX.md`
- `MFA_QUICK_START.md`
- `USERNAME_PASSWORD_MIGRATION.md` ← Latest

### Farmer Profiles
- `FARMER_PROFILE_QUICK_REFERENCE.txt`
- `FARMER_PROFILE_INTEGRATION_GUIDE.md`
- `FARMER_PROFILE_MIGRATION_GUIDE.md`

### Photos & Media
- `PASSPORT_PHOTO_QUICK_REFERENCE.md`
- `PHOTO_UPLOAD_QUICK_START.md`
- `HOW_TO_VERIFY_IMAGES.md`

### Market & Pricing
- `MARKET_PRICES_QUICK_REFERENCE.md`
- `MARKET_SYNC_TEST_GUIDE.md`

### Mobile & Design
- `MOBILE_RESPONSIVE_GUIDE.md`
- `MOBILE_OPTIMIZATION_SUMMARY.md`
- `DESIGN_IMPROVEMENTS_SUMMARY.md`

### Admin System
- `ADMIN_DASHBOARD_GUIDE.md`
- `ADMIN_QUICKSTART.md`

### USSD
- `USSD_QUICK_START.txt`
- `USSD_QUICK_REFERENCE.md`
- `USSD_CODE_QUICK_REFERENCE.md`

### Deployment
- `DEPLOYMENT_GUIDE.md`
- `COMPLETE_DEPLOYMENT_GUIDE.md`

### Testing
- `LANGUAGE_TESTING_GUIDE.md`
- `RESPONSIVE_TESTING_CHECKLIST.md`

## 🗂 Backend Code (in `/backend` and `/api`)

| Purpose | Location |
|---------|----------|
| API Routes | `/api` |
| Server Config | `/backend` |
| Database Setup | `/backend` |

## 🎨 Styling & Assets

| Item | Location |
|------|----------|
| Logo | `/public/fahamu-logo.png` |
| JavaScript Modules | `/public/js/` |
| Translations | `/public/translations/` |

## 📱 Mobile App

| Item | Location |
|------|----------|
| Android Studio | `/android-studio/` |

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.env.local` | Local development config |
| `.env.production` | Production config |
| `vercel.json` | Vercel deployment |
| `VERCEL_CONFIG_FINAL.json` | Backup Vercel config |
| `.gitignore` | Git ignore rules |

## 🚀 Setup Scripts

| Script | Purpose |
|--------|---------|
| `FARMER_PROFILE_SETUP.sh` | Setup farmer profiles |
| `SETUP_EMAIL_OTP.sh` | Configure OTP |
| `INSTANT_VERIFICATION.sh` | Quick verification |

## 📊 Testing Files

| File | Purpose |
|------|---------|
| `test_ml_api.js` | Test ML API |
| `test_ml_improvements.py` | Test ML improvements |
| `test_ussd_validation.py` | Test USSD validation |
| `test_ussd_code_validation.ps1` | PowerShell USSD tests |

## 💡 Quick Navigation Tips

### I need to edit a page
→ Go to `/public/*.html`

### I need to understand a feature
→ Check `/docs/*_QUICK_REFERENCE.md`

### I need setup instructions
→ Read `/docs/START_HERE.md`

### I need to configure something
→ Check `.env` files or `/docs/*_SETUP*.md`

### I need to deploy
→ Read `/docs/DEPLOYMENT_GUIDE.md`

### I need to test something
→ Look in `/public/*-simulator.html` or use test files

## 📋 Most Important Files

**For Users:**
1. `public/login.html` - User authentication
2. `public/signup.html` - New account
3. `public/profile.html` - User profile
4. `public/dashboard.html` - Main interface

**For Developers:**
1. `docs/START_HERE.md` - Getting started
2. `docs/PROJECT_CLEANUP_SUMMARY.md` - Project structure
3. `docs/USERNAME_PASSWORD_MIGRATION.md` - Latest updates
4. `vercel.json` - Deployment config

**For Administrators:**
1. `docs/ADMIN_DASHBOARD_GUIDE.md` - Admin features
2. `docs/DEPLOYMENT_GUIDE.md` - Deployment steps

---

## ✅ File Cleanup Status

**Deleted (No longer in project):**
- Dashboard.html (duplicate)
- api-tester.html (test file)
- crop-prediction-fix.js (merged)
- landing-page-optimized.html (old version)
- f (empty file)

**Kept (Active files):**
- All pages in `/public` (25 files)
- All documentation (170+ files)
- All configuration files

**Organized:**
- 170+ docs files moved to `/docs` folder
- Root directory now has only essential files

---

**Last Updated:** 2026-03-08  
**Status:** ✅ Clean & Organized
