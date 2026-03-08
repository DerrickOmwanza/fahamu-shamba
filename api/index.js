// Vercel API Handler for Fahamu Shamba
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const app = express();
const publicDir = join(process.cwd(), 'public');

// CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Helper to serve HTML files
function serveHTML(res, filename) {
  const filePath = join(publicDir, filename);
  if (existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html');
    res.send(readFileSync(filePath));
    return true;
  }
  return false;
}

// ===== ROUTES =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Fahamu Shamba API'
  });
});

// API test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Fahamu Shamba API is working!',
    version: '1.0.0'
  });
});

// Crop prediction endpoint
app.post('/api/predict', (req, res) => {
  const { subCounty, soilType, season, language = 'english' } = req.body;
  
  // Simple prediction logic for demo
  const cropRules = {
    'bondo-sandy-long_rains': { crop: 'Beans', confidence: 85 },
    'bondo-clay-short_rains': { crop: 'Maize', confidence: 80 },
    'bondo-loam-long_rains': { crop: 'Sorghum', confidence: 90 },
    'ugunja-sandy-long_rains': { crop: 'Cowpeas', confidence: 85 },
    'ugunja-loam-short_rains': { crop: 'Tomatoes', confidence: 88 },
    'yala-loam-long_rains': { crop: 'Rice', confidence: 95 },
    'yala-clay-short_rains': { crop: 'Sweet Potatoes', confidence: 88 },
    'gem-loam-long_rains': { crop: 'Soybeans', confidence: 82 },
    'gem-sandy-short_rains': { crop: 'Green Grams', confidence: 78 },
    'alego-sandy-short_rains': { crop: 'Green Grams', confidence: 78 },
    'alego-loam-short_rains': { crop: 'Beans', confidence: 90 }
  };

  const key = `${subCounty}-${soilType}-${season}`.toLowerCase();
  const result = cropRules[key] || { crop: 'Maize', confidence: 75 };

  res.json({
    success: true,
    crop: result.crop,
    confidence: result.confidence,
    reason: `Based on ${soilType} soil in ${subCounty} during ${season}`,
    message: 'Prediction successful'
  });
});

// Weather endpoint
app.get('/api/weather/:subcounty', (req, res) => {
  const subcounty = req.params.subcounty.toLowerCase();
  res.json({
    success: true,
    data: {
      location: subcounty,
      temperature: 25 + Math.floor(Math.random() * 10),
      humidity: 60 + Math.floor(Math.random() * 20),
      condition: 'Partly Cloudy',
      forecast: 'Rain expected in 3 days'
    }
  });
});

// Market prices
app.get('/api/market/prices', (req, res) => {
  res.json({
    success: true,
    prices: [
      { crop: 'Maize', price: 65, trend: 'up' },
      { crop: 'Beans', price: 85, trend: 'stable' },
      { crop: 'Rice', price: 120, trend: 'up' },
      { crop: 'Sorghum', price: 95, trend: 'down' }
    ]
  });
});

// Market trends - Real-time Siaya County prices
app.get('/api/market-trends', (req, res) => {
  // Get current week number for auto-update simulation
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  
  // Base prices for Siaya County crops (KSh per kg)
  const basePrices = {
    'Maize': 55,
    'Beans': 90,
    'Rice': 130,
    'Sorghum': 75,
    'Millet': 80,
    'Groundnuts': 150,
    'Cowpeas': 85,
    'Sweet Potatoes': 45,
    'Cassava': 35,
    'Green Grams': 95
  };
  
  // Price variation based on week (simulates seasonal changes)
  const getWeeklyVariation = (weekNum, basePrice) => {
    const variation = Math.sin(weekNum * 0.5) * 8; // Seasonal wave
    return Math.round(basePrice + variation);
  };
  
  // Markets in Siaya County
  const markets = {
    'siaya-town': { name: 'Siaya Town', location: 'Alego Usonga', coords: { lat: 0.0614, lng: 34.2882 } },
    'bondo': { name: 'Bondo', location: 'Bondo', coords: { lat: 0.2436, lng: 34.2703 } },
    'yala': { name: 'Yala', location: 'Gem', coords: { lat: 0.0921, lng: 34.5621 } },
    'ugunja': { name: 'Ugunja', location: 'Ugunja', coords: { lat: 0.1442, lng: 34.3215 } },
    'rumuruti': { name: 'Rumuruti', location: 'Laikipia', coords: { lat: 0.2925, lng: 36.9561 } },
    'nakuru': { name: 'Nakuru', location: 'Nakuru', coords: { lat: -0.3031, lng: 36.0800 } }
  };
  
  // Generate market data
  const marketData = {};
  
  for (const [marketId, market] of Object.entries(markets)) {
    const crops = [];
    
    for (const [crop, basePrice] of Object.entries(basePrices)) {
      const currentPrice = getWeeklyVariation(weekNumber, basePrice);
      // Add small random variation per market
      const marketVariation = Math.floor(Math.random() * 6) - 3;
      const finalPrice = Math.max(20, currentPrice + marketVariation);
      
      // Calculate trend (compare with previous week)
      const prevWeekPrice = getWeeklyVariation(weekNumber - 1, basePrice) + marketVariation;
      const trend = finalPrice > prevWeekPrice ? 'up' : finalPrice < prevWeekPrice ? 'down' : 'stable';
      
      crops.push({
        crop: crop,
        price: finalPrice,
        unit: 'kg',
        currency: 'KES',
        trend: trend,
        previousPrice: prevWeekPrice,
        change: finalPrice - prevWeekPrice
      });
    }
    
    marketData[marketId] = {
      name: market.name,
      location: market.location,
      coords: market.coords,
      crops: crops,
      lastUpdated: now.toISOString(),
      updateFrequency: 'weekly'
    };
  }
  
  res.json({
    success: true,
    data: marketData,
    meta: {
      county: 'Siaya',
      country: 'Kenya',
      weekNumber: weekNumber,
      year: now.getFullYear(),
      lastUpdated: now.toISOString(),
      updateSchedule: 'Weekly (every Monday)'
    }
  });
});

// Stats
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalPredictions: 1250,
      totalFarmers: 890,
      totalFeedback: 456,
      topCrop: 'Maize',
      topSubCounty: 'Bondo'
    }
  });
});

// Community stats
app.get('/api/community/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalQuestions: 45,
      totalAnswers: 120,
      approvedStories: 18
    }
  });
});

// ===== FRONTEND PAGES =====

// Root - landing page
app.get('/', (req, res) => {
  serveHTML(res, 'index.html') || res.status(404).json({ error: 'Not found' });
});

// Login page
app.get('/login', (req, res) => {
  serveHTML(res, 'index.html') || res.status(404).json({ error: 'Not found' });
});

// Dashboard
app.get('/dashboard', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fahamu Shamba - Farmer Dashboard</title>
    <link rel="icon" href="/fahamu-logo.png" type="image/png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Roboto', 'Segoe UI', sans-serif; background: #f9f7f4; display: flex; flex-direction: column; min-height: 100vh; }
        header { background: linear-gradient(135deg, #1e5631 0%, #2d7649 100%); color: white; padding: 18px 30px; display: flex; justify-content: space-between; position: sticky; top: 0; z-index: 1000; }
        .wrapper { display: flex; flex: 1; }
        aside { width: 280px; background: linear-gradient(180deg, #1e5631 0%, #2d7649 100%); color: white; padding: 25px 0; position: fixed; left: 0; top: 70px; height: calc(100vh - 70px); overflow-y: auto; z-index: 999; }
        aside ul { list-style: none; padding: 0; margin: 0; }
        aside a { display: flex; align-items: center; gap: 15px; padding: 15px 25px; color: rgba(255, 255, 255, 0.85); text-decoration: none; }
        aside a:hover { background: rgba(255, 255, 255, 0.1); padding-left: 35px; }
        aside a.active { background: rgba(255, 255, 255, 0.15); border-left: 4px solid #f57c00; padding-left: 21px; }
        main { margin-left: 280px; padding: 30px; flex: 1; }
        .card { background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .welcome { font-size: 1.8em; font-weight: 700; color: #1e5631; margin-bottom: 15px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .stat { background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2.5em; font-weight: 700; color: #2d7649; }
        @media (max-width: 768px) { aside { width: 70px; } aside span { display: none; } main { margin-left: 70px; } .stats { grid-template-columns: repeat(2, 1fr); } }
    </style>
</head>
<body>
    <header>
        <div><img src="/fahamu-logo.png" style="height: 40px;"> <span style="color: white; font-weight: bold; margin-left: 10px;">Fahamu Shamba</span></div>
        <div onclick="logout()" style="cursor: pointer; color: white;"><i class="fas fa-sign-out-alt"></i> Logout</div>
    </header>
    <div class="wrapper">
        <aside>
            <ul>
                <li><a href="/dashboard" class="active"><i class="fas fa-home" style="width: 25px;"></i> <span>Dashboard</span></a></li>
                <li><a href="/recommendations"><i class="fas fa-leaf" style="width: 25px;"></i> <span>Recommendations</span></a></li>
                <li><a href="/market"><i class="fas fa-chart-bar" style="width: 25px;"></i> <span>Market Prices</span></a></li>
                <li><a href="/community"><i class="fas fa-users" style="width: 25px;"></i> <span>Community</span></a></li>
                <li><a href="/feedback"><i class="fas fa-star" style="width: 25px;"></i> <span>Feedback</span></a></li>
                <li><a href="/profile"><i class="fas fa-user-circle" style="width: 25px;"></i> <span>My Profile</span></a></li>
            </ul>
            <div style="padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.1);">
                <a href="javascript:logout()" style="color: #ff6b6b; text-decoration: none; display: flex; gap: 10px;"><i class="fas fa-sign-out-alt" style="width: 25px;"></i> <span>Logout</span></a>
            </div>
        </aside>
        <main>
            <div class="welcome">🌅 Welcome to Fahamu Shamba Dashboard</div>
            <div class="stats">
                <div class="stat"><div class="stat-value">3</div><div>Active Crops</div></div>
                <div class="stat"><div class="stat-value">26°C</div><div>Weather</div></div>
                <div class="stat"><div class="stat-value">KSh 12,500</div><div>Market Value</div></div>
                <div class="stat"><div class="stat-value">156</div><div>Community</div></div>
            </div>
            <div class="card">
                <h2>Farmer Dashboard with Sidebar Menu</h2>
                <p>Welcome to your personalized Fahamu Shamba farming dashboard with a professional left sidebar menu.</p>
                <p style="margin-top: 15px; color: #7f8c8d;">Use the left sidebar to navigate between Dashboard, Recommendations, Market Prices, Community, Feedback, and your Profile.</p>
            </div>
        </main>
    </div>
    <script>
        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

app.get('/farmer-dashboard', (req, res) => {
  serveHTML(res, 'farmer-dashboard.html') || res.status(404).json({ error: 'Not found' });
});

// Other pages
app.get('/landing-page', (req, res) => serveHTML(res, 'landing-page.html') || res.status(404).json({ error: 'Not found' }));
app.get('/landing-page-optimized', (req, res) => serveHTML(res, 'landing-page-optimized.html') || res.status(404).json({ error: 'Not found' }));
app.get('/crop-prediction', (req, res) => serveHTML(res, 'crop-prediction.html') || res.status(404).json({ error: 'Not found' }));
app.get('/crop-details', (req, res) => serveHTML(res, 'crop-details.html') || res.status(404).json({ error: 'Not found' }));
app.get('/market-trends', (req, res) => serveHTML(res, 'market-trends.html') || res.status(404).json({ error: 'Not found' }));
app.get('/recommendations', (req, res) => serveHTML(res, 'recommendations.html') || res.status(404).json({ error: 'Not found' }));
app.get('/feedback', (req, res) => serveHTML(res, 'feedback.html') || res.status(404).json({ error: 'Not found' }));
app.get('/community', (req, res) => serveHTML(res, 'community.html') || res.status(404).json({ error: 'Not found' }));
app.get('/community-market', (req, res) => serveHTML(res, 'community-market.html') || res.status(404).json({ error: 'Not found' }));
app.get('/farmer-profile', (req, res) => serveHTML(res, 'farmer-profile.html') || res.status(404).json({ error: 'Not found' }));
app.get('/settings', (req, res) => serveHTML(res, 'settings.html') || res.status(404).json({ error: 'Not found' }));
app.get('/admin', (req, res) => serveHTML(res, 'admin-dashboard.html') || res.status(404).json({ error: 'Not found' }));
app.get('/ussd-simulator', (req, res) => serveHTML(res, 'ussd-simulator.html') || res.status(404).json({ error: 'Not found' }));
app.get('/api-tester', (req, res) => serveHTML(res, 'api-tester.html') || res.status(404).json({ error: 'Not found' }));

// Catch-all for other routes
app.get('*', (req, res) => {
  // Try to serve as HTML file
  const path = req.path.substring(1); // remove leading /
  if (path.endsWith('.html') || path === '') {
    if (serveHTML(res, path)) return;
  }
  // Default to landing page
  serveHTML(res, 'landing-page.html') || res.status(404).json({ error: 'Not found' });
});

export default app;

