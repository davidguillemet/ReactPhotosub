import { useRef, useCallback, useEffect, useState } from 'react';
import { throttle } from '../../utils';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';

const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;

export default function useResizeObserver(watchScroll) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [scroll, setScroll] = useState({top: 0, left: 0});
  const resizeObserver = useRef(null);
  const element = useRef(null);

  const onResize = useCallback(entries => {
    const { width, height } = entries[0].contentRect;
    setSize({ width, height });
  }, []);

  const onScroll = useCallback(() => {
    setScroll({ top: element.current.scrollTop, left: element.current.scrollLeft});
  }, []);

  const ref = useCallback(
    node => {
      if (node !== null) {
        if (resizeObserver.current) {
          resizeObserver.current.disconnect();
        }
        resizeObserver.current = new ResizeObserver(throttle(onResize, 50, false, true));
        resizeObserver.current.observe(node);

        if (watchScroll === true) {
          node.removeEventListener('scroll', onScroll);
          node.addEventListener('scroll', onScroll);
          // Don't remove scroll handler for element.current
          // otherwise it won't be added again when switching simulation image source
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
    scrollLeft: scroll.left,
    scrollTop: scroll.top
  };
}