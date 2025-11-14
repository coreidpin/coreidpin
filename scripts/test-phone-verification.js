#!/usr/bin/env node

// Test script for phone verification functionality
// Run: node scripts/test-phone-verification.js

const BASE_URL = 'https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/server';

async function testPhoneVerification() {
  console.log('🧪 Testing Phone Verification API...\n');

  // Mock access token (replace with real token for testing)
  const accessToken = 'your-test-token-here';
  const testPhone = '+2348012345678';

  try {
    // Test 1: Send OTP
    console.log('📱 Step 1: Sending OTP to', testPhone);
    const sendResponse = await fetch(`${BASE_URL}/pin/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ phone: testPhone })
    });

    const sendResult = await sendResponse.json();
    console.log('Send OTP Result:', sendResult);

    if (sendResult.success) {
      console.log('✅ OTP sent successfully!\n');
      
      // Test 2: Verify OTP (using mock OTP from console)
      console.log('🔐 Step 2: Verifying OTP (check server console for OTP)');
      const mockOTP = '123456'; // Replace with actual OTP from server logs
      
      const verifyResponse = await fetch(`${BASE_URL}/pin/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ phone: testPhone, otp: mockOTP })
      });

      const verifyResult = await verifyResponse.json();
      console.log('Verify OTP Result:', verifyResult);

      if (verifyResult.success) {
        console.log('✅ Phone verification completed!\n');
      } else {
        console.log('❌ Phone verification failed:', verifyResult.error);
      }
    } else {
      console.log('❌ Failed to send OTP:', sendResult.error);
    }

    // Test 3: Check PIN status
    console.log('📊 Step 3: Checking PIN status');
    const statusResponse = await fetch(`${BASE_URL}/pin/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const statusResult = await statusResponse.json();
    console.log('PIN Status Result:', statusResult);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPhoneVerification();