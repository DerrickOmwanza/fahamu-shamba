# Market Prices Sync - Testing & Verification Guide

## Changes Made

### 1. Farmer Dashboard (`/backend/public/farmer-dashboard.html`)
- ✅ Added `loadMarketPrices()` function that fetches live prices from `/api/market/prices`
- ✅ Prices update every 30 seconds (synchronized with community stats)
- ✅ Dynamic table rendering - no more hardcoded prices
- ✅ Error handling - gracefully falls back if API fails

**Function Details:**
- Calls `/api/market/prices` endpoint
- Filters prices for Maize, Beans, and Sorghum
- Updates table dynamically
- Runs on page load and every 30 seconds

### 2. Market Trends (`/backend/public/js/market-trends.js`)
- ✅ Changed API_BASE to use relative URLs: `window.location.origin`
- ✅ Replaced simulated historical data with real API calls
- ✅ Updated `loadMarketOverview()` - now fetches from `/api/market/prices`
- ✅ Updated `loadMarketData()` - displays all markets with live status
- ✅ Updated `loadMarketTrends()` - fetches from `/api/market/prices/history`
- ✅ Updated `loadMarketComparison()` - uses real market comparison data
- ✅ Updated `loadMarketAnalysis()` - analyzes real price data
- ✅ Updated `startMarketUpdates()` - syncs all charts every 30 seconds
- ✅ Added proper error handling to all functions

**API Endpoints Used:**
- `/api/market/prices` - Current prices across all markets
- `/api/market/prices/history` - Historical price data for trends

## How to Test

### Test 1: Verify Farmer Dashboard Market Prices
1. Navigate to `/farmer-dashboard` or `/dashboard`
2. Look at the "Market Prices" card in the "Community & Market" section
3. Check that prices are displayed (not the hardcoded "KSh 45/kg")
4. Wait 30 seconds and verify prices update

**Expected Result:**
- Prices should match those in the database
- Table should update every 30 seconds
- Console should show no errors

### Test 2: Verify Market Trends Page
1. Navigate to `/market-trends`
2. Check the "Market Overview" section at top
3. Verify all 5 crops show current prices from database
4. Click on each market view (Prices, Trends, Comparison, Analysis)
5. Wait 30 seconds and verify all visualizations refresh

**Expected Result:**
- All charts use real data from API
- Data updates every 30 seconds
- No "undefined" values or "Cannot read property" errors
- Last updated timestamp changes every 30 seconds

### Test 3: Monitor Network Calls
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/farmer-dashboard` or `/market-trends`
4. Watch for API calls to:
   - `/api/market/prices`
   - `/api/market/prices/history`
5. Verify responses contain valid JSON

**Expected Response Structure:**
```json
{
  "success": true,
  "prices": [
    {
      "id": 1,
      "crop": "Maize",
      "market": "Siaya Town Market",
      "price": 65,
      "unit": "kg",
      "currency": "KES",
      "trend": "stable",
      "recorded_at": "2026-03-06T10:30:00.000Z"
    }
  ],
  "timestamp": "2026-03-06T10:30:00.000Z"
}
```

### Test 4: Verify Error Handling
1. Temporarily block API calls (DevTools > Network > Offline)
2. Refresh page
3. Check that error messages appear instead of blank spaces
4. Restore network connection
5. Verify prices load once connection is restored

**Expected Result:**
- "Failed to load market data" message appears
- No JavaScript errors in console
- Page doesn't crash

### Test 5: Database Verification
Run these SQL queries to verify data is being stored:

```sql
-- Check latest prices
SELECT DISTINCT crop, market, price, trend, recorded_at 
FROM market_prices 
ORDER BY recorded_at DESC 
LIMIT 20;

-- Check price history
SELECT crop, market, price, recorded_at 
FROM market_prices 
WHERE crop = 'Maize' 
ORDER BY recorded_at DESC 
LIMIT 30;

-- Count total records
SELECT COUNT(*) as total, COUNT(DISTINCT crop) as crops FROM market_prices;
```

## Troubleshooting

### Issue: Prices not updating
**Solution:**
1. Check console for errors: `F12 > Console`
2. Verify API is running: `curl http://localhost:5000/api/market/prices`
3. Check database: `SELECT COUNT(*) FROM market_prices;`
4. Clear browser cache: `Ctrl+Shift+Delete`

### Issue: "Cannot read property of undefined"
**Solution:**
1. Verify API response format matches expected structure
2. Check that endpoints return `success: true`
3. Verify prices array is not empty
4. Reload page and check console for specific errors

### Issue: Prices stuck on old values
**Solution:**
1. Verify setInterval is running: `setInterval(loadMarketPrices, 30000);` in code
2. Check that API is returning new data
3. Verify database is being updated by admins
4. Clear browser cache and reload

## Performance Notes

- **Update Interval**: 30 seconds (balanced between responsiveness and server load)
- **Data Fetch**: Asynchronous, non-blocking
- **Error Handling**: Try-catch blocks with console logging
- **Cache**: Browser cache used for chart.js library, API responses not cached

## Verification Checklist

- [ ] Farmer Dashboard prices display correctly
- [ ] Prices update every 30 seconds
- [ ] Market Trends page shows real data
- [ ] All charts render without errors
- [ ] Network requests show successful responses
- [ ] Database contains current price data
- [ ] Error messages appear when API fails
- [ ] No console errors (F12 > Console)
- [ ] Responsive design works on mobile
- [ ] Relative URLs work (http://localhost:5000 and production)

## Next Steps

1. **Monitor Real Usage**: Watch production logs for any sync issues
2. **Adjust Update Interval**: If needed, change 30000 ms to different value
3. **Add More Markets**: Update database with additional market centers
4. **Historical Analysis**: Implement price trend predictions based on historical data
5. **Alerts**: Implement price alert notifications (already database structure exists)
