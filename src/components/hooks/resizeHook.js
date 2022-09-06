import { useRef, useCallback, useEffect, useState } from 'react';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';

const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;

/**
 * Retourne une fonction qui, tant qu'elle continue à être invoquée,
 * ne sera pas exécutée. La fonction ne sera exécutée que lorsque
 * l'on cessera de l'appeler pendant plus de N millisecondes.
 * Si le paramètre `immediate` vaut vrai, alors la fonction 
 * sera exécutée au premier appel au lieu du dernier.
 * Paramètres :
 *  - func : la fonction à `debouncer`
 *  - wait : le nombre de millisecondes (N) à attendre avant 
 *           d'appeler func()
 *  - immediate (optionnel) : Appeler func() à la première invocation
 *                            au lieu de la dernière (Faux par défaut)
 *  - context (optionnel) : le contexte dans lequel appeler func()
 *                          (this par défaut)
 */
function debounce(func, wait, immediate, context) {
    var result;
    var timeout = null;
    return function() {
        var ctx = context || this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) result = func.apply(ctx, args);
        };
        var callNow = immediate && !timeout;
        // Tant que la fonction est appelée, on reset le timeout.
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(ctx, args);
        return result;
    };
}

/**
 * Retourne une fonction qui, tant qu'elle est appelée,
 * n'est exécutée au plus qu'une fois toutes les N millisecondes.
 * Paramètres :
 *  - func : la fonction à contrôler
 *  - wait : le nombre de millisecondes (période N) à attendre avant 
 *           de pouvoir exécuter à nouveau la function func()
 *  - leading (optionnel) : Appeler également func() à la première
 *                          invocation (Faux par défaut)
 *  - trailing (optionnel) : Appeler également func() à la dernière
 *                           invocation (Faux par défaut)
 *  - context (optionnel) : le contexte dans lequel appeler func()
 *                          (this par défaut)
 */
function throttle(func, wait, leading, trailing, context) {
    var ctx, args, result;
    var timeout = null;
    var previous = 0;
    var later = function() {
        previous = new Date();
        timeout = null;
        result = func.apply(ctx, args);
    };
    return function() {
        var now = new Date();
        if (!previous && !leading) previous = now;
        var remaining = wait - (now - previous);
        ctx = context || this;
        args = arguments;
        // Si la période d'attente est écoulée
        if (remaining <= 0) {
            // Réinitialiser les compteurs
            clearTimeout(timeout);
            timeout = null;
            // Enregistrer le moment du dernier appel
            previous = now;
            // Appeler la fonction
            result = func.apply(ctx, args);
        } else if (!timeout && trailing) {
            // Sinon on s’endort pendant le temps restant
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

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