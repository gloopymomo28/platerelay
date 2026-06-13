import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import anime from 'animejs';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

// Mock relay data for hackathon demo
const MOCK_RELAYS = [
  {
    id: '1',
    food_name: 'Buffet Surplus — Dal Makhani & Rice',
    category: 'Cooked Meals',
    quantity: { value: 40, unit: 'servings' },
    status: 'claimed',
    pickup_window: { start: '2026-06-13T20:00:00Z', end: '2026-06-13T22:00:00Z' },
    created_at: '2026-06-13T18:30:00Z',
    claimed_by_org: 'Hope Shelter',
    is_vegetarian: 'true',
  },
  {
    id: '2',
    food_name: 'Assorted Pastries & Bread',
    category: 'Bakery',
    quantity: { value: 15, unit: 'items' },
    status: 'active',
    pickup_window: { start: '2026-06-13T21:00:00Z', end: '2026-06-13T22:30:00Z' },
    created_at: '2026-06-13T19:00:00Z',
    claimed_by_org: null,
    is_vegetarian: 'true',
  },
  {
    id: '3',
    food_name: 'Biryani (Mixed)',
    category: 'Cooked Meals',
    quantity: { value: 60, unit: 'servings' },
    status: 'completed',
    pickup_window: { start: '2026-06-12T20:00:00Z', end: '2026-06-12T22:00:00Z' },
    created_at: '2026-06-12T18:00:00Z',
    claimed_by_org: 'St. Mary\'s Children Home',
    is_vegetarian: 'mixed',
  },
  {
    id: '4',
    food_name: 'Fresh Vegetables Box',
    category: 'Raw Produce',
    quantity: { value: 8, unit: 'kg' },
    status: 'cancelled',
    pickup_window: { start: '2026-06-11T18:00:00Z', end: '2026-06-11T20:00:00Z' },
    created_at: '2026-06-11T16:00:00Z',
    claimed_by_org: null,
    is_vegetarian: 'true',
  },
];

const statusConfig = {
  active:    { label: 'Active',    variant: 'active',    icon: Clock },
  claimed:   { label: 'Claimed',   variant: 'claimed',   icon: AlertCircle },
  completed: { label: 'Completed', variant: 'completed', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'cancelled', icon: XCircle },
};

const categoryEmoji = {
  'Cooked Meals': '🍛',
  'Bakery': '🥐',
  'Raw Produce': '🥬',
  'Packaged': '📦',
  'Other': '🍱',
};

export default function MyRelays() {
  const [relays, setRelays] = useState(MOCK_RELAYS);
  const [filter, setFilter] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    anime({
      targets: '.relay-row',
      translateX: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(80),
      easing: 'easeOutExpo',
      duration: 600,
    });
  }, [filter]);

  const filtered = filter === 'all' ? relays : relays.filter(r => r.status === filter);

  const handleCancel = (relay) => {
    setRelays(prev => prev.map(r => r.id === relay.id ? { ...r, status: 'cancelled' } : r));
    setCancelTarget(null);
    toast.success('Relay cancelled successfully.');
  };

  const formatWindow = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `${date}, ${fmt(s)} – ${fmt(e)}`;
  };

  const tabs = [
    { key: 'all', label: 'All Relays' },
    { key: 'active', label: 'Active' },
    { key: 'claimed', label: 'Claimed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Relays</h1>
          <p className="text-steel font-body mt-1">Every meal you post is someone's dinner.</p>
        </div>
        <Link to="/donor/post">
          <Button variant="primary" icon={Plus}>Post New Relay</Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === tab.key
                ? 'bg-azure text-white shadow shadow-azure/30'
                : 'bg-steel-10 text-steel hover:text-white hover:bg-steel-20'
            }`}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-2 text-xs opacity-70">
                ({relays.filter(r => r.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Relay List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-steel/20" hover={false}>
          <div className="text-5xl mb-4">🍳</div>
          <h3 className="text-xl font-bold text-white font-display mb-2">Nothing here yet</h3>
          <p className="text-steel font-body mb-6">No relays match this filter. Try another tab or post a new relay.</p>
          <Link to="/donor/post"><Button variant="ghost">Post a Relay</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(relay => {
            const cfg = statusConfig[relay.status] || statusConfig.active;
            const StatusIcon = cfg.icon;
            const canCancel = relay.status === 'active';

            return (
              <div
                key={relay.id}
                className="relay-row glass-card p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-azure/30 transition-all"
                style={{ opacity: 0 }}
              >
                {/* Category Icon */}
                <div className="w-14 h-14 rounded-xl bg-steel-10 flex items-center justify-center text-2xl flex-shrink-0">
                  {categoryEmoji[relay.category] || '🍱'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant={cfg.variant} size="sm">
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>
                    <Badge variant={relay.is_vegetarian === 'true' ? 'veg' : relay.is_vegetarian === 'false' ? 'nonveg' : 'mixed'} size="xs">
                      {relay.is_vegetarian === 'true' ? 'Veg' : relay.is_vegetarian === 'false' ? 'Non-Veg' : 'Mixed'}
                    </Badge>
                  </div>
                  <h3 className="text-white font-display font-bold text-lg leading-tight truncate">{relay.food_name}</h3>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-steel font-body">
                    <span>🍽️ {relay.quantity.value} {relay.quantity.unit}</span>
                    <span>⏱️ {formatWindow(relay.pickup_window.start, relay.pickup_window.end)}</span>
                    {relay.claimed_by_org && (
                      <span className="text-azure">🤝 {relay.claimed_by_org}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {canCancel && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setCancelTarget(relay)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel This Relay?"
      >
        <p className="text-steel font-body mb-6">
          Are you sure you want to cancel <strong className="text-white">{cancelTarget?.food_name}</strong>?
          Nearby shelters will be notified that it's no longer available.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setCancelTarget(null)}>Keep it Active</Button>
          <Button variant="danger" onClick={() => handleCancel(cancelTarget)}>Yes, Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
