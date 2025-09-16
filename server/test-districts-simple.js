const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/radar/districts',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const districts = JSON.parse(data);
      console.log('Total districts:', districts.length);
      console.log('First 3 districts:');
      districts.slice(0, 3).forEach((district, index) => {
        console.log(`${index + 1}. ${district.districtName} (${district.districtCode}) - ${district.stateName}`);
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.log('Raw response:', data.substring(0, 200));
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
