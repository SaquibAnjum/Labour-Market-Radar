import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: 'test.env' });

async function testAdzunaAPI() {
  console.log('🧪 Testing Adzuna API Connection...\n');
  
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  const country = process.env.ADZUNA_COUNTRY || 'in';
  const baseUrl = process.env.ADZUNA_BASE_URL || 'https://api.adzuna.com/v1/api/jobs';
  
  console.log('Configuration:');
  console.log(`  App ID: ${appId}`);
  console.log(`  App Key: ${appKey ? appKey.substring(0, 8) + '...' : 'NOT SET'}`);
  console.log(`  Country: ${country}`);
  console.log(`  Base URL: ${baseUrl}\n`);
  
  if (!appId || !appKey) {
    console.error('❌ Missing API credentials!');
    process.exit(1);
  }
  
  // Test 1: Simple search without location
  console.log('Test 1: Simple search (software developer)');
  try {
    const url1 = `${baseUrl}/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=5&what=software+developer`;
    console.log(`URL: ${url1}`);
    
    const response1 = await fetch(url1);
    console.log(`Status: ${response1.status} ${response1.statusText}`);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`✅ Success! Found ${data1.results?.length || 0} jobs`);
      if (data1.results && data1.results.length > 0) {
        console.log(`Sample job: ${data1.results[0].title} at ${data1.results[0].company?.display_name}`);
      }
    } else {
      const errorText1 = await response1.text();
      console.log(`❌ Error: ${errorText1}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Search with location
  console.log('Test 2: Search with location (software developer in Bangalore)');
  try {
    const url2 = `${baseUrl}/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=5&what=software+developer&where=Bangalore`;
    console.log(`URL: ${url2}`);
    
    const response2 = await fetch(url2);
    console.log(`Status: ${response2.status} ${response2.statusText}`);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`✅ Success! Found ${data2.results?.length || 0} jobs`);
      if (data2.results && data2.results.length > 0) {
        console.log(`Sample job: ${data2.results[0].title} at ${data2.results[0].company?.display_name}`);
      }
    } else {
      const errorText2 = await response2.text();
      console.log(`❌ Error: ${errorText2}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Search with different parameters
  console.log('Test 3: Search with different parameters (javascript developer)');
  try {
    const url3 = `${baseUrl}/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=3&what=javascript+developer&where=Mumbai&full_time=1`;
    console.log(`URL: ${url3}`);
    
    const response3 = await fetch(url3);
    console.log(`Status: ${response3.status} ${response3.statusText}`);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log(`✅ Success! Found ${data3.results?.length || 0} jobs`);
      if (data3.results && data3.results.length > 0) {
        console.log(`Sample job: ${data3.results[0].title} at ${data3.results[0].company?.display_name}`);
      }
    } else {
      const errorText3 = await response3.text();
      console.log(`❌ Error: ${errorText3}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n🎉 API testing completed!');
}

testAdzunaAPI().catch(console.error);
