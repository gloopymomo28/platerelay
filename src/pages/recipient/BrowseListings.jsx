import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useNearbyRelays, useClaimRelay } from '../../api/relays';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import RelayMap from '../../components/map/RelayMap';

const categoryEmoji = {
  'cooked_meals': '🍛',
  'bakery': '🥐',
  'raw_produce': '🥬',
  'packaged': '📦',
  'other': '🍱',
};

const vegLabel = {
  'veg': 'Veg',
  'non_veg': 'Non-Veg',
  'mixed': 'Mixed'
};

const formatDistance = (meters) => {
  return (meters / 1000).toFixed(1) + ' km';
};

export default function BrowseListings() {
  const [view, setView] = useState('list'); // 'list' | 'map'
  const [radius, setRadius] = useState(10);
  const user = useAuthStore(state => state.user);
  
  // Get recipient's location
  const lat = user?.location?.coordinates[1] || 0;
  const lng = user?.location?.coordinates[0] || 0;

  const { data, isLoading } = useNearbyRelays(lat, lng, radius);
  const claimRelay = useClaimRelay();
  
  const relays = data?.relays || [];

  const handleClaim = (relay) => {
    claimRelay.mutate(relay.id, {
      onSuccess: () => {
        toast.success(`Successfully claimed ${relay.food_name}!`);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.detail || 'Failed to claim relay');
      }
    });
  };

  const getTimeRemaining = (endTimeStr) => {
    const end = new Date(endTimeStr);
    const now = new Date();
    const diffMs = end - now;
    if (diffMs <= 0) return 'Expired';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-midnight">
      
      {/* Sidebar / Filters */}
      <div className="w-full md:w-80 bg-midnight/80 border-r border-steel/20 p-4 flex flex-col h-full overflow-y-auto">
        <h2 className="text-2xl font-display font-bold text-white mb-6">Find Food</h2>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-steel mb-2 block">Search Radius: {radius} km</label>
            <input 
              type="range" 
              min="1" max="25" 
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-azure"
            />
            <div className="flex justify-between text-xs text-steel mt-1">
              <span>1 km</span>
              <span>25 km</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-steel mb-2 block">Dietary</label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="ghost" className="cursor-pointer border-cyan text-cyan">All</Badge>
              <Badge variant="ghost" className="cursor-pointer hover:bg-steel/20">Veg Only</Badge>
              <Badge variant="ghost" className="cursor-pointer hover:bg-steel/20">No Egg</Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-steel mb-2 block">Category</label>
            <div className="space-y-2">
              {['Cooked Meals', 'Bakery', 'Raw Produce', 'Packaged'].map(cat => (
                <label key={cat} className="flex items-center gap-2 text-white text-sm cursor-pointer">
                  <input type="checkbox" className="accent-azure rounded" defaultChecked />
                  {cat}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top bar with Map/List toggle */}
        <div className="p-4 border-b border-steel/20 flex justify-between items-center bg-midnight">
          <span className="text-steel font-body">{relays.length} active relays found</span>
          <div className="flex bg-steel/10 rounded-lg p-1">
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${view === 'list' ? 'bg-azure text-white shadow' : 'text-steel hover:text-white'}`}
              onClick={() => setView('list')}
            >
              List View
            </button>
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${view === 'map' ? 'bg-azure text-white shadow' : 'text-steel hover:text-white'}`}
              onClick={() => setView('map')}
            >
              Map View 🗺️
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-steel/5">
          {view === 'list' ? (
            isLoading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-azure mb-4" />
                <p className="text-steel font-body">Searching for nearby food...</p>
              </div>
            ) : relays.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-bold text-white font-display mb-2">No food found</h3>
                <p className="text-steel font-body max-w-md mx-auto">
                  There are no active relays within {radius} km of your location right now. Check back later or expand your search radius!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {relays.map(relay => {
                  const timeRemaining = getTimeRemaining(relay.pickup_window.end);
                  const isUrgent = timeRemaining.includes('m') && !timeRemaining.includes('h');
                  
                  return (
                    <Card key={relay.id} className="p-0 border-steel/20 bg-midnight/50 flex flex-col sm:flex-row hover:border-azure/30 transition-all hover:-translate-y-1 shadow-lg">
                      <div className="w-full sm:w-40 h-40 sm:h-auto bg-steel/10 flex items-center justify-center text-4xl border-r border-steel/10">
                        {categoryEmoji[relay.category] || '🍱'}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <Badge variant="active">Active</Badge>
                            <Badge variant="ghost" className="text-xs border-steel/20 text-steel">{vegLabel[relay.is_vegetarian] || 'Mixed'}</Badge>
                          </div>
                          <span className={`text-sm font-bold ${isUrgent ? 'text-crimson animate-pulse' : 'text-cyan'}`}>
                            ⏱️ {timeRemaining}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white font-display leading-tight">{relay.food_name}</h3>
                        <p className="text-steel text-xs font-body mb-3">From: {relay.donor_info?.org_name || 'Anonymous'}</p>
                        
                        <div className="mt-auto flex justify-between items-end">
                          <div>
                            <div className="text-lg font-bold text-white">{relay.quantity?.value} <span className="text-sm font-normal text-steel">{relay.quantity?.unit}</span></div>
                            <div className="text-xs text-steel">📍 {formatDistance(relay.distance_meters)} away</div>
                          </div>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleClaim(relay)}
                            disabled={claimRelay.isPending}
                          >
                            {claimRelay.isPending ? 'Claiming...' : 'Claim Food'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          ) : (
            <div className="h-full rounded-xl border border-steel/20 bg-midnight flex items-center justify-center overflow-hidden">
              <RelayMap 
                relays={relays} 
                centerLat={lat} 
                centerLng={lng} 
                radiusKm={radius} 
                onClaim={handleClaim} 
                claimPending={claimRelay.isPending} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
