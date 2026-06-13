import { UtensilsCrossed, SearchX, Inbox, AlertTriangle } from 'lucide-react';

const illustrations = {
  'no-relays': { icon: UtensilsCrossed, message: "The kitchen's quiet... but not for long." },
  'no-results': { icon: SearchX, message: "Nothing here yet. Try adjusting your search." },
  'no-claims': { icon: Inbox, message: "No claims yet. Good food is on its way!" },
  'no-data': { icon: Inbox, message: "Nothing to show here yet." },
  'error': { icon: AlertTriangle, message: "Oops! Something went wrong." },
};

const EmptyState = ({
  type = 'no-data',
  title,
  message,
  action,
  className = '',
}) => {
  const preset = illustrations[type] || illustrations['no-data'];
  const Icon = preset.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-steel-10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-steel/60" />
      </div>
      {title && (
        <h3 className="text-xl font-bold font-display text-white mb-2">{title}</h3>
      )}
      <p className="text-steel font-accent text-xl mb-6">
        {message || preset.message}
      </p>
      {action && action}
    </div>
  );
};

export default EmptyState;
