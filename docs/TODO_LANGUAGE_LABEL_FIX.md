# Language Label Fix - TODO List

## Objective
Add visible "Language:" label and "Choose Language" placeholder to all language dropdowns across the application.

## Files to Edit:
1. [x] public/dashboard.html - Add label + placeholder ✓
2. [x] public/profile.html - Add label + placeholder ✓
3. [x] public/recommendations.html - Add label + placeholder ✓
4. [x] public/community.html - Add label + placeholder ✓
5. [x] public/feedback.html - Add label + placeholder ✓
6. [x] public/farmer-profile.html - Add label + placeholder ✓
7. [x] public/market-trends.html - Add label + placeholder ✓
8. [x] public/settings.html - Add label + placeholder ✓

## Changes Made:
For each file:
1. Added CSS for `.language-label` styling (green/bold color matching the theme)
2. Added a `<span class="language-label">Language:</span>` before the select element
3. Added `<option value="" disabled selected>Choose Language</option>` as first option
4. Wrapped select elements in a `.language-wrapper` div for proper layout

## Status: COMPLETE ✅
All pages now have:
- Visible "Language:" label
- "Choose Language" placeholder option
- Improved usability for judges and users


