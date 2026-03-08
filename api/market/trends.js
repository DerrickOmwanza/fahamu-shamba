// Market Trends API Handler
// Serves historical price trends for crops across Siaya County

export default function handler(req, res) {
  const { crop } = req.query;
  
  // Base prices for different crops
  const basePrices = {
    'Maize': 55,
    'Beans': 90,
    'Sorghum': 70,
    'Millet': 75,
    'Rice': 135,
    'Groundnuts': 155,
    'Cowpeas': 88,
    'Sweet Potatoes': 48
  };
  
  const selectedCrop = crop || 'Maize';
  const basePrice = basePrices[selectedCrop] || 55;
  
  // Generate 9 weeks of historical data
  const trends = [];
  const now = new Date();
  
  for (let i = 8; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    const weekStart = date.toISOString().split('T')[0];
    
    // Weekly variation based on season
    const seasonalVariation = Math.sin((8 - i) * 0.7) * 8;
    
    // Sub-county variations
    const subcounties = ['bondo', 'ugunja', 'yala', 'gem', 'alego'];
    const subcountyBase = { bondo: 0, ugunja: 3, yala: 1, gem: -2, alego: 4 };
    
    subcounties.forEach(sc => {
      const randomVariation = Math.floor(Math.random() * 6) - 3;
      const price = Math.round(basePrice + seasonalVariation + subcountyBase[sc] + randomVariation);
      
      trends.push({
        crop: selectedCrop,
        subcounty: sc,
        week_start: weekStart,
        price: Math.max(20, price)
      });
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    crop: selectedCrop,
    trends: trends
  });
}

