import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8081';

async function testLookupUser() {
  try {
    console.log('🧪 Testing /api/lookup-user-from-receipt endpoint...');
    
    const response = await fetch(`${API_BASE}/api/lookup-user-from-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiptId: 'test_receipt_123'
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📄 Response body:', data);
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

async function testServerHealth() {
  try {
    console.log('🏥 Testing server health...');
    
    const response = await fetch(`${API_BASE}/`);
    const data = await response.text();
    
    console.log('✅ Server is running:', data);
    
  } catch (error) {
    console.error('❌ Server not accessible:', error.message);
  }
}

// Run tests
testServerHealth();
setTimeout(testLookupUser, 1000);
