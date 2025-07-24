import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, FileText, Clock } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto mobile-padding">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 text-primary mr-3" />
            <h1 className="mobile-heading">Refund & Exchange Policy</h1>
          </div>
          <p className="mobile-text text-muted-foreground max-w-2xl mx-auto">
            Please read our refund and exchange policy carefully. We strive to ensure your satisfaction while maintaining fair business practices.
          </p>
          <div className="mobile-small-text text-muted-foreground mt-2">
            Last updated: July 23, 2025
          </div>
        </div>

        <div className="space-y-6">
          {/* Important Notice */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center mobile-text text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Important Policy Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-semibold mobile-small-text text-red-800">NO RETURNS POLICY</h4>
                  </div>
                  <p className="mobile-small-text text-red-700">
                    We have a strict NO RETURNS policy. All sales are final and non-refundable.
                  </p>
                </div>
                
                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-semibold mobile-small-text text-red-800">NO CANCELLATION</h4>
                  </div>
                  <p className="mobile-small-text text-red-700">
                    Strictly no cancellation after payment is completed. Please review your order carefully before making payment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exchange Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <RefreshCw className="h-5 w-5 mr-2 text-primary" />
                Exchange Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold mobile-small-text text-green-800">Limited Exchange Available</h4>
                </div>
                <p className="mobile-small-text text-green-700">
                  Exchange (same dress) is applicable ONLY if damage is clearly shown in the unpacking video.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-3">Exchange Eligibility Criteria</h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h5 className="font-semibold mobile-small-text text-green-800 mb-2">✅ Valid for Exchange</h5>
                    <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-1">
                      <li>Significant damage to the product clearly visible in unpacking video</li>
                      <li>Manufacturing defects that affect product usability</li>
                      <li>Wrong product delivered (different from order)</li>
                      <li>Major color variations (not due to photography/screen differences)</li>
                      <li>Torn or damaged fabric</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h5 className="font-semibold mobile-small-text text-red-800 mb-2">❌ NOT Valid for Exchange</h5>
                    <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-1">
                      <li>Personal preference (like or dislike of the product)</li>
                      <li>Size issues or fitting problems</li>
                      <li>Minor loose threads</li>
                      <li>Removable stains or spots</li>
                      <li>Missing stitching that doesn't affect product integrity</li>
                      <li>Slight color variations due to digital photography or monitor settings</li>
                      <li>Color differences due to lighting conditions</li>
                      <li>Change of mind after purchase</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unpacking Video Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Unpacking Video Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mobile-small-text text-blue-800 mb-2">🎥 Video Documentation Required</h4>
                <p className="mobile-small-text text-blue-700">
                  A complete unpacking video is mandatory for any exchange request. Without this video, exchanges cannot be processed.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-3">Video Guidelines</h4>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                  <li><strong>Record continuously:</strong> The video must be recorded continuously from package opening to product inspection</li>
                  <li><strong>Show package condition:</strong> Record the package before opening, including any visible damage</li>
                  <li><strong>Clear visibility:</strong> Ensure good lighting and clear visibility of the product and any damage</li>
                  <li><strong>Show all sides:</strong> Display the product from all angles, highlighting any issues</li>
                  <li><strong>No editing:</strong> The video must be unedited and continuous</li>
                  <li><strong>Time stamp:</strong> Video should be recorded within 24 hours of delivery</li>
                  <li><strong>File format:</strong> MP4, MOV, or AVI format (max 100MB)</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="mobile-small-text text-amber-800">
                  <strong>Important:</strong> If you don't record an unpacking video and later find damage, we cannot process any exchange request. The video serves as proof of the product's condition upon delivery.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Exchange Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Exchange Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">Contact Us Within 24 Hours</h5>
                    <p className="mobile-small-text text-muted-foreground">Email us at vedhatrendz@gmail.com with your order number and unpacking video</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">Review Process</h5>
                    <p className="mobile-small-text text-muted-foreground">Our team will review your video and determine if the exchange is valid (2-3 business days)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">Approval Notification</h5>
                    <p className="mobile-small-text text-muted-foreground">If approved, we'll provide return shipping instructions and a return label</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">Return Shipping</h5>
                    <p className="mobile-small-text text-muted-foreground">Pack the item carefully and ship it back using the provided label (shipping costs covered by us)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">Exchange Processing</h5>
                    <p className="mobile-small-text text-muted-foreground">Once received, we'll send a replacement item within 5-7 business days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Return Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Who Pays for Shipping?</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="mobile-small-text">If damage is confirmed: VedhaTrendz pays return shipping</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="mobile-small-text">If exchange is denied: Customer pays return shipping (if item was sent back)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Return Packaging Requirements</h4>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-1">
                  <li>Use original packaging if available</li>
                  <li>Pack securely to prevent damage during return shipping</li>
                  <li>Include all original tags and accessories</li>
                  <li>Add a copy of your order confirmation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Refund Information */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Refund Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold mobile-small-text text-red-800 mb-2">No Monetary Refunds</h4>
                <p className="mobile-small-text text-red-700">
                  We do not offer monetary refunds under any circumstances. Approved exchanges will only receive a replacement of the same product.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Payment Security</h4>
                <p className="mobile-small-text text-muted-foreground">
                  All payments are processed securely through Razorpay. Once payment is completed, the transaction is final and cannot be reversed through our system.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Special Circumstances */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Special Circumstances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Wrong Product Delivered</h4>
                <p className="mobile-small-text text-muted-foreground">
                  If you receive a completely different product than what you ordered, we will exchange it for the correct item at no additional cost.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Shipping Damage</h4>
                <p className="mobile-small-text text-muted-foreground">
                  Damage that occurs during shipping and is clearly visible in your unpacking video will be eligible for exchange.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Repeated Quality Issues</h4>
                <p className="mobile-small-text text-muted-foreground">
                  If a replacement item also has quality issues, we will work with you to find a suitable solution, which may include store credit for future purchases.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Important Timelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="mobile-small-text font-medium">Report Issue</span>
                  <span className="mobile-small-text text-muted-foreground">Within 24 hours of delivery</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="mobile-small-text font-medium">Review Process</span>
                  <span className="mobile-small-text text-muted-foreground">2-3 business days</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="mobile-small-text font-medium">Return Item</span>
                  <span className="mobile-small-text text-muted-foreground">Within 7 days of approval</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="mobile-small-text font-medium">Replacement Dispatch</span>
                  <span className="mobile-small-text text-muted-foreground">5-7 business days after receipt</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="mobile-text">Contact Us for Exchanges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                For any exchange requests or questions about our policy:
              </p>
              <div className="space-y-2 mobile-small-text">
                <div><strong>Email:</strong> vedhatrendz@gmail.com (for exchanges)</div>
                <div><strong>WhatsApp:</strong> +91 7702284509</div>
                <div><strong>Phone:</strong> +91 7702284509</div>
                <div><strong>Support Hours:</strong> Monday to Saturday, 10:00 AM to 6:00 PM (IST)</div>
              </div>
              <p className="mobile-small-text text-muted-foreground mt-4">
                Please include your order number, issue description, and unpacking video when contacting us.
              </p>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground">
                This refund and exchange policy may be updated from time to time. Any changes will be posted on this page with an updated date. Continued use of our website after changes constitutes acceptance of the revised policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
