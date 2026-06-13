import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import anime from 'animejs';
import { FloatingFoodHero } from '../components/ui/hero-section-7';
import useAuthStore from '../store/authStore';

export default function Landing() {
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    // If user is already logged in, redirect them to their dashboard instead of keeping them on the landing page
    if (initialized && user) {
      navigate(user.role === 'recipient' ? '/recipient/dashboard' : '/donor/dashboard', { replace: true });
    }
  }, [user, initialized, navigate]);

  useEffect(() => {
    anime({
      targets: '.hero-element',
      translateY: [40, 0],
      opacity: [0, 1],
      delay: anime.stagger(150),
      easing: 'easeOutExpo',
      duration: 1200,
    });

    // Animate stats counters
    const counters = [
      { el: '#counter-meals', target: 25000 },
      { el: '#counter-co2', target: 5200 },
      { el: '#counter-partners', target: 150 },
    ];
    counters.forEach(({ el, target }) => {
      const element = document.querySelector(el);
      if (!element) return;
      const obj = { val: 0 };
      anime({
        targets: obj,
        val: target,
        round: 1,
        duration: 2500,
        delay: 800,
        easing: 'easeOutExpo',
        update: () => {
          if (element) element.textContent = Math.floor(obj.val).toLocaleString('en-IN');
        },
      });
    });

    // Float the orbs
    anime({
      targets: '.orb',
      translateY: ['-12px', '12px'],
      duration: 4000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      delay: anime.stagger(800),
    });
  }, []);

  return (
    <div className="min-h-screen bg-midnight text-white overflow-x-hidden">

      {/* ─── HERO ─── */}
      <FloatingFoodHero
        className="min-h-screen"
        title={
          <>
            Because leftovers deserve<br />
            <span style={{
              background: 'linear-gradient(135deg, #20A4F3 0%, #59F8E8 50%, #F4A22D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              a standing ovation
            </span>
          </>
        }
        description="Every surplus meal finds its next table. Connect restaurants with local shelters in under 15 minutes — real-time, photo-first, zero bureaucracy."
        images={[
          {
            src: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format&fit=crop',
            alt: 'Biryani in a traditional pot',
            className: 'w-40 sm:w-56 md:w-64 lg:w-72 top-10 left-4 sm:left-10 md:top-20 md:left-20 animate-float rounded-full shadow-2xl object-cover aspect-square border-4 border-midnight/50',
          },
          {
            src: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop',
            alt: 'Crispy Samosas',
            className: 'w-28 sm:w-36 md:w-48 top-10 right-4 sm:right-10 md:top-16 md:right-16 animate-float rounded-full shadow-2xl object-cover aspect-square border-4 border-midnight/50',
          },
          {
            src: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop',
            alt: 'Naan bread and curry',
            className: 'w-32 sm:w-40 md:w-56 bottom-8 right-5 sm:right-10 md:bottom-16 md:right-20 animate-float rounded-full shadow-2xl object-cover aspect-square border-4 border-midnight/50',
          },
           {
            src: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=400&auto=format&fit=crop',
            alt: 'Indian Spices',
            className: 'w-20 sm:w-28 top-1/4 left-1/3 animate-float rounded-full shadow-xl object-cover aspect-square border-2 border-midnight/30',
          },
          {
            src: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=400&auto=format&fit=crop',
            alt: 'Idli with sambhar',
            className: 'w-20 sm:w-28 bottom-1/4 left-1/4 animate-float rounded-full shadow-xl object-cover aspect-square border-2 border-midnight/30',
          },
        ]}
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/register">
            <button className="group relative px-8 py-4 rounded-2xl font-display font-bold text-base overflow-hidden transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E' }}>
              <span className="relative z-10 flex items-center gap-2">
                Start Donating
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </span>
            </button>
          </Link>
          <Link to="/register">
            <button className="px-8 py-4 rounded-2xl font-display font-bold text-base transition-all duration-300 hover:scale-105 hover:border-azure/60"
              style={{ border: '1px solid rgba(193,207,218,0.25)', color: '#C1CFDA', background: 'rgba(193,207,218,0.05)' }}>
              I Represent a Shelter
            </button>
          </Link>
        </div>
      </FloatingFoodHero>

      {/* ─── STATS ─── */}
      <section className="py-24 relative">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent, rgba(32,164,243,0.04), transparent)' }} />
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { id: 'counter-meals', suffix: '+', label: 'Meals Rescued', color: '#59F8E8' },
              { id: 'counter-co2', suffix: ' kg', label: 'CO\u2082 Reduced', color: '#20A4F3' },
              { id: 'counter-partners', suffix: '+', label: 'Active Partners', color: '#F4A22D' },
            ].map(stat => (
              <div key={stat.id} className="text-center">
                <div className="font-display font-bold mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: stat.color }}>
                  <span id={stat.id}>0</span>{stat.suffix}
                </div>
                <div className="text-xs md:text-sm font-body uppercase tracking-widest" style={{ color: 'rgba(193,207,218,0.5)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-body uppercase tracking-widest mb-4 block" style={{ color: '#20A4F3' }}>
              The Process
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">How PlateRelay Works</h2>
            <p className="mt-4 font-body text-lg max-w-xl mx-auto" style={{ color: '#C1CFDA' }}>
              From kitchen to shelter in under two hours. Every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Snap & Post',
                desc: 'Donors photograph surplus food, set a pickup window, and confirm food safety. Done in 30 seconds.',
                color: '#20A4F3',
              },
              {
                step: '02',
                title: 'Instant Match',
                desc: 'Verified shelters within radius get an immediate email. First to claim, wins the relay.',
                color: '#59F8E8',
              },
              {
                step: '03',
                title: 'Quick Pickup',
                desc: 'Shelter arrives before the window closes, donor gets a completion confirmation. Zero waste.',
                color: '#F4A22D',
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="rounded-2xl p-8 h-full transition-all duration-300 hover:-translate-y-2"
                  style={{
                    background: 'rgba(193,207,218,0.04)',
                    border: '1px solid rgba(193,207,218,0.1)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = item.color + '50'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(193,207,218,0.1)'}
                >
                  {/* Step number */}
                  <div className="text-xs font-bold font-display mb-6" style={{ color: item.color, letterSpacing: '0.15em' }}>
                    STEP {item.step}
                  </div>
                  {/* Icon circle */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: item.color + '15' }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3">{item.title}</h3>
                  <p className="font-body leading-relaxed text-sm" style={{ color: '#C1CFDA' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMPACT STRIP ─── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(32,164,243,0.08) 0%, rgba(89,248,232,0.05) 50%, rgba(244,162,45,0.05) 100%)',
        }} />
        <div className="max-w-4xl mx-auto relative">
          <div className="rounded-3xl p-10 md:p-14 text-center"
            style={{ border: '1px solid rgba(32,164,243,0.2)', background: 'rgba(32,164,243,0.06)' }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 leading-snug">
              India wastes <span style={{ color: '#941C2F' }}>68 million tonnes</span> of food yearly.<br />
              <span style={{ color: '#59F8E8' }}>We're fixing the coordination gap.</span>
            </h2>
            <p className="font-body text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#C1CFDA' }}>
              Restaurants can't call every shelter every night. Shelters can't wait by the phone.
              PlateRelay bridges the sub-2-hour window where food goes from surplus to served.
            </p>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-body uppercase tracking-widest mb-4 block" style={{ color: '#F4A22D' }}>
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="font-body text-lg max-w-xl mx-auto" style={{ color: '#C1CFDA' }}>
              Donors always eat free. Shelters start for free and grow with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Free Tier */}
            <div className="rounded-2xl p-8 flex flex-col h-full"
              style={{ background: 'rgba(193,207,218,0.04)', border: '1px solid rgba(193,207,218,0.12)' }}>
              <h3 className="text-xl font-display font-bold mb-1">Free Tier</h3>
              <p className="text-sm mb-6" style={{ color: '#C1CFDA' }}>Perfect for small shelters getting started</p>
              <div className="mb-8">
                <span className="text-5xl font-bold font-display">₹0</span>
                <span className="text-sm ml-1" style={{ color: '#C1CFDA' }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-body">
                {['3 claims per month', '10 km search radius', 'Email notifications'].map(f => (
                  <li key={f} className="flex items-center gap-3" style={{ color: '#C1CFDA' }}>
                    <span style={{ color: '#59F8E8' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <button className="w-full py-3 rounded-xl font-display font-bold text-sm transition-all hover:opacity-80"
                  style={{ border: '1px solid rgba(193,207,218,0.25)', color: '#C1CFDA' }}>
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Saathi — highlighted */}
            <div className="rounded-2xl p-8 flex flex-col relative h-full"
              style={{
                background: 'linear-gradient(160deg, rgba(32,164,243,0.15), rgba(89,248,232,0.08))',
                border: '1px solid rgba(32,164,243,0.4)',
                boxShadow: '0 0 40px rgba(32,164,243,0.15), 0 20px 60px rgba(0,0,0,0.3)',
              }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold font-display"
                style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E' }}>
                MOST POPULAR
              </div>
              <h3 className="text-xl font-display font-bold mb-1 mt-2">Saathi Plan</h3>
              <p className="text-sm mb-6" style={{ color: '#C1CFDA' }}><em>"Saathi" = companion in Hindi</em></p>
              <div className="mb-8">
                <span className="text-5xl font-bold font-display" style={{ color: '#20A4F3' }}>₹149</span>
                <span className="text-sm ml-1" style={{ color: '#C1CFDA' }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-body">
                {['Unlimited claims', '25 km search radius', 'Instant notifications', 'Priority claim queue', 'Monthly impact summary'].map(f => (
                  <li key={f} className="flex items-center gap-3" style={{ color: '#C1CFDA' }}>
                    <span style={{ color: '#59F8E8' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <button className="w-full py-3 rounded-xl font-display font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E' }}>
                  Upgrade to Saathi →
                </button>
              </Link>
            </div>

            {/* Daan Pro */}
            <div className="rounded-2xl p-8 flex flex-col h-full"
              style={{ background: 'rgba(244,162,45,0.06)', border: '1px solid rgba(244,162,45,0.25)' }}>
              <h3 className="text-xl font-display font-bold mb-1">Daan Pro</h3>
              <p className="text-sm mb-6" style={{ color: '#C1CFDA' }}>For corporate donors who need CSR proof</p>
              <div className="mb-8">
                <span className="text-5xl font-bold font-display" style={{ color: '#F4A22D' }}>₹499</span>
                <span className="text-sm ml-1" style={{ color: '#C1CFDA' }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm font-body">
                {['Unlimited listings', 'CSR-ready PDF reports', 'Verified donor badge', 'Analytics dashboard', 'Dedicated account support'].map(f => (
                  <li key={f} className="flex items-center gap-3" style={{ color: '#C1CFDA' }}>
                    <span style={{ color: '#F4A22D' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <button className="w-full py-3 rounded-xl font-display font-bold text-sm transition-all hover:opacity-80"
                  style={{ border: '1px solid rgba(244,162,45,0.4)', color: '#F4A22D' }}>
                  Get Daan Pro
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-28 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(32,164,243,0.08), transparent)',
        }} />
        <div className="max-w-3xl mx-auto relative">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
            The kitchen's quiet.
          </h2>
          <p className="font-accent text-4xl md:text-5xl mb-8" style={{ color: '#59F8E8' }}>
            But not for long.
          </p>
          <p className="font-body text-lg mb-12" style={{ color: '#C1CFDA' }}>
            Join 150+ organizations already passing the baton on food waste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button className="px-10 py-4 rounded-2xl font-display font-bold text-base transition-all hover:scale-105 hover:shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E', boxShadow: '0 0 30px rgba(32,164,243,0.3)' }}>
                Join the Relay — It's Free →
              </button>
            </Link>
            <Link to="/leaderboard">
              <button className="px-10 py-4 rounded-2xl font-display font-bold text-base transition-all hover:scale-105"
                style={{ border: '1px solid rgba(193,207,218,0.2)', color: '#C1CFDA', background: 'rgba(193,207,218,0.05)' }}>
                View Leaderboard
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: 'rgba(193,207,218,0.1)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E' }}>
              PR
            </div>
            <span className="font-display font-bold text-white">PlateRelay</span>
          </div>
          <p className="font-body text-sm text-center" style={{ color: 'rgba(193,207,218,0.5)' }}>
            Built for Hackprix 2026 · Every surplus meal finds its next table.
          </p>
          <div className="flex gap-6 text-sm font-body" style={{ color: 'rgba(193,207,218,0.5)' }}>
            <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
