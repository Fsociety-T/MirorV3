// Gesture Hooks
import { useEffect, useRef, useState, useCallback } from 'react';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

export function useSwipeGestures(options: SwipeOptions) {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50, preventDefault = true } = options;
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventDefault) e.preventDefault();
  }, [preventDefault]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const deltaX = touchEnd.x - touchStart.current.x;
    const deltaY = touchEnd.y - touchStart.current.y;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (absX > threshold || absY > threshold) {
      if (absX > absY) {
        if (deltaX > 0) onSwipeRight?.();
        else onSwipeLeft?.();
      } else {
        if (deltaY > 0) onSwipeDown?.();
        else onSwipeUp?.();
      }
    }
    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart as EventListener, { passive: !preventDefault });
    el.addEventListener('touchmove', handleTouchMove as EventListener, { passive: !preventDefault });
    el.addEventListener('touchend', handleTouchEnd as EventListener);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart as EventListener);
      el.removeEventListener('touchmove', handleTouchMove as EventListener);
      el.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return elementRef;
}

// Horizontal carousel swipe for pillars
export function usePillarCarousel(itemCount: number) {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);
  const dragIndex = useRef(0);

  const ref = useSwipeGestures({
    onSwipeLeft: () => setIndex(i => Math.min(i + 1, itemCount - 1)),
    onSwipeRight: () => setIndex(i => Math.max(i - 1, 0)),
    threshold: 80,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = e.clientX;
    dragIndex.current = index;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 50) {
      setIndex(Math.max(0, Math.min(itemCount - 1, dragIndex.current - Math.sign(delta))));
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return {
    index,
    setIndex,
    ref,
    dragProps: { onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onMouseLeave: handleMouseUp },
  };
}

// Pull to refresh / pull down for tree view
export function usePullDown(onPull: () => void, threshold = 100) {
  const [pullDistance, setPullDistance] = useState(0);
  const [pulling, setPulling] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      e.preventDefault();
      const distance = Math.min(delta * 0.5, threshold * 1.5);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!pulling) return;
    setPulling(false);
    if (pullDistance >= threshold) {
      onPull();
    }
    setPullDistance(0);
  };

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, pullDistance, threshold]);

  return { pullDistance, pulling };
}