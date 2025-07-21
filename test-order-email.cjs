// Test email integration by simulating an order
const fetch = require('node-fetch');

async function testOrderEmail() {
  console.log('🧪 Testing order email integration...');
  
  const testOrderData = {
    orderNumber: 'VT123456',
    customerName: 'Test Customer',
    customerEmail: 'chanakyadevendrachukka@gmail.com',
    customerPhone: '+91-9876543210',
    items: [
      {
        name: 'Beautiful Silk Saree',
        price: 2500,
        quantity: 1,
        color: 'Red',
        size: 'Free Size'
      }
    ],
    totalAmount: 2950, // Including tax and shipping
    shippingAddress: {
      street: '123 Test Street',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      country: 'India'
    }
  };

  try {
    // Test admin notification
    console.log('📧 Testing admin notification email...');
    const adminResponse = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'chanakyadevendrachukka@gmail.com',
        subject: `🛒 TEST - New Order #${testOrderData.orderNumber}`,
        html: `
          <h2>🧪 Test Order Notification</h2>
          <p><strong>Order Number:</strong> ${testOrderData.orderNumber}</p>
          <p><strong>Customer:</strong> ${testOrderData.customerName}</p>
          <p><strong>Email:</strong> ${testOrderData.customerEmail}</p>
          <p><strong>Total:</strong> ₹${testOrderData.totalAmount}</p>
          <p>This is a test email to verify the order notification system is working.</p>
        `,
        text: `Test Order Notification - Order #${testOrderData.orderNumber} from ${testOrderData.customerName}`
      })
    });

    if (adminResponse.ok) {
      const result = await adminResponse.json();
      console.log('✅ Admin notification test successful:', result.messageId);
    } else {
      const error = await adminResponse.json();
      console.log('❌ Admin notification test failed:', error.error);
    }

    // Test customer confirmation
    console.log('📧 Testing customer confirmation email...');
    const customerResponse = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: testOrderData.customerEmail,
        subject: `✅ TEST - Order Confirmation #${testOrderData.orderNumber}`,
        html: `
          <h2>✅ Test Order Confirmation</h2>
          <p>Dear ${testOrderData.customerName},</p>
          <p>This is a test confirmation for order #${testOrderData.orderNumber}</p>
          <p><strong>Total:</strong> ₹${testOrderData.totalAmount}</p>
          <p>Your order has been received and will be processed soon.</p>
          <p><em>This is a test email.</em></p>
        `,
        text: `Test Order Confirmation - Order #${testOrderData.orderNumber} for ₹${testOrderData.totalAmount}`
      })
    });

    if (customerResponse.ok) {
      const result = await customerResponse.json();
      console.log('✅ Customer confirmation test successful:', result.messageId);
    } else {
      const error = await customerResponse.json();
      console.log('❌ Customer confirmation test failed:', error.error);
    }

    console.log('\n🎉 Email integration test completed!');
    console.log('📬 Check your inbox for the test emails.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testOrderEmail();
