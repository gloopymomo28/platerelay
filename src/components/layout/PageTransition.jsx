import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import anime from 'animejs';

const PageTransition = ({ children }) => {
  const pageRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (pageRef.current) {
      anime({
        targets: pageRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: 'easeOutExpo',
      });
    }
  }, [location.pathname]);

  return (
    <div ref={pageRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
};

export default PageTransition;
