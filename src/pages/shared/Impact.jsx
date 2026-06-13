import React, { useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import anime from 'animejs';
import { Card } from '../../components/ui/Card';
import useAuthStore from '../../store/authStore';
import { useImpactSummary } from '../../api/impact';
import { Loader2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-sm">
        <p className="text-steel mb-1">{label}</p>
        <p className="text-azure font-bold">{payload[0].value} meals</p>
      </div>
    );
  }
  return null;
};

export default function Impact() {
  const user = useAuthStore(state => state.user);
  const isdonor = user?.role === 'donor';
  const { data: realStats, isLoading } = useImpactSummary();
  
  // Map real backend data to the component's expected structure, falling back to safe defaults
  const badgeMap = {
    first_relay:       { emoji: '🌱', title: 'First Relay',   glow: 'rgba(89,248,232,0.6)', desc: 'Completed your first food relay!' },
    hunger_hero:       { emoji: '🦸', title: 'Hunger Hero',   glow: 'rgba(244,162,45,0.6)', desc: '10 completed relays' },
    food_champion:     { emoji: '🏅', title: 'Food Champ',    glow: 'rgba(32,164,243,0.6)', desc: '25 completed relays' },
    platerelay_legend: { emoji: '🏆', title: 'Legend',         glow: 'rgba(148,28,47,0.6)', desc: '50 completed relays' },
    consistency_king:  { emoji: '👑', title: 'Consistency',    glow: 'rgba(244,162,45,0.6)', desc: '7 consecutive days' },
    community_pillar:  { emoji: '🏛️', title: 'Community',     glow: 'rgba(89,248,232,0.6)', desc: '10+ unique recipients' },
    century_club:      { emoji: '💯', title: 'Century Club',   glow: 'rgba(32,164,243,0.6)', desc: '100+ total meals donated' },
  };

  const userBadges = user?.badges || realStats?.badges || [];
  const allBadges = Object.entries(badgeMap).map(([key, meta]) => ({
    ...meta,
    earned: userBadges.some(b => (b.type || b.badge_type || b) === key),
  }));

  const stats = {
    total_meals: realStats?.total_meals_donated || realStats?.total_meals_received || 0,
    total_relays: realStats?.total_relays_posted || realStats?.total_relays_claimed || 0,
    total_claims: realStats?.total_relays_claimed || 0, // Specifically for recipients
    co2_kg_saved: realStats?.co2_kg_saved || 0,
    shelters_reached: realStats?.unique_recipients || realStats?.unique_donors || 0,
    monthly: realStats?.monthly || [
      { month: 'Jan', meals: 0 }, { month: 'Feb', meals: 0 }, { month: 'Mar', meals: 0 },
      { month: 'Apr', meals: 0 }, { month: 'May', meals: 0 }, { month: 'Jun', meals: 0 }
    ],
    top_partners: realStats?.top_partners || [],
    top_donors: realStats?.top_donors || [],
    badges: allBadges
  };
  const titleRef = useRef(null);

  useEffect(() => {
    anime({
      targets: '.impact-item',
      translateY: [30, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: 'easeOutExpo',
      duration: 800,
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="impact-item" style={{ opacity: 0 }}>
        <h1 className="text-4xl font-display font-bold text-white mb-2">Your Impact 🌍</h1>
        <p className="text-steel font-body">
          {isdonor
            ? "Every plate you rescued is a story of generosity."
            : "Every meal you collected helped someone sleep better tonight."}
        </p>
      </div>

      {/* Hero Stats */}
      <div className="impact-item grid grid-cols-2 md:grid-cols-4 gap-4" style={{ opacity: 0 }}>
        <Card className="text-center p-6 bg-gradient-to-br from-azure/20 to-midnight border-azure/30" hover={false}>
          <div className="text-4xl font-bold text-azure font-display">
            {stats.total_meals.toLocaleString()}
          </div>
          <div className="text-steel text-sm mt-1 font-body">Total Meals {isdonor ? 'Donated' : 'Received'}</div>
        </Card>

        <Card className="text-center p-6 bg-gradient-to-br from-cyan/20 to-midnight border-cyan/30" hover={false}>
          <div className="text-4xl font-bold text-cyan font-display">
            {isdonor ? stats.total_relays : stats.total_claims}
          </div>
          <div className="text-steel text-sm mt-1 font-body">Relays {isdonor ? 'Posted' : 'Claimed'}</div>
        </Card>

        {isdonor && (
          <>
            <Card className="text-center p-6 bg-gradient-to-br from-green-500/20 to-midnight border-green-500/30" hover={false}>
              <div className="text-4xl font-bold text-green-400 font-display">
                {stats.co2_kg_saved}
              </div>
              <div className="text-steel text-sm mt-1 font-body">kg CO₂ Saved</div>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-saffron/20 to-midnight border-saffron/30" hover={false}>
              <div className="text-4xl font-bold text-saffron font-display">
                {stats.shelters_reached}
              </div>
              <div className="text-steel text-sm mt-1 font-body">Shelters Reached</div>
            </Card>
          </>
        )}
      </div>

      {/* Monthly Chart */}
      <div className="impact-item" style={{ opacity: 0 }}>
        <Card className="p-6 border-steel/20" hover={false}>
          <h2 className="text-xl font-display font-bold text-white mb-6">Monthly Meals Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.monthly} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: '#C1CFDA', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#C1CFDA', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(193,207,218,0.05)' }} />
              <Bar dataKey="meals" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="meals" position="top" fill="#C1CFDA" fontSize={12} formatter={(val) => val > 0 ? val : ''} />
                {stats.monthly.map((_, index) => (
                  <Cell key={index} fill={index === stats.monthly.length - 1 ? '#59F8E8' : '#20A4F3'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Partners & Badges */}
      <div className="impact-item grid grid-cols-1 md:grid-cols-2 gap-6" style={{ opacity: 0 }}>
        {/* Partners */}
        <Card className="p-6 border-steel/20" hover={false}>
          <h2 className="text-xl font-display font-bold text-white mb-4">
            {isdonor ? '🤝 Top Recipient Partners' : '🏢 Top Donor Partners'}
          </h2>
          <div className="space-y-3">
            {(isdonor ? stats.top_partners : stats.top_donors).map((partner, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-azure/20 flex items-center justify-center text-azure font-bold text-sm">
                  {i + 1}
                </div>
                <span className="text-white font-body">{partner}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Badges (donor only) */}
        {isdonor && (
          <Card className="p-6 border-steel/20" hover={false}>
            <h2 className="text-xl font-display font-bold text-white mb-4">🏆 Badges Earned</h2>
            <div className="grid grid-cols-3 gap-3">
              {stats.badges.map(badge => (
                <div
                  key={badge.title}
                  title={badge.desc}
                  className={`text-center p-3 rounded-xl border transition-all ${
                    badge.earned
                      ? 'border-azure/30 bg-azure/5 hover:border-azure/60'
                      : 'border-steel/10 bg-steel/5 opacity-30 grayscale'
                  }`}
                >
                  <div className={`text-3xl mb-1 ${badge.earned ? 'drop-shadow-[0_0_8px_rgba(89,248,232,0.6)]' : ''}`}>
                    {badge.emoji}
                  </div>
                  <div className="text-xs font-bold text-white font-display leading-tight">{badge.title}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* CO2 Impact Callout (donor) */}
      {isdonor && (
        <div className="impact-item" style={{ opacity: 0 }}>
          <Card className="p-8 border-green-500/20 bg-gradient-to-r from-green-500/10 to-cyan/5" hover={false}>
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="text-6xl">🌱</div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  You've offset the equivalent of <span className="text-green-400">{Math.round(stats.co2_kg_saved / 2.5)} car trips</span>
                </h3>
                <p className="text-steel font-body">
                  Every kg of food rescued prevents approximately 2.5 kg of CO₂ from entering the atmosphere.
                  Your {stats.total_relays} relays have saved <strong className="text-cyan">{stats.co2_kg_saved} kg</strong> of CO₂.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
