// Frontend Email Service for VedhaTrendz
// This service communicates with the backend email server

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    color: string;
    size: string;
  }>;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

class EmailService {
  private readonly emailServerUrl: string;

  constructor() {
    // Use environment variable for email server URL, fallback to Vercel API
    this.emailServerUrl = import.meta.env.VITE_EMAIL_SERVER_URL || 
                         (import.meta.env.PROD ? '/api' : 'http://localhost:3001');
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price); // Remove division by 100 since prices are already in rupees
  }

  private generateOrderEmailHTML(orderData: OrderEmailData): string {
    const itemsHTML = orderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <small>Color: ${item.color} | Size: ${item.size}</small>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order - ${orderData.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37, #ffd700); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .table th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .total-row { background: #f0f8ff; font-weight: bold; }
          .address { background: #f8f9fa; padding: 15px; border-left: 4px solid #d4af37; margin: 15px 0; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 12px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Order Received!</h1>
            <p>Order #${orderData.orderNumber}</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">VedhaTrendz Admin Notification</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>⚡ Action Required:</strong> A new order has been placed and requires your attention.
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #d4af37;">👤 Customer Information</h2>
              <p><strong>Name:</strong> ${orderData.customerName}</p>
              <p><strong>Email:</strong> <a href="mailto:${orderData.customerEmail}">${orderData.customerEmail}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${orderData.customerPhone}">${orderData.customerPhone}</a></p>
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #d4af37;">🛍️ Order Items</h2>
              <table class="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 16px;"><strong>Grand Total:</strong></td>
                    <td style="padding: 12px; text-align: right; font-size: 16px; color: #d4af37;"><strong>${this.formatPrice(orderData.totalAmount)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="address">
              <h3 style="margin-top: 0; color: #d4af37;">📍 Shipping Address</h3>
              <p style="margin: 0;">
                ${orderData.shippingAddress.street}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}<br>
                ${orderData.shippingAddress.country}
              </p>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #d4af37;">📋 Next Steps</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Review and confirm the order details</li>
                <li>Verify payment status (COD)</li>
                <li>Prepare items for packaging</li>
                <li>Generate shipping label and tracking number</li>
                <li>Update customer with shipping confirmation</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: bold;">VedhaTrendz Admin Panel</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">This is an automated notification. Please log in to the admin panel to manage this order.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateCustomerConfirmationHTML(orderData: OrderEmailData): string {
    const itemsHTML = orderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <small style="color: #666;">Color: ${item.color} | Size: ${item.size}</small>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37, #ffd700); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .table th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .total-row { background: #f0f8ff; font-weight: bold; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .success-message { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Thank you for your purchase, ${orderData.customerName}!</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order #${orderData.orderNumber}</p>
          </div>
          
          <div class="content">
            <div class="success-message">
              <strong>🎉 Your order has been successfully placed!</strong> We're excited to prepare your beautiful sarees for delivery.
            </div>
            
            <div class="order-details">
              <h3 style="margin-top: 0; color: #d4af37;">📦 Order Summary</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 12px; text-align: right; font-size: 16px;"><strong>Grand Total:</strong></td>
                    <td style="padding: 12px; text-align: right; font-size: 16px; color: #d4af37;"><strong>${this.formatPrice(orderData.totalAmount)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #d4af37;">📍 Delivery Address</h3>
              <p style="margin: 0;">
                ${orderData.shippingAddress.street}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}<br>
                ${orderData.shippingAddress.country}
              </p>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #d4af37;">📋 What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>We'll process your order within 1-2 business days</li>
                <li>You'll receive a shipping confirmation email with tracking details</li>
                <li>Your order will be delivered within 5-7 business days</li>
                <li>Payment will be collected upon delivery (COD)</li>
              </ul>
            </div>

            <p style="text-align: center; margin: 20px 0;">
              <strong>Questions?</strong> Contact us at <a href="mailto:support@vedhatrendz.com">support@vedhatrendz.com</a> or call us at +91-XXXXXXXXXX
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: bold;">Thank you for choosing VedhaTrendz!</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Where tradition meets elegance</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async sendEmailToBackend(emailData: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    try {
      console.log('📤 Sending email to backend:', {
        url: `${this.emailServerUrl}/send-email`,
        to: emailData.to,
        subject: emailData.subject
      });

      const response = await fetch(`${this.emailServerUrl}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      console.log('📥 Backend response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Backend error response:', error);
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendOrderNotificationToAdmin(orderData: OrderEmailData): Promise<boolean> {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@vedhatrendz.com';
      
      console.log('🔧 Admin email service config:', {
        adminEmail,
        emailServerUrl: this.emailServerUrl,
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName
      });

      const emailSent = await this.sendEmailToBackend({
        to: adminEmail,
        subject: `🛒 New Order #${orderData.orderNumber} - ${orderData.customerName} (${this.formatPrice(orderData.totalAmount)})`,
        html: this.generateOrderEmailHTML(orderData),
        text: this.generateOrderEmailText(orderData)
      });

      console.log('📧 Admin email result:', emailSent);
      return emailSent;
    } catch (error) {
      console.error('❌ Failed to send admin notification email:', error);
      return false;
    }
  }

  async sendOrderConfirmationToCustomer(orderData: OrderEmailData): Promise<boolean> {
    try {
      return await this.sendEmailToBackend({
        to: orderData.customerEmail,
        subject: `✅ Order Confirmation #${orderData.orderNumber} - Thank you for your purchase!`,
        html: this.generateCustomerConfirmationHTML(orderData),
        text: this.generateCustomerConfirmationText(orderData)
      });
    } catch (error) {
      console.error('Failed to send customer confirmation email:', error);
      return false;
    }
  }

  private generateOrderEmailText(orderData: OrderEmailData): string {
    const itemsText = orderData.items.map(item => 
      `- ${item.name} (${item.color}, ${item.size}) x${item.quantity} = ${this.formatPrice(item.price * item.quantity)}`
    ).join('\n');

    return `
🛒 NEW ORDER RECEIVED - ${orderData.orderNumber}

Customer Information:
👤 Name: ${orderData.customerName}
📧 Email: ${orderData.customerEmail}
📞 Phone: ${orderData.customerPhone}

Order Items:
${itemsText}

💰 Total Amount: ${this.formatPrice(orderData.totalAmount)}

📍 Shipping Address:
${orderData.shippingAddress.street}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}
${orderData.shippingAddress.country}

📋 Next Steps:
- Review and confirm the order details
- Verify payment status (COD)
- Prepare items for packaging
- Generate shipping label and tracking number
- Update customer with shipping confirmation

---
VedhaTrendz Admin Notification
Please log in to the admin panel to manage this order.
    `.trim();
  }

  private generateCustomerConfirmationText(orderData: OrderEmailData): string {
    const itemsText = orderData.items.map(item => 
      `- ${item.name} (${item.color}, ${item.size}) x${item.quantity} = ${this.formatPrice(item.price * item.quantity)}`
    ).join('\n');

    return `
✅ ORDER CONFIRMATION #${orderData.orderNumber}

Dear ${orderData.customerName},

🎉 Thank you for your purchase! Your order has been successfully placed.

📦 Order Summary:
${itemsText}

💰 Total: ${this.formatPrice(orderData.totalAmount)}

📍 Delivery Address:
${orderData.shippingAddress.street}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}
${orderData.shippingAddress.country}

📋 What's Next?
- We'll process your order within 1-2 business days
- You'll receive a shipping confirmation email with tracking details
- Your order will be delivered within 5-7 business days
- Payment will be collected upon delivery (COD)

Questions? Contact us at support@vedhatrendz.com

Thank you for choosing VedhaTrendz!
Where tradition meets elegance
    `.trim();
  }

  async testEmailConnection(): Promise<boolean> {
    try {
      console.log('🔗 Testing email connection to:', `${this.emailServerUrl}/health`);
      const response = await fetch(`${this.emailServerUrl}/health`);
      console.log('🔗 Email connection test result:', response.ok, response.status);
      return response.ok;
    } catch (error) {
      console.error('❌ Email service not available:', error);
      return false;
    }
  }

  async sendTestEmail(testEmail?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.emailServerUrl}/api/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Test email sent successfully:', result.message);
      return true;
    } catch (error) {
      console.error('❌ Test email failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export type { OrderEmailData };
