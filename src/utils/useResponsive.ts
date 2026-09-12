import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean; // < 768px
  isTablet: boolean; // >= 768px and < 1024px
  isDesktop: boolean; // >= 1024px
  isTouchDevice: boolean;
  width: number;
  height: number;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        width: 1200,
        height: 800
      };
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      width: w,
      height: h
    };
  });

  useEffect(() => {
    let timeoutId: number;

    const handleResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setState({
          isMobile: w < 768,
          isTablet: w >= 768 && w < 1024,
          isDesktop: w >= 1024,
          isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
          width: w,
          height: h
        });
      }, 60);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
