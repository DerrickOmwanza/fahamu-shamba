const http = require('http');

console.log('Testing API response format...');

http.get('http://localhost:5000/api/market-prices', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('API Response Format:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success && jsonData.prices) {
        console.log('\nFirst price entry:');
        console.log(JSON.stringify(jsonData.prices[0], null, 2));
        
        console.log('\nExpected format for frontend:');
        console.log('crop: string');
        console.log('bondo: number');
        console.log('ugunja: number');
        console.log('yala: number');
        console.log('gem: number');
        console.log('alego: number');
        console.log('trend: string');
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err);
});