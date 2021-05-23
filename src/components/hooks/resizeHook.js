import { useRef, useCallback, useEffect, useState } from 'react';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';

const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;

export default function useResizeObserver() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const resizeObserver = useRef(null);
  const element = useRef(null);

  const onResize = useCallback(entries => {
    const { width, height } = entries[0].contentRect;
    setSize({ width, height });
  }, []);

  const ref = useCallback(
    node => {
      if (node !== null) {
        element.current = node;
        if (resizeObserver.current) {
          resizeObserver.current.disconnect();
        }
        resizeObserver.current = new ResizeObserver(onResize);
        resizeObserver.current.observe(node);
      }
    },
    [onResize]
  );

  useEffect(() => () => {
    resizeObserver.current.disconnect();
  }, []);

  return {
    ref,
    element: element.current,
    width: size.width,
    height: size.height
  };
}