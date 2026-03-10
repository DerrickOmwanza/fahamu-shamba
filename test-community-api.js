#!/usr/bin/env node

/**
 * Test Community API Endpoints
 */

const http = require('http');

const baseUrl = 'http://localhost:3000';

async function testAPI(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Community API Endpoints\n');
  
  try {
    // Test 1: Get all questions
    console.log('1️⃣ Testing GET /api/community/questions');
    let result = await testAPI('GET', '/api/community/questions');
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2).substring(0, 200));
    console.log();

    // Test 2: Get all stories
    console.log('2️⃣ Testing GET /api/community/stories');
    result = await testAPI('GET', '/api/community/stories');
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2).substring(0, 200));
    console.log();

    // Test 3: Get stats
    console.log('3️⃣ Testing GET /api/community/stats');
    result = await testAPI('GET', '/api/community/stats');
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2).substring(0, 200));
    console.log();

    // Test 4: Post a question
    console.log('4️⃣ Testing POST /api/community/questions');
    result = await testAPI('POST', '/api/community/questions', {
      title: 'Test Question',
      content: 'This is a test question',
      authorPhone: '0700123456',
      authorName: 'Test Farmer',
      category: 'pest-control'
    });
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2));
    console.log();

    // Test 5: Get my questions
    console.log('5️⃣ Testing GET /api/community/my-questions?phone=0700123456');
    result = await testAPI('GET', '/api/community/my-questions?phone=0700123456');
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2).substring(0, 200));
    console.log();

    // Test 6: Post a story
    console.log('6️⃣ Testing POST /api/community/stories');
    result = await testAPI('POST', '/api/community/stories', {
      title: 'Test Story',
      content: 'This is a test success story',
      authorPhone: '0700123456',
      authorName: 'Test Farmer'
    });
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2));
    console.log();

    // Test 7: Get my stories
    console.log('7️⃣ Testing GET /api/community/my-stories?phone=0700123456');
    result = await testAPI('GET', '/api/community/my-stories?phone=0700123456');
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2).substring(0, 200));
    console.log();

    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
}

runTests();
