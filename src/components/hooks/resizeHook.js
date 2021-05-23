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
          node.addEventListener('scroll', onScroll);
          if (element.current !== null) {
            element.current.removeEventListener('scroll', onScroll);
          }
        }
        element.current = node;
      }
    },
    [onResize, onScroll, watchScroll]
  );

  useEffect(() => () => {
    resizeObserver.current.disconnect();
    element.current.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return {
    ref,
    element: element.current,
    width: size.width,
    height: size.height,
    scrollLeft
  };
}