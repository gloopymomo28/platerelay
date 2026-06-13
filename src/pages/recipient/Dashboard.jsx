import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Loader2 } from 'lucide-react';
import anime from 'animejs';
import useAuthStore from '../../store/authStore';
import { useImpactSummary } from '../../api/impact';

export default function RecipientDashboard() {
  const user = useAuthStore(state => state.user);

  // ── Fetch real data from API ──
  const { data: impactData, isLoading } = useImpactSummary();

  const totalMeals = impactData?.total_meals_received ?? 0;
  const totalClaims = impactData?.total_relays_claimed ?? 0;
  const partnerDonors = impactData?.unique_donors ?? 0;

  const subscription = user?.subscription || {};
  const planName = (subscription.plan || 'free').charAt(0).toUpperCase() + (subscription.plan || 'free').slice(1);
  const claimsThisMonth = user?.claims_this_month ?? 0;
  const claimLimit = planName === 'Free' ? 3 : planName === 'Saathi' ? 30 : 999;
  const claimsRemaining = Math.max(0, claimLimit - claimsThisMonth);

  const stats = [
    { label: 'Meals Received', value: totalMeals.toLocaleString(), icon: '🍽️', color: '#20A4F3', sub: 'all-time' },
    { label: 'Claims This Month', value: claimsThisMonth.toString(), icon: '✅', color: '#59F8E8', sub: `${claimsRemaining} remaining` },
    { label: 'Plan', value: planName, icon: '⭐', color: '#F4A22D', sub: planName === 'Free' ? 'Upgrade to Saathi' : 'Active' },
    { label: 'Partner Donors', value: partnerDonors.toString(), icon: '🏢', color: '#4ade80', sub: 'active' },
  ];

  useEffect(() => {
    anime({
      targets: '.rdash-item',
      translateY: [24, 0],
      opacity: [0, 1],
      delay: anime.stagger(80),
      easing: 'easeOutExpo',
      duration: 700,
    });
  }, [isLoading]);

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
                {user?.org_name || 'Shelter'}
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
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : stat.value}
              </div>
              <div className="text-sm font-body text-white mb-1">{stat.label}</div>
              <div className="text-xs font-body" style={{ color: 'rgba(193,207,218,0.4)' }}>
                {stat.label === 'Plan' && planName === 'Free' ? (
                  <Link to="/recipient/upgrade" style={{ color: '#20A4F3' }} className="hover:underline">
                    {stat.sub} →
                  </Link>
                ) : stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── Plan / Claim notice ── */}
        <div className="rdash-item opacity-0 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'rgba(244,162,45,0.06)', border: '1px solid rgba(244,162,45,0.2)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(244,162,45,0.15)' }}>⭐</div>
            <div>
              <div className="font-display font-bold text-white text-sm">
                {claimsRemaining > 0
                  ? `You have ${claimsRemaining} claim${claimsRemaining !== 1 ? 's' : ''} remaining this month`
                  : 'You have used all your claims this month'}
              </div>
              <div className="text-xs font-body mt-0.5" style={{ color: 'rgba(193,207,218,0.6)' }}>
                {planName} plan: {claimLimit} claims/month
              </div>
            </div>
          </div>
          {planName === 'Free' && (
            <Link to="/recipient/upgrade">
              <button className="px-5 py-2.5 rounded-xl font-display font-bold text-sm flex-shrink-0 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #F4A22D, #f59e0b)', color: '#03191E' }}>
                Upgrade to Saathi →
              </button>
            </Link>
          )}
        </div>

        {/* ── Browse CTA ── */}
        <div className="rdash-item opacity-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-display font-bold text-white">Find Food Nearby</h2>
            <Link to="/recipient/browse" className="flex items-center gap-1 text-sm font-body transition-colors hover:text-white"
              style={{ color: '#20A4F3' }}>
              View map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl p-16 text-center"
            style={{ background: 'rgba(193,207,218,0.03)', border: '1px dashed rgba(193,207,218,0.15)' }}>
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-white font-display mb-2">Browse available food near you</h3>
            <p className="font-body mb-6" style={{ color: '#C1CFDA' }}>Check the food map to see what's available from nearby donors.</p>
            <Link to="/recipient/browse">
              <button className="px-6 py-3 rounded-xl font-display font-bold text-sm transition-all hover:opacity-80"
                style={{ border: '1px solid rgba(244,162,45,0.4)', color: '#F4A22D' }}>
                Open Food Map
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
