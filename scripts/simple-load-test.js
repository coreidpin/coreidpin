// Simple Load Test for Day 20
// Run with: node scripts/simple-load-test.js

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://evcqpapvcvmljgqiuzsq.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Simple test: How many concurrent requests can we handle?
async function testEndpoint(url, count = 10) {
  console.log(`\n🔥 Testing ${count} concurrent requests to: ${url}\n`);
  
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    promises.push(
      fetch(url, {
        headers: {
          'apikey': ANON_KEY || '',
          'Content-Type': 'application/json'
        }
      })
      .then(res => ({
        success: res.ok,
        status: res.status,
        time: Date.now()
      }))
      .catch(err => ({
        success: false,
        error: err.message,
        time: Date.now()
      }))
    );
  }
  
  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;
  
  const successful = results.filter(r => r.success).length;
  const failed = count - successful;
  const successRate = (successful / count * 100).toFixed(1);
  
  console.log(`✅ Successful: ${successful}/${count} (${successRate}%)`);
  console.log(`❌ Failed: ${failed}/${count}`);
  console.log(`⏱️  Total time: ${duration}ms`);
  console.log(`⏱️  Avg time per request: ${(duration / count).toFixed(0)}ms`);
  console.log(`📊 Throughput: ${(count / (duration / 1000)).toFixed(1)} req/s`);
  
  return { successful, failed, duration, successRate };
}

async function runTests() {
  console.log('🎯 Day 20 Load Testing\n');
  console.log('Testing Supabase endpoint availability...\n');
  
  // Test 1: Small load (10 requests)
  await testEndpoint(`${SUPABASE_URL}/rest/v1/`, 10);
  await new Promise(r => setTimeout(r, 2000)); // Wait 2s
  
  // Test 2: Medium load (50 requests)
  await testEndpoint(`${SUPABASE_URL}/rest/v1/`, 50);
  await new Promise(r => setTimeout(r, 2000)); // Wait 2s
  
  // Test 3: Higher load (100 requests)
  await testEndpoint(`${SUPABASE_URL}/rest/v1/`, 100);
  
  console.log('\n✅ Load testing complete!');
  console.log('\n📊 Results Summary:');
  console.log('- If success rate > 95%: ✅ System is handling load well');
  console.log('- If success rate 90-95%: ⚠️  System is stressed but functional');
  console.log('- If success rate < 90%: ❌ System needs optimization');
}

runTests().catch(console.error);
