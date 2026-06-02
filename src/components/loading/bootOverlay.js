// components/loading/bootOverlay.js
//
// Hides and removes the boot splash overlay that is rendered statically in
// public/index.html (#boot). Call once, when the first real app
// content has mounted, so the splash covers the whole boot window (chunk load +
// provider init + initial route loaders) and disappears only when the UI is ready.
 
export function hideBootOverlay() {
    const overlay = document.getElementById('boot');
    if (!overlay) return; // already removed (e.g. StrictMode double-invoke, or SPA nav)
 
    overlay.classList.add('boot--hide');
 
    let removed = false;
    const remove = () => {
        if (removed) return;
        removed = true;
        overlay.remove();
    };
 
    // Remove after the fade-out, with a timeout fallback in case 'transitionend'
    // never fires (interrupted transition, reduced-motion, etc.).
    overlay.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 700);
}
