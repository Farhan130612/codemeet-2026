import { useEffect, useState, useRef } from 'react';
import { ROBOT_CONFIG } from '../config/robot';

export type RobotStateKey = 'HERO' | 'SHOWCASE' | 'COMPANION' | 'FINAL_CTA' | 'HIDDEN';

export function useRobotScroll(scrollProgress: number) {
  const [activeState, setActiveState] = useState<RobotStateKey>('HERO');
  const [currentStyle, setCurrentStyle] = useState(ROBOT_CONFIG.STATES.HERO.desktop);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollTilt, setScrollTilt] = useState(0);

  const lastProgress = useRef(scrollProgress);
  const scrollVelocity = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Scroll velocity calculation for dynamic robot tilt
    const delta = scrollProgress - lastProgress.current;
    lastProgress.current = scrollProgress;
    scrollVelocity.current = delta * 120;
    const dynamicTilt = Math.max(-12, Math.min(12, -scrollVelocity.current * 0.5));
    setScrollTilt(dynamicTilt);

    // Dynamic Element Detection with percentage fallback
    const heroEl = document.getElementById('hero');
    const descentEl = document.getElementById('the-descent');
    const finalCtaEl = document.getElementById('final-cta');

    let nextState: RobotStateKey = 'HERO';

    if (heroEl && window.scrollY < (heroEl.offsetTop + heroEl.offsetHeight * 0.75)) {
      nextState = 'HERO';
    } else if (descentEl) {
      const dRect = descentEl.getBoundingClientRect();
      if (dRect.top <= window.innerHeight * 0.5 && dRect.bottom >= window.innerHeight * 0.25) {
        nextState = 'SHOWCASE';
      } else if (finalCtaEl && finalCtaEl.getBoundingClientRect().top <= window.innerHeight * 0.55) {
        nextState = 'FINAL_CTA';
      } else {
        nextState = 'COMPANION';
      }
    } else {
      // Fallback percentages
      if (scrollProgress < 0.15) {
        nextState = 'HERO';
      } else if (scrollProgress >= 0.35 && scrollProgress < 0.62) {
        nextState = 'SHOWCASE';
      } else if (scrollProgress >= 0.85) {
        nextState = 'FINAL_CTA';
      } else {
        nextState = 'COMPANION';
      }
    }

    setActiveState(nextState);

    const configForState = ROBOT_CONFIG.STATES[nextState];
    const targetStyle = isMobile ? configForState.mobile : configForState.desktop;
    setCurrentStyle(targetStyle);

  }, [scrollProgress, isMobile]);

  return {
    activeState,
    style: currentStyle,
    isMobile,
    scrollTilt
  };
}
