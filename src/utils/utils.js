import { useEffect, useState, useRef } from 'react';
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

export function useEventListener(eventName, handler){
	// Create a ref that stores handler
	const savedHandler = useRef();
  
	// Update ref.current value if handler changes.
	// This allows our effect below to always get latest handler ...
	// ... without us needing to pass it in effect deps array ...
	// ... and potentially cause effect to re-run every render.
	useEffect(() => {
	  savedHandler.current = handler;
	}, [handler]);
  
	useEffect(
	  () => {
		// Make sure element supports addEventListener
		// On 
		const isSupported = window && window.addEventListener;
		if (!isSupported) return;
  
		// Create event listener that calls handler function stored in ref
		const eventListener = event => savedHandler.current(event);
  
		// Add event listener
		window.addEventListener(eventName, eventListener);
  
		// Remove event listener on cleanup
		return () => {
			window.removeEventListener(eventName, eventListener);
		};
	  },
	  [eventName] // Re-run if eventName changes
	);
  };