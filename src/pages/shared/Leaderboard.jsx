import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatsCard } from '../../components/ui/StatsCard';

export default function Leaderboard() {
  // Mock data for hackathon demo
  const topDonors = [
    { id: 1, org_name: "Royal Banquet", city: "Bangalore", meals: 2500, relays: 142, badges: ['First Relay', 'Hunger Hero', 'Food Champion', 'PlateRelay Legend'] },
    { id: 2, org_name: "FreshMart Produce", city: "Mumbai", meals: 1850, relays: 95, badges: ['First Relay', 'Hunger Hero', 'Food Champion'] },
    { id: 3, org_name: "Bakers Street", city: "Delhi", meals: 1200, relays: 88, badges: ['First Relay', 'Hunger Hero', 'Consistency King'] },
    { id: 4, org_name: "TechCorp Cafeteria", city: "Pune", meals: 950, relays: 45, badges: ['First Relay', 'Hunger Hero'] },
    { id: 5, org_name: "Green Leaf Caterers", city: "Hyderabad", meals: 820, relays: 30, badges: ['First Relay', 'Hunger Hero'] }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-4">Top Food Donors 🏆</h1>
        <p className="text-steel font-body max-w-2xl mx-auto">
          These organizations are leading the charge against food waste and hunger in our communities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 bg-gradient-to-b from-saffron/20 to-midnight border-saffron/50 text-center transform scale-105 shadow-xl shadow-saffron/10 z-10">
          <div className="text-4xl mb-2">🥇</div>
          <h2 className="text-2xl font-bold text-white font-display mb-1">{topDonors[0].org_name}</h2>
          <p className="text-steel mb-4">{topDonors[0].city}</p>
          <div className="text-3xl font-bold text-saffron mb-4">{topDonors[0].meals} <span className="text-sm font-normal text-steel">meals</span></div>
          <div className="flex justify-center gap-1">
            {topDonors[0].badges.map(badge => (
              <span key={badge} className="text-xl" title={badge}>🏅</span>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-b from-steel/20 to-midnight border-steel/50 text-center flex flex-col justify-end">
          <div className="text-4xl mb-2">🥈</div>
          <h2 className="text-xl font-bold text-white font-display mb-1">{topDonors[1].org_name}</h2>
          <p className="text-steel text-sm mb-4">{topDonors[1].city}</p>
          <div className="text-2xl font-bold text-steel mb-4">{topDonors[1].meals} <span className="text-sm font-normal text-steel">meals</span></div>
        </Card>

        <Card className="p-6 bg-gradient-to-b from-azure/20 to-midnight border-azure/50 text-center flex flex-col justify-end">
          <div className="text-4xl mb-2">🥉</div>
          <h2 className="text-xl font-bold text-white font-display mb-1">{topDonors[2].org_name}</h2>
          <p className="text-steel text-sm mb-4">{topDonors[2].city}</p>
          <div className="text-2xl font-bold text-azure mb-4">{topDonors[2].meals} <span className="text-sm font-normal text-steel">meals</span></div>
        </Card>
      </div>

      <Card className="p-0 border-steel/20 bg-midnight/50 overflow-hidden">
        <table className="w-full text-left font-body">
          <thead className="bg-steel/10 border-b border-steel/20 text-steel">
            <tr>
              <th className="p-4 font-bold">Rank</th>
              <th className="p-4 font-bold">Organization</th>
              <th className="p-4 font-bold">Meals Donated</th>
              <th className="p-4 font-bold">Relays Completed</th>
              <th className="p-4 font-bold">Badges</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel/10">
            {topDonors.map((donor, index) => (
              <tr key={donor.id} className="hover:bg-steel/5 transition-colors">
                <td className="p-4 font-bold text-steel">#{index + 1}</td>
                <td className="p-4">
                  <div className="font-bold text-white font-display">{donor.org_name}</div>
                  <div className="text-xs text-steel">{donor.city}</div>
                </td>
                <td className="p-4 font-bold text-cyan">{donor.meals}</td>
                <td className="p-4 text-steel">{donor.relays}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {donor.badges.map(b => <span key={b} title={b}>🏅</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
