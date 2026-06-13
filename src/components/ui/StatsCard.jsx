import AnimatedCounter from './AnimatedCounter';
import Card from './Card';

const StatsCard = ({
  icon: Icon,
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
    steel: 'text-steel bg-steel-10',
  };

  return (
    <Card className={`flex items-center gap-4 ${className}`} hover={false}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          className="text-2xl text-white block"
        />
        <p className="text-steel text-sm mt-0.5">{label}</p>
      </div>
    </Card>
  );
};

export default StatsCard;
