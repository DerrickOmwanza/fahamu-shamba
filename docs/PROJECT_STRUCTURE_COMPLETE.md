# Fahamu Shamba - Complete Project Structure

## 📁 Root Directory Overview

```
fahamu-shamba1-main/
├── public/                    # Static files served by Vercel (ROOT LEVEL)
├── api/                      # Serverless API handlers
├── backend/                  # Backend services & utilities
├── frontend/                 # Frontend source files
├── android-studio/           # Android mobile app
├── photos/                   # Uploaded photos storage
├── vercel.json               # Vercel deployment configuration
├── index.html                # Root HTML entry point
├── package.json              # Node.js dependencies
└── [100+ documentation files] # Guides, READMEs, configs
```

---

## 📂 public/ (Static Files - Served by Vercel)

```
public/
├── index.html                    # ⭐ LANDING PAGE - First page served
├── dashboard.html                # Farmer dashboard
├── community.html                # Community page
├── market.html                  # Market prices page
├── feedback.html                # Feedback page
├── farmer-profile.html          # Farmer profile page
├── recommendations.html        # Crop recommendations
├── settings.html                # Settings page
├── landing-page.html           # Alternative landing page
├── landing-page-optimized.html  # Optimized landing page
├── crop-prediction.html         # Crop prediction tool
├── crop-details.html            # Crop details page
├── market-trends.html           # Market trends page
├── ussd-simulator.html          # USSD simulator
├── api-tester.html              # API testing tool
├── admin-dashboard.html          # Admin dashboard
├── farmer-dashboard.html        # Farmer dashboard variants
├── farmer-dashboard-modern.html
├── farmer-dashboard-premium.html
├── farmer-dashboard-professional.html
├── farmer-dashboard-refined.html
├── farmer-module.html
├── farmer-profile-dashboard.html
├── community-market.html
├── manifest.json                # PWA manifest
├── sw.js                        # Service worker
├── fahamu-logo.png              # Logo file
├── language-utils.js             # Language utilities
├── crop-prediction-fix.js       # Crop prediction fixes
├── js/
│   ├── translations.js          # Translation strings
│   └── market-trends.js        # Market trends JS
└── translations/
    ├── en.json                  # English translations
    ├── sw.json                  # Swahili translations
    └── luo.json                 # Dholuo translations
```

---

## 📂 api/ (Serverless API)

```
api/
├── index.js                     # Main API handler
├── package.json                 # API dependencies
└── [other API files]
```

### API Endpoints:
- `/api/health` - Health check
- `/api/test` - API test
- `/api/predict` - Crop prediction (POST)
- `/api/weather/:subcounty` - Weather data
- `/api/market/prices` - Market prices
- `/api/market-trends` - Market trends
- `/api/stats` - Statistics
- `/api/community/stats` - Community stats

---

## 📂 backend/ (Backend Services)

```
backend/
├── public/                      # Legacy public files (NOT used by Vercel)
│   ├── landing-page.html
│   ├── farmer-dashboard.html
│   ├── community.html
│   ├── feedback.html
│   ├── farmer-profile.html
│   ├── settings.html
│   ├── community-market.html
│   ├── manifest.json
│   ├── sw.js
│   └── crop-prediction.html
├── community-routes.js         # Community API routes
├── community-service.js         # Community business logic
├── feedback-routes.js          # Feedback API routes
├── feedback-service.js         # Feedback business logic
├── market-routes.js            # Market API routes
├── market-service.js           # Market business logic
├── recommendation-engine.js    # ML recommendation engine
├── ussd-service.js             # USSD service
└── [other backend files]
```

---

## 📂 android-studio/ (Mobile App)

```
android-studio/
├── FahamuShamba/                # Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/fahamu/shamba/
│   │   │   │   └── MainActivity.java
│   │   │   ├── res/
│   │   │   │   ├── layout/
│   │   │   │   │   └── activity_main.xml
│   │   │   │   ├── values/
│   │   │   │   │   ├── colors.xml
│   │   │   │   │   ├── strings.xml
│   │   │   │   │   └── themes.xml
│   │   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle.properties
└── [Gradle wrapper files]
```

---

## 📂 frontend/ (Frontend Source)

```
frontend/
└── [Frontend source files]
```

---

## 📂 photos/ (Photo Storage)

```
photos/
└── [Uploaded farmer photos]
```

---

## 🔧 Configuration Files

```
Root Configuration:
├── vercel.json                 # Vercel routing & builds
├── package.json                # Root dependencies
├── .env.local                 # Environment variables
├── .gitignore                 # Git ignore rules
└── [100+ markdown docs]        # Documentation
```

---

## 📋 Key Documentation Files

### Deployment & Setup:
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Detailed deployment
- `QUICK_START.md` - Quick start guide
- `START_HERE.md` - Entry point for new developers

### Features:
- `LOGIN_SYSTEM_COMPLETE.md` - Login/authentication system
- `MULTILINGUAL_FEATURE_GUIDE.md` - Multilingual support
- `FARMER_PROFILE_IMPLEMENTATION_SUMMARY.md` - Farmer profiles
- `MARKET_PRICES_SYNC_INDEX.md` - Market prices feature

### USSD:
- `USSD_COMPLETE_GUIDE.md` - USSD implementation
- `USSD_SYSTEM_ARCHITECTURE.md` - USSD architecture
- `USSD_QUICK_REFERENCE.md` - Quick USSD reference

### ML Model:
- `ML_MODEL_PHASE1_COMPLETE.md` - ML model phase 1
- `ML_MODEL_STATUS_SUMMARY.md` - ML model status
- `RECOMMENDATIONS_PAGE_FIX.md` - Recommendations page

### Admin:
- `ADMIN_DASHBOARD_GUIDE.md` - Admin dashboard guide
- `ADMIN_EMAIL_OTP_SETUP.md` - OTP setup
- `MFA_SETUP_GUIDE.md` - Multi-factor authentication

---

## 🌐 Deployment Configuration (vercel.json)

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/", "destination": "/index.html" },
    { "source": "/dashboard", "destination": "/dashboard.html" },
    { "source": "/community", "destination": "/community.html" },
    { "source": "/market", "destination": "/market.html" },
    { "source": "/feedback", "destination": "/feedback.html" },
    { "source": "/profile", "destination": "/profile.html" },
    { "source": "/recommendations", "destination": "/recommendations.html" }
  ]
}
```

---

## 🔑 Key URLs (After Deployment)

| Route | Page |
|-------|------|
| `/` | Landing Page (index.html) |
| `/dashboard` | Farmer Dashboard |
| `/community` | Community Page |
| `/market` | Market Prices |
| `/feedback` | Feedback Page |
| `/profile` | Farmer Profile |
| `/recommendations` | Crop Recommendations |
| `/api/*` | API Endpoints |

---

## 📱 App Features

1. **Crop Prediction** - AI-powered crop recommendations
2. **Weather Forecasts** - Real-time weather for Siaya
3. **Market Prices** - Track crop prices across markets
4. **Farmer Profiles** - Manage farmer information
5. **Community** - Farmer community discussions
6. **Feedback** - User feedback system
7. **Multilingual** - English, Swahili, Dholuo
8. **USSD** - Feature phone support (*384*86#)
9. **PWA** - Progressive Web App support

---

## 🚀 Quick Start Commands

```bash
# Deploy to Vercel
vercel --prod

# Development
vercel dev

# Install dependencies
npm install
```

---

*Last Updated: 2025*
*Project: Fahamu Shamba - Smart Farming Intelligence for Siaya County*

