import { useRef, useCallback, useEffect } from 'react';

export default function useIntersectionObserver(onVisible) {
    const element = useRef(null);
    const leaving = useRef(false);
    const intersectionObserver = useRef(null);

    const ref = useCallback((node) => {
        if (node !== null) {
            element.current = node;
            if (IntersectionObserver) {
                if (intersectionObserver.current !== null) {
                    intersectionObserver.current.unobserve(node)
                }
                intersectionObserver.current = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            // when element is visible in the viewport + rootMargin
                            if (leaving.current === false && 
                                (entry.intersectionRatio > 0 || entry.isIntersecting)) {
                                onVisible();
                            }
                        })
                    }
                )
                intersectionObserver.current.observe(node);
            } else {
                // Old browsers fallback
                onVisible();
            }
        }
    }, [onVisible]);

    useEffect(() => () => {
        leaving.current = true;
        intersectionObserver.current.unobserve(element.current);
    }, []);

    return {
        ref: ref,
        element: element.current
    };
};