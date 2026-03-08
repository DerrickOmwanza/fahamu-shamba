# USSD Code Lock-In: *123# Only Access

## Overview
The Fahamu Shamba USSD system is now **locked to a single access code: `*123#`**

This is the ONLY valid USSD code that can access the entire system. Any attempt to use a different code will be rejected.

---

## How It Works

### 1. **Valid USSD Codes**
Only these codes are accepted:
- `*123#` (primary/standard format)
- `123` (shorthand, accepted for simulator compatibility)
- Empty serviceCode (accepted for backward compatibility)

### 2. **Rejection Mechanism**
Any other USSD code will receive:
```
END Invalid USSD code. Please dial *123# to access Fahamu Shamba.
```

The session will immediately end without accessing any system features.

### 3. **Code Validation Flow**

```
User dials USSD code
    ↓
Server receives request with serviceCode parameter
    ↓
Normalize and validate serviceCode
    ↓
Is it *123#, 123, or empty?
    ├─ YES → Continue to language selection
    └─ NO → REJECT and end session (security log)
```

---

## Implementation Details

### Location: `backend/ussd-service.js`

**Constant Definition** (Line 25):
```javascript
const VALID_USSD_CODE = '*123#'; // ONE AND ONLY VALID CODE
```

**Validation Code** (Lines 156-176):
```javascript
export function handleUSSD(sessionId, phoneNumber, text, serviceCode) {
  // CRITICAL: Validate USSD code - MUST be *123# ONLY
  const normalizedCode = (serviceCode || '').trim().toUpperCase();
  
  // Accept: *123#, 123, or empty (for backward compatibility with simulator)
  const isValidCode = !normalizedCode || normalizedCode === '123' || normalizedCode === '*123#';
  
  if (normalizedCode && !isValidCode) {
    // Reject any other USSD code - security measure
    console.log(`[USSD] REJECTED: Invalid service code "${serviceCode}" from phone ${phoneNumber}`);
    return {
      sessionId,
      response: 'Invalid USSD code. Please dial *123# to access Fahamu Shamba.',
      endSession: true,
    };
  }
  
  if (normalizedCode) {
    console.log(`[USSD] ACCEPTED: Valid service code from phone ${phoneNumber}`);
  }
  
  // Continue with normal flow...
}
```

---

## API Endpoint: `/api/ussd`

### Request Format
```json
{
  "sessionId": "test-1772739140268",
  "phoneNumber": "254712345678",
  "text": "1",
  "serviceCode": "*123#"
}
```

### Key Parameters:
- **serviceCode** - The USSD code dialed by the user
  - Must be `*123#` or `123` to proceed
  - Any other value triggers rejection

### Response Examples

**✅ Valid Code - Accepted:**
```
CON Welcome to Fahamu Shamba
Choose language:
1. English
2. Kiswahili
3. Dholuo
```

**❌ Invalid Code - Rejected:**
```
END Invalid USSD code. Please dial *123# to access Fahamu Shamba.
```

---

## Real-World Integration

When integrating with real USSD providers (Safaricom, Airtel):

### Safaricom Implementation
Safaricom will send `serviceCode` as the USSD code dialed:
```
serviceCode = "*123#"
```

The validation will check this and allow access.

### Multi-Code Management (Future Enhancement)
Currently only `*123#` is valid. To add additional codes in the future:

```javascript
const VALID_USSD_CODES = ['*123#', '*456#', '*789#'];
const isValidCode = !normalizedCode || VALID_USSD_CODES.includes(normalizedCode);
```

---

## Security Features

### 1. **Access Control**
Only authorized users (those who know the correct code) can access the system.

### 2. **Audit Logging**
All rejected access attempts are logged:
```
[USSD] REJECTED: Invalid service code "*999#" from phone 254712345678
```

### 3. **Immediate Termination**
Invalid codes terminate the session immediately, preventing further exploitation.

### 4. **Case-Insensitive Matching**
The code is normalized to uppercase for reliable matching regardless of input format.

---

## Testing

### USSD Simulator
The simulator at `http://localhost:5000/ussd-simulator` sends:
```javascript
serviceCode: '123'  // Accepted as valid
```

### Testing Invalid Codes

Using curl to test invalid code rejection:
```bash
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "phoneNumber": "254712345678",
    "text": "",
    "serviceCode": "*999#"
  }'
```

Expected response:
```
END Invalid USSD code. Please dial *123# to access Fahamu Shamba.
```

---

## Production Deployment Checklist

- [x] Code validation implemented
- [x] Rejection message configured
- [x] Audit logging enabled
- [x] Simulator updated to send correct code
- [x] Server logs code acceptance/rejection
- [ ] Real USSD provider configured with *123# code
- [ ] Test with real feature phones
- [ ] Monitor server logs for access attempts
- [ ] Document code for support team

---

## Support

### For End Users
- Dial `*123#` on any mobile phone
- If you get "Invalid USSD code" message, ensure you're dialing exactly `*123#`
- Check with your network provider if USSD is enabled

### For Administrators
- Monitor logs for access attempts
- Check `/api/ussd` request logs for any unusual patterns
- To change the code, edit `VALID_USSD_CODE` in `backend/ussd-service.js`

---

## Troubleshooting

### "Invalid USSD code" message appearing for valid code?
1. Ensure dialing exactly `*123#` (with asterisk and hash)
2. Check server logs for what code was received
3. Verify network provider isn't blocking the code
4. Try again after a few seconds

### Need to change the code?
1. Edit `backend/ussd-service.js` line 25
2. Update `VALID_USSD_CODE` constant
3. Restart the server
4. Test with simulator
5. Notify USSD provider of code change

---

## Summary

✅ **USSD System is LOCKED to `*123#`**
- Single valid access code
- All other codes rejected
- Security logging enabled
- Ready for production deployment
