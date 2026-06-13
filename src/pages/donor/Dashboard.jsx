import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Clock, Loader2 } from 'lucide-react';
import anime from 'animejs';
import useAuthStore from '../../store/authStore';
import { useMyRelays } from '../../api/relays';
import { useImpactSummary } from '../../api/impact';

export default function DonorDashboard() {
  const user = useAuthStore(state => state.user);

  // ── Fetch real data from API ──
  const { data: impactData, isLoading: impactLoading } = useImpactSummary();
  const { data: relaysData, isLoading: relaysLoading } = useMyRelays();

  const activeRelays = (relaysData?.relays || []).filter(
    r => r.status === 'active' || r.status === 'claimed'
  );

  const totalMeals = impactData?.total_meals ?? user?.total_meals ?? 0;
  const totalRelays = impactData?.total_relays ?? user?.total_relays ?? 0;
  const sheltersReached = impactData?.shelters_reached ?? 0;
  const co2Saved = impactData?.co2_kg_saved ?? user?.co2_saved ?? 0;

  const stats = [
    { label: 'Meals Donated', value: totalMeals.toLocaleString(), icon: '🍽️', color: '#20A4F3', sub: 'all-time' },
    { label: 'Active Relays', value: activeRelays.length.toString(), icon: '⚡', color: '#59F8E8', sub: `${activeRelays.filter(r => r.status === 'claimed').length} claimed` },
    { label: 'Shelters Reached', value: sheltersReached.toString(), icon: '🤝', color: '#F4A22D', sub: 'all-time' },
    { label: 'CO₂ Saved (kg)', value: Math.round(co2Saved).toLocaleString(), icon: '🌱', color: '#4ade80', sub: 'equivalent' },
  ];

  const userBadges = user?.badges || impactData?.badges || [];
  const badgeMap = {
    first_relay:       { emoji: '🌱', title: 'First Relay',   glow: 'rgba(89,248,232,0.6)' },
    hunger_hero:       { emoji: '🦸', title: 'Hunger Hero',   glow: 'rgba(244,162,45,0.6)' },
    food_champion:     { emoji: '🏅', title: 'Food Champ',    glow: 'rgba(32,164,243,0.6)' },
    platerelay_legend: { emoji: '🏆', title: 'Legend',         glow: 'rgba(148,28,47,0.6)' },
    consistency_king:  { emoji: '👑', title: 'Consistency',    glow: 'rgba(244,162,45,0.6)' },
    community_pillar:  { emoji: '🏛️', title: 'Community',     glow: 'rgba(89,248,232,0.6)' },
    century_club:      { emoji: '💯', title: 'Century Club',   glow: 'rgba(32,164,243,0.6)' },
  };

  const allBadges = Object.entries(badgeMap).map(([key, meta]) => ({
    ...meta,
    earned: userBadges.some(b => (b.badge_type || b) === key),
  }));

  useEffect(() => {
    anime({
      targets: '.dash-item',
      translateY: [24, 0],
      opacity: [0, 1],
      delay: anime.stagger(80),
      easing: 'easeOutExpo',
      duration: 700,
    });
  }, [impactLoading, relaysLoading]);

  const isLoading = impactLoading || relaysLoading;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #03191E 0%, #041f26 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Welcome Banner ── */}
        <div className="dash-item opacity-0 relative rounded-3xl overflow-hidden p-8 md:p-10"
          style={{ background: 'linear-gradient(135deg, rgba(32,164,243,0.15) 0%, rgba(89,248,232,0.08) 50%, rgba(3,25,30,0) 100%)', border: '1px solid rgba(32,164,243,0.2)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10"
            style={{ background: 'radial-gradient(circle, #59F8E8, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm font-body mb-2" style={{ color: '#20A4F3' }}>Welcome back,</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {user?.org_name || 'Food Donor'}
              </h1>
              <p className="font-body" style={{ color: '#C1CFDA' }}>Your kitchen is someone's lifeline tonight.</p>
            </div>
            <Link to="/donor/post">
              <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-display font-bold text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #20A4F3, #59F8E8)', color: '#03191E', boxShadow: '0 0 24px rgba(32,164,243,0.3)' }}>
                <Plus className="w-4 h-4" />
                Post a Relay
              </button>
            </Link>
          </div>
        </div>

        {/* ── Safety Warning ── */}
        <div className="dash-item opacity-0 rounded-2xl p-4 flex items-start gap-4"
          style={{ background: 'rgba(148,28,47,0.08)', border: '1px solid rgba(148,28,47,0.25)' }}>
          <span className="text-xl flex-shrink-0 mt-0.5">🌡️</span>
          <div>
            <h3 className="font-display font-bold text-sm mb-0.5" style={{ color: '#f87171' }}>Food Safety Reminder</h3>
            <p className="font-body text-sm" style={{ color: 'rgba(193,207,218,0.7)' }}>
              Post only food prepared today, stored safely, and that you'd serve to a paying guest. Poor quality endangers vulnerable people.
            </p>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="dash-item opacity-0 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-2xl p-5 transition-all hover:-translate-y-1"
              style={{ background: 'rgba(193,207,218,0.04)', border: '1px solid rgba(193,207,218,0.08)' }}>
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold font-display mb-0.5" style={{ color: stat.color }}>
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : stat.value}
              </div>
              <div className="text-sm font-body text-white mb-1">{stat.label}</div>
              <div className="text-xs font-body" style={{ color: 'rgba(193,207,218,0.4)' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Today's Relays ── */}
        <div className="dash-item opacity-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-display font-bold text-white">Your Active Relays</h2>
            <Link to="/donor/relays" className="flex items-center gap-1 text-sm font-body transition-colors hover:text-white"
              style={{ color: '#20A4F3' }}>
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {relaysLoading ? (
            <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(193,207,218,0.03)', border: '1px dashed rgba(193,207,218,0.15)' }}>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#20A4F3' }} />
              <p className="font-body" style={{ color: '#C1CFDA' }}>Loading your relays...</p>
            </div>
          ) : activeRelays.length === 0 ? (
            <div className="rounded-2xl p-16 text-center"
              style={{ background: 'rgba(193,207,218,0.03)', border: '1px dashed rgba(193,207,218,0.15)' }}>
              <div className="text-5xl mb-4">🍳</div>
              <h3 className="text-xl font-bold text-white font-display mb-2">No active relays yet</h3>
              <p className="font-body mb-6" style={{ color: '#C1CFDA' }}>Post your surplus food to notify nearby shelters instantly.</p>
              <Link to="/donor/post">
                <button className="px-6 py-3 rounded-xl font-display font-bold text-sm transition-all hover:opacity-80"
                  style={{ border: '1px solid rgba(32,164,243,0.4)', color: '#20A4F3' }}>
                  Post a Relay
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRelays.map(relay => (
                <div key={relay.id || relay._id} className="rounded-2xl p-5 group transition-all hover:-translate-y-1 cursor-pointer"
                  style={{ background: 'rgba(193,207,218,0.04)', border: '1px solid rgba(193,207,218,0.08)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(32,164,243,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(193,207,218,0.08)'}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold font-display"
                      style={relay.status === 'active'
                        ? { background: 'rgba(89,248,232,0.15)', color: '#59F8E8' }
                        : { background: 'rgba(32,164,243,0.15)', color: '#20A4F3' }}>
                      {relay.status === 'active' ? '● ACTIVE' : '● CLAIMED'}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#59F8E8' }}>
                      <Clock className="w-3 h-3" />
                      {relay.expires_in || 'N/A'}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white font-display mb-1 leading-tight">{relay.food_name}</h3>
                  <p className="text-sm font-body" style={{ color: 'rgba(193,207,218,0.6)' }}>{relay.quantity} {relay.unit}</p>
                  <div className="mt-4 pt-4 border-t flex items-center text-xs font-body transition-colors"
                    style={{ borderColor: 'rgba(193,207,218,0.08)', color: 'rgba(193,207,218,0.4)' }}>
                    <span className="group-hover:text-azure transition-colors">View details →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Badges ── */}
        <div className="dash-item opacity-0">
          <h2 className="text-2xl font-display font-bold text-white mb-4">Impact Badges</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {allBadges.map(badge => (
              <div key={badge.title}
                className={`flex-shrink-0 text-center p-5 rounded-2xl transition-all ${badge.earned ? 'hover:-translate-y-1' : 'opacity-30 grayscale'}`}
                style={{ background: 'rgba(193,207,218,0.04)', border: '1px solid rgba(193,207,218,0.08)', minWidth: '110px' }}>
                <div className="text-4xl mb-2" style={badge.earned ? { filter: `drop-shadow(0 0 10px ${badge.glow})` } : {}}>
                  {badge.emoji}
                </div>
                <div className="text-xs font-bold font-display text-white">{badge.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
