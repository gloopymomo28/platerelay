import { useEffect, useRef } from 'react';
import { fadeInUp } from '../../lib/animations';

const Card = ({
  children,
  className = '',
  hover = true,
  animate = false,   // Changed default to false to prevent flash-of-invisible content
  padding = '',      // Use empty string so callers control padding via className
  onClick,
  style,
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
        glass-card
        transition-all duration-300 ease-out
        ${hover ? 'glass-card-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{ opacity: animate ? 0 : 1, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
export { Card };
