import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

export default function Landing() {
  const heroRef = useRef(null);

  useEffect(() => {
    anime({
      targets: '.hero-element',
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: 'easeOutExpo',
      duration: 1000
    });
  }, []);

  return (
    <div className="min-h-screen bg-midnight text-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <h1 className="hero-element text-5xl md:text-7xl font-display font-bold mb-6 text-white leading-tight">
          Because leftovers deserve a <br/><span className="text-azure">standing ovation 🍽️</span>
        </h1>
        <p className="hero-element text-xl text-steel max-w-2xl mb-10 font-body">
          Every surplus meal finds its next table. Join the zero-waste food logistics platform connecting donors with local shelters in real-time.
        </p>
        <div className="hero-element flex flex-col sm:flex-row gap-4">
          <Link to="/register">
            <Button variant="primary" size="lg" className="w-full sm:w-auto font-display text-lg">
              Start Donating
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto font-display text-lg">
              I Represent a Shelter
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-midnight border-t border-steel/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-cyan mb-2">
                <AnimatedCounter to={25000} />+
              </div>
              <div className="text-steel font-body text-sm uppercase tracking-wide">Meals Rescued</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-azure mb-2">
                <AnimatedCounter to={5200} /> kg
              </div>
              <div className="text-steel font-body text-sm uppercase tracking-wide">CO₂ Reduced</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-saffron mb-2">
                <AnimatedCounter to={150} />+
              </div>
              <div className="text-steel font-body text-sm uppercase tracking-wide">Active Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-steel/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center mb-16">How PlateRelay Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-midnight/50 border-steel/20 hover:border-azure/50 transition-colors">
              <div className="w-16 h-16 bg-azure/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-bold mb-4 font-display">1. Snap & Post</h3>
              <p className="text-steel font-body">Donors post surplus food with a photo and pickup window. It takes 30 seconds.</p>
            </Card>
            <Card className="p-8 text-center bg-midnight/50 border-steel/20 hover:border-cyan/50 transition-colors">
              <div className="w-16 h-16 bg-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-4 font-display">2. Instant Match</h3>
              <p className="text-steel font-body">Nearby verified shelters get notified instantly and can claim the food in one tap.</p>
            </Card>
            <Card className="p-8 text-center bg-midnight/50 border-steel/20 hover:border-saffron/50 transition-colors">
              <div className="w-16 h-16 bg-saffron/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold mb-4 font-display">3. Quick Pickup</h3>
              <p className="text-steel font-body">Shelters pick up the food before the window closes. Zero waste, maximum impact.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-midnight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-steel mb-16 max-w-2xl mx-auto">Donors always use PlateRelay for free. Shelters can start for free and upgrade for unlimited access.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-midnight border-steel/20 flex flex-col">
              <h3 className="text-xl font-bold mb-2 font-display">Free Tier</h3>
              <div className="text-3xl font-bold mb-6">₹0<span className="text-sm font-normal text-steel">/mo</span></div>
              <ul className="text-steel mb-8 flex-1 space-y-3 font-body">
                <li>✓ 3 claims per month</li>
                <li>✓ 10 km radius access</li>
                <li>✓ Email notifications</li>
              </ul>
              <Button variant="ghost" className="w-full">Get Started</Button>
            </Card>
            
            <Card className="p-8 bg-midnight border-azure/50 relative transform md:-translate-y-4 shadow-lg shadow-azure/10 flex flex-col">
              <div className="absolute top-0 right-0 bg-azure text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
              <h3 className="text-xl font-bold mb-2 font-display">Saathi Plan</h3>
              <div className="text-3xl font-bold mb-6">₹149<span className="text-sm font-normal text-steel">/mo</span></div>
              <ul className="text-steel mb-8 flex-1 space-y-3 font-body">
                <li>✓ Unlimited claims</li>
                <li>✓ 25 km radius access</li>
                <li>✓ Instant notifications</li>
                <li>✓ Priority claim queue</li>
              </ul>
              <Button variant="primary" className="w-full">Upgrade to Saathi</Button>
            </Card>
            
            <Card className="p-8 bg-midnight border-steel/20 flex flex-col">
              <h3 className="text-xl font-bold mb-2 font-display">Daan Pro (Donors)</h3>
              <div className="text-3xl font-bold mb-6">₹499<span className="text-sm font-normal text-steel">/mo</span></div>
              <ul className="text-steel mb-8 flex-1 space-y-3 font-body">
                <li>✓ Unlimited listings</li>
                <li>✓ CSR-ready PDF reports</li>
                <li>✓ Certified Donor badge</li>
                <li>✓ Analytics dashboard</li>
              </ul>
              <Button variant="secondary" className="w-full">Get Pro</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-midnight border-t border-steel/20 py-12 text-center text-steel font-body">
        <p>Built with ❤️ for Hackprix 2026</p>
        <p className="mt-2 font-accent text-xl">The kitchen's quiet... but not for long.</p>
      </footer>
    </div>
  );
}
