import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatsCard } from '../../components/ui/StatsCard';
import useAuthStore from '../../store/authStore';

export default function RecipientDashboard() {
  const user = useAuthStore(state => state.user);

  // Mock data for hackathon demo
  const nearbyRelays = [
    { id: 1, food_name: 'Buffet Surplus - Rice & Dal', quantity: 40, unit: 'servings', distance: '2.4 km', expires_in: '1h 20m', donor: 'Royal Banquet' },
    { id: 2, food_name: 'Assorted Pastries', quantity: 15, unit: 'items', distance: '4.1 km', expires_in: '45m', donor: 'Bakers Street' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Good food is on its way.</h1>
          <p className="text-steel font-body mt-1">{user?.org_name || 'Shelter'} Dashboard</p>
        </div>
        <Link to="/recipient/browse">
          <Button variant="primary" className="shadow-lg shadow-azure/20">
            Browse Listings Map 🗺️
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Meals Received" value={420} icon="🍽️" />
        <StatsCard label="Claims This Month" value={2} icon="✅" />
        <Card className="p-6 bg-midnight/50 border-saffron/30 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-saffron text-midnight text-xs font-bold px-2 py-1 rounded-bl-lg">FREE PLAN</div>
          <p className="text-steel text-sm mb-1 font-body">Claims Remaining</p>
          <p className="text-3xl font-bold text-saffron">1 <span className="text-base font-normal text-steel">/ 3</span></p>
          <Link to="/recipient/upgrade" className="text-xs text-azure mt-2 hover:underline">Upgrade to Saathi →</Link>
        </Card>
        <StatsCard label="Partner Donors" value={5} icon="🏢" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display font-bold text-white">Nearby Right Now</h2>
          <Link to="/recipient/browse" className="text-azure text-sm hover:underline">View all on map</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearbyRelays.map(relay => (
            <Card key={relay.id} className="p-0 border-steel/20 bg-midnight/50 overflow-hidden flex flex-col sm:flex-row hover:border-azure/30 transition-all">
              <div className="w-full sm:w-48 h-48 bg-steel/10 flex items-center justify-center text-4xl border-r border-steel/10">
                🍛
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="active">Active</Badge>
                  <span className={`text-sm font-bold ${relay.expires_in.includes('45m') ? 'text-crimson' : 'text-cyan'}`}>
                    ⏱️ {relay.expires_in}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-display">{relay.food_name}</h3>
                <p className="text-steel text-sm font-body mb-2">From: {relay.donor}</p>
                
                <div className="mt-auto flex justify-between items-end">
                  <div>
                    <div className="text-lg font-bold text-white">{relay.quantity} <span className="text-sm font-normal text-steel">{relay.unit}</span></div>
                    <div className="text-sm text-steel">📍 {relay.distance} away</div>
                  </div>
                  <Button variant="primary" size="sm">Claim</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
