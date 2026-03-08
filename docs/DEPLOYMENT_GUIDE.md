# 🚀 Fahamu Shamba - Deployment & Mobile App Guide

## Overview
This guide covers two deployment options:
1. **Web Deployment** (accessible via QR code) - Deploy to Vercel
2. **Android App** - Convert to native Android application

---

## Option 1: Web Deployment (QR Code Access)

### Deploy to Vercel (Free)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Your app will be live at:** `https://your-project.vercel.app`

### Generate QR Code

After deployment, generate a QR code for easy mobile access:
- Go to: https://qr-code-generator.com
- Enter your Vercel URL
- Download QR code image

### Access Without Internet (PWA)

The app works offline after first load:
- Open in Chrome → Menu → "Add to Home Screen"
- Works like a native app!

---

## Option 2: Android App (Android Studio)

### Prerequisites
- Android Studio installed
- JDK 17+

### Steps

1. **Open in Android Studio:**
   - Open Android Studio
   - File → Open → Select `android-studio/FahamuShamba`

2. **Update URL:**
   - Edit: `app/src/main/java/com/fahamu/shamba/MainActivity.java`
   - Change: `websiteUrl = "https://your-vercel-url.vercel.app"`

3. **Build APK:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

4. **Install:**
   - Transfer APK to phone
   - Enable "Install from Unknown Sources"
   - Install and open!

---

## File Structure

```
fahamu-shamba1-main/
├── backend/
│   ├── public/           # HTML pages (all responsive!)
│   │   ├── farmer-dashboard.html
│   │   ├── landing-page.html
│   │   ├── recommendations.html
│   │   └── ... (24 pages total)
│   ├── server.js         # Express server
│   └── ...
├── api/
│   └── index.js         # Vercel API handler
├── android-studio/
│   └── FahamuShamba/    # Android app project
├── vercel.json          # Vercel config
├── manifest.json        # PWA manifest
└── sw.js               # Service worker (offline support)
```

---

## Features Ready for Mobile

✅ **Responsive Design** - All pages work on phones/tablets/desktop  
✅ **PWA Support** - Install to home screen, works offline  
✅ **Touch Optimized** - Large buttons, swipe gestures  
✅ **QR Code Access** - Share via QR for instant access  

---

## Quick Start

### Local Development
```bash
cd backend
npm start
# Open http://localhost:5000
```

### Deploy to Vercel
```bash
vercel --prod
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Get crop recommendation |
| `/api/weather/:subcounty` | GET | Weather data |
| `/api/market/prices` | GET | Market prices |
| `/api/stats` | GET | System statistics |

---

## Support

For issues or questions:
- 🌐 Web: https://github.com/your-repo
- 📧 Email: support@fahamu-shamba.org

