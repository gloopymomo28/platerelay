import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatsCard } from '../../components/ui/StatsCard';
import useAuthStore from '../../store/authStore';

export default function DonorDashboard() {
  const user = useAuthStore(state => state.user);
  
  useEffect(() => {
    anime({
      targets: '.stagger-item',
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: 'easeOutExpo',
      duration: 800
    });
  }, []);

  // Mock data for hackathon demo
  const activeRelays = [
    { id: 1, food_name: 'Buffet Surplus - Rice & Dal', quantity: 40, unit: 'servings', expires_in: '1h 20m', status: 'active' },
    { id: 2, food_name: 'Assorted Bread & Pastries', quantity: 15, unit: 'items', expires_in: '45m', status: 'claimed' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome & Banner */}
      <div className="stagger-item flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Your kitchen, their lifeline.</h1>
          <p className="text-steel font-body mt-1">Welcome back, {user?.org_name || 'Donor'}</p>
        </div>
        <Link to="/donor/post">
          <Button variant="primary" className="shadow-lg shadow-azure/20 shadow-[0_0_15px_rgba(32,164,243,0.5)]">
            <span className="text-xl mr-2">+</span> Post a Relay
          </Button>
        </Link>
      </div>

      {/* Safety Warning */}
      <div className="stagger-item bg-crimson/10 border border-crimson/30 rounded-lg p-4 flex items-start gap-4">
        <span className="text-2xl">🌡️</span>
        <div>
          <h3 className="text-crimson font-bold font-display">Food Safety First</h3>
          <p className="text-steel text-sm font-body mt-1">
            Post only food prepared today, stored safely. Poor quality food endangers vulnerable people and may result in account suspension.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-item grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Total Meals Donated" value={145} icon="🍽️" />
        <StatsCard label="Active Relays" value={1} icon="⚡" />
        <StatsCard label="Shelters Reached" value={12} icon="🤝" />
        <StatsCard label="CO₂ Saved (kg)" value={45.2} icon="🌱" />
      </div>

      {/* Active Relays List */}
      <div className="stagger-item">
        <h2 className="text-2xl font-display font-bold text-white mb-4">Today's Relays</h2>
        
        {activeRelays.length === 0 ? (
          <Card className="p-12 text-center border-steel/20 bg-midnight/50">
            <div className="text-4xl mb-4">🍳</div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">The kitchen's quiet...</h3>
            <p className="text-steel mb-6 font-body">But not for long. Post your surplus food to notify nearby shelters.</p>
            <Link to="/donor/post"><Button variant="ghost">Post a Relay</Button></Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRelays.map(relay => (
              <Card key={relay.id} className="p-5 border-steel/20 bg-midnight/50 hover:border-azure/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={relay.status === 'active' ? 'success' : 'warning'}>
                    {relay.status === 'active' ? 'ACTIVE' : 'CLAIMED'}
                  </Badge>
                  <span className={`text-sm font-bold ${relay.expires_in.includes('45m') ? 'text-crimson' : 'text-cyan'}`}>
                    ⏱️ {relay.expires_in}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-display mb-1">{relay.food_name}</h3>
                <p className="text-steel text-sm font-body mb-4">{relay.quantity} {relay.unit}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-steel/10">
                  <span className="text-xs text-steel font-body group-hover:text-azure transition-colors cursor-pointer">
                    View Details →
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rewards Showcase */}
      <div className="stagger-item pt-8">
        <h2 className="text-2xl font-display font-bold text-white mb-4">Your Impact Badges</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          <div className="text-center p-4 bg-steel/5 border border-steel/20 rounded-lg min-w-[120px]">
            <div className="text-4xl mb-2 drop-shadow-[0_0_10px_rgba(89,248,232,0.8)]">🌱</div>
            <div className="text-sm font-bold text-cyan font-display">First Relay</div>
          </div>
          <div className="text-center p-4 bg-steel/5 border border-steel/20 rounded-lg min-w-[120px]">
            <div className="text-4xl mb-2 drop-shadow-[0_0_10px_rgba(244,162,45,0.8)]">🦸</div>
            <div className="text-sm font-bold text-saffron font-display">Hunger Hero</div>
          </div>
          <div className="text-center p-4 bg-steel/5 border border-steel/20 rounded-lg min-w-[120px] opacity-40 grayscale">
            <div className="text-4xl mb-2">🏅</div>
            <div className="text-sm font-bold text-steel font-display">Food Champ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
