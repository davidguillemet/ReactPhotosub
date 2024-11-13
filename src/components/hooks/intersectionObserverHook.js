import React from 'react';

export default function useIntersectionObserver(onVisible) {
    const element = React.useRef(null);

    React.useEffect(() => {
        const node = element.current;
        let intersectionObserver = undefined;
        if (node) {
            if (IntersectionObserver) {
                intersectionObserver = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            // when element is visible in the viewport + rootMargin
                            if (entry.intersectionRatio > 0 || entry.isIntersecting) {
                                onVisible();
                            }
                        })
                    }
                )
                intersectionObserver.observe(node);
            } else {
                // Old browsers fallback
                onVisible();
            }
        }
        return () => {
            intersectionObserver.unobserve(node);
        };
    }, [onVisible]); 

    return {
        ref: element,
        element: element.current
    };
};