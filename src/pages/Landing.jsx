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
    if (initialized && user) {
      if (user.role === 'donor') {
        navigate('/donor/dashboard', { replace: true });
      } else if (user.role === 'recipient') {
        navigate('/recipient/dashboard', { replace: true });
      }
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
            Because leftovers<br />
            deserve a<br />
            <span style={{
              background: 'linear-gradient(135deg, #FF7A00 0%, #FF5200 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              paddingRight: '0.1em'
            }}>
              standing ovation
            </span>
          </>
        }
        description="PlateRelay connects restaurants, events, and individuals with surplus, delicious meals to communities in need. Reduce waste, feed hope—seamlessly."
        images={[
          {
            src: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format&fit=crop',
            alt: 'Biryani in a traditional pot',
            className: 'w-32 sm:w-48 lg:w-56 top-[15%] left-[5%] md:top-[10%] md:left-[10%] animate-float rounded-full object-cover aspect-square',
            style: { border: '3px solid #FF9800', boxShadow: '0 0 30px rgba(255,152,0,0.5)' }
          },
          {
            src: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=400&auto=format&fit=crop',
            alt: 'Palak Paneer',
            className: 'w-32 sm:w-48 lg:w-56 top-[15%] right-[5%] md:top-[10%] md:right-[10%] animate-float rounded-full object-cover aspect-square',
            style: { border: '3px solid #00E5FF', boxShadow: '0 0 30px rgba(0,229,255,0.4)', animationDelay: '1s' }
          },
          {
            src: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop',
            alt: 'Naan bread and curry',
            className: 'w-40 sm:w-56 lg:w-64 top-1/2 -translate-y-[40%] left-0 md:left-[2%] animate-float rounded-full object-cover aspect-square',
            style: { border: '3px solid #FF5722', boxShadow: '0 0 35px rgba(255,87,34,0.5)', animationDelay: '2s' }
          },
          {
            src: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=400&auto=format&fit=crop',
            alt: 'Tandoori Chicken',
            className: 'w-36 sm:w-52 lg:w-60 top-1/2 -translate-y-[20%] right-0 md:right-[2%] animate-float rounded-full object-cover aspect-square',
            style: { border: '3px solid #FF3D00', boxShadow: '0 0 35px rgba(255,61,0,0.5)', animationDelay: '1.5s' }
          },
          {
            src: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=400&auto=format&fit=crop',
            alt: 'Green dish',
            className: 'w-24 sm:w-32 lg:w-40 bottom-[10%] left-[25%] md:left-[30%] animate-float rounded-full object-cover aspect-square',
            style: { border: '3px solid #00BFA5', boxShadow: '0 0 25px rgba(0,191,165,0.5)', animationDelay: '2.5s' }
          },
          {
            src: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop',
            alt: 'Samosas',
            className: 'w-24 sm:w-32 lg:w-40 bottom-[10%] right-[25%] md:right-[30%] animate-float rounded-full object-cover aspect-square',
            style: { border: '3px solid #FFB300', boxShadow: '0 0 25px rgba(255,179,0,0.5)', animationDelay: '0.5s' }
          },
        ]}
      >
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
          <Link to="/register">
            <button className="group relative px-8 py-3.5 rounded-full font-body font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #FF7A00, #EA580C)', boxShadow: '0 0 20px rgba(234,88,12,0.5)' }}>
              <span className="relative z-10 flex items-center gap-2">
                Start Donating
                <span className="group-hover:translate-x-1 transition-transform inline-block">›</span>
              </span>
            </button>
          </Link>
          <Link to="/register">
            <button className="px-8 py-3.5 rounded-full font-body font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(15,118,110,0.4)', border: '1px solid #14B8A6', boxShadow: '0 0 20px rgba(20,184,166,0.3)' }}>
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
      <section className="py-24 px-4 bg-midnight">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">How PlateRelay Works</h2>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-32">
            {[
              {
                label: 'surplus food',
                color: '#FF7A00',
                icon: (
                  <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FF7A00' }}>
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    <path d="M6 12v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    <path d="M4 12h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z" />
                  </svg>
                )
              },
              {
                label: 'rescue',
                color: '#FF7A00',
                icon: (
                  <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FF7A00' }}>
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M12 22v-7" />
                    <path d="M9 19h6" />
                  </svg>
                )
              },
              {
                label: 'delivery',
                color: '#00E5FF',
                icon: (
                  <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#00E5FF' }}>
                    <circle cx="7" cy="17" r="2" />
                    <circle cx="17" cy="17" r="2" />
                    <path d="M5 17H3v-6l2-5h9v11h-2" />
                    <path d="M14 17h-1" />
                    <path d="M14 6h4l3 5v6h-2" />
                  </svg>
                )
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                {item.icon}
                <div className="text-xl font-display font-medium text-white">{item.label}</div>
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
          <div className="flex items-center gap-3">
            <img src="/pr-logo-new.png" alt="PlateRelay Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(255,122,0,0.3)]" />
            <span className="font-display font-bold text-xl text-white">PlateRelay</span>
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
