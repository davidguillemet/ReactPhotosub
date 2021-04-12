import { useEffect, useState } from 'react';
export function formatDate(tripDate, locale) {
	const options = { year: 'numeric', month: 'long' };
	const formatedDate = tripDate.toLocaleDateString(locale, options);
	return formatedDate.charAt(0).toUpperCase() + formatedDate.slice(1);
}

function debounce(fn, ms) {
    let timer
    return () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        fn.apply(this, arguments)
      }, ms)
    };
}

export function resizeEffectHook(elementRef, onResize) {

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const [elementWidth, setElementWidth] = useState(0);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const debouncedHandleResize = debounce(function handleResize() {
			setElementWidth(elementRef.current.clientWidth);
			if (onResize) {
				onResize();
			}
        }, 200);
		setElementWidth(elementRef.current.clientWidth);
        window.addEventListener("resize", debouncedHandleResize);
        return () => window.removeEventListener("resize", debouncedHandleResize);
    }, [elementRef, onResize]);

	return elementWidth;
}