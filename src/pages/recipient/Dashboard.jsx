import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import anime from 'animejs';
import useAuthStore from '../../store/authStore';

const nearbyRelays = [
  { id: 1, food_name: 'Buffet Surplus — Rice & Dal', quantity: 40, unit: 'servings', distance: '2.4 km', expires_in: '1h 20m', donor: 'Royal Banquet', urgency: 'low', emoji: '🍛' },
  { id: 2, food_name: 'Assorted Pastries', quantity: 15, unit: 'items', distance: '4.1 km', expires_in: '45m', donor: 'Bakers Street', urgency: 'high', emoji: '🥐' },
];

const stats = [
  { label: 'Meals Received', value: '420', icon: '🍽️', color: '#20A4F3', sub: 'all-time' },
  { label: 'Claims This Month', value: '2', icon: '✅', color: '#59F8E8', sub: '1 more left (free)' },
  { label: 'Plan', value: 'Free', icon: '⭐', color: '#F4A22D', sub: 'Upgrade to Saathi' },
  { label: 'Partner Donors', value: '5', icon: '🏢', color: '#4ade80', sub: 'active' },
];

export default function RecipientDashboard() {
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    anime({
      targets: '.rdash-item',
      translateY: [24, 0],
      opacity: [0, 1],
      delay: anime.stagger(80),
      easing: 'easeOutExpo',
      duration: 700,
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #03191E 0%, #041f26 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Welcome ── */}
        <div className="rdash-item opacity-0 relative rounded-3xl overflow-hidden p-8 md:p-10"
          style={{ background: 'linear-gradient(135deg, rgba(244,162,45,0.12) 0%, rgba(89,248,232,0.06) 60%, transparent)', border: '1px solid rgba(244,162,45,0.2)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10"
            style={{ background: 'radial-gradient(circle, #F4A22D, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm font-body mb-2" style={{ color: '#F4A22D' }}>Welcome back,</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {user?.org_name || 'Shelter'} 🤝
              </h1>
              <p className="font-body" style={{ color: '#C1CFDA' }}>Good food is on its way to you.</p>
            </div>
            <Link to="/recipient/browse">
              <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-display font-bold text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #F4A22D, #f59e0b)', color: '#03191E', boxShadow: '0 0 24px rgba(244,162,45,0.3)' }}>
                <MapPin className="w-4 h-4" />
                Browse Food Map
              </button>
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="rdash-item opacity-0 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-2xl p-5 transition-all hover:-translate-y-1"
              style={{ background: 'rgba(193,207,218,0.04)', border: '1px solid rgba(193,207,218,0.08)' }}>
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold font-display mb-0.5" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-sm font-body text-white mb-1">{stat.label}</div>
              <div className="text-xs font-body" style={{ color: 'rgba(193,207,218,0.4)' }}>
                {stat.label === 'Plan' ? (
                  <Link to="/recipient/upgrade" style={{ color: '#20A4F3' }} className="hover:underline">
                    {stat.sub} →
                  </Link>
                ) : stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── Free tier notice ── */}
        <div className="rdash-item opacity-0 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'rgba(244,162,45,0.06)', border: '1px solid rgba(244,162,45,0.2)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(244,162,45,0.15)' }}>⭐</div>
            <div>
              <div className="font-display font-bold text-white text-sm">You have 1 claim remaining this month</div>
              <div className="text-xs font-body mt-0.5" style={{ color: 'rgba(193,207,218,0.6)' }}>
                Free plan: 3 claims/month · Resets July 1st
              </div>
            </div>
          </div>
          <Link to="/recipient/upgrade">
            <button className="px-5 py-2.5 rounded-xl font-display font-bold text-sm flex-shrink-0 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #F4A22D, #f59e0b)', color: '#03191E' }}>
              Upgrade to Saathi →
            </button>
          </Link>
        </div>

        {/* ── Nearby Right Now ── */}
        <div className="rdash-item opacity-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-display font-bold text-white">Nearby Right Now</h2>
            <Link to="/recipient/browse" className="flex items-center gap-1 text-sm font-body transition-colors hover:text-white"
              style={{ color: '#20A4F3' }}>
              View map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyRelays.map(relay => (
              <div key={relay.id} className="rounded-2xl overflow-hidden flex flex-col sm:flex-row group cursor-pointer transition-all hover:-translate-y-1"
                style={{ background: 'rgba(193,207,218,0.04)', border: '1px solid rgba(193,207,218,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(32,164,243,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(193,207,218,0.08)'}
              >
                {/* Photo placeholder */}
                <div className="w-full sm:w-40 h-40 sm:h-auto flex items-center justify-center text-5xl flex-shrink-0"
                  style={{ background: 'rgba(193,207,218,0.06)', borderRight: '1px solid rgba(193,207,218,0.08)' }}>
                  {relay.emoji}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold font-display px-2 py-1 rounded-full"
                      style={{ background: 'rgba(89,248,232,0.15)', color: '#59F8E8' }}>● ACTIVE</span>
                    <span className="text-xs font-bold flex items-center gap-1"
                      style={{ color: relay.urgency === 'high' ? '#f87171' : '#59F8E8' }}>
                      ⏱ {relay.expires_in}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-display leading-tight mb-1">{relay.food_name}</h3>
                  <p className="text-xs font-body mb-3" style={{ color: 'rgba(193,207,218,0.5)' }}>From: {relay.donor}</p>
                  <div className="mt-auto flex justify-between items-end">
                    <div>
                      <div className="text-lg font-bold text-white">{relay.quantity} <span className="text-sm font-normal" style={{ color: 'rgba(193,207,218,0.6)' }}>{relay.unit}</span></div>
                      <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'rgba(193,207,218,0.5)' }}>
                        <MapPin className="w-3 h-3" /> {relay.distance} away
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-xl font-display font-bold text-xs transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E' }}>
                      Claim Food
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
