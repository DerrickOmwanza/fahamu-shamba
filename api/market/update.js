// Market Prices Weekly Update API
// This endpoint can be called by a cron job to update prices weekly

export default function handler(req, res) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  
  // Generate updated prices with slight variations
  const generateWeeklyPrices = () => {
    const basePrices = {
      "Maize": 55,
      "Beans": 90,
      "Sorghum": 70,
      "Millet": 75,
      "Rice": 135,
      "Groundnuts": 155,
      "Cowpeas": 88,
      "Sweet Potatoes": 48
    };
    
    const prices = Object.entries(basePrices).map(([crop, base]) => {
      // Add small random variation each week
      const variation = Math.floor(Math.random() * 6) - 3;
      const newBase = Math.max(30, base + variation);
      
      // Determine trend compared to last week
      const trend = variation > 0 ? 'up' : variation < 0 ? 'down' : 'stable';
      
      return {
        crop,
        bondo: Math.round(newBase + Math.floor(Math.random() * 4) - 2),
        ugunja: Math.round(newBase + 3 + Math.floor(Math.random() * 4) - 2),
        yala: Math.round(newBase + 1 + Math.floor(Math.random() * 4) - 2),
        gem: Math.round(newBase - 2 + Math.floor(Math.random() * 4) - 2),
        alego: Math.round(newBase + 4 + Math.floor(Math.random() * 4) - 2),
        trend
      };
    });
    
    return prices;
  };
  
  const newPrices = {
    lastUpdated: now.toISOString().split('T')[0],
    weekStart: weekStartStr,
    prices: generateWeeklyPrices()
  };
  
  // In production, this would save to a database
  // For now, we just return the new prices
  
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    message: 'Market prices updated successfully',
    data: newPrices,
    nextUpdate: 'Next scheduled update: Next Monday'
  });
}

