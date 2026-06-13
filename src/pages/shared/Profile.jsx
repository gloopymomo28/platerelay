import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import anime from 'animejs';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import { useImpactSummary } from '../../api/impact';
import { useMyRelays, useClaimedRelays } from '../../api/relays';

// Mock data — in production this would be fetched from /api/profiles/:id
const getProfileData = (userId) => ({
  _id: userId || 'mock-id',
  org_name: 'Royal Banquet Hall',
  contact_name: 'Arjun Sharma',
  role: 'donor',
  city: 'Bangalore',
  state: 'Karnataka',
  verification_status: 'verified',
  subscription: { plan: 'daan_pro' },
  created_at: '2024-09-15T00:00:00Z',
  stats: {
    total_meals: 2500,
    total_relays: 142,
    shelters_reached: 18,
    co2_kg_saved: 750,
  },
  badges: [
    { emoji: '🌱', title: 'First Relay', earned: true },
    { emoji: '🦸', title: 'Hunger Hero', earned: true },
    { emoji: '🏅', title: 'Food Champion', earned: true },
    { emoji: '🏆', title: 'PlateRelay Legend', earned: true },
  ],
  recent_relays: [
    { id: '1', food_name: 'Buffet Surplus — Rice & Dal', meals: 40, date: '2026-06-12', status: 'completed' },
    { id: '2', food_name: 'Assorted Bread & Pastries', meals: 15, date: '2026-06-10', status: 'completed' },
    { id: '3', food_name: 'Biryani (Mixed)', meals: 60, date: '2026-06-08', status: 'completed' },
  ],
});

const roleLabel = { donor: 'Food Donor', recipient: 'Shelter / NGO', admin: 'Admin' };
const planLabel = { free: 'Free', saathi: 'Saathi Plan', daan_pro: 'Daan Pro' };

export default function Profile() {
  const { id } = useParams();
  const currentUser = useAuthStore(state => state.user);

  const { data: impactData } = useImpactSummary();
  const { data: donorRelaysData } = useMyRelays();
  const { data: recipientRelaysData } = useClaimedRelays();
  const relaysData = currentUser?.role === 'recipient' ? recipientRelaysData : donorRelaysData;

  // Real stats from the backend
  const profile = currentUser ? { 
        ...currentUser,
        stats: {
          total_meals: impactData?.total_meals_donated || impactData?.total_meals_received || 0,
          total_relays: currentUser.role === 'donor' ? (impactData?.total_relays_posted || 0) : (impactData?.total_relays_claimed || 0),
          shelters_reached: impactData?.unique_recipients || impactData?.unique_donors || 0,
          co2_kg_saved: impactData?.co2_kg_saved || 0,
        },
        badges: impactData?.badges || currentUser.badges || [],
        recent_relays: (relaysData?.relays || []).filter(r => r.status === 'completed' || r.status === 'claimed').slice(0, 5),
        city: currentUser.address?.city || 'City not set',
        state: currentUser.address?.state || 'State not set'
      } : null;

  useEffect(() => {
    if (profile) {
      anime({
        targets: '.profile-item',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        easing: 'easeOutExpo',
        duration: 700,
      });
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin text-azure text-4xl">🌍</div>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Profile Header */}
      <Card className="profile-item p-8 border-steel/20 bg-gradient-to-br from-azure/10 to-midnight overflow-hidden relative" hover={false} style={{ opacity: 0 }}>
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-azure/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-azure to-cyan flex items-center justify-center text-midnight text-4xl font-bold font-display shadow-lg shadow-azure/30 flex-shrink-0">
            {profile.org_name?.[0] || 'P'}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-3xl font-display font-bold text-white">{profile.org_name}</h1>
              {profile.verification_status === 'verified' && (
                <span className="text-cyan text-xl" title="Verified">✅</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={profile.role}>{roleLabel[profile.role] || profile.role}</Badge>
              {profile.subscription?.plan !== 'free' && (
                <Badge variant={profile.subscription.plan}>
                  {planLabel[profile.subscription.plan]}
                </Badge>
              )}
              <Badge variant="pending" size="xs">📍 {profile.city}, {profile.state}</Badge>
            </div>

            <p className="text-steel text-sm font-body">Member since {memberSince}</p>
          </div>

          {isOwnProfile && (
            <Link to={`/${currentUser?.role === 'donor' ? 'donor' : 'recipient'}/dashboard`}>
              <Button variant="ghost" size="sm">← Back to Dashboard</Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="profile-item grid grid-cols-2 md:grid-cols-4 gap-4" style={{ opacity: 0 }}>
        {[
          { label: 'Meals Donated', value: profile.stats.total_meals.toLocaleString(), color: 'text-azure' },
          { label: 'Relays Completed', value: profile.stats.total_relays, color: 'text-cyan' },
          { label: 'Shelters Reached', value: profile.stats.shelters_reached, color: 'text-saffron' },
          { label: 'CO₂ Saved (kg)', value: profile.stats.co2_kg_saved, color: 'text-green-400' },
        ].map(stat => (
          <Card key={stat.label} className="text-center p-5 border-steel/20" hover={false}>
            <div className={`text-3xl font-bold font-display ${stat.color}`}>{stat.value}</div>
            <div className="text-steel text-xs mt-1 font-body">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Badges */}
      <div className="profile-item" style={{ opacity: 0 }}>
        <Card className="p-6 border-steel/20" hover={false}>
          <h2 className="text-xl font-display font-bold text-white mb-4">🏆 Achievements</h2>
          <div className="flex flex-wrap gap-4">
            {profile.badges.map((badge, i) => (
              <div
                key={i}
                title={badge.desc || badge.description}
                className="flex flex-col items-center gap-1 p-4 rounded-xl border border-azure/20 bg-azure/5 min-w-[80px]"
              >
                <span className="text-4xl drop-shadow-[0_0_8px_rgba(89,248,232,0.5)]">{badge.emoji}</span>
                <span className="text-xs font-bold text-white font-display text-center leading-tight">{badge.title || badge.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="profile-item" style={{ opacity: 0 }}>
        <Card className="p-6 border-steel/20" hover={false}>
          <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            📋 {profile.role === 'recipient' ? 'Recent Claims' : 'Recent Relays'}
          </h2>
          <div className="space-y-3">
            {profile.recent_relays.map(relay => (
              <div key={relay._id || relay.id} className="flex items-center justify-between py-3 border-b border-steel/10 last:border-0">
                <div>
                  <div className="text-white font-body font-medium">{relay.food_name}</div>
                  <div className="text-steel text-sm">{relay.meals} meals · {new Date(relay.created_at || relay.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <Badge variant="completed">Completed</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
