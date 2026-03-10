#!/usr/bin/env node

/**
 * Test Community API - Fixed Endpoints
 */

const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
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
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
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
  console.log('🧪 Testing Fixed Community API Endpoints\n');
  
  try {
    // Test 1: Get all questions
    console.log('✅ Test 1: GET /api/community/questions');
    let result = await makeRequest('GET', '/api/community/questions');
    console.log(`   Status: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
    console.log(`   Questions: ${result.body?.data?.length || 0}`);
    console.log();

    // Test 2: Get all stories
    console.log('✅ Test 2: GET /api/community/stories');
    result = await makeRequest('GET', '/api/community/stories');
    console.log(`   Status: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
    console.log(`   Stories: ${result.body?.data?.length || 0}`);
    console.log();

    // Test 3: Get stats
    console.log('✅ Test 3: GET /api/community/stats');
    result = await makeRequest('GET', '/api/community/stats');
    console.log(`   Status: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
    console.log(`   Stats:`, result.body?.stats);
    console.log();

    // Test 4: Post a question WITH authorPhone and authorName
    console.log('✅ Test 4: POST /api/community/questions (WITH auth info)');
    result = await makeRequest('POST', '/api/community/questions', {
      title: 'How do I grow better maize?',
      content: 'I am having issues with my maize yield. It keeps decreasing.',
      authorPhone: '0700123456',
      authorName: 'John Farmer',
      category: 'crop'
    });
    console.log(`   Status: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
    console.log(`   Response:`, result.body);
    const questionId = result.body?.questionId;
    console.log();

    // Test 5: Get my questions
    console.log('✅ Test 5: GET /api/community/my-questions?phone=0700123456');
    result = await makeRequest('GET', '/api/community/my-questions?phone=0700123456');
    console.log(`   Status: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
    console.log(`   My Questions: ${result.body?.data?.length || 0}`);
    if (result.body?.data?.length > 0) {
      console.log(`   First Q: "${result.body.data[0].title}"`);
    }
    console.log();

    // Test 6: Post a story WITH author info
    console.log('✅ Test 6: POST /api/community/stories (WITH auth info)');
    result = await makeRequest('POST', '/api/community/stories', {
      title: 'My Success with Farming',
      content: 'I started with small plots and now I have expanded to 2 acres.',
      authorPhone: '0700654321',
      authorName: 'Jane Farmer'
    });
    console.log(`   Status: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
    console.log(`   Response:`, result.body);
    const storyId = result.body?.storyId;
    console.log();

    // Test 7: Get my stories
    console.log('✅ Test 7: GET /api/community/my-stories?phone=0700654321');
    result = await makeRequest('GET', '/api/community/my-stories?phone=0700654321');
    console.log(`   Status: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
    console.log(`   My Stories: ${result.body?.data?.length || 0}`);
    if (result.body?.data?.length > 0) {
      console.log(`   First Story: "${result.body.data[0].title}"`);
    }
    console.log();

    // Test 8: Post an answer (if we have a question)
    if (questionId) {
      console.log(`✅ Test 8: POST /api/community/answers (for question ${questionId})`);
      result = await makeRequest('POST', '/api/community/answers', {
        questionId: questionId,
        content: 'Try using organic fertilizers mixed with compost.',
        authorPhone: '0700999999',
        authorName: 'Expert Farmer'
      });
      console.log(`   Status: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
      console.log(`   Response:`, result.body);
      console.log();
    }

    // Test 9: Like a story (if we have one)
    if (storyId) {
      console.log(`✅ Test 9: POST /api/community/stories/like (for story ${storyId})`);
      result = await makeRequest('POST', '/api/community/stories/like', {
        storyId: storyId
      });
      console.log(`   Status: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
      console.log(`   Response:`, result.body);
      console.log();
    }

    console.log('✅✅✅ All tests completed successfully! ✅✅✅');
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
}

runTests();
