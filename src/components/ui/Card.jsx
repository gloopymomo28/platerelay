import { useEffect, useRef } from 'react';
import { fadeInUp } from '../../lib/animations';

const Card = ({
  children,
  className = '',
  hover = true,
  animate = true,
  padding = 'p-6',
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (animate && cardRef.current) {
      fadeInUp(cardRef.current);
    }
  }, [animate]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`
        glass-card ${padding}
        transition-all duration-300 ease-out
        ${hover ? 'glass-card-hover cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{ opacity: animate ? 0 : 1 }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
