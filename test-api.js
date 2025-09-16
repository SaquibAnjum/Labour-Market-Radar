import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test stats
    const statsResponse = await fetch('http://localhost:8000/api/radar/stats');
    const stats = await statsResponse.json();
    console.log('Stats:', stats);
    
    // Test districts
    const districtsResponse = await fetch('http://localhost:8000/api/radar/districts');
    const districts = await districtsResponse.json();
    console.log('Districts:', districts);
    
    // Test top skills
    const skillsResponse = await fetch('http://localhost:8000/api/radar/top-skills');
    const skills = await skillsResponse.json();
    console.log('Top Skills:', skills.slice(0, 3));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
