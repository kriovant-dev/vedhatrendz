#!/usr/bin/env node

import http from 'http';

console.log('🔍 Testing API endpoints...\n');

const tests = [
  { url: 'http://localhost:3001/api/health', name: 'Dev API Server (Health)' },
  { url: 'http://localhost:8080/api/health', name: 'Vite Proxy (Health)' },
];

async function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.log(`❌ ${name}`);
      console.log(`   ${url}`);
      console.log(`   → Timeout (server not responding)\n`);
      resolve(false);
    }, 2000);

    http.get(url, (res) => {
      clearTimeout(timeoutId);
      let data = '';
      
      res.on('data', chunk => data += chunk);
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${name}`);
          console.log(`   ${url}`);
          console.log(`   Status: ${res.statusCode}\n`);
          resolve(true);
        } else {
          console.log(`❌ ${name}`);
          console.log(`   ${url}`);
          console.log(`   Status: ${res.statusCode}\n`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      console.log(`❌ ${name}`);
      console.log(`   ${url}`);
      console.log(`   Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

async function runTests() {
  const results = await Promise.all(
    tests.map(test => testEndpoint(test.url, test.name))
  );

  console.log('\n📊 Summary:');
  console.log(`Dev API Server (3001): ${results[0] ? '✅ Running' : '❌ Not Running'}`);
  console.log(`Vite Proxy (8080):     ${results[1] ? '✅ Working' : '❌ Not Working'}`);

  if (!results[0]) {
    console.log('\n⚠️  Dev API server is not running!');
    console.log('   Run: npm run dev:api');
  }

  if (!results[1]) {
    console.log('\n⚠️  Vite dev server is not running!');
    console.log('   Run: npm run dev');
  }

  if (results[0] && results[1]) {
    console.log('\n✅ Both servers are running and responding!');
    console.log('✅ You can now test the checkout feature');
  } else {
    console.log('\n❌ Some servers are not responding. Please start them:');
    console.log('   Terminal 1: npm run dev:api');
    console.log('   Terminal 2: npm run dev');
    console.log('   OR: npm run dev:full');
  }

  process.exit(results[0] && results[1] ? 0 : 1);
}

runTests();
