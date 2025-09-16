const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testFrontendBackendIntegration() {
  console.log('🚀 Testing Frontend-Backend Integration for Adzuna API\n');
  console.log('=' * 60);

  const tests = [];
  let passed = 0;
  let failed = 0;

  const runTest = async (testName, testFunction) => {
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFunction();
      console.log(`✅ PASSED: ${testName}\n`);
      tests.push({ name: testName, status: 'passed' });
      passed++;
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}\n`);
      tests.push({ name: testName, status: 'failed', error: error.message });
      failed++;
    }
  };

  // Test 1: Server Health Check
  await runTest('Server Health Check', async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.status !== 200) {
      throw new Error('Server not responding');
    }
  });

  // Test 2: Adzuna Search API
  await runTest('Adzuna Search API', async () => {
    const response = await axios.get(`${API_BASE_URL}/radar/adzuna/search`, {
      params: {
        what: 'software developer',
        where: 'Bangalore',
        results_per_page: 3
      }
    });
    
    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    if (!response.data.data.results || response.data.data.results.length === 0) {
      throw new Error('No jobs returned from API');
    }
  });

  // Test 3: Adzuna Categories API
  await runTest('Adzuna Categories API', async () => {
    const response = await axios.get(`${API_BASE_URL}/radar/adzuna/categories`);
    
    if (!response.data.success) {
      throw new Error('Categories API failed');
    }
    
    if (!Array.isArray(response.data.data)) {
      throw new Error('Categories data is not an array');
    }
  });

  // Test 4: Adzuna Trending Skills API
  await runTest('Adzuna Trending Skills API', async () => {
    const response = await axios.get(`${API_BASE_URL}/radar/adzuna/trending-skills`, {
      params: {
        district: 'KA01',
        time: '30'
      }
    });
    
    if (!response.data.success) {
      throw new Error('Trending skills API failed');
    }
    
    if (!Array.isArray(response.data.data)) {
      throw new Error('Trending skills data is not an array');
    }
  });

  // Test 5: Adzuna Stats API
  await runTest('Adzuna Stats API', async () => {
    const response = await axios.get(`${API_BASE_URL}/radar/adzuna/stats`, {
      params: {
        district: 'KA01',
        time: '30'
      }
    });
    
    if (!response.data.success) {
      throw new Error('Stats API failed');
    }
    
    if (typeof response.data.data.totalJobs !== 'number') {
      throw new Error('Invalid stats data structure');
    }
  });

  // Test 6: Adzuna Fetch and Save API
  await runTest('Adzuna Fetch and Save API', async () => {
    const response = await axios.post(`${API_BASE_URL}/radar/adzuna/fetch`, {
      searchTerm: 'javascript developer',
      location: 'Mumbai',
      maxPages: 1
    });
    
    if (!response.data.success) {
      throw new Error('Fetch and save API failed');
    }
    
    if (typeof response.data.data.jobsSaved !== 'number') {
      throw new Error('Invalid response data structure');
    }
  });

  // Test 7: CORS Headers
  await runTest('CORS Headers', async () => {
    const response = await axios.options(`${API_BASE_URL}/radar/adzuna/search`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    if (!response.headers['access-control-allow-origin']) {
      throw new Error('CORS headers not properly set');
    }
  });

  // Print Results
  console.log('=' * 60);
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    tests.filter(t => t.status === 'failed').forEach(test => {
      console.log(`   • ${test.name}: ${test.error}`);
    });
  }

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Frontend-Backend integration is working correctly.');
    console.log('\n📋 Integration Summary:');
    console.log('   ✅ Server is running and accessible');
    console.log('   ✅ Adzuna API endpoints are working');
    console.log('   ✅ CORS is properly configured');
    console.log('   ✅ Data formats are correct');
    console.log('\n🚀 The frontend can now successfully communicate with the backend!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Run the tests
testFrontendBackendIntegration().catch(console.error);
