const express = require('express');
const marketPricesApi = require('./backend/market-prices-api.js');

const app = express();
app.use('/', marketPricesApi);

app.listen(3001, () => {
  console.log('Market prices API test server running on port 3001');
  console.log('Testing /api/market/prices endpoint...');
  
  // Test the endpoint
  const http = require('http');
  
  http.get('http://localhost:3001/api/market/prices', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Response:', data);
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('Error:', err);
    process.exit(1);
  });
});