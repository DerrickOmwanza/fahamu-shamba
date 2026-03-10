const http = require('http');

console.log('Testing frontend-backend integration...');

// Test 1: Check if market prices API is working
console.log('\n1. Testing market prices API...');
http.get('http://localhost:5000/api/market-prices', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.success && jsonData.data && jsonData.data.prices) {
        console.log('✅ Market prices API working correctly');
        console.log(`   - ${jsonData.data.prices.length} crops available`);
        console.log(`   - First crop: ${jsonData.data.prices[0].crop} - ${jsonData.data.prices[0].bondo} KSh/kg`);
      } else {
        console.log('❌ Market prices API returned unexpected format');
      }
    } catch (error) {
      console.log('❌ Error parsing market prices response:', error.message);
    }
  });
}).on('error', (err) => {
  console.log('❌ Error connecting to market prices API:', err.message);
});

// Test 2: Check if server is running
console.log('\n2. Testing server status...');
http.get('http://localhost:5000/api/test', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.success) {
        console.log('✅ Server is running and responding');
        console.log(`   - Status: ${jsonData.message}`);
      } else {
        console.log('❌ Server returned error');
      }
    } catch (error) {
      console.log('❌ Error parsing server status response:', error.message);
    }
  });
}).on('error', (err) => {
  console.log('❌ Error connecting to server:', err.message);
});

// Test 3: Check if frontend files are accessible
console.log('\n3. Testing frontend file access...');
http.get('http://localhost:5000/market.html', (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Market page is accessible');
    console.log(`   - Status: ${res.statusCode} OK`);
  } else {
    console.log(`❌ Market page returned status ${res.statusCode}`);
  }
}).on('error', (err) => {
  console.log('❌ Error accessing market page:', err.message);
});

console.log('\nIntegration test complete. Check results above.');