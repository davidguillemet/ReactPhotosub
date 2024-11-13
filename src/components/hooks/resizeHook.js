import React, { useRef, useCallback, useState } from 'react';
import { throttle } from '../../utils';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';

const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;

export default function useResizeObserver(watchScroll) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [scroll, setScroll] = useState({top: 0, left: 0});
  const element = useRef(null);

  const onResize = useCallback(entries => {
    window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
    })
  }, []);

  const onScroll = useCallback(() => {
    setScroll({ top: element.current.scrollTop, left: element.current.scrollLeft});
  }, []);

  React.useLayoutEffect(() => {
    let resizeObserver = undefined;
    let node = element.current;
    if (node) {
        resizeObserver = new ResizeObserver(throttle(onResize, 50, false, true));
        resizeObserver.observe(element.current);
        if (watchScroll === true) {
            node.removeEventListener('scroll', onScroll);
            node.addEventListener('scroll', onScroll);
            // Don't remove scroll handler for element.current
            // otherwise it won't be added again when switching simulation image source
            // It should just be removed in the cleaning hook below
        }
    }
    return () => {
        resizeObserver?.disconnect();
        node?.removeEventListener('scroll', onScroll);
    }
  }, [onResize, onScroll, watchScroll]);

  return {
    ref: element,
    element: element.current,
    width: size.width,
    height: size.height,
    scrollLeft: scroll.left,
    scrollTop: scroll.top
  };
}