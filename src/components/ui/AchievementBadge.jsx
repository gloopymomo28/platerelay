import { useEffect, useRef } from 'react';
import { pulseGlow } from '../../lib/animations';

const badgeData = {
  verified: { emoji: '✅', label: 'Verified Donor', color: 'cyan' },
  trusted: { emoji: '⭐', label: 'Trusted Donor', color: 'azure' },
  champion: { emoji: '🏆', label: 'Champion Donor', color: 'yellow-400' },
  saathi: { emoji: '🤝', label: 'Saathi Partner', color: 'azure' },
  first_relay: { emoji: '🎉', label: 'First Relay', color: 'cyan' },
  ten_relays: { emoji: '🔟', label: '10 Relays', color: 'azure' },
  fifty_relays: { emoji: '🏅', label: '50 Relays', color: 'yellow-400' },
  hundred_relays: { emoji: '💯', label: '100 Relays', color: 'crimson' },
  zero_disputes: { emoji: '🛡️', label: 'Zero Disputes', color: 'cyan' },
};

const AchievementBadge = ({
  type = 'verified',
  size = 'md',
  showLabel = true,
  animate = true,
  className = '',
}) => {
  const badgeRef = useRef(null);
  const info = badgeData[type] || badgeData.verified;

  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  useEffect(() => {
    if (animate && badgeRef.current) {
      // Hover-triggered glow handled by CSS
    }
  }, [animate]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        ref={badgeRef}
        className={`
          ${sizes[size]}
          rounded-full bg-steel-10 border border-steel-20
          flex items-center justify-center
          badge-glow-hover
          transition-all duration-300
          hover:scale-110
        `}
      >
        <span>{info.emoji}</span>
      </div>
      {showLabel && (
        <span className="text-xs text-steel font-medium text-center">{info.label}</span>
      )}
    </div>
  );
};

export default AchievementBadge;
