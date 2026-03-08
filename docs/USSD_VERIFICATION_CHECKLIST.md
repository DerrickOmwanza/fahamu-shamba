# USSD System Verification Checklist

## Pre-Deployment Verification

### ✅ Code Validation Checks

- [ ] **USSD Code Restriction**
  - Open: `backend/ussd-service.js`
  - Look for: `const VALID_USSD_CODE = '*123#';`
  - Verify: Only `*123#` is accepted (line ~18)
  - Check: `handleUSSD()` rejects other codes (lines ~182-190)

- [ ] **Language Selection Works**
  - Verify: `handleLanguageSelect()` properly transitions to MAIN_MENU
  - Check: State changes from LANGUAGE_SELECT to MAIN_MENU
  - Confirm: Returns main menu on successful selection

- [ ] **Menu Flow Logic**
  - Check: `handleMainMenu()` routes all 4 options correctly
  - Verify: Options 1-4 work as intended
  - Confirm: Invalid choices return menu again

- [ ] **Input Validation**
  - All handlers should use regex: `^[1-N]$`
  - Invalid input should return error + menu
  - No skip-ahead allowed

### ✅ Functional Tests

#### Test 1: Language Selection
```
1. Dial *123# (empty text)
   Expected: Welcome message with language options
   
2. Enter: 1
   Expected: Main menu in English
   
3. Enter: invalid input
   Expected: "Invalid option. Try again." + Language menu again
```

#### Test 2: Complete Get Advice Flow
```
1. Start session
2. Select language: 1
3. Select feature: 1 (Get Advice)
4. Select location: 1
5. Select ward: 1
6. Select soil: 1
7. Select season: 1
8. Select size: 1
9. Select budget: 1
10. Expected: Recommendation shown, session ends
```

#### Test 3: Registration Flow
```
1. Start session
2. Select language: 1
3. Select feature: 2 (Register)
4. Enter phone: 254712345678
5. Enter name: John Farmer
6. Expected: "Account created!" message, session ends
```

#### Test 4: Profile & Market
```
Profile:
- Select: 3
- Expected: Show phone number, end session

Market:
- Select: 4
- Expected: Show prices, end session
```

#### Test 5: Invalid USSD Code
```
1. Send with serviceCode: "999"
   Expected: "Invalid USSD code. Please dial *123#..."
   Expected: Session ends

2. Send with serviceCode: "*456#"
   Expected: "Invalid USSD code..."
   Expected: Session ends
```

### ✅ Database Checks

- [ ] Table: `predictions` exists
- [ ] Table: `users` exists
- [ ] Table: `feedback` exists
- [ ] Columns in predictions: phone_number, sub_county, soil_type, season, predicted_crop, confidence, reason

### ✅ Server Configuration

- [ ] Port running: 5000 (or configured PORT)
- [ ] USSD endpoint available: `POST /api/ussd`
- [ ] CORS configured for USSD requests
- [ ] Content-Type: text/plain for responses
- [ ] Responses formatted: "CON" or "END" + message

### ✅ Logging

- [ ] Console logs show `[USSD]` prefix
- [ ] Logs show: sessionId, state, language, transitions
- [ ] Error logging present for invalid codes
- [ ] Session lifecycle logged

### ✅ Simulator Tests

- [ ] Go to: `http://localhost:5000/ussd-simulator`
- [ ] "Start Over" button works
- [ ] Quick test buttons (🔄 English, etc.) work
- [ ] "✅ Full Flow" completes without errors
- [ ] Language selector updates in control panel
- [ ] State transitions show correctly

### ✅ Edge Cases

- [ ] Empty input handling
- [ ] Special characters in input (should be rejected)
- [ ] Very long input (should be trimmed)
- [ ] Multiple spaces in input (should be trimmed)
- [ ] Session timeout (5 min creates new session)
- [ ] Same sessionId called twice (uses existing session)
- [ ] Invalid phone number format (rejected in registration)
- [ ] Very short names (< 3 chars, rejected)

### ✅ State Machine Verification

```
Initial:     LANGUAGE_SELECT
After lang:  MAIN_MENU
After opt 1: GET_ADVICE_LOCATION
After opt 2: REGISTER_PHONE
After opt 3: VIEW_PROFILE (ends)
After opt 4: MARKET_PRICES (ends)

Advice flow: LOCATION → WARD → SOIL → SEASON → SIZE → BUDGET → RESULT (ends)
```

- [ ] All state transitions are one-directional
- [ ] No backward transitions
- [ ] No state skipping
- [ ] Each state has valid input range

### ✅ Translation Verification

- [ ] English: All keys have values
- [ ] Swahili: All keys have values
- [ ] Luo: All keys have values
- [ ] No missing translations cause errors
- [ ] Language change works mid-session (if supported)

### ✅ Performance

- [ ] Response time < 500ms
- [ ] No memory leaks (sessions cleaned up)
- [ ] Handles 100+ concurrent sessions
- [ ] No database locks

---

## Sign-Off Checklist

- [ ] All code validations passed
- [ ] All functional tests passed
- [ ] Database checks passed
- [ ] Server configuration correct
- [ ] Logging working properly
- [ ] Simulator tests passed
- [ ] Edge cases handled
- [ ] State machine correct
- [ ] Translations complete
- [ ] Performance acceptable

## Ready for Deployment

**Date**: _______________
**Verified By**: _______________
**Status**: ☐ READY ☐ NEEDS FIXES

---

## Notes for Production

1. Update SAFARICOM_SHORTCODE to "*123#"
2. Ensure USSD gateway webhook points to /api/ussd
3. Set up monitoring for [USSD] logs
4. Configure backup session storage (for scaling)
5. Set up SMS notifications for registrations
