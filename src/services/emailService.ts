// Frontend Email Service for VedhaTrendz
// This service communicates with the backend email server

import { getDeliveryText } from '@/utils/deliveryUtils';

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
    deliveryDaysMin?: number | null;
    deliveryDaysMax?: number | null;
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

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

class EmailService {
  private readonly emailServerUrl: string;

  constructor() {
    // Use current domain for production, fallback to localhost for development
    if (import.meta.env.PROD) {
      this.emailServerUrl = window.location.origin;
    } else {
      this.emailServerUrl = import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:3001';
    }
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price / 100);
  }

  private generateOrderEmailHTML(orderData: OrderEmailData): string {
    const itemsHTML = orderData.items.map(item => {
      const deliveryInfo = item.deliveryDaysMin ? 
        `<br><small style="color: #28a745;"><strong>📦 ${getDeliveryText(item.deliveryDaysMin, item.deliveryDaysMax, 'short')}</strong></small>` : 
        '';
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong><br>
            <small>Color: ${item.color} | Size: ${item.size}</small>
            ${deliveryInfo}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.price)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.price * item.quantity)}</td>
        </tr>
      `;
    }).join('');

    // Calculate expected delivery date for the order
    const maxDeliveryDays = Math.max(
      ...orderData.items
        .filter(item => item.deliveryDaysMax)
        .map(item => item.deliveryDaysMax || 0)
    );
    
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + maxDeliveryDays);
    const formattedDeliveryDate = maxDeliveryDays > 0 
      ? expectedDeliveryDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;

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
              ${formattedDeliveryDate ? `<br><strong>📅 Expected Delivery Date: ${formattedDeliveryDate}</strong>` : ''}
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
    const itemsHTML = orderData.items.map(item => {
      const deliveryInfo = item.deliveryDaysMin ? 
        `<br><small style="color: #28a745;"><strong>📦 ${getDeliveryText(item.deliveryDaysMin, item.deliveryDaysMax)}</strong></small>` : 
        '';
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong><br>
            <small style="color: #666;">Color: ${item.color} | Size: ${item.size}</small>
            ${deliveryInfo}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.price * item.quantity)}</td>
        </tr>
      `;
    }).join('');

    // Calculate expected delivery dates for the order
    const maxDeliveryDays = Math.max(
      ...orderData.items
        .filter(item => item.deliveryDaysMax)
        .map(item => item.deliveryDaysMax || 0)
    );
    
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + maxDeliveryDays);
    const formattedDeliveryDate = maxDeliveryDays > 0 
      ? expectedDeliveryDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;

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
              ${formattedDeliveryDate ? `<br><br><strong>📅 Expected Delivery Date: ${formattedDeliveryDate}</strong>` : ''}
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
                <li>Your items will be delivered as per the timelines shown above</li>
                <li>Payment will be collected upon delivery (COD)</li>
              </ul>
            </div>

            <p style="text-align: center; margin: 20px 0;">
              <strong>Questions?</strong> Contact us at <a href="mailto:vedhatrendz@gmail.com">vedhatrendz@gmail.com</a> or call us at +91-7702284509
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
      const response = await fetch(`${this.emailServerUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      // Check if response is ok
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        
        // Try to get error details from response
        try {
          const errorText = await response.text();
          console.error('❌ Raw error response:', errorText);
          
          // Try to parse as JSON
          let errorData;
          try {
            errorData = JSON.parse(errorText);
            console.error('❌ Error details:', errorData);
          } catch (parseError) {
            console.error('❌ Response is not JSON:', errorText);
            errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
          }
          
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        } catch (responseError) {
          console.error('❌ Failed to read error response:', responseError);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Try to parse JSON response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format from email service');
      }

      if (result.success) {
        console.log('📧 Email sent successfully:', result.messageId);
        return true;
      } else {
        throw new Error(result.error || 'Email sending failed');
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendOrderNotificationToAdmin(orderData: OrderEmailData): Promise<boolean> {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'vedhatrendz@gmail.com';
      
      return await this.sendEmailToBackend({
        to: adminEmail,
        subject: `🛒 New Order #${orderData.orderNumber} - ${orderData.customerName} (₹${this.formatPrice(orderData.totalAmount).replace('₹', '')})`,
        html: this.generateOrderEmailHTML(orderData),
        text: this.generateOrderEmailText(orderData)
      });
    } catch (error) {
      console.error('Failed to send admin notification email:', error);
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
    const itemsText = orderData.items.map(item => {
      const deliveryInfo = item.deliveryDaysMin ? ` (📦 ${getDeliveryText(item.deliveryDaysMin, item.deliveryDaysMax, 'short')})` : '';
      return `- ${item.name} (${item.color}, ${item.size}) x${item.quantity} = ${this.formatPrice(item.price * item.quantity)}${deliveryInfo}`;
    }).join('\n');

    // Calculate expected delivery date
    const maxDeliveryDays = Math.max(
      ...orderData.items
        .filter(item => item.deliveryDaysMax)
        .map(item => item.deliveryDaysMax || 0)
    );
    
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + maxDeliveryDays);
    const formattedDeliveryDate = maxDeliveryDays > 0 
      ? expectedDeliveryDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;

    return `
🛒 NEW ORDER RECEIVED - ${orderData.orderNumber}

${formattedDeliveryDate ? `📅 Expected Delivery Date: ${formattedDeliveryDate}\n` : ''}Customer Information:
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
    const itemsText = orderData.items.map(item => {
      const deliveryInfo = item.deliveryDaysMin ? ` (📦 ${getDeliveryText(item.deliveryDaysMin, item.deliveryDaysMax)})` : '';
      return `- ${item.name} (${item.color}, ${item.size}) x${item.quantity} = ${this.formatPrice(item.price * item.quantity)}${deliveryInfo}`;
    }).join('\n');

    // Calculate expected delivery date
    const maxDeliveryDays = Math.max(
      ...orderData.items
        .filter(item => item.deliveryDaysMax)
        .map(item => item.deliveryDaysMax || 0)
    );
    
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + maxDeliveryDays);
    const formattedDeliveryDate = maxDeliveryDays > 0 
      ? expectedDeliveryDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;

    return `
✅ ORDER CONFIRMATION #${orderData.orderNumber}

Dear ${orderData.customerName},

🎉 Thank you for your purchase! Your order has been successfully placed.

${formattedDeliveryDate ? `📅 Expected Delivery Date: ${formattedDeliveryDate}\n` : ''}

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
- Your items will be delivered as per the timelines shown above
- Payment will be collected upon delivery (COD)

Questions? Contact us at vedhatrendz@gmail.com

Thank you for choosing VedhaTrendz!
Where tradition meets elegance
    `.trim();
  }

  async testEmailConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.emailServerUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Email service not available:', error);
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

  private generateContactEmailHTML(contactData: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B5A3C 0%, #D4AF37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">VedhaTrendz - Customer Inquiry</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #8B5A3C; margin-top: 0; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Customer Information</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #8B5A3C;">Name:</strong>
              <span style="margin-left: 10px; color: #333;">${contactData.name}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #8B5A3C;">Email:</strong>
              <span style="margin-left: 10px; color: #333;">
                <a href="mailto:${contactData.email}" style="color: #D4AF37; text-decoration: none;">${contactData.email}</a>
              </span>
            </div>
            
            ${contactData.phone ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #8B5A3C;">Phone:</strong>
              <span style="margin-left: 10px; color: #333;">
                <a href="tel:${contactData.phone}" style="color: #D4AF37; text-decoration: none;">${contactData.phone}</a>
              </span>
            </div>
            ` : ''}
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #8B5A3C;">Subject:</strong>
              <span style="margin-left: 10px; color: #333;">${contactData.subject}</span>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px;">
            <h3 style="color: #8B5A3C; margin-top: 0; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Message</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #D4AF37;">
              <p style="margin: 0; white-space: pre-wrap; color: #333; line-height: 1.6;">${contactData.message}</p>
            </div>
          </div>
          
          <div style="margin-top: 25px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #D4AF37;">
            <p style="margin: 0; color: #856404;">
              <strong>📧 Quick Actions:</strong><br>
              • Reply to: <a href="mailto:${contactData.email}" style="color: #D4AF37;">${contactData.email}</a><br>
              ${contactData.phone ? `• Call: <a href="tel:${contactData.phone}" style="color: #D4AF37;">${contactData.phone}</a><br>` : ''}
              • Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p style="margin: 0;">This email was generated automatically from the VedhaTrendz contact form.</p>
          <p style="margin: 5px 0 0 0;">VedhaTrendz - Where tradition meets elegance</p>
        </div>
      </body>
      </html>
    `;
  }

  async sendContactFormNotification(contactData: ContactFormData): Promise<boolean> {
    try {
      console.log('📧 Sending contact form notification...');

      const emailHTML = this.generateContactEmailHTML(contactData);
      
      // Email to admin
      const adminEmailResult = await this.sendEmailToBackend({
        to: 'vedhatrendz@gmail.com', // Admin email
        subject: `New Contact Form Submission: ${contactData.subject}`,
        html: emailHTML,
        text: `New contact form submission from ${contactData.name} (${contactData.email}):\n\nSubject: ${contactData.subject}\n\nMessage:\n${contactData.message}\n\nPhone: ${contactData.phone || 'Not provided'}`
      });

      if (adminEmailResult) {
        console.log('✅ Contact form notification sent to admin successfully');
        return true;
      } else {
        console.error('❌ Failed to send contact form notification to admin');
        return false;
      }
    } catch (error) {
      console.error('❌ Contact form notification error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export type { OrderEmailData, ContactFormData };
