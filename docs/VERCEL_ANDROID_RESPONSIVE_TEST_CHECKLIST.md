# Vercel + Android WebView Responsive Test Checklist

## Scope
Validate responsive behavior for landing page, dashboard, and sidebar pages on:
1. Vercel browser (mobile/tablet/desktop)
2. Android Studio WebView app

## Test URLs
1. `/` (Landing)
2. `/dashboard`
3. `/recommendations`
4. `/market`
5. `/community`
6. `/feedback`
7. `/profile`
8. `/settings`

## Devices and Viewports
1. Phone portrait: `360x800` (Android), `390x844` (iPhone size)
2. Phone landscape: `800x360`
3. Tablet portrait: `768x1024`
4. Tablet landscape: `1024x768`
5. Desktop: `1366x768` or wider

## A. Core Layout Checks (All Pages)
1. No horizontal scrolling at any viewport.
2. Header content does not overlap or clip.
3. Primary content remains readable without zoom.
4. Buttons/links are tappable (minimum touch comfort).
5. No text cut-off in cards, tables, or nav labels.

## B. Sidebar Navigation Checks
1. On phone/tablet, hamburger button appears.
2. Tapping hamburger opens sidebar.
3. Tapping overlay closes sidebar.
4. Tapping any nav item closes sidebar on small screens.
5. Navigation works to all target pages.
6. Active nav item is clearly visible.

## C. Page-Specific Checks

### Landing (`/`)
1. Header actions and language controls wrap cleanly.
2. Hero CTA buttons stack correctly on small screens.
3. Feature/stat/testimonial grids collapse to single column on phone.
4. Footer remains readable and non-overlapping.

### Dashboard (`/dashboard`)
1. Stats cards align correctly on phone/tablet.
2. Sidebar can be opened/closed via hamburger on mobile widths.
3. Bottom clipping does not occur while scrolling.

### Recommendations (`/recommendations`)
1. Form fields stack cleanly on phone.
2. Recommendation cards do not overflow width.
3. Buttons remain visible and usable.

### Market (`/market`)
1. Price table is horizontally scrollable inside container when needed.
2. Chart remains visible and scaled on phone/tablet.
3. Currency and language controls do not overlap.

### Community (`/community`)
1. Stats cards render without overlap.
2. Question/story blocks wrap correctly.
3. Modals remain usable on phone widths.

### Feedback (`/feedback`)
1. Star rating controls remain tappable.
2. Quick feedback buttons stack correctly on phone.
3. Yield and feedback inputs remain fully accessible.

### Profile (`/profile`)
1. Sidebar opens on mobile using hamburger.
2. Profile photo area does not overflow.
3. Form grid collapses to one column on phone.

### Settings (`/settings`)
1. Sidebar opens on mobile using hamburger.
2. Toggles/selects remain aligned and tappable.
3. Page header actions do not overlap.

## D. Android WebView-Specific Checks
1. App opens deployed Vercel URL successfully.
2. Pages render same as mobile browser for all URLs listed above.
3. Hamburger and overlay interactions work.
4. Back button behavior is correct (WebView history).
5. Pull-to-refresh does not break layout/state.

## E. Pass/Fail Gate
Release is ready only if:
1. 0 critical issues: blocked navigation, broken layout, unusable forms.
2. 0 major issues: sidebar inaccessible on mobile/tablet, persistent overlap.
3. Minor visual issues documented and accepted.

## Quick Defect Template
1. Page:
2. Platform: `Vercel Browser` or `Android WebView`
3. Viewport/device:
4. Steps to reproduce:
5. Expected:
6. Actual:
7. Screenshot/video:
