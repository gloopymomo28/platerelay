import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className = '',
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
        <select
          ref={ref}
          className={`
            w-full bg-steel-10 border border-steel-20 rounded-xl
            pl-4 pr-10 py-3
            text-white
            focus:outline-none focus:ring-2 focus:ring-azure/50 focus:border-azure/50
            transition-all duration-200
            font-body text-sm appearance-none
            ${error ? 'border-crimson/50 focus:ring-crimson/50' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="" className="bg-midnight">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-midnight">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel/60 pointer-events-none" />
      </div>
      {error && (
        <p className="text-crimson text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
