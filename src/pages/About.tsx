
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Award, Users, Truck, Shield, Star, ArrowLeft } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();
  
  const values = [
    {
      icon: Heart,
      title: 'Passion for Tradition',
      description: 'We celebrate the rich heritage of Indian textiles and bring you authentic sarees crafted with love.'
    },
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'Every saree in our collection meets the highest standards of quality and craftsmanship.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We provide personalized service and support.'
    },
    {
      icon: Truck,
      title: 'Reliable Delivery',
      description: 'Fast and secure shipping ensures your sarees reach you in perfect condition.'
    }
  ];

  const features = [
    { icon: Shield, text: 'Secure Payments' },
    { icon: Star, text: '4.8/5 Customer Rating' },
    { icon: Truck, text: 'Free Shipping Above ₹2000' },
    { icon: Award, text: 'Premium Quality Guarantee' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
      </div>
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-saree-rose/10 to-saree-marigold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-6">
              About VedhaTrendz
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your trusted destination for exquisite traditional and contemporary sarees. 
              We bring you the finest collection of Indian textiles with modern convenience.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  VedhaTrendz was born from a passion for preserving and celebrating the rich tradition 
                  of Indian textiles. Founded with the vision of making authentic, high-quality sarees 
                  accessible to women everywhere, we have grown into a trusted name in ethnic fashion.
                </p>
                <p>
                  Our journey began with a simple belief: every woman deserves to feel beautiful and 
                  confident in traditional attire. We work directly with skilled artisans and weavers 
                  across India to bring you sarees that tell stories of heritage, craftsmanship, and elegance.
                </p>
                <p>
                  Today, VedhaTrendz serves thousands of customers worldwide, offering not just sarees, 
                  but a connection to India's textile legacy and the promise of timeless beauty.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600"
                alt="Traditional saree weaving"
                className="rounded-2xl shadow-elegant"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-soft border">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">1000+</div>
                    <div className="text-sm text-muted-foreground">Happy Customers</div>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">500+</div>
                    <div className="text-sm text-muted-foreground">Saree Designs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground text-lg">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-saree-saffron to-saree-marigold rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Why Choose VedhaTrendz?</h2>
            <p className="text-muted-foreground text-lg">
              Experience the difference with our commitment to excellence
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 hover:bg-card transition-colors">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
