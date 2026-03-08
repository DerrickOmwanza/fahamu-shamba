# ML Model Bias Fix - Action Plan

## Problem Summary
✅ USSD is working perfectly BUT model is biased - everything recommends Maize

**Root Cause**: Rule-based system with hardcoded 95% confidence for Maize

---

## Quick Wins (This Week)

### 1. Fix Confidence Scoring Bug
**File**: `backend/demo-data.js`

**Current Problem**:
```javascript
// Line 8: Maize confidence: 95 (TOO HIGH, always wins!)
{ name: 'Maize', confidence: 95, ... }
{ name: 'Beans', confidence: 92, ... }
{ name: 'Rice', confidence: 93, ... }
```

**Solution**: Rebalance confidence scores based on ACTUAL conditions

```javascript
// NEW: Confidence = how suitable FOR THAT SPECIFIC CONDITION
cropRules: [
  // Maize: Best in Bondo with loam & long rains
  {
    name: 'Maize',
    conditions: { subcounty: 'bondo', soil: 'loam', season: 'long_rains' },
    confidence: 95,  // Excellent for THIS condition
    budget_min: 5000,
    farm_size_min: 2,
    reasons: { english: '...' }
  },
  // But Maize gets lower score in other conditions
  {
    name: 'Maize',
    conditions: { subcounty: 'yala', soil: 'sandy', season: 'dry' },
    confidence: 45,  // Poor for THIS condition
    budget_min: 3000,
    farm_size_min: 1,
    reasons: { english: 'Not ideal for dry season sandy soils' }
  }
]
```

### 2. Add Missing Crops
**Current**: 8 crops
**Add**: 7 more crops for Siaya region

**Code Location**: `backend/demo-data.js` line 6-135

```javascript
cropRules: [
  // Existing 8 crops...
  
  // NEW CROPS:
  {
    name: 'Kales',
    conditions: { subcounty: 'bondo', soil: 'loam', season: 'long_rains' },
    confidence: 90,
    inputs: 'Compost, DAP, minimal pesticides',
    waterReq: 'Moderate (400-500mm)',
    marketPrice: 50,
    yieldRange: '20-30 tons/ha'
  },
  {
    name: 'Cowpeas',
    conditions: { subcounty: 'alego', soil: 'sandy', season: 'short_rains' },
    confidence: 85,
    inputs: 'Minimal fertilizer, Cowpea seed',
    waterReq: 'Low-Medium (300-500mm)',
    marketPrice: 70,
    yieldRange: '1.2-2.0 tons/ha'
  },
  // ... add Spinach, Millet, Pigeon Peas, Okra, Cucumber
]
```

### 3. Improve Scoring Function
**File**: `backend/recommendation-engine.js` line 65-93

**Current Issue**: Exact match gets 30 points, non-match gets only 10
**Result**: Very volatile recommendations

**Fix**:
```javascript
calculateCropScore(rule, farmerData) {
  let score = 0;
  
  // 1. Soil match (40 points max) - increased importance
  const soilMatch = rule.conditions.soil === farmerData.soilType;
  score += soilMatch ? 40 : 15;  // Changed from 30:10
  
  // 2. Season match (25 points max)
  const seasonMatch = rule.conditions.season === farmerData.season;
  score += seasonMatch ? 25 : 10;
  
  // 3. Sub-county match (20 points max)
  const subCountyMatch = rule.conditions.subcounty === farmerData.subCounty;
  score += subCountyMatch ? 20 : 8;
  
  // 4. Budget feasibility (10 points max) - add min/max
  const budgetScore = this.getBudgetScore(
    rule.budget_min,
    rule.budget_max, 
    farmerData.budget
  );
  score += budgetScore;
  
  // 5. Farm size suitability (5 points max)
  const sizeScore = this.getFarmSizeScore(rule.name, farmerData.farmSize);
  score += sizeScore;
  
  // NEW: Baseline score from rule confidence
  score += rule.confidence / 2;  // Rule's own confidence (0-50 points)
  
  return Math.min(100, Math.round(score));
}
```

### 4. Add Diversification Logic
**File**: `backend/recommendation-engine.js` new method

```javascript
diversifyRecommendations(allCrops, selectedCrop, season) {
  // Don't recommend same crop twice
  // Suggest rotation for next season
  
  const availableForNextSeason = allCrops.filter(crop => 
    crop.name !== selectedCrop &&
    crop.conditions.season !== season
  );
  
  return availableForNextSeason.slice(0, 2);
}
```

---

## Medium Term (Next Month)

### 1. Collect Real Farmer Feedback
Add to USSD after recommendation:

```
Recommendation: Plant Maize
Did this work for you?
1. Yes, excellent harvest
2. Yes, good harvest
3. Average harvest
4. Poor harvest
5. Failed

>>> User selects option
[Save to database for training]
```

**Database Table**: `crop_recommendations_feedback`
```sql
CREATE TABLE crop_recommendations_feedback (
  id INTEGER PRIMARY KEY,
  phone_number TEXT,
  recommended_crop TEXT,
  actual_outcome TEXT,
  yield_kg INTEGER,
  revenue KSH,
  cost KSH,
  feedback_date TIMESTAMP,
  farmer_rating INTEGER (1-5)
);
```

### 2. Expand Market Data
**File**: `backend/demo-data.js` line 195-207

Replace mock prices with real data from:
- Kenya Bureau of Standards
- Nairobi Commodity Exchange
- Local market surveys

### 3. Add Real Weather Data
Replace mock weather with API:

```javascript
// Get real data from Open-Meteo (free API)
const weatherData = await fetch(
  'https://archive-api.open-meteo.com/v1/archive?' +
  'latitude=-0.52&longitude=34.24' +
  '&start_date=2024-01-01&end_date=2024-12-31' +
  '&daily=precipitation,temperature_2m_max'
);
```

---

## Long Term (Next 6 Months)

### Transition to Real ML

**Step 1**: Build dataset from user feedback
- Target: 500+ farmer records with outcomes
- Data: crops planted, conditions, actual results

**Step 2**: Feature engineering
```python
# Convert to ML features
features = {
  'location_code': encode(subcounty),
  'soil_type_code': encode(soil),
  'season_code': encode(season),
  'budget_normalized': budget / 5000,
  'farm_size_normalized': farmSize / 2,
  'rainfall_mm': historical_rainfall,
  'soil_pH': soil_pH,
  'nitrogen_ppm': nitrogen,
  # ... more features
}
```

**Step 3**: Train classifier
```python
from sklearn.ensemble import RandomForestClassifier

# Train on real data
X = [features for each farmer]
y = [actual_crop_planted for each farmer]

model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Get accuracy on test set
accuracy = model.score(X_test, y_test)  # Target: 75%+
```

---

## Implementation Files

### Files to Modify

1. **backend/demo-data.js**
   - [ ] Add missing crops (7 new)
   - [ ] Add budget_min/max to rules
   - [ ] Add farm_size_min/max to rules
   - [ ] Rebalance confidence scores
   - [ ] Add real weather data

2. **backend/recommendation-engine.js**
   - [ ] Update calculateCropScore() function
   - [ ] Add diversification logic
   - [ ] Add rotation recommendations
   - [ ] Add feedback mechanism

3. **backend/server.js**
   - [ ] Add feedback endpoint POST /api/crop-feedback
   - [ ] Add ML model endpoint (future)

4. **backend/public/ussd-simulator.html**
   - [ ] Add feedback prompts after recommendation
   - [ ] Show why crop was recommended

### Files to Create

1. **backend/farmer-feedback-db.js**
   - Database schema for feedback
   - Query functions for analysis

2. **ml-model/data_preparation.py**
   - Data cleaning scripts
   - Feature engineering
   - Train/test split

3. **ml-model/train_model.py**
   - Model training
   - Evaluation metrics
   - Model saving

---

## Testing Plan

### Before Improvements
```
Test Case 1: Bondo + Loam + Long Rains + 5000 budget + 2ha
Current Result: Maize (95%)
Expected: Maize, Beans, or Rice

Test Case 2: Alego + Sandy + Short Rains + 2000 budget + 1ha
Current Result: Maize (high score)
Expected: Sorghum, Cowpeas, or Kales
```

### After Improvements
```
Test Case 1: Bondo + Loam + Long Rains + 5000 budget + 2ha
Expected: Maize (95%), Beans (70%), Rice (65%)
         ↑ Diversified recommendations

Test Case 2: Alego + Sandy + Short Rains + 2000 budget + 1ha
Expected: Sorghum (85%), Cowpeas (78%), Kales (72%)
         ↑ Different crop recommended!
```

---

## Metrics to Track

### Current Metrics
- [ ] Model accuracy: 35-45%
- [ ] Crop diversity: 10% (90% get Maize)
- [ ] User complaints: High

### Target Metrics (Phase 1, 1 month)
- [ ] Model accuracy: 60-70%
- [ ] Crop diversity: 50% (varied recommendations)
- [ ] User satisfaction: Improved feedback

### Target Metrics (Phase 2, 6 months)
- [ ] Model accuracy: 75-85%
- [ ] Crop diversity: 80% (good variety)
- [ ] Farmer adoption: Feedback showing good yields

---

## Priority Actions This Week

### Priority 1 (Do Today)
1. [ ] Expand crop rules with budget/size constraints
2. [ ] Add 5 missing crops
3. [ ] Rebalance confidence scores

### Priority 2 (This Week)
1. [ ] Update scoring function
2. [ ] Add diversification logic
3. [ ] Test with different scenarios

### Priority 3 (Next Week)
1. [ ] Create feedback mechanism
2. [ ] Deploy to production
3. [ ] Monitor user feedback

---

## Code Example: Quick Fix

**File**: `backend/demo-data.js`

```javascript
// BEFORE (Biased)
cropRules: [
  { name: 'Maize', conditions: {...}, confidence: 95 },
  { name: 'Beans', conditions: {...}, confidence: 92 }
]

// AFTER (Better)
cropRules: [
  // Maize optimal
  { name: 'Maize', conditions: {subcounty: 'bondo', soil: 'loam', season: 'long_rains'}, 
    confidence: 95, budget_min: 5000, farm_size_min: 2 },
  
  // Maize suboptimal
  { name: 'Maize', conditions: {subcounty: 'yala', soil: 'sandy', season: 'dry'}, 
    confidence: 45, budget_min: 3000, farm_size_min: 1 },
  
  // Beans optimal
  { name: 'Beans', conditions: {subcounty: 'bondo', soil: 'loam', season: 'short_rains'}, 
    confidence: 92, budget_min: 2000, farm_size_min: 1 },
  
  // Beans suboptimal
  { name: 'Beans', conditions: {subcounty: 'yala', soil: 'sandy', season: 'dry'}, 
    confidence: 40, budget_min: 1500, farm_size_min: 0.5 },
  
  // NEW CROPS
  { name: 'Kales', conditions: {subcounty: 'bondo', soil: 'loam', season: 'long_rains'}, 
    confidence: 88, budget_min: 1000, farm_size_min: 0.25 },
  
  { name: 'Cowpeas', conditions: {subcounty: 'alego', soil: 'sandy', season: 'short_rains'}, 
    confidence: 85, budget_min: 1500, farm_size_min: 1 }
]
```

---

## Success Criteria

✅ **Task Complete When:**
1. Model recommends different crops for different conditions
2. Users don't always get Maize
3. Feedback shows improved farmer satisfaction
4. Database shows yield data for real crops
5. Diversification reaches 50%+ in first month

---

## Summary

| Aspect | Current | Target | Timeline |
|--------|---------|--------|----------|
| Crops | 8 | 15 | 1 week |
| Accuracy | 35-45% | 70%+ | 1 month |
| Diversity | 10% | 50% | 1 month |
| Data | Synthetic | Real feedback | 6 months |
| ML Type | Rule-based | Decision Tree | 6 months |

Start with Phase 1 (expanding rules) - takes 1 week, huge impact.
