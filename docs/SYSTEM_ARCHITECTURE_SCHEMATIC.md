# Fahamu Shamba - System Architecture Schematic

## 📋 Executive Summary
**Current Status**: Web application with complete backend API, authentication, and dashboard  
**Next Phase**: Mobile application development (React Native/Flutter)  
**Foundation**: Fully functional REST API ready for mobile consumption

---

## 🏗️ System Overview

### What We've Built

#### **1. Backend Infrastructure (Node.js/Express)**
```
✅ REST API Server
   ├── Authentication Endpoints
   │   ├── POST /api/auth/register (Step 1: Phone + Password)
   │   ├── POST /api/auth/register-profile (Step 2: Farm Details)
   │   ├── POST /api/auth/login
   │   ├── GET /api/auth/user (Fetch user profile)
   │   └── POST /api/auth/logout
   │
   ├── Recommendation Endpoints
   │   ├── POST /api/analyze-farm (Generate recommendations)
   │   ├── POST /api/predict
   │   └── GET /api/predictions
   │
   └── Utility Endpoints
       ├── POST /api/ussd (USSD gateway)
       ├── POST /api/feedback
       └── GET /api/market (Market data)
```

#### **2. Database Layer (SQLite)**
```
✅ Tables Created:
   ├── users
   │   ├── id (Primary Key)
   │   ├── phone (Unique)
   │   ├── password_hash
   │   ├── name
   │   ├── email
   │   └── timestamps
   │
   ├── farms
   │   ├── user_id (Foreign Key)
   │   ├── location (County)
   │   ├── ward
   │   ├── farm_size
   │   ├── farm_size_unit
   │   ├── soil_type
   │   └── water_source
   │
   ├── sessions
   │   ├── user_id
   │   ├── token_jti
   │   └── expires_at
   │
   ├── predictions
   │   ├── phone_number
   │   ├── sub_county
   │   ├── soil_type
   │   ├── season
   │   ├── predicted_crop
   │   └── confidence
   │
   └── locations
       ├── county
       └── ward
```

#### **3. Security Features**
```
✅ Implemented:
   ├── JWT Token-based Authentication
   │   ├── Token generation on registration/login
   │   ├── 7-day token expiry
   │   └── Bearer token validation
   │
   ├── Password Security
   │   ├── bcryptjs hashing (10 rounds)
   │   └── Minimum 6 characters enforcement
   │
   ├── Data Validation
   │   ├── Phone number format validation (E.164)
   │   ├── Email validation
   │   └── Input sanitization
   │
   ├── HTTP Security
   │   ├── CORS enabled
   │   ├── Security headers (Content-Security-Policy, X-Frame-Options)
   │   └── Body size limits (50MB)
   │
   └── API Protection
       ├── Bearer token verification
       ├── User context extraction
       └── 404 error handling
```

#### **4. Frontend - Web Application**
```
✅ Completed Pages:
   │
   ├── Landing Page
   │   ├── Language selector (English/Kiswahili/Dholuo)
   │   ├── Feature highlights
   │   └── CTA buttons
   │
   ├── Authentication Pages (login-register.html)
   │   ├── Login Form
   │   │   ├── Phone number input
   │   │   ├── Password input
   │   │   └── Remember me checkbox
   │   │
   │   ├── Registration - Step 1 (Security)
   │   │   ├── Phone validation
   │   │   ├── Password strength
   │   │   └── Confirm password
   │   │
   │   ├── Registration - Step 2 (Profile)
   │   │   ├── Full name
   │   │   ├── County selection
   │   │   ├── Ward selection
   │   │   └── Farm size
   │   │
   │   └── Language Toggle
   │       ├── Fixed at top-right
   │       ├── Instant translation
   │       └── Persistent selection
   │
   └── Farmer Dashboard (farmer-dashboard-professional.html)
       ├── Header
       │   ├── Logo + System Name
       │   ├── Language Selector
       │   └── Profile Menu (with logout)
       │
       ├── Welcome Section
       │   ├── Time-aware greeting
       │   └── Personalized message with user name
       │
       ├── Two-Column Layout
       │   ├── Left: Farm Profile Card
       │   │   ├── Name
       │   │   ├── Phone
       │   │   ├── County
       │   │   ├── Ward
       │   │   ├── Farm Size
       │   │   ├── Soil Type
       │   │   └── Edit button
       │   │
       │   └── Right: Insights Cards
       │       ├── Success Rate (with progress bar)
       │       ├── Top Crop
       │       ├── Recommendations Count
       │       └── Last Updated
       │
       ├── Actions Section
       │   ├── Location selector
       │   ├── Soil type selector
       │   ├── Season selector
       │   ├── Farm size input
       │   ├── Budget input
       │   ├── Water source selector
       │   ├── Generate Recommendations button (Primary)
       │   └── Try Demo Data button (Secondary)
       │
       └── Responsive Design
           ├── Mobile-optimized
           ├── Tablet-friendly
           └── Desktop-compatible
```

#### **5. Multilingual System**
```
✅ Languages Supported:
   ├── English (Default)
   ├── Kiswahili (Swahili)
   └── Luo (Dholuo)

✅ Translation Coverage:
   ├── All form labels
   ├── Buttons and CTAs
   ├── Navigation items
   ├── Error messages
   ├── Success messages
   ├── Dashboard sections
   ├── Profile fields
   └── Form field placeholders

✅ Technology:
   └── language-utils.js (custom i18n system)
       ├── localStorage persistence
       ├── data-i18n attributes
       └── Dynamic translation on page load
```

#### **6. Features Implemented**
```
✅ User Authentication
   ├── Two-step registration process
   ├── Email/phone validation
   ├── JWT token generation
   ├── Session management
   └── Secure logout

✅ Farm Management
   ├── Farm profile creation
   ├── Location tracking (County/Ward)
   ├── Farm size input
   ├── Soil type selection
   └── Water source tracking

✅ Recommendation Engine
   ├── Crop analysis based on:
   │   ├── Soil type
   │   ├── Season
   │   ├── Location (sub-county)
   │   ├── Farm size
   │   ├── Budget
   │   └── Water source
   │
   ├── Confidence scoring
   ├── Alternative suggestions
   └── Market price integration

✅ Multilingual Support
   ├── Language toggle on every page
   ├── Persistent user preference
   ├── Real-time translation
   └── 100+ translated strings

✅ User Experience
   ├── Responsive design
   ├── Progress indicators
   ├── Error handling
   ├── Success feedback
   ├── Demo data for testing
   └── Personalized dashboard
```

---

## 📊 Data Flow Architecture

### User Registration Flow
```
1. User selects language (Landing Page)
   └─> localStorage stores preference

2. User clicks "Create Account"
   └─> Redirect to /login?mode=signup

3. Step 1: Security (Phone + Password)
   └─> POST /api/auth/register
   └─> Returns: userId, token
   └─> Saved to localStorage

4. Step 2: Profile (Name, County, Ward, Farm Size)
   └─> POST /api/auth/register-profile
   └─> Stores farm details
   └─> Returns: full user object with farm data
   └─> Updates localStorage with complete user info

5. User redirected to /farmer-dashboard
   └─> Dashboard loads with user data
   └─> Language preference applied
   └─> Profile card populated
```

### Recommendation Flow
```
1. User fills form fields
   ├─ Location (sub-county)
   ├─ Soil type
   ├─ Season
   ├─ Farm size
   ├─ Budget
   └─ Water source

2. User clicks "Generate Recommendations"
   └─> POST /api/analyze-farm
   └─> Backend processes request

3. Recommendation Engine
   ├─ Matches conditions against rules
   ├─ Calculates compatibility score
   ├─ Retrieves market prices
   └─ Returns top 3 recommendations

4. Results displayed
   ├─ Success rate (%)
   ├─ Top crop name
   ├─ Count of available options
   └─ Last updated timestamp
```

---

## 🔗 API Endpoints Summary

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register user (phone + password) |
| POST | `/api/auth/register-profile` | Complete profile setup |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/user` | Fetch current user (requires token) |
| POST | `/api/auth/logout` | User logout |

### Recommendations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/analyze-farm` | Get crop recommendations |
| POST | `/api/predict` | Alternative prediction endpoint |
| GET | `/api/predictions` | Get user's prediction history |
| POST | `/api/feedback` | Submit feedback on recommendation |

### Utilities
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ussd` | USSD gateway integration |
| GET | `/api/market` | Get market prices |
| GET | `/api/farmers` | Get farmer list |

---

## 📱 Ready for Mobile App Development

### What's Ready for Mobile
```
✅ Backend API
   ├─ All endpoints documented
   ├─ Request/response formats defined
   ├─ Error handling standardized
   ├─ Token-based authentication ready
   └─ CORS enabled for external clients

✅ Database
   ├─ Schema finalized
   ├─ Relationships established
   ├─ Indexes created for performance
   └─ Sample data available

✅ Authentication
   ├─ JWT tokens (mobile-compatible)
   ├─ Token storage instructions ready
   ├─ Refresh token logic ready
   └─ Secure password handling

✅ Translations
   ├─ All strings externalized
   ├─ JSON format ready for mobile
   ├─ 3 languages fully supported
   └─ Easy to add more languages

✅ Features
   ├─ Crop recommendation algorithm finalized
   ├─ Location database populated
   ├─ Market data integration ready
   ├─ User profile management complete
   └─ Farm data structure defined
```

---

## 🚀 Next Steps for Mobile App

### Phase 1: Mobile App Development
```
1. Choose Framework
   ├─ React Native (Cross-platform: iOS + Android)
   │  └─ Best for code reuse, JavaScript-based
   │
   ├─ Flutter (Cross-platform: iOS + Android)
   │  └─ Better performance, Dart language
   │
   └─ Native (iOS + Android separately)
      └─ Best performance, more development effort

2. Set Up Mobile Project
   ├─ Initialize project structure
   ├─ Install dependencies
   ├─ Configure API base URL
   ├─ Set up local storage (tokens)
   └─ Set up navigation

3. Implement Auth Module
   ├─ Login screen
   ├─ Registration (2-step process)
   ├─ Token storage (secure storage)
   ├─ Logout functionality
   └─ Token refresh logic

4. Implement Farmer Dashboard
   ├─ User profile display
   ├─ Farm information card
   ├─ Recommendation form
   ├─ Results display
   └─ Insights cards with charts

5. Add Multilingual Support
   ├─ Use i18n library
   ├─ Load translations from JSON
   ├─ Language toggle
   ├─ Persist user language preference
   └─ Real-time translation
```

### Phase 2: Mobile-Specific Features
```
1. Offline Support
   ├─ Local data caching
   ├─ Offline recommendation (limited)
   ├─ Sync when online

2. Push Notifications
   ├─ Weather alerts
   ├─ Market price updates
   ├─ Crop care reminders
   └─ Community messages

3. Camera Integration
   ├─ Soil photo upload
   ├─ Crop disease detection
   ├─ Farm photo gallery

4. Location Services
   ├─ Auto-detect current location
   ├─ Map view of nearby farmers
   ├─ GPS for field boundaries

5. Biometric Auth
   ├─ Fingerprint login
   ├─ Face recognition
   └─ PIN backup
```

### Phase 3: Optimization
```
1. Performance
   ├─ Image optimization
   ├─ Bundle size reduction
   ├─ API response caching
   └─ Background sync

2. Testing
   ├─ Unit tests
   ├─ Integration tests
   ├─ E2E tests
   └─ User acceptance testing

3. Deployment
   ├─ iOS App Store
   ├─ Google Play Store
   ├─ Beta testing
   └─ Release management
```

---

## 📈 System Metrics

### Current Deployment
```
Backend Server
├─ Technology: Node.js + Express.js
├─ Database: SQLite (local)
├─ Environment: Development ready
└─ Scalability: Can migrate to PostgreSQL + Heroku/AWS

Frontend Web
├─ Technology: HTML + CSS + JavaScript (vanilla)
├─ Responsive: Mobile-friendly
├─ Languages: 3 supported
└─ Performance: Optimized for low-end devices

Languages Supported
├─ English (100%)
├─ Kiswahili (100%)
└─ Luo/Dholuo (100%)

User Journey Coverage
├─ Landing → 100%
├─ Registration → 100%
├─ Dashboard → 100%
├─ Recommendations → 100%
└─ Feedback → Ready to implement
```

---

## 🎯 Recommended Mobile Stack

### Option 1: React Native (Recommended for Speed)
```
✅ Pros
├─ Single codebase for iOS + Android
├─ JavaScript/TypeScript
├─ Large community & libraries
├─ Faster development
└─ Code sharing with web frontend

⚠️ Cons
├─ Slightly slower than native
├─ Platform-specific issues sometimes
└─ Limited access to newer OS features

Stack:
├─ React Native CLI
├─ React Navigation
├─ Redux (state management)
├─ i18next (multilingual)
├─ Axios (HTTP client)
├─ AsyncStorage (local storage)
└─ React Native Camera (optional)
```

### Option 2: Flutter (Recommended for Performance)
```
✅ Pros
├─ Better performance than React Native
├─ Single codebase for iOS + Android
├─ Beautiful default UI
├─ Growing community
└─ Excellent documentation

⚠️ Cons
├─ Dart language (new to learn)
├─ Smaller ecosystem than React
└─ Fewer third-party libraries

Stack:
├─ Flutter SDK
├─ Provider (state management)
├─ Dio (HTTP client)
├─ GetStorage (local storage)
├─ easy_localization (multilingual)
└─ image_picker (camera integration)
```

---

## ✅ Checklist for Mobile Development Start

```
Before Starting Mobile App:
☑️ Set up API documentation
☑️ Create API request/response examples
☑️ Document authentication flow
☑️ Prepare translation JSON files
☑️ Create mobile design mockups
☑️ Set up CI/CD pipeline
☑️ Create mobile app store accounts
☑️ Prepare app icons & splash screens
☑️ Define error handling strategy
☑️ Plan testing strategy

Team Requirements:
☑️ Mobile developer(s)
☑️ UI/UX designer (mobile-specific)
☑️ QA tester (mobile-specific)
☑️ DevOps engineer (optional, for deployment)
```

---

## 📝 Summary

**What We've Achieved:**
- ✅ Complete backend API with authentication
- ✅ Professional web dashboard
- ✅ Fully multilingual system (3 languages)
- ✅ Farm recommendation engine
- ✅ User profile management
- ✅ Security best practices implemented
- ✅ Responsive design for all devices

**What's Next:**
- 📱 Mobile application development (React Native or Flutter)
- 📦 Production database migration (SQLite → PostgreSQL)
- 🌐 Cloud deployment (Heroku, AWS, or DigitalOcean)
- 📊 Advanced analytics dashboard
- 🤖 ML-based crop disease detection
- 📱 Push notifications system

**Estimated Timeline for Mobile App:**
- 4-6 weeks for MVP (basic registration, dashboard, recommendations)
- 8-12 weeks for full feature parity with web
- 12-16 weeks for Phase 2 features (offline support, notifications)
- 16-20 weeks for app store submission and optimization

---

*Document Updated: March 5, 2026*
*Current Version: 1.0*
*Status: Ready for Mobile Development*
