const http = require('http');

console.log('Testing Export Endpoints...');

const optionsCSV = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/export/csv/usufruct',
  method: 'GET'
};

const reqCSV = http.request(optionsCSV, res => {
  console.log(`CSV Export Status: ${res.statusCode}`);
  res.on('data', d => {
    // If it's 404 or 500, it might return a message.
  });
});

reqCSV.on('error', error => {
  console.error('CSV Export Test Error:', error.message);
});
reqCSV.end();

const optionsPDF = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/export/pdf/grm',
  method: 'GET'
};

const reqPDF = http.request(optionsPDF, res => {
  console.log(`PDF Export Status: ${res.statusCode}`);
  res.on('data', d => {
  });
});

reqPDF.on('error', error => {
  console.error('PDF Export Test Error:', error.message);
});
reqPDF.end();
