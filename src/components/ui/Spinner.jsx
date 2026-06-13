const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-steel-20 border-t-azure animate-spin`} />
        <div className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-b-cyan animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-steel text-sm font-accent text-lg">Setting the table...</p>
    </div>
  );
};

export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-midnight">
    <Spinner size="lg" />
  </div>
);

export default Spinner;
