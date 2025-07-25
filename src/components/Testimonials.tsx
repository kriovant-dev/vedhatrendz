import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Komali",
      location: "Hyderabad, Telangana",
      rating: 5,
      review: "The recent lehanga which I have purchased from you is excellent.. quality and fitting of blouse and lehanga is top notch. Thank you for maintaining such good quality and fast delivery service.",
      saree: "Paithani Lehanga",
      image: "customer1"
    },
    {
      id: 2,
      name: "Swetha",
      location: "Nellore, Andhra Pradesh",
      rating: 5,
      review: "Bought latest trending space silk saree from your page .. wore it for a wedding. Got many compliments from everyone. Thank you ",
      saree: "Space silk saree with Jarkhan work ",
      image: "customer2"
    },
    {
      id: 3,
      name: "Priya",
      location: "Hanumakonda, Telangana",
      rating: 5,
      review: "Absolutely in love with the saree I ordered! The fabric quality is top-notch, and it looked exactly like the pictures.  VedhaTrendz has become my go-to for festive shopping!",
      saree: "Benarasi Saree",
      image: "customer3"
    },
    {
      id: 4,
      name: "Anilisha",
      location: "Chennai, Tamil Nadu",
      rating: 5,
      review: "Was worried about online saree shopping, but VedhaTrendz made it so easy. The frock fitting is perfect and delivery was on time. Highly recommended. Customer service was very responsive too!!",
      saree: "Mul Mul Cotton Frock",
      image: "customer4"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">What Our </span>
            <span className="gradient-primary bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from real customers who have experienced the beauty and quality of our sarees
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id}
              className="border-border hover:shadow-elegant transition-smooth animate-fade-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-saree-gold" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-4 w-4 fill-saree-gold text-saree-gold" 
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.review}"
                </p>

                {/* Product */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg border-l-4 border-saree-saffron">
                  <span className="text-sm font-medium text-foreground">
                    Purchased: {testimonial.saree}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  {/* Customer Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 animate-fade-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">4.8</div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 fill-saree-gold text-saree-gold" 
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">22K+</div>
              <div className="text-sm text-muted-foreground">Instagram Followers</div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center animate-fade-up">
          <Card className="border-saree-burgundy/20 bg-gradient-to-r from-saree-burgundy/5 to-saree-gold/5">
            <CardContent className="p-8">
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Join Our Happy Customers
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Experience the same quality and service that our customers love. Shop with confidence today!
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>✓ Authentic Products</span>
                <span>✓ Fast Shipping</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
