import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import anime from 'animejs';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { useMyRelays, useClaimedRelays, useCancelRelay, useScanQRRelay } from '../../api/relays';
import { QRCodeCanvas } from 'qrcode.react';
import { QRScannerModal } from '../../components/ui/QRScannerModal';
import useAuthStore from '../../store/authStore';
import { FloatingBackground } from '../../components/ui/FloatingBackground';
import { LiquidGlassCard } from '../../components/ui/liquid-glass-card';

const statusConfig = {
  active:    { label: 'Active',    variant: 'active',    icon: Clock },
  claimed:   { label: 'Claimed',   variant: 'claimed',   icon: AlertCircle },
  completed: { label: 'Completed', variant: 'completed', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'cancelled', icon: XCircle },
};



const vegLabel = {
  'veg': 'Veg',
  'non_veg': 'Non-Veg',
  'mixed': 'Mixed'
};

const vegVariant = {
  'veg': 'veg',
  'non_veg': 'nonveg',
  'mixed': 'mixed'
};

export default function MyRelays() {
  const [filter, setFilter] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  
  const user = useAuthStore(state => state.user);
  const isDonor = user?.role === 'donor';

  const myRelaysQuery = useMyRelays();
  const claimedRelaysQuery = useClaimedRelays();
  
  const { data, isLoading } = isDonor ? myRelaysQuery : claimedRelaysQuery;
  const cancelRelay = useCancelRelay();
  const scanQRRelay = useScanQRRelay();

  const [scanTarget, setScanTarget] = useState(null);
  const [qrTarget, setQrTarget] = useState(null);
  
  const relays = data?.relays || [];

  useEffect(() => {
    anime({
      targets: '.relay-row',
      translateX: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(80),
      easing: 'easeOutExpo',
      duration: 600,
    });
  }, [filter, isLoading]);

  const filtered = filter === 'all' ? relays : relays.filter(r => r.status === filter);

  const handleCancel = (relay) => {
    cancelRelay.mutate(relay.id, {
      onSuccess: () => {
        setCancelTarget(null);
        toast.success('Relay cancelled successfully.');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.detail || 'Failed to cancel relay');
      }
    });
  };

  const handleScan = (qr_secret) => {
    if (!scanTarget) return;
    scanQRRelay.mutate({ relayId: scanTarget.id, qr_secret }, {
      onSuccess: () => {
        setScanTarget(null);
        toast.success('Pickup Confirmed! Relay Completed! 🎉');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.detail || 'Invalid QR code.');
      }
    });
  };

  const formatWindow = (start, end) => {
    const safeStart = start.endsWith('Z') ? start : `${start}Z`;
    const safeEnd = end.endsWith('Z') ? end : `${end}Z`;
    const s = new Date(safeStart);
    const e = new Date(safeEnd);
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#03191E' }}>
      <FloatingBackground />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">{isDonor ? 'My Relays' : 'My Claims'}</h1>
            <p className="text-steel font-body mt-1">
              {isDonor ? "Every meal you post is someone's dinner." : "Keep track of the food you've claimed."}
            </p>
          </div>
          {isDonor && (
            <Link to="/donor/post">
              <Button variant="primary" icon={Plus}>Post New Relay</Button>
            </Link>
          )}
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
      {isLoading ? (
        <LiquidGlassCard className="p-12 text-center border-steel/20" blurIntensity="md" shadowIntensity="sm" glowIntensity="sm">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-azure" />
          <p className="text-steel font-body">Loading your relays...</p>
        </LiquidGlassCard>
      ) : filtered.length === 0 ? (
        <LiquidGlassCard className="p-12 text-center border-steel/20" blurIntensity="md" shadowIntensity="sm" glowIntensity="sm">
          <h3 className="text-xl font-bold text-white font-display mb-2 mt-4">Nothing here yet</h3>
          <p className="text-steel font-body mb-6">No relays match this filter. Try another tab or post a new relay.</p>
          <Link to="/donor/post"><Button variant="ghost">Post a Relay</Button></Link>
        </LiquidGlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(relay => {
            const cfg = statusConfig[relay.status] || statusConfig.active;
            const StatusIcon = cfg.icon;
            const canCancel = relay.status === 'active';

            return (
              <LiquidGlassCard
                key={relay.id}
                className="relay-row p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-azure/30 transition-all"
                style={{ opacity: 0 }}
                blurIntensity="md" shadowIntensity="sm" glowIntensity="sm"
              >
                {/* Photo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-steel-10 flex-shrink-0 overflow-hidden relative">
                  {(relay.photo?.thumbnail_url || relay.photo?.cloudinary_url) && (
                    <img 
                      src={relay.photo.thumbnail_url || relay.photo.cloudinary_url} 
                      alt={relay.food_name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant={cfg.variant} size="sm">
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>
                    <Badge variant={vegVariant[relay.is_vegetarian] || 'mixed'} size="xs">
                      {vegLabel[relay.is_vegetarian] || 'Mixed'}
                    </Badge>
                  </div>
                  <h3 className="text-white font-display font-bold text-lg leading-tight truncate">{relay.food_name}</h3>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-steel font-body">
                    <span>{relay.quantity?.value} {relay.quantity?.unit}</span>
                    <span>{formatWindow(relay.pickup_window.start, relay.pickup_window.end)}</span>
                  </div>
                  </div>

                  {/* Personalized Impact / Contact Info */}
                  {relay.status === 'claimed' && (
                    <div className="mt-3 p-3 bg-midnight/40 rounded-lg border border-steel/10">
                      {isDonor && relay.recipient_info ? (
                        <>
                          <p className="text-sm font-bold text-azure mb-1">Your {relay.food_name} is going to {relay.recipient_info.org_name}!</p>
                          <p className="text-xs text-steel">Contact: {relay.recipient_info.email} | {relay.recipient_info.phone}</p>
                        </>
                      ) : !isDonor && relay.donor_info ? (
                        <>
                          <p className="text-sm font-bold text-azure mb-1">Donor: {relay.donor_info.org_name}</p>
                          <p className="text-xs text-steel">Contact: {relay.donor_info.email} | {relay.donor_info.phone}</p>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {canCancel && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setCancelTarget(relay)}
                      disabled={cancelRelay.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                  {relay.status === 'claimed' && isDonor && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setScanTarget(relay)}
                    >
                      Scan QR to Complete
                    </Button>
                  )}
                  {relay.status === 'claimed' && !isDonor && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setQrTarget(relay)}
                    >
                      Show QR Code
                    </Button>
                  )}
                </div>
              </LiquidGlassCard>
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
          <Button variant="danger" onClick={() => handleCancel(cancelTarget)} disabled={cancelRelay.isPending}>
            {cancelRelay.isPending ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </div>
        </div>
      </Modal>

      {/* QR Scanner Modal for Donors */}
      <QRScannerModal 
        isOpen={!!scanTarget} 
        onClose={() => setScanTarget(null)} 
        onScan={handleScan} 
      />

      {/* QR Code Modal for Recipients */}
      <Modal
        isOpen={!!qrTarget}
        onClose={() => setQrTarget(null)}
        title="Pickup QR Code"
      >
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-steel font-body mb-6">
            Show this QR code to the donor when you arrive to pick up the food.
          </p>
          <div className="bg-white p-4 rounded-xl shadow-lg">
            {qrTarget?.qr_secret && (
              <QRCodeCanvas 
                value={qrTarget.qr_secret} 
                size={200}
                level="H"
                fgColor="#03191E"
              />
            )}
          </div>
          <p className="text-sm font-bold text-azure mt-6">
            Relay: {qrTarget?.food_name}
          </p>
        </div>
      </Modal>

      </div>
    </div>
  );
}
