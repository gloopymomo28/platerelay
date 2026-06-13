const badgeStyles = {
  active: 'bg-cyan/20 text-cyan border-cyan/30',
  claimed: 'bg-azure/20 text-azure border-azure/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  expired: 'bg-steel-20 text-steel border-steel-30',
  cancelled: 'bg-crimson/20 text-crimson border-crimson/30',
  verified: 'bg-cyan/20 text-cyan border-cyan/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  rejected: 'bg-crimson/20 text-crimson border-crimson/30',
  suspended: 'bg-crimson/20 text-crimson border-crimson/30',
  veg: 'bg-green-500/20 text-green-400 border-green-500/30',
  nonveg: 'bg-red-500/20 text-red-400 border-red-500/30',
  mixed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  trust: 'bg-cyan/10 text-cyan border-cyan/20 badge-glow-hover',
  donor: 'bg-azure/20 text-azure border-azure/30',
  recipient: 'bg-cyan/20 text-cyan border-cyan/30',
  admin: 'bg-crimson/20 text-crimson border-crimson/30',
  free: 'bg-steel-20 text-steel border-steel-30',
  saathi: 'bg-azure/20 text-azure border-azure/30',
  daan_pro: 'bg-cyan/20 text-cyan border-cyan/30',
};

const Badge = ({
  children,
  variant = 'active',
  size = 'sm',
  className = '',
  icon,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        ${sizeClasses[size]}
        ${badgeStyles[variant] || badgeStyles.active}
        border rounded-full font-medium font-display
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
export { Badge };
