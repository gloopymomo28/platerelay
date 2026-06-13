import anime from 'animejs';

export const fadeInUp = (targets, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [30, 0],
    duration: 800,
    easing: 'easeOutExpo',
    delay: anime.stagger ? anime.stagger(100, { start: delay }) : delay,
  });
};

export const fadeIn = (targets, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutExpo',
    delay,
  });
};

export const staggerCards = (targets, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [40, 0],
    scale: [0.95, 1],
    duration: 600,
    easing: 'easeOutExpo',
    delay: anime.stagger(80, { start: delay }),
  });
};

export const counterAnimation = (target, endValue, duration = 2000) => {
  const obj = { value: 0 };
  return anime({
    targets: obj,
    value: endValue,
    round: 1,
    duration,
    easing: 'easeOutExpo',
    update: () => {
      if (target && target.current) {
        target.current.textContent = obj.value.toLocaleString();
      }
    },
  });
};

export const shimmerEffect = (targets) => {
  return anime({
    targets,
    backgroundPosition: ['-200% 0', '200% 0'],
    duration: 1500,
    easing: 'linear',
    loop: true,
  });
};

export const pulseGlow = (targets) => {
  return anime({
    targets,
    boxShadow: [
      '0 0 5px rgba(89, 248, 232, 0.3)',
      '0 0 20px rgba(89, 248, 232, 0.6)',
      '0 0 5px rgba(89, 248, 232, 0.3)',
    ],
    duration: 2000,
    easing: 'easeInOutSine',
    loop: true,
  });
};

export const slideInRight = (targets, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateX: [100, 0],
    duration: 500,
    easing: 'easeOutExpo',
    delay,
  });
};

export const slideInLeft = (targets, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateX: [-100, 0],
    duration: 500,
    easing: 'easeOutExpo',
    delay,
  });
};

export const scaleIn = (targets, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    scale: [0.5, 1],
    duration: 500,
    easing: 'easeOutBack',
    delay,
  });
};

export const heroTextAnimation = (targets) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [50, 0],
    duration: 1200,
    easing: 'easeOutExpo',
    delay: anime.stagger(200),
  });
};

export const floatAnimation = (targets) => {
  return anime({
    targets,
    translateY: [-10, 10],
    duration: 3000,
    easing: 'easeInOutSine',
    direction: 'alternate',
    loop: true,
  });
};
