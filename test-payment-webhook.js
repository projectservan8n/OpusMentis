// Test script to trigger payment proof webhook
// This simulates a payment submission to test Discord webhook

const fs = require('fs');
const path = require('path');

async function testPaymentWebhook() {
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');

    // Create FormData
    const FormData = require('form-data');
    const formData = new FormData();

    formData.append('file', testImageBuffer, {
      filename: 'test-gcash-receipt.png',
      contentType: 'image/png'
    });
    formData.append('planRequested', 'premium');
    formData.append('amount', '399');
    formData.append('referenceNumber', 'TEST-REF-' + Date.now());

    console.log('📤 Sending test payment proof...');
    console.log('Plan: PREMIUM');
    console.log('Amount: ₱399');
    console.log('Reference: TEST-REF-' + Date.now());
    console.log('');

    const response = await fetch('http://localhost:3000/api/payment-proofs', {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        // You need to add your Clerk auth token here
        // Get it from browser DevTools -> Application -> Cookies -> __session
        'Cookie': 'YOUR_SESSION_COOKIE_HERE'
      },
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log('Payment Proof ID:', result.paymentProofId);
      console.log('');
      console.log('🔔 Check your Discord for the webhook notification!');
      console.log('You should see:');
      console.log('  - User info');
      console.log('  - Plan: PREMIUM');
      console.log('  - Amount: ₱399 (not ₱₱399)');
      console.log('  - Receipt image embedded');
    } else {
      console.error('❌ Error:', result.error);

      if (response.status === 401) {
        console.log('');
        console.log('⚠️  You need to add your session cookie!');
        console.log('1. Open http://localhost:3000 in browser');
        console.log('2. Login with Clerk');
        console.log('3. Open DevTools -> Application -> Cookies');
        console.log('4. Copy the __session cookie value');
        console.log('5. Replace YOUR_SESSION_COOKIE_HERE in this script');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPaymentWebhook();
