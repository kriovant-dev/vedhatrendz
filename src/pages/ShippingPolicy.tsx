import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, MapPin, Package, Globe, AlertCircle } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto mobile-padding">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Truck className="h-8 w-8 text-primary mr-3" />
            <h1 className="mobile-heading">Shipping Policy</h1>
          </div>
          <p className="mobile-text text-muted-foreground max-w-2xl mx-auto">
            We are committed to delivering your beautiful sarees safely and efficiently. Learn about our shipping process, timelines, and policies below.
          </p>
          <div className="mobile-small-text text-muted-foreground mt-2">
            Last updated: July 23, 2025
          </div>
        </div>

        <div className="space-y-6">
          {/* Free Shipping Banner */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="mobile-text font-semibold text-green-800">Free Shipping All Over India! 🇮🇳</h3>
              </div>
              <p className="mobile-small-text text-green-700">
                Enjoy complimentary shipping on all orders within India, no minimum order value required.
              </p>
            </CardContent>
          </Card>

          {/* Processing Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Order Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mobile-small-text mb-2 text-primary">Standard Processing</h4>
                  <p className="mobile-small-text text-muted-foreground">
                    <strong>2-3 working days</strong> before dispatch
                  </p>
                  <p className="mobile-small-text text-muted-foreground mt-2">
                    This includes order verification, quality check, and careful packaging of your saree.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mobile-small-text mb-2 text-primary">What We Do</h4>
                  <ul className="mobile-small-text text-muted-foreground space-y-1">
                    <li>• Quality inspection</li>
                    <li>• Careful packaging</li>
                    <li>• Order verification</li>
                    <li>• Label preparation</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="mobile-small-text text-blue-800">
                  <strong>Note:</strong> Processing time excludes weekends and public holidays. Orders placed on Friday evening or weekends will be processed starting the next working day.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-green-600 mr-2" />
                    <h4 className="font-semibold mobile-small-text text-green-800">Domestic Shipping (India)</h4>
                  </div>
                  <p className="mobile-small-text text-green-700 mb-2">
                    <strong>8-9 working days</strong> after dispatch
                  </p>
                  <p className="mobile-small-text text-green-600">
                    Free shipping nationwide 🚚
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center mb-2">
                    <Globe className="h-4 w-4 text-blue-600 mr-2" />
                    <h4 className="font-semibold mobile-small-text text-blue-800">International Shipping</h4>
                  </div>
                  <p className="mobile-small-text text-blue-700 mb-2">
                    <strong>10-12 working days</strong> after dispatch
                  </p>
                  <p className="mobile-small-text text-blue-600">
                    Shipping charges apply 📦
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold mobile-small-text">Factors Affecting Delivery Time</h4>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-1">
                  <li>Weather conditions and natural disasters</li>
                  <li>Peak season demand (festivals, holidays)</li>
                  <li>Remote location accessibility</li>
                  <li>Customs clearance (for international orders)</li>
                  <li>Local courier service schedules</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Globe className="h-5 w-5 mr-2 text-primary" />
                Shipping Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mobile-small-text mb-3">We Ship Worldwide! 🌍</h4>
                <p className="mobile-small-text text-muted-foreground mb-4">
                  We can ship anywhere in the world and want to make it easy for you to get your products where they need to go.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h5 className="font-semibold mobile-small-text mb-1">India</h5>
                  <p className="mobile-small-text text-muted-foreground">Free shipping</p>
                  <p className="mobile-small-text text-muted-foreground">All states & UTs</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h5 className="font-semibold mobile-small-text mb-1">International</h5>
                  <p className="mobile-small-text text-muted-foreground">Paid shipping</p>
                  <p className="mobile-small-text text-muted-foreground">Most countries</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h5 className="font-semibold mobile-small-text mb-1">Remote Areas</h5>
                  <p className="mobile-small-text text-muted-foreground">May take longer</p>
                  <p className="mobile-small-text text-muted-foreground">Additional 2-3 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Partners */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Our Shipping Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                We work with trusted shipping partners to ensure safe and timely delivery of your orders:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'Blue Dart', 'DHL', 'FedEx', 'DTDC', 
                  'Ekart', 'India Post', 'XpressBees', 'Delhivery'
                ].map((partner) => (
                  <div key={partner} className="text-center p-3 border rounded-lg">
                    <div className="h-8 w-8 bg-primary/10 rounded mx-auto mb-2 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mobile-small-text font-medium">{partner}</p>
                  </div>
                ))}
              </div>
              
              <p className="mobile-small-text text-muted-foreground mt-4">
                The shipping partner is selected based on your location and the fastest available service.
              </p>
            </CardContent>
          </Card>

          {/* Delivery Process */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Delivery Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">Order Confirmation</h5>
                    <p className="mobile-small-text text-muted-foreground">You'll receive an email confirmation with order details</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">Processing & Packaging</h5>
                    <p className="mobile-small-text text-muted-foreground">2-3 working days for quality check and packaging</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">Dispatch Notification</h5>
                    <p className="mobile-small-text text-muted-foreground">Email with tracking details once shipped</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">In Transit</h5>
                    <p className="mobile-small-text text-muted-foreground">Track your package using the provided tracking number</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <div>
                    <h5 className="font-semibold mobile-small-text">Delivered</h5>
                    <p className="mobile-small-text text-muted-foreground">Package delivered to your doorstep</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Delivery Notes */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center mobile-text text-amber-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                Important Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="bg-white border border-amber-200 rounded-lg p-3">
                  <h5 className="font-semibold mobile-small-text text-amber-800 mb-1">Door Delivery Not Possible</h5>
                  <p className="mobile-small-text text-amber-700">
                    If door delivery is not possible, you will need to collect the package from the nearest courier service center.
                  </p>
                </div>
                
                <div className="bg-white border border-amber-200 rounded-lg p-3">
                  <h5 className="font-semibold mobile-small-text text-amber-800 mb-1">Package Shows Delivered</h5>
                  <p className="mobile-small-text text-amber-700">
                    If the tracking shows "delivered" but you haven't received the package, please visit the nearest courier branch immediately.
                  </p>
                </div>
                
                <div className="bg-white border border-amber-200 rounded-lg p-3">
                  <h5 className="font-semibold mobile-small-text text-amber-800 mb-1">Address Changes</h5>
                  <p className="mobile-small-text text-amber-700">
                    Delivery address cannot be changed once the order is shipped. Please ensure your address is correct before placing the order.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Your Order */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">Tracking Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="mobile-small-text text-muted-foreground">
                Once your order is shipped, you'll receive:
              </p>
              
              <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                <li>Email notification with tracking number</li>
                <li>SMS updates on delivery status</li>
                <li>WhatsApp notifications (if opted in)</li>
                <li>Direct link to track your package</li>
              </ul>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="mobile-small-text text-blue-800">
                  <strong>Tip:</strong> Keep your tracking number handy and check the status regularly for the most up-to-date delivery information.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* International Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">International Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Additional Information for International Orders</h4>
                <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                  <li>Customs duties and taxes are not included in the product price</li>
                  <li>Recipients are responsible for any customs charges</li>
                  <li>Delivery may be delayed due to customs clearance</li>
                  <li>Some countries may have import restrictions on textiles</li>
                  <li>We recommend checking with local customs before ordering</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mobile-small-text mb-2">Countries We Ship To</h4>
                <p className="mobile-small-text text-muted-foreground">
                  We ship to most countries worldwide. If you're unsure whether we ship to your location, please contact us before placing your order.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Packaging */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center mobile-text">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Packaging Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                We take great care in packaging your sarees to ensure they arrive in perfect condition:
              </p>
              
              <ul className="list-disc list-inside mobile-small-text text-muted-foreground space-y-2">
                <li>Acid-free tissue paper to protect fabric</li>
                <li>Moisture-resistant packaging materials</li>
                <li>Sturdy boxes to prevent damage during transit</li>
                <li>Fragile stickers for delicate items</li>
                <li>Eco-friendly packaging materials when possible</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact for Shipping Issues */}
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="mobile-text">Shipping Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mobile-small-text text-muted-foreground mb-4">
                Having issues with your shipment? We're here to help!
              </p>
              <div className="space-y-2 mobile-small-text">
                <div><strong>Email:</strong> vedhatrendz@gmail.com</div>
                <div><strong>Phone:</strong> +91 7702284509</div>
                <div><strong>WhatsApp:</strong> +91 7702284509</div>
                <div><strong>Support Hours:</strong> Monday to Saturday, 10:00 AM to 6:00 PM (IST)</div>
              </div>
              <p className="mobile-small-text text-muted-foreground mt-4">
                Please have your order number ready when contacting us for faster assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
