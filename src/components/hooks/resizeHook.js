import { useRef, useCallback, useEffect, useState } from 'react';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';

const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;

export default function useResizeObserver(watchScroll) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [scrollLeft, setScrollLeft] = useState(0);
  const resizeObserver = useRef(null);
  const element = useRef(null);

  const onResize = useCallback(entries => {
    const { width, height } = entries[0].contentRect;
    setSize({ width, height });
  }, []);

  const onScroll = useCallback(() => {
    setScrollLeft(element.current.scrollLeft);
  }, []);

  const ref = useCallback(
    node => {
      if (node !== null) {
        if (resizeObserver.current) {
          resizeObserver.current.disconnect();
        }
        resizeObserver.current = new ResizeObserver(onResize);
        resizeObserver.current.observe(node);

        if (watchScroll === true) {
          node.removeEventListener('scroll', onScroll);
          node.addEventListener('scroll', onScroll);
          // Don't remove scroll handler for element.current
          // otherwse it won't be added again when switching simulation image source
          // It should just be removed in the cleaning hook below
        }
        element.current = node;
      }
    },
    [onResize, onScroll, watchScroll]
  );

  useEffect(() => () => {
    if (resizeObserver.current) {
      resizeObserver.current.disconnect();
    }
    if (element.current) {
      element.current.removeEventListener('scroll', onScroll);
    }
  }, [onScroll]);

  return {
    ref,
    element: element.current,
    width: size.width,
    height: size.height,
    scrollLeft
  };
}