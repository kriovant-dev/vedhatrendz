import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle, CreditCard, Truck, RefreshCw, Scale } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto mobile-padding">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-primary mr-3" />
            <h1 className="mobile-heading">Terms & Conditions</h1>
          </div>
          <p className="mobile-text text-muted-foreground max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using our website or purchasing our products. By accessing or using VedhaTrendz, you agree to be bound by these terms.
          </p>
          <div className="mobile-small-text text-muted-foreground mt-2">
            Last updated: July 23, 2025
          </div>
        </div>

        <div className="space-y-6">
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Scale className="h-5 w-5 mr-2 text-primary" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                By accessing and using the VedhaTrendz website, placing orders, or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our website or services.
              </p>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center mobile-text text-amber-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-white border border-amber-200 rounded-lg p-3">
                  <p className="mobile-small-text text-amber-800 font-semibold">
                    ⚠️ STRICTLY NO CANCELLATION after payment is completed
                  </p>
                </div>
                <div className="bg-white border border-amber-200 rounded-lg p-3">
                  <p className="mobile-small-text text-amber-800 font-semibold">
                    ⚠️ NO RETURNS - Exchange (same dress) applicable only if damage is shown in unpacking video
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order and Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Order and Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Payment Processing</h4>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                  <li>All payments are processed securely through Razorpay</li>
                  <li>We accept major credit cards, debit cards, UPI, and net banking</li>
                  <li>Prices are listed in Indian Rupees (INR) and include applicable taxes</li>
                  <li>Payment must be completed at the time of placing the order</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Order Confirmation</h4>
                <p className="mobile-small-text text-muted-foreground">
                  Once your payment is successfully processed, you will receive an order confirmation email. This confirmation constitutes acceptance of your order and creates a binding contract between you and VedhaTrendz.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Pricing and Availability</h4>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                  <li>All prices are subject to change without notice</li>
                  <li>Product availability is subject to stock levels</li>
                  <li>We reserve the right to limit order quantities</li>
                  <li>In case of pricing errors, we reserve the right to cancel the order</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Shipping and Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Truck className="h-5 w-5 mr-2 text-primary" />
                Shipping and Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Processing Time</h4>
                <p className="mobile-small-text text-muted-foreground">
                  Order processing time is 2-3 working days before dispatch.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Delivery Timeline</h4>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                  <li>India: 8-9 working days after dispatch</li>
                  <li>International: 10-12 working days after dispatch</li>
                  <li>Free shipping available all over India</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Delivery Conditions</h4>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                  <li>If door delivery is not possible, customers must collect the package from the courier service</li>
                  <li>If a package shows "delivered" but you haven't received it, please visit the nearest courier branch</li>
                  <li>Delivery address cannot be changed once the order is shipped</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Returns and Exchanges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <RefreshCw className="h-5 w-5 mr-2 text-primary" />
                Returns and Exchange Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold mobile-small-text mb-2 text-red-800">No Returns Policy</h4>
                <p className="mobile-small-text text-red-700">
                  We have a strict NO RETURNS policy. All sales are final.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Exchange Policy</h4>
                <p className="mobile-small-text text-muted-foreground mb-3">
                  Exchange (same dress) is applicable ONLY in the following conditions:
                </p>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                  <li>Damage is clearly shown in the unpacking video</li>
                  <li>The unpacking video must be recorded continuously from package opening to product inspection</li>
                  <li>Exchange request must be raised within 24 hours of delivery</li>
                  <li>Product must be unused and in original packaging</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">What is NOT considered damage</h4>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                  <li>Personal preference (like or dislike of the product)</li>
                  <li>Minor issues like loose threads</li>
                  <li>Removable stains or spots</li>
                  <li>Missing stitching that doesn't affect product integrity</li>
                  <li>Slight color variations due to digital photography or screen settings</li>
                  <li>Color differences due to lighting conditions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Exchange Process</h4>
                <p className="mobile-small-text text-muted-foreground">
                  If your exchange request is approved, you will need to courier the dress back to us. Shipping charges for the return will be paid by VedhaTrendz if the damage is confirmed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Product Information and Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                <li>We strive to provide accurate product descriptions, images, and specifications</li>
                <li>Colors may vary slightly due to monitor settings and lighting conditions</li>
                <li>Product images are for illustration purposes and may not reflect exact appearance</li>
                <li>We reserve the right to make changes to product specifications without notice</li>
                <li>Size charts are provided as guidelines; actual measurements may vary slightly</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                By using our website and services, you agree to:
              </p>
              <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                <li>Provide accurate and complete information when placing orders</li>
                <li>Use the website in compliance with applicable laws and regulations</li>
                <li>Not engage in fraudulent or unauthorized activities</li>
                <li>Respect intellectual property rights</li>
                <li>Not attempt to damage or disrupt our website or services</li>
                <li>Keep your account credentials secure and confidential</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                All content on this website, including text, graphics, logos, images, and software, is the property of VedhaTrendz or its content suppliers and is protected by Indian and international copyright laws. You may not reproduce, distribute, or use any content without our express written permission.
              </p>
            </CardContent>
          </Card>

          {/* Privacy and Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                To the maximum extent permitted by law, VedhaTrendz shall not be liable for:
              </p>
              <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages resulting from website downtime or technical issues</li>
                <li>Damages caused by third-party services or shipping partners</li>
                <li>Any amount exceeding the total amount paid for the relevant order</li>
              </ul>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Governing Law and Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                These Terms and Conditions are governed by the laws of India. Any disputes arising from these terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in Andhra Pradesh, India.
              </p>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Modifications to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                We reserve the right to modify these Terms and Conditions at any time without prior notice. Changes will be effective immediately upon posting on our website. Your continued use of our website after any modifications constitutes acceptance of the revised terms.
              </p>
            </CardContent>
          </Card>

          {/* Severability */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Severability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall continue to be valid and enforceable to the fullest extent permitted by law.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="mobile-text">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 mobile-small-text">
                <div><strong>Email:</strong> vedhatrendz@gmail.com</div>
                <div><strong>Phone:</strong> +91 7702284509</div>
                <div><strong>Address:</strong> Vizag, Andhra Pradesh, India</div>
                <div><strong>Business Hours:</strong> Monday to Saturday, 10:00 AM to 6:00 PM (IST)</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;
