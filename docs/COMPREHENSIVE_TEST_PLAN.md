# Fahamu Shamba - Comprehensive Testing Plan

**Created:** March 8, 2026  
**Status:** Active Testing Phase  
**Scope:** All Dashboard Pages + Cross-Platform Compatibility  

---

## Testing Objectives

1. ✅ Verify all pages load correctly
2. ✅ Test all page functionality works as intended
3. ✅ Verify responsive design across all devices
4. ✅ Test cross-platform compatibility
5. ✅ Check language dropdown on all pages
6. ✅ Verify authentication flows
7. ✅ Test data persistence
8. ✅ Check accessibility standards

---

## Pages Under Test (18 Total)

### Authentication Pages (2)
- [ ] `login.html` - Username + password login
- [ ] `signup.html` - Account creation

### Core Dashboard Pages (5)
- [ ] `dashboard.html` - Main dashboard/home
- [ ] `profile.html` - User profile with photo upload
- [ ] `settings.html` - User settings
- [ ] `recommendations.html` - Crop recommendations
- [ ] `feedback.html` - Feedback submission

### Feature Pages (8)
- [ ] `market.html` - Market prices
- [ ] `market-trends.html` - Price trends analysis
- [ ] `community.html` - Community feed
- [ ] `community-market.html` - Community marketplace
- [ ] `crop-prediction.html` - ML crop predictions
- [ ] `crop-details.html` - Detailed crop information
- [ ] `farmer-profile.html` - Farmer profile view
- [ ] `farmer-module.html` - Farmer module

### Support Pages (2)
- [ ] `index.html` - Landing page
- [ ] `landing-page.html` - Alternative landing
- [ ] `ussd-simulator.html` - USSD tester

---

## Test Case Categories

### 1. FUNCTIONALITY TESTING

#### Login Page (`login.html`)
```
Test Case 1.1: Username Field
- [ ] Accepts text input
- [ ] Shows placeholder text
- [ ] Required field validation works
- [ ] Rejects empty input

Test Case 1.2: Password Field
- [ ] Accepts password input
- [ ] Password is masked (not visible)
- [ ] Required field validation works
- [ ] Rejects empty input

Test Case 1.3: Form Submission
- [ ] Form submits when both fields filled
- [ ] Stores token in localStorage
- [ ] Stores user data in localStorage
- [ ] Redirects to dashboard after login
- [ ] Success message displays (if applicable)

Test Case 1.4: Navigation
- [ ] "Sign Up" link navigates to signup.html
- [ ] "Back to Home" link navigates to index.html
- [ ] Language dropdown works correctly
```

#### Sign-Up Page (`signup.html`)
```
Test Case 2.1: Form Fields
- [ ] Full Name field accepts input
- [ ] Username field accepts input
- [ ] Phone field accepts input
- [ ] Sub-County dropdown works
- [ ] Ward field accepts input
- [ ] Farm Size field accepts numbers
- [ ] Main Crop dropdown works
- [ ] Password field accepts input
- [ ] Confirm Password field accepts input

Test Case 2.2: Validation
- [ ] Password confirmation validation works
- [ ] Passwords must match
- [ ] All required fields validated
- [ ] Error messages display correctly
- [ ] Username field is required

Test Case 2.3: Form Submission
- [ ] Form submits with valid data
- [ ] Data stored to localStorage
- [ ] Redirects to login page
- [ ] Success message shows
- [ ] Language dropdown functional
```

#### Dashboard (`dashboard.html`)
```
Test Case 3.1: Page Load
- [ ] Requires login (redirects if no token)
- [ ] Displays user name in header
- [ ] Displays greeting message
- [ ] Shows sidebar navigation
- [ ] All sidebar links functional

Test Case 3.2: Sidebar Navigation
- [ ] Dashboard link active on dashboard page
- [ ] Clicking nav items navigates correctly
- [ ] Active state highlights current page
- [ ] Logout button visible and functional
- [ ] User info displayed in sidebar

Test Case 3.3: Content Display
- [ ] Welcome message shows username
- [ ] Statistics display (if applicable)
- [ ] Cards and widgets render correctly
- [ ] No broken images or links
- [ ] Language dropdown works
```

#### Profile Page (`profile.html`)
```
Test Case 4.1: Profile Display
- [ ] User name displays in header
- [ ] Profile photo displays (circular)
- [ ] User location displays
- [ ] All profile fields load with data

Test Case 4.2: Photo Upload
- [ ] Photo upload button clickable
- [ ] File picker opens on click
- [ ] Accepts image files (jpg, png, gif)
- [ ] Photo previews after selection
- [ ] Photo saves to localStorage
- [ ] Photo displays as perfect circle
- [ ] Photo displays in header avatar
- [ ] Photo displays in sidebar

Test Case 4.3: Form Editing
- [ ] Full Name field editable
- [ ] Phone field read-only
- [ ] County/Ward fields editable
- [ ] Farm Size field accepts numbers
- [ ] Main Crop dropdown functional
- [ ] "Save Changes" button saves all data
- [ ] Data persists after page reload
```

#### Settings Page (`settings.html`)
```
Test Case 5.1: Page Load
- [ ] Sidebar loads correctly
- [ ] Settings options visible
- [ ] User info displays
- [ ] Language dropdown functional

Test Case 5.2: Settings Options
- [ ] All setting categories visible
- [ ] Settings toggles work (if applicable)
- [ ] Preferences save correctly
- [ ] Changes persist after reload
```

#### Recommendations Page (`recommendations.html`)
```
Test Case 6.1: Content Display
- [ ] Page loads without errors
- [ ] Crop recommendations display
- [ ] Weather information shows (if applicable)
- [ ] Recommendations update based on location
- [ ] Language dropdown works
- [ ] No broken links or images

Test Case 6.2: Interactivity
- [ ] Users can expand/collapse recommendations
- [ ] Detail views work
- [ ] Share functionality (if available)
- [ ] Sidebar navigation works
```

#### Market Pages (`market.html`, `market-trends.html`)
```
Test Case 7.1: Market Prices
- [ ] Market prices display
- [ ] Prices update (live or on refresh)
- [ ] Crop list shows correctly
- [ ] Prices are readable and formatted

Test Case 7.2: Market Trends
- [ ] Trend charts display
- [ ] Date range selectors work
- [ ] Trend data updates
- [ ] No JavaScript errors
```

#### Community Pages (`community.html`, `community-market.html`)
```
Test Case 8.1: Community Feed
- [ ] Community posts display
- [ ] Posts load correctly
- [ ] Images in posts display
- [ ] User names and timestamps show

Test Case 8.2: Community Market
- [ ] Marketplace items display
- [ ] Item details visible
- [ ] Prices show clearly
- [ ] Contact information available
```

#### Feedback Page (`feedback.html`)
```
Test Case 9.1: Form Display
- [ ] Form loads correctly
- [ ] All input fields visible
- [ ] Text area works for longer feedback
- [ ] Required fields marked

Test Case 9.2: Form Submission
- [ ] Form validates all required fields
- [ ] Can type in all fields
- [ ] Submit button functional
- [ ] Success message displays
- [ ] Data stores correctly
```

---

### 2. RESPONSIVE DESIGN TESTING

#### Desktop (1920x1080)
```
Device Profiles to Test:
- Desktop PC (1920x1080)
- Desktop (1600x900)
- Desktop (1024x768)
- Ultra-wide (2560x1440)

Tests:
- [ ] All content visible without horizontal scroll
- [ ] Sidebar displays fully
- [ ] Grid layouts work correctly
- [ ] Typography readable
- [ ] Spacing appropriate
- [ ] No layout breaks
- [ ] Tables display properly
```

#### Tablet (768x1024)
```
Device Profiles:
- iPad Portrait (768x1024)
- iPad Landscape (1024x768)
- Android Tablet (600x1024)
- Tablet Landscape (1024x600)

Tests:
- [ ] Navigation adapts for touch
- [ ] Sidebar collapsible/toggleable
- [ ] Content readable without zoom
- [ ] Touch targets large enough (44x44px minimum)
- [ ] Forms easy to fill on tablet
- [ ] Images scale correctly
- [ ] No horizontal overflow
```

#### Mobile (375x667)
```
Device Profiles:
- iPhone SE (375x667)
- iPhone 12/13 (390x844)
- Samsung Galaxy S20 (360x800)
- Samsung Galaxy S21 Ultra (440x906)

Tests:
- [ ] All content visible
- [ ] Navigation hamburger menu (if applicable)
- [ ] Sidebar hidden/collapsed on mobile
- [ ] Touch-friendly buttons (minimum 44x44px)
- [ ] Forms stack vertically
- [ ] Images responsive
- [ ] No horizontal scroll
- [ ] Status bar space respected
- [ ] Notch handling (iPhone)
- [ ] Grid converts to single column
```

---

### 3. CROSS-PLATFORM TESTING

#### Browsers Desktop
```
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Edge (Latest)

Tests for Each:
- All pages load correctly
- No JavaScript errors
- Styling renders correctly
- Forms submit properly
- Local storage works
- Language dropdown functional
```

#### Browsers Mobile
```
- [ ] Chrome Mobile (iOS/Android)
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile (Android)
- [ ] Samsung Internet (Android)

Tests for Each:
- Pages load on slow 4G
- Touch interactions work
- Forms submittable via mobile keyboard
- Photo upload works
- Language dropdown accessible
```

#### Operating Systems
```
- [ ] Windows 10/11 (Desktop/Laptop)
- [ ] macOS (Desktop)
- [ ] iOS (iPad/iPhone)
- [ ] Android (Various tablets/phones)
- [ ] Linux (Desktop)
```

---

### 4. LANGUAGE & LOCALIZATION TESTING

```
Test Case: Language Dropdown
- [ ] Appears on all authenticated pages
- [ ] Shows 3 languages: English, Kiswahili, Dholuo
- [ ] Selection persists across page navigation
- [ ] Page content updates when language changes
- [ ] Dropdown closes after selection
- [ ] Works on mobile and desktop
- [ ] Touch-friendly on mobile

Languages to Test:
- [ ] English (🌐 English)
- [ ] Kiswahili (🌐 Kiswahili)
- [ ] Dholuo (🌐 Dholuo)
```

---

### 5. AUTHENTICATION & SECURITY TESTING

```
Test Case: Token Management
- [ ] Token stored in localStorage after login
- [ ] User data stored correctly
- [ ] Logout clears token
- [ ] Non-authenticated users redirected to login
- [ ] Session persists on page reload
- [ ] Multiple sessions don't conflict

Test Case: Form Security
- [ ] Password field masked
- [ ] No sensitive data in URL
- [ ] Form data not exposed in console
- [ ] CSRF protection (if applicable)
```

---

### 6. PERFORMANCE TESTING

```
Test Metrics:
- [ ] Page load time < 3 seconds (on 4G)
- [ ] Time to Interactive < 4.5 seconds
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Contentful Paint < 1.8 seconds
- [ ] Lighthouse Score > 80

Tools:
- Google PageSpeed Insights
- Lighthouse
- WebPageTest
- Chrome DevTools
```

---

### 7. ACCESSIBILITY TESTING

```
Test Case: WCAG 2.1 AA Compliance
- [ ] Color contrast > 4.5:1 (text)
- [ ] All form inputs have labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Images have alt text
- [ ] Semantic HTML structure
- [ ] ARIA labels where needed

Tools:
- axe DevTools
- WAVE
- Screen Reader (NVDA, JAWS)
```

---

## Vercel Deployment Testing

### Pre-Deployment Checklist
```
- [ ] All files optimized
- [ ] No console errors
- [ ] Lighthouse score checked
- [ ] Environment variables configured
- [ ] Build process tested locally
```

### Post-Deployment Checklist
```
- [ ] QR code generated and tested
- [ ] Live URL working
- [ ] HTTPS enabled
- [ ] All pages accessible
- [ ] Images loading correctly
- [ ] Database/APIs connected
- [ ] Environment variables set
- [ ] Custom domain working (if applicable)
```

### QR Code & Link Testing
```
Test Procedure:
1. Generate QR code for deployed URL
2. Scan QR code with:
   - [ ] iPhone (iOS 14+)
   - [ ] Android (Android 9+)
   - [ ] Multiple QR scanner apps
3. Verify:
   - [ ] QR redirects to correct URL
   - [ ] Page loads on mobile
   - [ ] All functionality works
   - [ ] No HTTPS warnings
   - [ ] Performance acceptable
```

---

## Test Results Template

```markdown
## Page: [Page Name]
**URL:** /[page-name].html
**Last Tested:** [Date]

### Functionality
- [x] Feature 1: ✅ PASS
- [ ] Feature 2: ⚠️ PENDING
- [x] Feature 3: ❌ FAIL

### Responsive Design
- [x] Desktop: ✅ PASS
- [x] Tablet: ✅ PASS
- [x] Mobile: ✅ PASS

### Cross-Browser
- [x] Chrome: ✅ PASS
- [x] Firefox: ✅ PASS
- [x] Safari: ✅ PASS

### Issues Found
- Issue 1: [Description] - [Status]
- Issue 2: [Description] - [Status]

### Recommendations
- [Improvement suggestion]
```

---

## Testing Schedule

| Phase | Timeline | Focus |
|-------|----------|-------|
| **Unit Testing** | Week 1 | Individual page functionality |
| **Integration Testing** | Week 1 | Page interactions and flows |
| **Responsive Design** | Week 2 | All device sizes |
| **Cross-Browser** | Week 2 | All browsers and platforms |
| **Performance** | Week 2 | Load times and optimization |
| **Deployment** | Week 3 | Vercel deployment and QR codes |
| **UAT** | Week 3 | User acceptance testing |

---

## Defect Categories

### Critical (Blocks Usage)
- Page won't load
- Form submission fails
- Navigation broken
- Data not persisting
- Authentication failing

### High (Severely Impacts UX)
- Responsive design broken on device
- Language dropdown not working
- Photo upload fails
- Sidebar navigation not working

### Medium (Affects Some Users)
- Minor responsive issues
- Slow page load
- Missing text on some devices
- Console warnings

### Low (Minor Issues)
- Typography inconsistencies
- Minor spacing issues
- Cosmetic improvements needed

---

## Sign-Off

**Testing Lead:** [Your Name]  
**Date Started:** March 8, 2026  
**Date Completed:** [To be filled]  
**Overall Status:** 🔴 IN PROGRESS  

---

**Next Step:** Execute Test Cases and Document Results
