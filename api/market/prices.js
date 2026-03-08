// Market Prices API Handler
// Serves weekly crop prices for Siaya County sub-counties

export default function handler(req, res) {
  // Get current week info
  const now = new Date();
  const lastUpdated = now.toISOString().split('T')[0];
  
  // Weekly prices data for Siaya County
  // These would be updated weekly via cron job or database
  const weeklyPrices = {
    lastUpdated: lastUpdated,
    prices: [
      {
        crop: "Maize",
        bondo: 52,
        ugunja: 55,
        yala: 53,
        gem: 51,
        alego: 56,
        trend: "up"
      },
      {
        crop: "Beans",
        bondo: 92,
        ugunja: 95,
        yala: 93,
        gem: 90,
        alego: 96,
        trend: "stable"
      },
      {
        crop: "Sorghum",
        bondo: 68,
        ugunja: 72,
        yala: 70,
        gem: 67,
        alego: 73,
        trend: "up"
      },
      {
        crop: "Millet",
        bondo: 75,
        ugunja: 78,
        yala: 76,
        gem: 73,
        alego: 79,
        trend: "down"
      },
      {
        crop: "Rice",
        bondo: 135,
        ugunja: 140,
        yala: 138,
        gem: 132,
        alego: 142,
        trend: "up"
      },
      {
        crop: "Groundnuts",
        bondo: 155,
        ugunja: 160,
        yala: 157,
        gem: 152,
        alego: 162,
        trend: "stable"
      },
      {
        crop: "Cowpeas",
        bondo: 88,
        ugunja: 92,
        yala: 90,
        gem: 86,
        alego: 93,
        trend: "up"
      },
      {
        crop: "Sweet Potatoes",
        bondo: 48,
        ugunja: 52,
        yala: 50,
        gem: 47,
        alego: 53,
        trend: "down"
      }
    ]
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    ...weeklyPrices
  });
}

