# Fahamu Shamba - Standard USSD Code & Integration

## 🎯 Official USSD Code

```
*123#
```

**For Feature Phone Users:**
1. Open phone
2. Dial: `*123#`
3. Press Call/Send
4. Follow prompts
5. Get crop recommendations

---

## 📡 How It Works

### User Journey
```
Farmer dials: *123#
       ↓
System receives request at /api/ussd endpoint
       ↓
Backend processes USSD flow
       ↓
Response sent back to phone
       ↓
User selects option
       ↓
Next menu appears
       ↓
... continues until recommendation ...
       ↓
Session ends with crop recommendation
```

---

## 🔌 Integration Points

### USSD Providers We Support
- ✅ Safaricom (Kenya)
- ✅ Airtel Kenya
- ✅ Equity Bank USSD
- ✅ Any USSD gateway following standard protocol

---

## 📋 Standard USSD Request Format

### From USSD Gateway to Fahamu Shamba

```http
POST /api/ussd HTTP/1.1
Host: fahamu-shamba.com
Content-Type: application/x-www-form-urlencoded

sessionId=abc123def456&
serviceCode=123&
phoneNumber=254712345678&
text=1*1*2
```

**Parameters:**
- `sessionId` - Unique session identifier
- `serviceCode` - The USSD code (123 for *123#)
- `phoneNumber` - User's phone number (international format)
- `text` - User's navigation history (menu selections separated by *)

---

## 📤 Standard USSD Response Format

### From Fahamu Shamba to USSD Gateway

**For Continuing Session (CON):**
```
CON Main Menu:
1. Get Crop Advice
2. Register Farm
3. My Profile
4. Market Prices
```

**For Ending Session (END):**
```
END Top Recommendation:
Rice

Suitability Score:
95%

Current Market Price:
KSh 120/kg

Thank you! Visit fahamu-shamba.com for more.
```

---

## 🚀 Setup for Production

### Step 1: Register Shortcode with Provider

#### Safaricom
```
Contact: developer.safaricom.co.ke
Request: USSD Shortcode registration
Shortcode: *123#
Service: Crop recommendations for farmers
```

#### Airtel Kenya
```
Contact: https://airtel.co.ke/business/
Request: USSD Gateway integration
Shortcode: *123#
Service: Agricultural advisory
```

### Step 2: Get API Credentials
```
Each provider will give you:
- API Key/Consumer Key
- Consumer Secret
- OAuth URL
- API Base URL
```

### Step 3: Configure Fahamu Shamba Backend

Create `.env` file:
```env
# Safaricom Configuration
SAFARICOM_CONSUMER_KEY=your_key_here
SAFARICOM_CONSUMER_SECRET=your_secret_here
SAFARICOM_SHORTCODE=123
SAFARICOM_BASE_URL=https://api.safaricom.co.ke

# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=./fahamu_shamba.db
```

### Step 4: Deploy Backend
```bash
# On production server
npm install
npm start

# Verify endpoint is accessible
curl -X POST https://fahamu-shamba.com/api/ussd \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=test&phoneNumber=254712345678&text=1&serviceCode=123"
```

---

## 📞 Complete USSD Flow

### User Experience (What Farmer Sees)

```
Farmer dials: *123#
       ↓
SYSTEM MESSAGE:
Welcome to Fahamu Shamba
Choose language:
1. English
2. Kiswahili
3. Dholuo
       ↓ (Farmer enters: 1)
       
SYSTEM MESSAGE:
Main Menu:
1. Get Crop Advice
2. Register Farm
3. My Profile
4. Market Prices
       ↓ (Farmer enters: 1)

SYSTEM MESSAGE:
Select your County:
1. Siaya
2. Kisumu
3. Migori
       ↓ (Farmer enters: 1)

SYSTEM MESSAGE:
Select your Ward:
1. Bondo
2. Ugunja
3. Yala
4. Gem
5. Alego
       ↓ (Farmer enters: 1)

SYSTEM MESSAGE:
Soil Type:
1. Sandy
2. Clay
3. Loam
       ↓ (Farmer enters: 3)

SYSTEM MESSAGE:
Season:
1. Long Rains (Mar-May)
2. Short Rains (Oct-Dec)
3. Dry (Jun-Sep)
       ↓ (Farmer enters: 1)

SYSTEM MESSAGE:
Farm size (acres):
1. 0-1 acre
2. 1-2 acres
3. 2-5 acres
4. 5+ acres
       ↓ (Farmer enters: 2)

SYSTEM MESSAGE:
Budget (KSh):
1. <2000
2. 2000-5000
3. 5000-10000
4. 10000+
       ↓ (Farmer enters: 2)

FINAL MESSAGE:
Top Recommendation:
Rice

Suitability Score:
95%

Current Market Price:
KSh 120/kg

Thank you! Visit fahamu-shamba.com for more details.

[Session Ends]
```

---

## 🔄 Technical Implementation

### Backend Endpoint

**File**: `/backend/server.js`

```javascript
// USSD Endpoint
app.post('/api/ussd', (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    // Validate required parameters
    if (!sessionId || !phoneNumber) {
      res.status(400).json({ 
        error: 'Missing required parameters: sessionId, phoneNumber' 
      });
      return;
    }

    // Handle USSD request
    const result = handleUSSD(sessionId, phoneNumber, text || '', serviceCode || '');

    // Format response for USSD gateway
    const ussdResponse = result.endSession 
      ? `END ${result.response}`
      : `CON ${result.response}`;

    // Send plain text response (USSD standard)
    res.set('Content-Type', 'text/plain');
    res.send(ussdResponse);

  } catch (error) {
    console.error('USSD Error:', error);
    const response = `END An error occurred. Please try again later.`;
    res.set('Content-Type', 'text/plain');
    res.send(response);
  }
});
```

### USSD Service Module

**File**: `/backend/ussd-service.js`

Handles:
- Session management
- State machine (language → menu → selections → recommendation)
- Multi-language support
- Database integration
- Crop recommendations
- Market price lookups

---

## 📊 USSD Protocol

### Session Management
- **Session Duration**: 5 minutes
- **Timeout**: Auto-cleanup after inactivity
- **Storage**: In-memory (can upgrade to Redis for scale)

### Message Format

**Request Format:**
```
POST /api/ussd
Content-Type: application/x-www-form-urlencoded

sessionId=SESSION_ID&
phoneNumber=PHONE&
text=1*1*2&
serviceCode=123
```

**Response Format:**
```
CON Next Menu Text
(for continuing session)

END Final Response Text
(for ending session)
```

---

## 🌍 Multi-Language Support

### Languages Available
- **English** - Full translation
- **Kiswahili** - Complete localization
- **Dholuo** - Culturally relevant

### Language Selection
User selects at first screen:
```
1. English
2. Kiswahili
3. Dholuo
```

All subsequent responses in selected language.

---

## 📈 Usage Analytics

### What We Track
- Session ID
- Phone number (anonymized for privacy)
- County/Ward selection
- Soil type preference
- Season selection
- Farm size
- Budget level
- Recommended crop
- Confidence score
- Timestamp

### Analytics Database
```sql
CREATE TABLE predictions (
  id INTEGER PRIMARY KEY,
  phone_number TEXT,
  sub_county TEXT,
  ward TEXT,
  soil_type TEXT,
  season TEXT,
  farm_size TEXT,
  budget TEXT,
  predicted_crop TEXT,
  confidence INTEGER,
  reason TEXT,
  created_at TIMESTAMP
);
```

---

## 🔐 Security Features

### Input Validation
- ✅ Phone number format validation
- ✅ Session ID validation
- ✅ Selection range validation
- ✅ SQL injection prevention
- ✅ XSS protection

### Rate Limiting
- ✅ Per-session limits
- ✅ Per-phone number limits
- ✅ Prevents abuse

### Data Protection
- ✅ HTTPS in production
- ✅ Database encryption recommended
- ✅ Phone number encryption optional
- ✅ Audit logging

---

## 🚨 Error Handling

### Invalid Input
```
User enters: 9 (invalid option)
System responds: Invalid option. Try again.
Main Menu:
1. Get Crop Advice
2. Register Farm
3. My Profile
4. Market Prices
```

### Session Timeout
```
If no activity for 5 minutes:
- Session automatically ended
- User must dial *123# again
- New session ID generated
```

### Network Error
```
If connection fails:
END An error occurred. Please try again later.
```

---

## 📞 Customer Support

### Help Text
At any point, farmers can dial back to:
- Get help: Instructions sent via SMS
- Know current prices: *123*4#
- Check profile: *123*3#
- Start over: Just dial *123# again

---

## 🎯 Success Metrics

### Key Performance Indicators
```
- Daily Active Users (DAU)
- Average Session Duration: ~2-3 minutes
- Completion Rate: % completing full flow
- Crop Selection Distribution: Which crops most recommended
- Geographic Spread: County/Ward distribution
- Language Preference: Which language selected
- Device Type: Phone brand/model (if available)
```

---

## 📚 Documentation for USSD Providers

### Integration Guide (Send to Provider)
```
Service Name: Fahamu Shamba Agricultural Advisory
USSD Code: *123#
API Endpoint: https://fahamu-shamba.com/api/ussd
Method: POST
Content-Type: application/x-www-form-urlencoded

Parameters:
- sessionId (string, required)
- phoneNumber (string, required, international format)
- text (string, user selections separated by *)
- serviceCode (string, the shortcode)

Response Format:
- CON [message] for continuing
- END [message] for ending

Session Duration: 5 minutes
Timeout Handling: Auto-cleanup
Error Response: END [error message]
```

---

## 🔄 USSD Navigation Examples

### Example 1: Get Crop Advice (Complete Flow)
```
Dial: *123#
Input: 1 (English)
Input: 1 (Get Crop Advice)
Input: 1 (Siaya)
Input: 2 (Ugunja)
Input: 2 (Clay)
Input: 2 (Short Rains)
Input: 3 (2-5 acres)
Input: 3 (5000-10000 KSh)
Result: Get Recommendation (Maize, 92%, KSh 68/kg)
```

### Example 2: View Market Prices (Quick)
```
Dial: *123#
Input: 1 (English)
Input: 4 (Market Prices)
Result: Show prices, session ends
```

### Example 3: Check Profile (Quick)
```
Dial: *123#
Input: 1 (English)
Input: 3 (My Profile)
Result: Show phone number, session ends
```

### Example 4: Register Farm (Multi-step)
```
Dial: *123#
Input: 1 (English)
Input: 2 (Register Farm)
Input: 254712345678 (phone number)
Input: John Kipchoge (full name)
Result: Account created, session ends
```

---

## 🌐 Production Checklist

Before launching with USSD provider:

- [ ] Backend deployed to production server
- [ ] HTTPS/SSL configured
- [ ] Database backups enabled
- [ ] Logging enabled
- [ ] Monitoring set up
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Multi-language tested
- [ ] All USSD flows tested
- [ ] Database tables created
- [ ] API endpoint verified
- [ ] Load testing completed
- [ ] Disaster recovery plan
- [ ] User documentation created
- [ ] Support team trained

---

## 💰 Cost Estimation

### Per-Session Cost (Safaricom)
- Outgoing message: ~KSh 0.80
- Incoming message: ~KSh 1.20
- **Total per complete flow**: ~KSh 8-12

### Monthly Estimate (1000 farmers/month)
```
1000 sessions × KSh 10 = KSh 10,000/month
(Plus server hosting: ~KSh 5,000/month)
Total: ~KSh 15,000/month
```

---

## 📞 Contact USSD Provider

### Safaricom
```
Developer Portal: developer.safaricom.co.ke
Email: api@safaricom.co.ke
Support: +254722000000
Hours: 8:00 AM - 5:00 PM EST
```

### Airtel Kenya
```
Business Portal: https://airtel.co.ke/business/
Email: business@airtel.co.ke
Phone: +254100113000
Hours: 8:00 AM - 5:00 PM EAT
```

---

## 🎓 Training

### For Farmers
- SMS notification: "Dial *123# to get crop advice"
- Radio spots: "Get free agricultural advice on any phone"
- Community training: Direct demonstration

### For Support Team
- How to read logs
- Common issues and fixes
- User support procedures

---

## 📝 Standard Responses

### Success Response
```
END [Recommendation with crop, score, and price]
```

### Error Response
```
END An error occurred. Please try again later.
```

### Goodbye Message
```
Thank you! Visit fahamu-shamba.com for more details.
Dial *123# anytime for new recommendations.
```

---

**Version**: 1.0
**Status**: Ready for USSD Provider Integration
**Date**: March 2026
**Code**: *123#
