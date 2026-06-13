import AnimatedCounter from './AnimatedCounter';
import Card from './Card';

const StatsCard = ({
  icon,
  label,
  value,
  prefix = '',
  suffix = '',
  color = 'azure',
  className = '',
}) => {
  const colors = {
    azure: 'text-azure bg-azure/10',
    cyan: 'text-cyan bg-cyan/10',
    crimson: 'text-crimson bg-crimson/10',
    saffron: 'text-saffron bg-saffron/10',
    steel: 'text-steel bg-steel-10',
  };

  // Support both emoji strings and Lucide components
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <span className="text-2xl">{icon}</span>;
    }
    const Icon = icon;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <Card className={`flex items-center gap-4 ${className}`} hover={false}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color] || colors.azure}`}>
        {renderIcon()}
      </div>
      <div>
        <AnimatedCounter
          value={typeof value === 'number' ? value : 0}
          prefix={prefix}
          suffix={suffix}
          className="text-2xl text-white block"
        />
        {typeof value === 'string' && (
          <span className="text-2xl font-display font-bold text-white block">{value}</span>
        )}
        <p className="text-steel text-sm mt-0.5">{label}</p>
      </div>
    </Card>
  );
};

export default StatsCard;
export { StatsCard };
