import { useEffect, useRef } from 'react';
import anime from 'animejs';

const AnimatedCounter = ({
  value = 0,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
}) => {
  const counterRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!counterRef.current || hasAnimated.current || value === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const obj = { value: 0 };
            anime({
              targets: obj,
              value: value,
              round: decimals === 0 ? 1 : Math.pow(10, decimals),
              duration: duration,
              easing: 'easeOutExpo',
              update: () => {
                if (counterRef.current) {
                  const formatted = decimals > 0
                    ? obj.value.toFixed(decimals)
                    : Math.floor(obj.value).toLocaleString();
                  counterRef.current.textContent = `${prefix}${formatted}${suffix}`;
                }
              },
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [value, duration, prefix, suffix, decimals]);

  return (
    <span ref={counterRef} className={`font-display font-bold ${className}`}>
      {prefix}0{suffix}
    </span>
  );
};

export default AnimatedCounter;
