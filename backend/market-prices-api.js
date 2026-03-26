/**
 * Market Prices API for Fahamu Shamba
 * Provides live market prices plus frontend-friendly grouped data
 */

import express from 'express';
import { getLiveSiayaMarketSnapshot } from './live-market-source.js';

const router = express.Router();

router.get('/api/market/live/prices', async (req, res) => {
  try {
    const snapshot = await getLiveSiayaMarketSnapshot({
      forceRefresh: req.query.refresh === '1'
    });

    res.json(snapshot);
  } catch (error) {
    console.error('Error fetching live market prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live market prices'
    });
  }
});

// Get market prices in frontend-compatible format
router.get('/api/market/prices', async (req, res) => {
  try {
    const snapshot = await getLiveSiayaMarketSnapshot({
      forceRefresh: req.query.refresh === '1'
    });
    const grouped = new Map();

    snapshot.prices.forEach((row) => {
      if (!grouped.has(row.crop)) {
        grouped.set(row.crop, {
          crop: row.crop,
          alego: 0,
          bondo: 0,
          gem: 0,
          rarieda: 0,
          ugenya: 0,
          ugunja: 0,
          trend: row.signal === 'good' ? 'up' : row.signal === 'low' ? 'down' : 'stable'
        });
      }

      const subCounty = String(row.subCounty || '').toLowerCase();
      const bucket = grouped.get(row.crop);
      if (subCounty.includes('alego')) bucket.alego = row.retailPrice || row.wholesalePrice || 0;
      if (subCounty.includes('bondo')) bucket.bondo = row.retailPrice || row.wholesalePrice || 0;
      if (subCounty.includes('gem')) bucket.gem = row.retailPrice || row.wholesalePrice || 0;
      if (subCounty.includes('rarieda')) bucket.rarieda = row.retailPrice || row.wholesalePrice || 0;
      if (subCounty.includes('ugenya')) bucket.ugenya = row.retailPrice || row.wholesalePrice || 0;
      if (subCounty.includes('ugunja')) bucket.ugunja = row.retailPrice || row.wholesalePrice || 0;
    });

    res.json({
      success: true,
      prices: Array.from(grouped.values()),
      timestamp: snapshot.observedAt || snapshot.fetchedAt,
      message: snapshot.isFallback ? 'Showing fallback local prices' : 'Live market prices loaded successfully',
      meta: {
        provider: snapshot.provider,
        sourceUrl: snapshot.sourceUrl,
        observedAt: snapshot.observedAt,
        fetchedAt: snapshot.fetchedAt,
        isFallback: snapshot.isFallback,
        notes: snapshot.notes
      }
    });
    
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prices'
    });
  }
});

// Get market trends for Chart.js with all 6 valid Siaya sub-counties
router.get('/api/market-trends', (req, res) => {
  try {
    const { crop } = req.query;
    
    if (!crop) {
      return res.status(400).json({
        success: false,
        error: 'Crop parameter is required'
      });
    }

    // Generate demo trends for 8 weeks
    const weeks = [];
    const basePrice = crop === 'Maize' ? 55 : crop === 'Beans' ? 90 : 70;
    
    for (let i = 8; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekStart = date.toISOString().split('T')[0];
      
      // All 6 valid Siaya County sub-counties
      const subcounties = ['alego', 'bondo', 'gem', 'rarieda', 'ugenya', 'ugunja'];
      const trends = subcounties.map(sc => ({
        subcounty: sc,
        week_start: weekStart,
        price: basePrice + Math.floor(Math.random() * 10) - 5
      }));
      weeks.push(...trends);
    }

    res.json({
      success: true,
      trends: weeks
    });
    
  } catch (error) {
    console.error('Error fetching market trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market trends'
    });
  }
});

export default router;
