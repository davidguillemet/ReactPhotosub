import { useState, useCallback } from 'react';
import useIntersectionObserver from './intersectionObserverHook';
import { isPrerenderUserAgent } from '../../utils';

const isPrerender = isPrerenderUserAgent();

export default function useVisibleHook() {
    // Always visible on prerender
    const [isVisible, setIsVisible] = useState(isPrerender);

    const onVisible = useCallback(() => {
        setIsVisible(true);
    }, []);

    const { ref, element } = useIntersectionObserver(onVisible);

    return { isVisible, ref, element }
}
