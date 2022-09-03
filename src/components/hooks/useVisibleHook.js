import { useState, useCallback } from 'react';
import { useGlobalContext } from '../globalContext';
import useIntersectionObserver from './intersectionObserverHook';

export default function useVisibleHook() {
    const context = useGlobalContext();
    // Always visible on prerender
    const [isVisible, setIsVisible] = useState(context.isPrerender);

    const onVisible = useCallback(() => {
        setIsVisible(true);
    }, []);

    const { ref, element } = useIntersectionObserver(onVisible);

    return { isVisible, ref, element }
}
