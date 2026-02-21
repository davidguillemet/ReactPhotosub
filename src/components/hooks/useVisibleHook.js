import { useState, useCallback } from 'react';
import useIntersectionObserver from './intersectionObserverHook';

export default function useVisibleHook() {
    const [isVisible, setIsVisible] = useState(false);

    const onVisible = useCallback(() => {
        setIsVisible(true);
    }, []);

    const { ref, element } = useIntersectionObserver(onVisible);

    return { isVisible, ref, element }
}
