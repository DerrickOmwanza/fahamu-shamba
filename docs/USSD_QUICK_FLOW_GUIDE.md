# USSD Flow - Quick Reference Guide

## Global USSD Code: `*123#` (ONLY CODE)

---

## Complete Flow Diagram

```
START: Dial *123#
│
├─ System validates code (MUST be *123#)
│  └─ If invalid: REJECT & END ❌
│
├─ SESSION CREATED
│  └─ sessionId + phoneNumber stored
│
├─ LANGUAGE SELECTION
│  ├─ Input: 1 → English ✓
│  ├─ Input: 2 → Swahili ✓
│  ├─ Input: 3 → Dholuo ✓
│  └─ Invalid input → Show menu again
│
├─ MAIN MENU (Language selected)
│  ├─ Input: 1 → GET CROP ADVICE
│  ├─ Input: 2 → REGISTER FARM
│  ├─ Input: 3 → VIEW PROFILE (End)
│  ├─ Input: 4 → MARKET PRICES (End)
│  └─ Invalid input → Show menu again
│
├─ FEATURE FLOWS ─────────────────────────────────────────┐
│                                                          │
│  [1] GET CROP ADVICE FLOW:                               │
│  ├─ Location: 1=Siaya, 2=Kisumu, 3=Migori              │
│  ├─ Ward: 1=Bondo, 2=Ugunja, 3=Yala, 4=Gem, 5=Alego   │
│  ├─ Soil: 1=Sandy, 2=Clay, 3=Loam                      │
│  ├─ Season: 1=Long Rains, 2=Short Rains, 3=Dry         │
│  ├─ Size: 1=0-1, 2=1-2, 3=2-5, 4=5+ acres             │
│  ├─ Budget: 1=<2000, 2=2000-5000, 3=5000-10000, 4=10K+ │
│  └─ Result: Recommendation shown → SESSION ENDS ✓      │
│                                                          │
│  [2] REGISTER FARM FLOW:                                │
│  ├─ Input: Phone number (10 digits)                     │
│  ├─ Input: Full name (3+ characters)                    │
│  └─ Success: Account created → SESSION ENDS ✓           │
│                                                          │
│  [3] VIEW PROFILE:                                       │
│  └─ Shows: Phone number → SESSION ENDS ✓                │
│                                                          │
│  [4] MARKET PRICES:                                      │
│  └─ Shows: Current prices → SESSION ENDS ✓              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## State Machine

```
LANGUAGE_SELECT
    ↓ (input: 1/2/3)
MAIN_MENU
    ↓ (input: 1)
GET_ADVICE_LOCATION → GET_ADVICE_WARD → GET_ADVICE_SOIL → 
GET_ADVICE_SEASON → GET_ADVICE_SIZE → GET_ADVICE_BUDGET → 
GET_ADVICE_RESULT (END)

MAIN_MENU
    ↓ (input: 2)
REGISTER_PHONE → REGISTER_NAME → REGISTER_CONFIRM (END)

MAIN_MENU
    ↓ (input: 3)
VIEW_PROFILE (END)

MAIN_MENU
    ↓ (input: 4)
MARKET_PRICES (END)
```

---

## Test Scenarios

### Scenario 1: Complete Advice Request (7 inputs)
```
Input 1: (empty)       → Language menu
Input 2: 1             → Main menu (English)
Input 3: 1             → Location selection
Input 4: 1             → Ward selection
Input 5: 1             → Soil selection
Input 6: 1             → Season selection
Input 7: 1             → Size selection
Input 8: 1             → Budget selection
Output: Recommendation → Session ends
```

### Scenario 2: Registration (3 inputs)
```
Input 1: (empty)       → Language menu
Input 2: 1             → Main menu
Input 3: 2             → Phone prompt
Input 4: 254712345678  → Name prompt
Input 5: John Farmer   → Success message
Output: Account created → Session ends
```

### Scenario 3: Invalid Input Handling
```
Input 1: (empty)       → Language menu
Input 2: 5             → "Invalid option. Try again." + Language menu
Input 3: 1             → Main menu
Input 4: 10            → "Invalid option. Try again." + Main menu
Input 5: 1             → Location selection
```

### Scenario 4: Wrong USSD Code
```
Dial: *456#            → "Invalid USSD code..." → Session ends
Dial: *999#            → "Invalid USSD code..." → Session ends
Dial: *123#            → "Welcome..." → Session continues ✓
```

---

## Input Validation Rules

| State | Valid Input | Invalid Input | Response |
|-------|-------------|----------------|----------|
| LANGUAGE_SELECT | 1, 2, 3 | Anything else | Error + menu |
| MAIN_MENU | 1, 2, 3, 4 | Anything else | Error + menu |
| LOCATION | 1, 2, 3 | Anything else | Error + menu |
| WARD | 1, 2, 3, 4, 5 | Anything else | Error + menu |
| SOIL | 1, 2, 3 | Anything else | Error + menu |
| SEASON | 1, 2, 3 | Anything else | Error + menu |
| SIZE | 1, 2, 3, 4 | Anything else | Error + menu |
| BUDGET | 1, 2, 3, 4 | Anything else | Error + menu |
| REGISTER_PHONE | 10-digit number | Invalid format | Error + retry |
| REGISTER_NAME | 3+ characters | <3 characters | Error + retry |

---

## Response Format

### Continuation Response
```
CON {message}

Example:
CON Main Menu:
1. Get Crop Advice
2. Register Farm
3. My Profile
4. Market Prices
```

### End Session Response
```
END {message}

Example:
END Thank you! See full recommendations at fahamu-shamba.com
```

---

## Session Lifecycle

```
1. CREATE
   - User dials *123#
   - sessionId + phoneNumber generated
   - Initial state: LANGUAGE_SELECT
   - Duration: 5 minutes

2. MAINTAIN
   - State stored in memory
   - Session data collected
   - User navigates menu
   - Input validated at each step

3. SAVE (on applicable states)
   - Predictions saved to database
   - User registration saved
   - Feedback stored

4. CLEANUP
   - Session ends (user completes)
   - OR timeout after 5 minutes (auto cleanup)
   - OR invalid USSD code (immediate cleanup)
```

---

## Error Handling

### Invalid USSD Code
```
Input: *456#
Response: Invalid USSD code. Please dial *123#
Status: END SESSION
```

### Invalid Menu Choice
```
Current state: LANGUAGE_SELECT
Input: 5
Response: Invalid option. Try again.

Choose language:
1. English
2. Kiswahili
3. Dholuo
Status: CON (session continues)
```

### Invalid Phone Format (Registration)
```
Current state: REGISTER_PHONE
Input: 123
Response: Invalid option. Try again.
         Enter your phone number:
Status: CON (session continues)
```

### Timeout
```
No input for 5 minutes
Response: Session expired. Dial *123# to start over
Status: END SESSION
```

---

## Database Interactions

### Save Predictions
```
trigger: After budget selection (input 7 in advice flow)
table: predictions
fields: phone_number, sub_county, soil_type, season, 
        predicted_crop, confidence, reason
```

### Save Registration
```
trigger: After name input in registration
table: users
fields: phone, name, password_hash, created_at, updated_at
```

### Query Profile
```
trigger: When user selects "View Profile"
action: Read user record by phone number
display: Phone number + website link
```

---

## Multilingual Support

All messages available in:
- 🇬🇧 English
- 🇰🇪 Kiswahili
- 🇰🇪 Dholuo (Luo)

Language selected at first step, used for entire session.

---

## Quick Troubleshooting

| Problem | Check | Solution |
|---------|-------|----------|
| Other codes work | USSD validation | Check line 18: VALID_USSD_CODE |
| Menu not showing after language | State transition | Check handleLanguageSelect() |
| Can skip steps | Input validation | Check all handlers for validation |
| Session expires too fast | Timeout setting | Check SESSION_TIMEOUT (5 min) |
| Database not saving | Query execution | Check database permissions |

---

## Production Checklist

- [ ] USSD code set to `*123#` only
- [ ] No other codes accepted
- [ ] All states transition properly
- [ ] All inputs validated
- [ ] Database tables exist
- [ ] Logging working ([USSD] prefix)
- [ ] USSD gateway configured
- [ ] SMS notifications ready
- [ ] Monitoring in place

---

**Version**: 2.0 (Final)
**Status**: ✅ Production Ready
**Last Updated**: 2024-12-31
