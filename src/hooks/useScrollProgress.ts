import { useState, useEffect, useCallback } from 'react';

interface ScrollProgress {
  scrollY: number;
  progress: number; // 0-1, где 1 = полностью проскроллен до триггера
  isCollapsed: boolean;
}

export function useScrollProgress(triggerPoint: number = 150): ScrollProgress {
  const [scrollState, setScrollState] = useState<ScrollProgress>({
    scrollY: 0,
    progress: 0,
    isCollapsed: false,
  });

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const progress = Math.min(scrollY / triggerPoint, 1);
    const isCollapsed = progress >= 0.8;

    setScrollState({ scrollY, progress, isCollapsed });
  }, [triggerPoint]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return scrollState;
}
