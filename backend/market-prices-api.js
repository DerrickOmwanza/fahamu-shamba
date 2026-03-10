/**
 * Market Prices API for Fahamu Shamba
 * Provides market prices in the format expected by the frontend
 */

import express from 'express';
import marketService from './market-service.js';

const router = express.Router();

// Initialize market database
let initialized = false;

function ensureInitialized(req, res, next) {
  if (!initialized) {
    marketService.initializeMarketDatabase();
    initialized = true;
  }
  next();
}

// Get market prices in frontend-compatible format
router.get('/api/market/prices', ensureInitialized, (req, res) => {
  try {
    const result = marketService.getCurrentPrices();
    
    if (!result.success || !result.prices || result.prices.length === 0) {
      return res.json({
        success: false,
        message: 'No market data available'
      });
    }

    // Group prices by crop and map to sub-counties
    const subcounties = ['bondo', 'ugunja', 'yala', 'gem', 'alego'];
    const marketToSubcounty = {
      'Bondo Market': 'bondo',
      'Ugunja Market': 'ugunja', 
      'Yala Market': 'yala',
      'Gem Market': 'gem',
      'Siaya Town Market': 'alego', // Using alego as default for Siaya Town
      'Siaya Town': 'alego' // Also handle without "Market" suffix
    };

    // Create a map to group by crop
    const cropMap = new Map();
    
    result.prices.forEach(price => {
      const crop = price.crop;
      const market = price.market;
      const subcounty = marketToSubcounty[market];
      const priceValue = price.price || 0;
      
      if (!cropMap.has(crop)) {
        cropMap.set(crop, {
          crop: crop,
          bondo: 0,
          ugunja: 0,
          yala: 0,
          gem: 0,
          alego: 0,
          trend: price.trend || 'stable'
        });
      }
      
      const cropData = cropMap.get(crop);
      if (subcounty && priceValue > 0) {
        cropData[subcounty] = priceValue;
      }
    });

    // Convert map to array and sort
    const prices = Array.from(cropMap.values()).sort((a, b) => a.crop.localeCompare(b.crop));
    
    res.json({
      success: true,
      prices: prices,
      timestamp: result.timestamp,
      message: 'Market prices loaded successfully'
    });
    
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market prices'
    });
  }
});

// Get market trends for Chart.js
router.get('/api/market-trends', ensureInitialized, (req, res) => {
  try {
    const { crop } = req.query;
    
    if (!crop) {
      return res.status(400).json({
        success: false,
        error: 'Crop parameter is required'
      });
    }

    // Get price history for the last 8 weeks
    const history = marketService.getPriceHistory(crop, 'Siaya Town Market', 56);
    
    if (!history.success || !history.history || history.history.length === 0) {
      // Return demo data if no history available
      return res.json({
        success: true,
        trends: generateDemoTrends(crop)
      });
    }

    // Group by week
    const weeklyData = {};
    history.history.forEach(record => {
      const date = new Date(record.recorded_at);
      const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week_start: weekKey,
          subcounty: 'alego', // Default subcounty
          price: record.price
        };
      }
    });

    const trends = Object.values(weeklyData).sort((a, b) => a.week_start.localeCompare(b.week_start));
    
    res.json({
      success: true,
      trends: trends
    });
    
  } catch (error) {
    console.error('Error fetching market trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market trends'
    });
  }
});

// Generate demo trends for Chart.js
function generateDemoTrends(crop) {
  const weeks = [];
  const basePrice = crop === 'Maize' ? 55 : crop === 'Beans' ? 90 : 70;
  
  for (let i = 8; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    const weekStart = date.toISOString().split('T')[0];
    
    const subcounties = ['bondo', 'ugunja', 'yala', 'gem', 'alego'];
    const trends = subcounties.map(sc => ({
      subcounty: sc,
      week_start: weekStart,
      price: basePrice + Math.floor(Math.random() * 10) - 5
    }));
    weeks.push(...trends);
  }
  return weeks;
}

export default router;