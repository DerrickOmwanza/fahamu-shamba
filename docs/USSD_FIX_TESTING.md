# USSD Flow Fix - Testing Guide

## What Was Fixed

### 1. **State Machine Bug**
**Problem**: Selecting options from main menu kept showing the same menu
**Fix**: 
- Fixed main menu state transitions to properly move to next states
- Fixed profile and market price options to properly end sessions
- Added proper error handling for invalid inputs

### 2. **UI/UX Issue**
**Problem**: All messages were showing, making it look cluttered (not like real USSD)
**Fix**:
- UI now clears old messages and shows only current prompt
- Behaves like real feature phone USSD (one screen at a time)
- Message history only shown when session ends

---

## Testing the Fixed Flow

### Step 1: Restart Backend
```bash
cd backend
npm start
```

### Step 2: Open USSD Simulator
- Go to: `http://localhost:5000/ussd-simulator`
- Or click "USSD Test" button on landing page

### Step 3: Test the Complete Flow

**Input Sequence** (enter these one by one):
```
1. First input: 1 (Select English)
   Expected: See only "Main Menu" with 4 options

2. Second input: 1 (Select "Get Crop Advice")
   Expected: See only county selection menu (old message gone)

3. Third input: 1 (Select Siaya)
   Expected: See only ward selection menu

4. Fourth input: 1 (Select Bondo)
   Expected: See only soil type menu

5. Fifth input: 3 (Select Loam)
   Expected: See only season menu

6. Sixth input: 1 (Select Long Rains)
   Expected: See only farm size menu

7. Seventh input: 2 (Select 1-2 acres)
   Expected: See only budget menu

8. Eighth input: 2 (Select 2000-5000 KSh)
   Expected: See RECOMMENDATION with crop, score, and price
            Then: Session Ended message
            Input field becomes DISABLED
```

---

## What You Should See at Each Step

### After Language Selection (Step 1)
```
Main Menu:
1. Get Crop Advice
2. Register Farm
3. My Profile
4. Market Prices
```
(Previous language selection menu DISAPPEARS)

### After Main Menu Selection (Step 2)
```
Select your County:
1. Siaya
2. Kisumu
3. Migori
```
(Main Menu DISAPPEARS)

### After County Selection (Step 3)
```
Select your Ward:
1. Bondo
2. Ugunja
3. Yala
4. Gem
5. Alego
```
(County menu DISAPPEARS)

### After Ward Selection (Step 4)
```
Soil Type:
1. Sandy
2. Clay
3. Loam
```
(Ward menu DISAPPEARS)

### After Soil Selection (Step 5)
```
Season:
1. Long Rains (Mar-May)
2. Short Rains (Oct-Dec)
3. Dry (Jun-Sep)
```
(Soil menu DISAPPEARS)

### After Season Selection (Step 6)
```
Farm size (acres):
1. 0-1 acre
2. 1-2 acres
3. 2-5 acres
4. 5+ acres
```
(Season menu DISAPPEARS)

### After Farm Size Selection (Step 7)
```
Budget (KSh):
1. <2000
2. 2000-5000
3. 5000-10000
4. 10000+
```
(Size menu DISAPPEARS)

### After Budget Selection (Step 8) - FINAL
```
Top Recommendation:
Rice

Suitability Score:
95%

Current Market Price:
KSh 120/kg

Thank you! See full recommendations at fahamu-shamba.com

Session ended. Click "Start Over" to begin again.
```
(Input disabled, click "Start Over" to test again)

---

## Alternative Test: Market Prices

**To test Market Prices option (Option 4):**
```
1. Input: 1 (English)
2. Input: 4 (Market Prices)
   Expected: See market prices then session ends
```

**Market Prices Response:**
```
Market Prices:

1. Maize: KSh 65/kg
2. Beans: KSh 85/kg
3. Rice: KSh 125/kg
4. Sorghum: KSh 95/kg
5. Groundnuts: KSh 110/kg

Goodbye! Dial *123# to use Fahamu Shamba again.

Session ended. Click "Start Over" to begin again.
```

---

## Alternative Test: Profile View

**To test Profile option (Option 3):**
```
1. Input: 1 (English)
2. Input: 3 (My Profile)
   Expected: See your profile info then session ends
```

**Profile Response:**
```
Your Profile:
Phone: 254712345678

Visit fahamu-shamba.com for full profile.

Goodbye! Dial *123# to use Fahamu Shamba again.

Session ended. Click "Start Over" to begin again.
```

---

## Test Checklist

### Functionality ✅
- [ ] Language selection works
- [ ] Main menu displays correctly
- [ ] Get Crop Advice flow works (8 steps)
- [ ] Each selection moves to next question
- [ ] Final recommendation displays
- [ ] Market Prices option works
- [ ] Profile option works
- [ ] Session ends properly
- [ ] "Start Over" resets everything

### UI/UX ✅
- [ ] Old prompts disappear when new ones appear
- [ ] Only current prompt visible (clean experience)
- [ ] User input shows as "You: [choice]"
- [ ] Server responses are clear
- [ ] No message clutter
- [ ] Input field disables when session ends
- [ ] Scrolling shows history if needed
- [ ] Professional appearance

### Data ✅
- [ ] Recommendation is saved to database
- [ ] Phone number is captured
- [ ] Selections are recorded
- [ ] Timestamp is created

---

## Troubleshooting

### Issue: Menu Repeats
**Solution**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Restart backend server
- Clear database cache

### Issue: Old Messages Still Show
**Solution**:
- Refresh the page
- Clear browser cache
- Make sure you're using the updated ussd-simulator.html

### Issue: Session Doesn't End
**Solution**:
- Check that you're selecting valid options (1-4 for main menu)
- Verify all 8 steps are completed for crop advice
- Check browser console for errors

### Issue: Messages Disappear Too Fast
**Solution**:
- Scroll up to see message history if needed
- Messages are still logged, just cleaned up for UX
- This is intentional (real USSD behavior)

---

## Testing Different Languages

### English Flow
```
1. Input: 1
2. Input: 1
3. Follow with: 1, 1, 3, 1, 2, 2
```

### Kiswahili Flow
```
1. Input: 2
2. Input: 1
3. Follow with: 1, 1, 3, 1, 2, 2
```

### Dholuo Flow
```
1. Input: 3
2. Input: 1
3. Follow with: 1, 1, 3, 1, 2, 2
```

All should complete successfully with recommendations in that language.

---

## Multi-Test Scenario

**To test multiple flows back-to-back:**
```
1. Complete first flow (steps 1-8)
2. Click "Start Over" button
3. New session ID created
4. Complete different flow (e.g., select different county)
5. Click "Start Over" again
6. Test different language
```

This ensures sessions are properly isolated and cleaned up.

---

## Performance Check

**Note**: All responses should appear in < 100ms
- If slower, check:
  - Backend CPU usage
  - Database performance
  - Browser console for errors

---

## Database Verification

**To verify data is being saved:**

1. After completing a flow, check the database:
   ```bash
   sqlite3 fahamu_shamba.db
   SELECT * FROM predictions ORDER BY created_at DESC LIMIT 1;
   ```

2. Should show:
   - phone_number: 254712345678
   - location: siaya
   - ward: bondo
   - soil_type: loam
   - season: long_rains
   - farm_size: 1-2
   - budget: 2000-5000
   - predicted_crop: Rice
   - confidence: 95
   - timestamp: Current time

---

## Success Criteria

✅ **You're successful when:**
1. Language selection works
2. Main menu appears cleanly (old menu gone)
3. Each step transitions to next question
4. Only current prompt shows (clean UX)
5. Final recommendation appears
6. Session ends properly
7. Can restart with "Start Over"
8. Data saves to database
9. No infinite loops
10. Professional appearance

---

## If Tests Pass

Great! The USSD flow is now working correctly. You can:
1. Demo to judges
2. Deploy to production
3. Contact USSD provider
4. Plan marketing campaign

---

## If Tests Fail

Check:
1. Backend is running
2. Console shows no errors
3. Database connection works
4. Files are saved correctly
5. Server was restarted after changes

---

**Version**: 2.0 (Fixed)
**Last Updated**: Today
**Status**: Ready for Testing
