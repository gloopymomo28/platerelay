import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-steel font-display">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-steel/60">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full bg-steel-10 border border-steel-20 rounded-xl
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3
            text-white placeholder-steel/50
            focus:outline-none focus:ring-2 focus:ring-azure/50 focus:border-azure/50
            transition-all duration-200
            font-body text-sm
            ${error ? 'border-crimson/50 focus:ring-crimson/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-crimson text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
