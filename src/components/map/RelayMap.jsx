import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const categoryEmoji = {
  'cooked_meals': '🍛',
  'bakery': '🥐',
  'raw_produce': '🥬',
  'packaged': '📦',
  'other': '🍱',
};

const userIcon = new L.divIcon({
  className: 'custom-user-icon',
  html: `<div style="background-color: #3b82f6; width: 100%; height: 100%; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); box-sizing: border-box;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const relayIcon = new L.divIcon({
  className: 'custom-relay-icon',
  html: `<div style="background-color: #ef4444; width: 100%; height: 100%; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5); box-sizing: border-box;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const RelayMap = ({ relays, centerLat, centerLng, radiusKm, onClaim, claimPending }) => {
  const mapRef = useRef(null);

  // Default center if no coordinates (e.g. India)
  const defaultCenter = [20.5937, 78.9629];
  const position = centerLat && centerLng ? [centerLat, centerLng] : defaultCenter;
  const zoom = centerLat && centerLng ? 12 : 5;

  useEffect(() => {
    // Re-center map when coordinates change
    if (mapRef.current && centerLat && centerLng) {
      mapRef.current.setView(position, 13);
    }
  }, [centerLat, centerLng]);

  return (
    <MapContainer 
      center={position} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 10 }}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Shelter Location Circle */}
      {centerLat !== 0 && centerLng !== 0 && (
        <Circle
          center={position}
          radius={radiusKm * 1000} // meters
          pathOptions={{ color: '#20A4F3', fillColor: '#20A4F3', fillOpacity: 0.1, weight: 2 }}
        />
      )}

      {/* Shelter Marker */}
      {centerLat !== 0 && centerLng !== 0 && (
        <Marker position={position} icon={userIcon} zIndexOffset={1000}>
          <Popup>
            <div className="text-center font-display font-bold">Your Location</div>
          </Popup>
        </Marker>
      )}

      {/* Relay Markers */}
      {relays.map((relay) => {
        const coords = relay.pickup_location?.coordinates;
        if (!coords || coords.length !== 2) return null;
        const [lng, lat] = coords;
        
        return (
          <Marker key={relay.id} position={[lat, lng]} icon={relayIcon}>
            <Popup className="custom-popup">
              <div className="font-body text-sm min-w-[200px]">
                <div className="flex items-center gap-2 mb-2 border-b pb-2">
                  <span className="text-2xl">{categoryEmoji[relay.category] || '🍱'}</span>
                  <div>
                    <h4 className="font-display font-bold text-base leading-tight">{relay.food_name}</h4>
                    <span className="text-xs text-gray-500">{relay.donor_info?.org_name || 'Anonymous Donor'}</span>
                  </div>
                </div>
                <div className="mb-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">Quantity:</span>
                    <span>{relay.quantity?.value} {relay.quantity?.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">Distance:</span>
                    <span>{(relay.distance_meters / 1000).toFixed(1)} km</span>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full text-xs py-1.5"
                  onClick={() => onClaim(relay)}
                  disabled={claimPending}
                >
                  {claimPending ? 'Claiming...' : 'Claim Food'}
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default RelayMap;
