# Farmer Dashboard Side Menu Implementation Plan

## Information Gathered

### Current Files Analyzed:
1. **farmer-dashboard-professional.html** - Main dashboard with:
   - Top header with logo, language selector, USSD buttons, Community, Market, Profile, Logout
   - Welcome section with greeting
   - Two-column layout: Farm Profile card + Insights cards
   - Recommendation form with inputs
   - Prediction result section
   - Prediction history section

2. **community-market.html** - Community/Market page with:
   - Top header with navigation tabs
   - Community section (Questions, Success Stories)
   - Market section (Prices, Buyers, Dealers)
   - Feedback section (Rate prediction, Record yield)
   - My Farm section (Predictions, Yields, Price Alerts)

## Plan

### File: backend/public/farmer-dashboard.html (New Enhanced Dashboard)

**Structure:**
1. **Left Sidebar (Collapsible)**
   - Logo/Brand at top
   - Navigation menu items with icons:
     - 📊 Dashboard
     - 🌾 Recommendations  
     - 💰 Market Prices
     - 👥 Community
     - ⭐ Feedback
     - 👤 My Profile
     - ⚙️ Settings
   - User info at bottom
   - Logout button

2. **Main Content Area**
   - Header row with: Welcome greeting, Language selector, Mobile menu toggle
   - Dashboard widgets in grid layout
   - Recommendation form
   - Quick stats cards

3. **CSS Styling**
   - Fixed sidebar on desktop (250px width)
   - Collapsible drawer on mobile (slides from left)
   - Green/white theme matching existing design
   - Smooth transitions and hover effects

### Key Features:
- Responsive: Sidebar collapses to hamburger menu on mobile
- Active state highlighting for current page
- Smooth slide animation for mobile menu
- Integration with existing API endpoints

## Dependent Files to be Edited
- None - creating new enhanced dashboard file

## Followup Steps
1. Test the new dashboard loads correctly
2. Verify all navigation links work
3. Check mobile responsive behavior
4. Ensure all existing features (recommendations, community stats) still function
5. Update any links pointing to old dashboard

