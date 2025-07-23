import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, UserCheck, Globe, Database } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto mobile-padding">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-3" />
            <h1 className="mobile-heading">Privacy Policy</h1>
          </div>
          <p className="mobile-text text-muted-foreground max-w-2xl mx-auto">
            At VedhaTrendz, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.
          </p>
          <div className="mobile-small-text text-muted-foreground mt-2">
            Last updated: July 23, 2025
          </div>
        </div>

        <div className="space-y-6">
          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Database className="h-5 w-5 mr-2 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Personal Information</h4>
                <p className="mobile-small-text text-muted-foreground">
                  We collect personally identifiable information (PII) when you interact with our website, including:
                </p>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground mt-2 space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through Razorpay)</li>
                  <li>Order history and preferences</li>
                  <li>Account credentials and profile information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Non-Personal Information</h4>
                <p className="mobile-small-text text-muted-foreground">
                  We also collect non-personally identifiable information such as:
                </p>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground mt-2 space-y-1">
                  <li>Browser type, device information, and IP address</li>
                  <li>Website usage patterns and analytics data</li>
                  <li>Cookies and tracking preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <UserCheck className="h-5 w-5 mr-2 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                <li>Processing and fulfilling your orders</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Sending order confirmations, updates, and shipping notifications</li>
                <li>Improving our website functionality and user experience</li>
                <li>Analyzing website usage to enhance our services</li>
                <li>Sending promotional content and newsletters (with your consent)</li>
                <li>Ensuring website security and preventing fraud</li>
                <li>Complying with legal obligations and requirements</li>
              </ul>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Globe className="h-5 w-5 mr-2 text-primary" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Services We Use</h4>
                <p className="mobile-small-text text-muted-foreground mb-3">
                  To provide you with the best service, we work with trusted third-party providers:
                </p>
                
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h5 className="font-semibold mobile-small-text">Firebase (Google)</h5>
                    <p className="mobile-small-text text-muted-foreground">
                      We use Firebase for order management, user authentication, and data storage. Your order information and account details are securely stored on Firebase servers.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h5 className="font-semibold mobile-small-text">Razorpay</h5>
                    <p className="mobile-small-text text-muted-foreground">
                      All payment processing is handled by Razorpay, a secure payment gateway. We do not store your complete payment card details on our servers.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h5 className="font-semibold mobile-small-text">Shipping Partners</h5>
                    <p className="mobile-small-text text-muted-foreground">
                      We share necessary delivery information (name, address, phone number) with our shipping partners to ensure successful delivery of your orders.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="mobile-small-text text-amber-800">
                  <strong>Important:</strong> We never sell, rent, or trade your personal information to unrelated third parties for marketing purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Lock className="h-5 w-5 mr-2 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                We take data security seriously and employ industry-standard measures to protect your information:
              </p>
              <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                <li>SSL encryption for all data transmission</li>
                <li>Secure payment processing through certified payment gateways</li>
                <li>Regular security updates and monitoring</li>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Secure storage with automatic backups</li>
                <li>Regular security audits and vulnerability assessments</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Eye className="h-5 w-5 mr-2 text-primary" />
                Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to enhance your browsing experience:
              </p>
              <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                <li>Essential cookies for website functionality</li>
                <li>Analytics cookies to understand website usage</li>
                <li>Preference cookies to remember your settings</li>
                <li>Marketing cookies for relevant advertisements (with consent)</li>
              </ul>
              <p className="mobile-small-text text-muted-foreground mt-4">
                You can manage or disable cookies in your browser settings. However, some website features may not function properly without certain cookies.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                <li><strong>Object:</strong> Object to certain types of data processing</li>
              </ul>
              <p className="mobile-small-text text-muted-foreground mt-4">
                To exercise these rights or for any privacy-related questions, please contact us at{' '}
                <a href="mailto:vedhatrendz@gmail.com" className="text-primary hover:underline">
                  vedhatrendz@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order information is typically retained for 7 years for tax and accounting purposes.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                Our website is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are conducted in accordance with applicable data protection laws and that appropriate safeguards are in place.
              </p>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                We may update our Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make significant changes, we will notify you through our website or via email. We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="mobile-text">Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 mobile-small-text">
                <div><strong>Email:</strong> vedhatrendz@gmail.com</div>
                <div><strong>Phone:</strong> +91 7702284509</div>
                <div><strong>Address:</strong> Visakhapatnam, Andhra Pradesh, India</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
