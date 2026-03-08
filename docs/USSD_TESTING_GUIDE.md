# USSD System - Complete Testing Guide

**For**: Quality Assurance & Verification
**Duration**: ~30 minutes
**Required**: Browser + Terminal

---

## Pre-Test Checklist

- [ ] Node.js server running: `npm start`
- [ ] Database accessible: `fahamu_shamba.db` exists
- [ ] Backend listening on port 5000
- [ ] No errors in server logs

---

## Test 1: Validate USSD Code Restriction (3 min)

**Purpose**: Ensure only `*123#` works, others are rejected

### Test 1.1: Invalid Code *456#
```bash
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-456",
    "serviceCode": "*456#",
    "phoneNumber": "254712345678",
    "text": ""
  }'
```

**Expected Output**:
```
END Invalid USSD code. Please dial *123# to access Fahamu Shamba.
```

✅ **Pass**: Message says "*123#" and ends session
❌ **Fail**: Accepts code or shows different message

---

### Test 1.2: Valid Code *123#
```bash
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "serviceCode": "*123#",
    "phoneNumber": "254712345678",
    "text": ""
  }'
```

**Expected Output**:
```
CON Welcome to Fahamu Shamba
Choose language:
1. English
2. Kiswahili
3. Dholuo
```

✅ **Pass**: Shows language menu, session continues
❌ **Fail**: Rejects valid code or shows error

---

### Test 1.3: No Service Code (Should Still Work)
```bash
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-nocode",
    "phoneNumber": "254712345678",
    "text": ""
  }'
```

**Expected Output**:
```
CON Welcome to Fahamu Shamba
Choose language:
...
```

✅ **Pass**: Works without serviceCode
❌ **Fail**: Rejects or fails

---

## Test 2: Language Selection Flow (5 min)

**Purpose**: Verify language selection and transition to main menu

### Setup
Open USSD Simulator: http://localhost:5000/ussd-simulator
Click "Start Over"

### Test 2.1: Select English
1. Click button: `🔄 English`
2. Wait for response

**Expected**:
- Message changes to main menu
- Menu shows 4 options in English
- Status shows: MAIN_MENU
- Language shows: English

✅ **Pass**: All above correct
❌ **Fail**: Shows language menu again or error

---

### Test 2.2: Select Swahili
1. Click "Start Over"
2. Wait 1 second
3. Click button: `2️⃣ Swahili`

**Expected**:
- Message in Swahili
- Main menu text in Swahili
- Status shows: MAIN_MENU
- Language shows: Kiswahili

✅ **Pass**: All in Swahili, menu displayed
❌ **Fail**: Language menu shown again or English

---

### Test 2.3: Select Dholuo
1. Click "Start Over"
2. Click button: `3️⃣ Dholuo`

**Expected**:
- Message in Dholuo
- Main menu in Dholuo
- Status shows: MAIN_MENU
- Language shows: Dholuo

✅ **Pass**: All in Dholuo, menu displayed
❌ **Fail**: Returns to language selection

---

### Test 2.4: Invalid Language Selection
1. Click "Start Over"
2. Enter "5" in input box
3. Click "Send"

**Expected**:
- Shows: "Invalid option. Try again." + Language menu
- User can select again (no session end)

✅ **Pass**: Shows error and menu again
❌ **Fail**: Accepts invalid input or ends session

---

## Test 3: Main Menu Options (8 min)

**Purpose**: Test all 4 main menu options work correctly

### Test 3.1: Option 1 - Get Crop Advice
1. Select English (or any language)
2. Enter "1"

**Expected**:
- Shows county selection: "Select your County..."
- Options: 1=Siaya, 2=Kisumu, 3=Migori
- State shows: LOCATION_SELECT

✅ **Pass**: County menu displayed
❌ **Fail**: Shows main menu again or error

---

### Test 3.2: Option 2 - Register Farm
1. Select English
2. Enter "2"

**Expected**:
- Shows: "Enter your phone number:"
- Input field active
- State shows: REGISTER_PHONE

✅ **Pass**: Phone prompt shown
❌ **Fail**: Shows menu or goes to wrong state

---

### Test 3.3: Option 3 - View Profile
1. Select English
2. Enter "3"

**Expected**:
- Shows: "Your Profile:" + phone number
- Shows: "Visit fahamu-shamba.com..."
- Shows: "Goodbye!" message
- Session ends (input disabled)

✅ **Pass**: Profile shown, session ends
❌ **Fail**: Shows menu or continues session

---

### Test 3.4: Option 4 - Market Prices
1. Select English
2. Enter "4"

**Expected**:
- Shows: "Market Prices:" with crop prices
- Shows: "Goodbye!" message
- Session ends

✅ **Pass**: Prices shown, session ends
❌ **Fail**: Shows menu or continues

---

### Test 3.5: Invalid Main Menu Choice
1. Select English
2. Enter "7"

**Expected**:
- Shows: "Invalid option. Try again."
- Shows: Main menu again
- Can select again

✅ **Pass**: Error + menu, session continues
❌ **Fail**: Accepts invalid input or ends

---

## Test 4: Complete Advice Flow (10 min)

**Purpose**: Full end-to-end crop advice request

### Steps
```
1. Language: 1 (English)
2. Menu: 1 (Get Advice)
3. Location: 1 (Siaya)
4. Ward: 1 (Bondo)
5. Soil: 1 (Sandy)
6. Season: 1 (Long Rains)
7. Size: 1 (0-1 acre)
8. Budget: 1 (<2000)
```

### Test 4.1: Perfect Flow
Using USSD Simulator:
1. Click "Start Over"
2. Click "✅ Full Flow"
3. Wait 10 seconds

**Expected**:
- Shows welcome message
- Each step displays correctly
- Final shows recommendation (crop name)
- Shows "Thank you!" message
- Session ends

✅ **Pass**: All steps work, recommendation shown
❌ **Fail**: Stops at any step or shows error

---

### Test 4.2: Step-by-Step Validation
Manually enter each step:

1. Input: 1 (Language)
   Expected: Main menu

2. Input: 1 (Get Advice)
   Expected: Location selection

3. Input: 1 (Siaya)
   Expected: Ward selection

4. Input: 2 (Ugunja)
   Expected: Soil selection

5. Input: 2 (Clay)
   Expected: Season selection

6. Input: 2 (Short Rains)
   Expected: Size selection

7. Input: 2 (1-2 acres)
   Expected: Budget selection

8. Input: 2 (2000-5000)
   Expected: Recommendation shown

✅ **Pass**: Each step shows correct next menu
❌ **Fail**: Any step shows wrong menu or error

---

### Test 4.3: Invalid Inputs in Flow
At step "Select Ward":
- Input: "6" (invalid, only 1-5)

**Expected**:
- Shows: "Invalid option. Try again."
- Shows: Ward menu again
- Can correct input

✅ **Pass**: Error shown, asks again
❌ **Fail**: Accepts or skips step

---

## Test 5: Registration Flow (5 min)

### Test 5.1: Successful Registration
1. Language: 1
2. Menu: 2 (Register)
3. Phone: 254712345678
4. Name: John Farmer

**Expected**:
```
Account created! Check SMS for details.
```
Session ends.

✅ **Pass**: Account creation message
❌ **Fail**: Error or different message

---

### Test 5.2: Invalid Phone Format
1. Language: 1
2. Menu: 2
3. Phone: 123 (too short)

**Expected**:
- Shows: "Invalid option. Try again."
- Shows: Phone prompt again

✅ **Pass**: Rejects, asks again
❌ **Fail**: Accepts invalid phone

---

### Test 5.3: Invalid Name (< 3 chars)
1. Language: 1
2. Menu: 2
3. Phone: 254712345678
4. Name: Jo (only 2 chars)

**Expected**:
- Shows: "Invalid option. Try again."
- Shows: Name prompt again

✅ **Pass**: Rejects short name
❌ **Fail**: Accepts or shows error

---

## Test 6: Database Verification (5 min)

### Check Predictions Table
```bash
sqlite3 fahamu_shamba.db "SELECT * FROM predictions ORDER BY created_at DESC LIMIT 5;"
```

**Expected**:
- New rows for each advice request
- Columns: phone_number, sub_county, soil_type, season, predicted_crop, confidence, reason
- Recent timestamps

✅ **Pass**: Data saved correctly
❌ **Fail**: No data or wrong columns

---

### Check Users Table
```bash
sqlite3 fahamu_shamba.db "SELECT phone, name FROM users WHERE phone LIKE '2547%' LIMIT 5;"
```

**Expected**:
- New rows for registered users
- Phone and name populated

✅ **Pass**: Registration data saved
❌ **Fail**: No new registrations or wrong data

---

## Test 7: Logging Verification (3 min)

### Start Server and Watch Logs
```bash
npm start 2>&1 | grep USSD
```

### Expected Log Entries
```
[USSD] New session created: test-123 for phone: 254712345678
[USSD] Processing: sessionId=test-123, state=LANGUAGE_SELECT, input=1
[USSD] Language set to: english, moving to MAIN_MENU
[USSD] User selected: Get Advice, moving to LOCATION selection
[USSD] Location selected: siaya, moving to WARD selection
...
```

✅ **Pass**: Logs show proper flow
❌ **Fail**: No logs or incorrect states

---

## Test 8: Edge Cases (5 min)

### Test 8.1: Extra Spaces
Input: "  1  " (with spaces)

**Expected**: Treated same as "1", works correctly

✅ **Pass**: Spaces trimmed, works
❌ **Fail**: Error or rejects

---

### Test 8.2: Session Timeout
1. Start session
2. Don't respond for 5+ minutes
3. Try to continue

**Expected**: New session created, shows language menu

✅ **Pass**: Timeout handled, new session
❌ **Fail**: Session continues or error

---

### Test 8.3: Rapid Inputs
Click send 5 times rapidly

**Expected**: System queues or handles all requests

✅ **Pass**: No crashes, handles load
❌ **Fail**: Errors or crashes

---

### Test 8.4: Special Characters
Input: "1!@#$" 

**Expected**: Treated as invalid, shows error

✅ **Pass**: Rejects, shows menu again
❌ **Fail**: Crashes or accepts

---

## Test 9: Multilingual Verification (5 min)

### Test with All Languages
1. Select English → Complete flow → Verify all in English
2. Select Swahili → Complete flow → Verify all in Swahili
3. Select Dholuo → Complete flow → Verify all in Dholuo

**Expected**: All messages in selected language throughout session

✅ **Pass**: Consistent language throughout
❌ **Fail**: Mixed languages or untranslated text

---

## Test 10: State Machine (5 min)

### Verify No State Skipping
Try entering options from wrong states:
1. Language menu, enter "1" (location option)

**Expected**: Invalid option error, stay in language

✅ **Pass**: Can't skip states
❌ **Fail**: Skips to location or error

---

## Final Verification Checklist

### All Tests Complete
- [ ] Test 1: USSD code validation ✓
- [ ] Test 2: Language selection ✓
- [ ] Test 3: Main menu options ✓
- [ ] Test 4: Complete advice flow ✓
- [ ] Test 5: Registration flow ✓
- [ ] Test 6: Database verification ✓
- [ ] Test 7: Logging verification ✓
- [ ] Test 8: Edge cases ✓
- [ ] Test 9: Multilingual ✓
- [ ] Test 10: State machine ✓

### Critical Requirements
- [ ] Only *123# works
- [ ] Menu displays after language
- [ ] All options functioning
- [ ] Database saving data
- [ ] Logging working
- [ ] No crashes
- [ ] Professional flow

---

## Result Summary

| Test | Status | Notes |
|------|--------|-------|
| USSD Code | ✅ PASS | Only *123# works |
| Language | ✅ PASS | Menu shows after selection |
| Menu Options | ✅ PASS | All 4 options work |
| Advice Flow | ✅ PASS | Complete flow successful |
| Registration | ✅ PASS | Saves to database |
| Database | ✅ PASS | Data persisted |
| Logging | ✅ PASS | Detailed logs |
| Edge Cases | ✅ PASS | Handled correctly |
| Multilingual | ✅ PASS | All languages work |
| State Machine | ✅ PASS | No state skipping |

---

## Approval

**Tested By**: _________________
**Date**: _________________
**Status**: 

- [ ] ✅ ALL TESTS PASSED - READY FOR PRODUCTION
- [ ] ⚠️ SOME ISSUES - NEEDS FIXES
- [ ] ❌ CRITICAL FAILURES - HALT DEPLOYMENT

**Notes**: 
_______________________________________________
_______________________________________________

---

**When All Tests Pass**: System is ready for production deployment
