# USSD Implementation Guide - Fahamu Shamba

## 📱 What is USSD?

**USSD** (Unstructured Supplementary Service Data) is a protocol used by GSM mobile networks to send text-based messages between a phone and a network server. 

### Why USSD?
- ✅ Works on **all phones** (smartphones, feature phones, basic phones)
- ✅ **No internet required** - uses cellular network
- ✅ **No data costs** - similar to SMS charges
- ✅ **Instant response** - unlike SMS which can have delays
- ✅ **Interactive** - allows multi-step conversations
- ✅ **Perfect for Kenya** - 90%+ feature phone penetration in rural areas

---

## 🎯 Current USSD Implementation

### System Architecture

```
Farmer with Feature Phone
        ↓
  Dials *123#
        ↓
Safaricom/Airtel USSD Gateway
        ↓
Fahamu Shamba Backend (Node.js)
        ↓
SQLite Database
        ↓
Response back to phone
```

### User Flow

```
1. User dials *123#
   ↓
2. Welcomes user & offers language choice
   - 1. English
   - 2. Kiswahili
   - 3. Dholuo
   ↓
3. Main Menu
   - 1. Get Crop Advice
   - 2. Register Farm
   - 3. My Profile
   - 4. Market Prices
   ↓
4. For Crop Advice:
   ├─ Select County
   ├─ Select Ward
   ├─ Select Soil Type
   ├─ Select Season
   ├─ Select Farm Size
   └─ Get Recommendation
   ↓
5. Display Result
   - Recommended Crop
   - Suitability Score
   - Market Price
```

---

## 🔧 Technical Details

### API Endpoint

**POST** `/api/ussd`

### Request Format (from USSD Gateway)

```json
{
  "sessionId": "unique-session-id-12345",
  "serviceCode": "*123#",
  "phoneNumber": "254712345678",
  "text": "" // First request is empty
}
```

### Response Format (to USSD Gateway)

```
CON [message]\n[options]    // Continue session (ask for more input)
END [message]               // End session
```

### Example Flow

**Request 1:** (Initial)
```json
{
  "sessionId": "sess_001",
  "serviceCode": "*123#",
  "phoneNumber": "254712345678",
  "text": ""
}
```

**Response 1:**
```
CON Welcome to Fahamu Shamba
Choose language:
1. English
2. Kiswahili
3. Dholuo
```

**Request 2:** (User selects language 1)
```json
{
  "sessionId": "sess_001",
  "serviceCode": "*123#",
  "phoneNumber": "254712345678",
  "text": "1"
}
```

**Response 2:**
```
CON Main Menu:
1. Get Crop Advice
2. Register Farm
3. My Profile
4. Market Prices
```

**Request 3:** (User selects option 1)
```json
{
  "sessionId": "sess_001",
  "serviceCode": "*123#",
  "phoneNumber": "254712345678",
  "text": "1"
}
```

**Response 3:**
```
CON Select your County:
1. Siaya
2. Kisumu
3. Migori
```

---

## 🌍 Supported Languages

### English
- Menu items
- Form labels
- Error messages
- Recommendations
- Tips

### Kiswahili (Swahili)
- Complete UI translation
- Natural language explanations
- Local context

### Dholuo (Luo)
- Complete UI translation
- Culturally relevant messaging
- Local farming terminology

---

## 💾 Data Storage

All USSD interactions are saved to the database:

```sql
-- Predictions table
INSERT INTO predictions (
  phone_number,      -- User's phone
  sub_county,        -- Location selected
  soil_type,         -- Soil type selected
  season,            -- Season selected
  predicted_crop,    -- Recommended crop
  confidence,        -- Score (0-100)
  reason,            -- Why recommended
  created_at         -- Timestamp
)
```

### User Registration via USSD

```sql
-- Users table
INSERT INTO users (
  phone,            -- User's phone
  name,             -- Registered name
  password_hash,    -- Empty for USSD users
  created_at,
  updated_at
)
```

---

## 🚀 Integration with USSD Gateway Providers

### Safaricom (Kenya's Largest Operator)

**1. Register for USSD Service**
- Contact Safaricom Business
- Request USSD short code (e.g., *123#)
- Sign API integration agreement

**2. Configuration**
```
Short Code: *123#
Service Name: Fahamu Shamba
Service Type: Menu-driven
```

**3. API Details**
- **Endpoint**: Your server's `/api/ussd`
- **Method**: POST
- **Content-Type**: application/json
- **Timeout**: 5 minutes per session

**4. Sample Integration URL**
```
https://your-domain.com/api/ussd
```

### Airtel Kenya

**1. Register for USSD**
- Contact Airtel Business
- Request short code setup
- Agree to USSD terms

**2. Configuration**
- Similar to Safaricom
- Endpoint: `/api/ussd`
- Format: POST JSON

### Equity Bank USSD

**1. Register**
- Through Equity Bank's digital banking platform
- Link to merchant account
- Get API credentials

---

## 📊 Features Implemented

### ✅ Language Support
- [x] English
- [x] Kiswahili  
- [x] Dholuo

### ✅ Main Features
- [x] Language Selection
- [x] Crop Recommendations
- [x] Farm Registration
- [x] Profile Viewing
- [x] Market Price Checking

### ✅ Data Handling
- [x] Session Management
- [x] Data Persistence
- [x] Error Handling
- [x] Input Validation
- [x] Timeout Management

### ⏳ Coming Soon
- [ ] SMS delivery of recommendations
- [ ] Farmer group messaging
- [ ] Weather alerts via USSD
- [ ] Payment integration
- [ ] Farm input ordering
- [ ] Pest/disease reporting

---

## 🔒 Security Considerations

### 1. Session Management
```javascript
// Sessions auto-expire after 5 minutes
const SESSION_TIMEOUT = 5 * 60 * 1000;

setTimeout(() => {
  USSD_SESSIONS.delete(sessionId);
}, SESSION_TIMEOUT);
```

### 2. Input Validation
```javascript
// Validate phone number format
const isValidPhone = (phone) => {
  return phone.match(/^(254|\+254|0)?[0-9]{9,10}$/);
};
```

### 3. Database Protection
- Prepared statements (prevent SQL injection)
- Input sanitization
- Error handling without data exposure

### 4. Rate Limiting
```javascript
// Recommended: Add rate limiting per phone
const requestsPerMinute = 10;
const requestsPerHour = 100;
```

---

## 🧪 Testing USSD

### 1. Local Testing with curl

```bash
# First request (language selection)
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_001",
    "serviceCode": "*123#",
    "phoneNumber": "254712345678",
    "text": ""
  }'

# Expected response:
# CON Welcome to Fahamu Shamba
# Choose language:
# 1. English
# 2. Kiswahili
# 3. Dholuo
```

### 2. Select Language (1 for English)

```bash
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_001",
    "serviceCode": "*123#",
    "phoneNumber": "254712345678",
    "text": "1"
  }'

# Expected response:
# CON Main Menu:
# 1. Get Crop Advice
# 2. Register Farm
# 3. My Profile
# 4. Market Prices
```

### 3. Get Crop Advice (1)

```bash
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_001",
    "serviceCode": "*123#",
    "phoneNumber": "254712345678",
    "text": "1"
  }'
```

Continue with the flow...

---

## 📈 Monitoring & Analytics

### Track USSD Usage

```sql
-- Get daily USSD users
SELECT COUNT(DISTINCT phone_number) as unique_users
FROM predictions
WHERE DATE(created_at) = CURDATE();

-- Get most recommended crops
SELECT predicted_crop, COUNT(*) as count
FROM predictions
GROUP BY predicted_crop
ORDER BY count DESC;

-- Get popular locations
SELECT sub_county, COUNT(*) as count
FROM predictions
GROUP BY sub_county
ORDER BY count DESC;
```

---

## 🌐 Deployment Checklist

- [ ] USSD gateway account created (Safaricom/Airtel/Equity)
- [ ] Short code assigned (*123# or similar)
- [ ] API endpoint tested with gateway
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] Rate limiting implemented
- [ ] SMS notifications ready
- [ ] Documentation shared with team
- [ ] User guide created for farmers
- [ ] Training materials prepared

---

## 📞 Support & Escalation

### Common Issues

**1. "Invalid option" error**
- User entered wrong number
- Session timed out
- Reset and try again

**2. Timeout after 5 minutes**
- Session expires for security
- User must dial *123# again
- Their data is saved in database

**3. Recommendation not saved**
- Check database connection
- Verify SQL permissions
- Check error logs

### Troubleshooting

```javascript
// Check session status
console.log('Current sessions:', USSD_SESSIONS.size);

// Check database
SELECT * FROM predictions 
WHERE phone_number = '254712345678'
ORDER BY created_at DESC;
```

---

## 📱 User Guide (for Farmers)

### How to Use Fahamu Shamba via USSD

1. **Dial:** `*123#` on any phone
2. **Select Language:** Choose 1 (English), 2 (Kiswahili), or 3 (Dholuo)
3. **Choose Action:** 
   - 1 = Get crop advice
   - 2 = Register your farm
   - 3 = View your profile
   - 4 = Check market prices
4. **Answer Questions:** Location, soil type, season, farm size
5. **Get Recommendation:** Top crop + suitability score
6. **Share:** You can share recommendations with friends

### Cost
- No data charges
- Same as regular SMS
- Typically KSh 1-3 per session

### Tips
- Save this guide
- Try different seasons to compare
- Check market prices before planting
- Register your farm for better recommendations

---

## 🔮 Future Enhancements

1. **SMS Integration**
   - Send recommendations via SMS
   - Market price updates
   - Weather alerts

2. **Payment Integration**
   - Buy farm inputs via USSD
   - M-Pesa integration
   - Subscription model

3. **AI Improvements**
   - Machine learning recommendations
   - Pest/disease detection
   - Personalized advice

4. **Community Features**
   - Share experiences with farmers
   - Group buying arrangements
   - Farmer network messages

5. **Analytics Dashboard**
   - Real-time usage stats
   - Farmer demographics
   - Crop popularity trends
   - Regional insights

---

## 📚 References

- [GSM World USSD Documentation](https://www.gsma.com/)
- [Safaricom API Docs](https://www.safaricom.co.ke/business/platform-services/apis)
- [USSD Best Practices](https://en.wikipedia.org/wiki/Unstructured_Supplementary_Service_Data)

---

**Document Version:** 1.0  
**Last Updated:** March 5, 2026  
**Status:** Ready for Production  
**Maintained by:** Fahamu Shamba Development Team
