import React, { useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import anime from 'animejs';
import { Card } from '../../components/ui/Card';
import useAuthStore from '../../store/authStore';

// Mock data — would come from /api/impact/summary in production
const DONOR_STATS = {
  total_meals: 1240,
  total_relays: 58,
  co2_kg_saved: 372.0,
  shelters_reached: 14,
  monthly: [
    { month: 'Jan', meals: 80 },
    { month: 'Feb', meals: 120 },
    { month: 'Mar', meals: 190 },
    { month: 'Apr', meals: 150 },
    { month: 'May', meals: 210 },
    { month: 'Jun', meals: 240 },
  ],
  top_partners: ['Hope Shelter', "St. Mary's Home", 'Green Valley NGO', 'City Food Bank'],
  badges: [
    { emoji: '🌱', title: 'First Relay', desc: 'Posted your first relay', earned: true },
    { emoji: '🦸', title: 'Hunger Hero', desc: 'Donated 100+ meals', earned: true },
    { emoji: '🏅', title: 'Food Champion', desc: 'Donated 500+ meals', earned: true },
    { emoji: '🏆', title: 'PlateRelay Legend', desc: 'Donated 1000+ meals', earned: true },
    { emoji: '⚡', title: 'Speed Feeder', desc: 'Posted relay with <30m claim time', earned: false },
    { emoji: '🌍', title: 'Zero Waste Hero', desc: 'Zero expired relays for 30 days', earned: false },
  ],
};

const RECIPIENT_STATS = {
  total_meals: 3820,
  total_claims: 47,
  top_donors: ['Royal Banquet', 'Bakers Street', 'TechCorp Cafeteria'],
  monthly: [
    { month: 'Jan', meals: 400 },
    { month: 'Feb', meals: 620 },
    { month: 'Mar', meals: 720 },
    { month: 'Apr', meals: 580 },
    { month: 'May', meals: 810 },
    { month: 'Jun', meals: 690 },
  ],
};

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
  const stats = isdonor ? DONOR_STATS : RECIPIENT_STATS;
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
