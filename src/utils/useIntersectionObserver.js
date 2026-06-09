import { useState, useEffect } from 'react';

/**
 * A hook to detect when an element is in the viewport using IntersectionObserver.
 * @param {React.RefObject} ref - The ref of the element to watch.
 * @param {Object} options - IntersectionObserver configuration.
 * @param {boolean} [options.triggerOnce=true] - Whether the trigger should only fire once.
 * @param {string} [options.rootMargin='100px'] - Margins around the root to expand/shrink intersection bounding box.
 * @param {number|number[]} [options.threshold=0] - Threshold at which intersection is triggered.
 */
export function useIntersectionObserver(ref, { triggerOnce = true, rootMargin = '100px', threshold = 0 } = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      if (element && !triggerOnce) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [ref, triggerOnce, rootMargin, threshold]);

  return isIntersecting;
}
