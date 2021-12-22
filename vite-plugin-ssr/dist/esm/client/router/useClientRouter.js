import { assert, assertUsage, assertWarning, getUrlFull, getUrlFullWithoutHash, hasProp, isBrowser, isCallable, objectAssign, } from '../../shared/utils';
import { navigationState } from '../navigationState';
import { throttle } from '../../shared/utils/throttle';
import { getPageContext } from './getPageContext';
import { releasePageContext } from '../releasePageContext';
import { getGlobalContext } from './getGlobalContext';
import { addComputedUrlProps } from '../../shared/addComputedUrlProps';
import { addLinkPrefetchHandlers } from './prefetch';
import { skipLink } from './utils/skipLink';
export { useClientRouter };
export { navigate };
setupNativeScrollRestoration();
let isAlreadyCalled = false;
function useClientRouter({ render, ensureHydration = false, onTransitionStart, onTransitionEnd, prefetchLinks = false, }) {
    assertUsage(isAlreadyCalled === false, '`useClientRouter` can be called only once.');
    isAlreadyCalled = true;
    assertUsage(render, '[useClientRouter({render})]: Argument `render` is missing.');
    assertUsage(isCallable(render), '[useClientRouter({render})]: Argument `render` should be a function.');
    assertWarning(!(isVueApp() && ensureHydration !== true), 'You seem to be using Vue.js; we strongly recommend using the option `useClientRouter({ensureHydration: true})` to avoid "Hydration mismatch" errors.');
    autoSaveScrollPosition();
    onLinkClick((url, { keepScrollPosition }) => {
        const scrollTarget = keepScrollPosition ? 'preserve-scroll' : 'scroll-to-top-or-hash';
        fetchAndRender(scrollTarget, url);
    });
    onBrowserHistoryNavigation((scrollTarget) => {
        fetchAndRender(scrollTarget);
    });
    navigateFunction = async (url, { keepScrollPosition }) => {
        const scrollTarget = keepScrollPosition ? 'preserve-scroll' : 'scroll-to-top-or-hash';
        await fetchAndRender(scrollTarget, url);
    };
    let resolveInitialPagePromise;
    const hydrationPromise = new Promise((resolve) => (resolveInitialPagePromise = resolve));
    let renderingCounter = 0;
    let renderPromise;
    let isTransitioning = false;
    fetchAndRender('preserve-scroll');
    return { hydrationPromise };
    async function fetchAndRender(scrollTarget, url = getUrlFull()) {
        const renderingNumber = ++renderingCounter;
        assert(renderingNumber >= 1);
        // Start transition before any await's
        if (renderingNumber > 1) {
            if (isTransitioning === false) {
                if (onTransitionStart) {
                    onTransitionStart();
                }
                isTransitioning = true;
            }
        }
        if (ensureHydration) {
            if (renderingNumber > 1) {
                await hydrationPromise;
            }
        }
        const shouldAbort = () => {
            // We should never abort the hydration if `ensureHydration: true`
            if (ensureHydration && renderingNumber === 1) {
                return false;
            }
            // If there is a newer rendering, we should abort all previous renderings
            if (renderingNumber !== renderingCounter) {
                return true;
            }
            return false;
        };
        const globalContext = await getGlobalContext();
        if (shouldAbort()) {
            return;
        }
        const pageContext = {
            url,
            _isFirstRender: renderingNumber === 1,
            ...globalContext,
        };
        addComputedUrlProps(pageContext);
        const pageContextAddendum = await getPageContext(pageContext);
        if (shouldAbort()) {
            return;
        }
        objectAssign(pageContext, pageContextAddendum);
        if (renderPromise) {
            // Always make sure that the previous render has finished,
            // otherwise that previous render may finish after this one.
            await renderPromise;
        }
        if (shouldAbort()) {
            return;
        }
        changeUrl(url);
        navigationState.markNavigationChange();
        assert(renderPromise === undefined);
        renderPromise = (async () => {
            const pageContextReadyForRelease = releasePageContext(pageContext);
            await render(pageContextReadyForRelease);
            addLinkPrefetchHandlers(prefetchLinks, url);
        })();
        await renderPromise;
        renderPromise = undefined;
        if (pageContext._isFirstRender) {
            resolveInitialPagePromise();
        }
        else if (renderingNumber === renderingCounter) {
            if (onTransitionEnd) {
                onTransitionEnd();
            }
            isTransitioning = false;
        }
        setScrollPosition(scrollTarget);
        browserNativeScrollRestoration_disable();
        initialRenderIsDone = true;
    }
}
let navigateFunction;
async function navigate(url, { keepScrollPosition = false } = {}) {
    assertUsage(isBrowser(), '[`navigate(url)`] The `navigate(url)` function is only callable in the browser but you are calling it in Node.js.');
    assertUsage(url, '[navigate(url)] Missing argument `url`.');
    assertUsage(typeof url === 'string', '[navigate(url)] Argument `url` should be a string (but we got `typeof url === "' + typeof url + '"`.');
    assertUsage(typeof keepScrollPosition === 'boolean', '[navigate(url, { keepScrollPosition })] Argument `keepScrollPosition` should be a boolean (but we got `typeof keepScrollPosition === "' +
        typeof keepScrollPosition +
        '"`.');
    assertUsage(url.startsWith('/'), '[navigate(url)] Argument `url` should start with a leading `/`.');
    assertUsage(navigateFunction, '[navigate()] You need to call `useClientRouter()` before being able to use `navigate()`.');
    await navigateFunction(url, { keepScrollPosition });
}
function onLinkClick(callback) {
    document.addEventListener('click', onClick);
    return;
    // Code adapted from https://github.com/HenrikJoreteg/internal-nav-helper/blob/5199ec5448d0b0db7ec63cf76d88fa6cad878b7d/src/index.js#L11-L29
    function onClick(ev) {
        if (!isNormalLeftClick(ev))
            return;
        const linkTag = findLinkTag(ev.target);
        if (!linkTag)
            return;
        const url = linkTag.getAttribute('href');
        if (skipLink(linkTag))
            return;
        assert(url); // `skipLink()` returns `true` otherwise
        const keepScrollPosition = ![null, 'false'].includes(linkTag.getAttribute('keep-scroll-position'));
        ev.preventDefault();
        callback(url, { keepScrollPosition });
    }
    function isNormalLeftClick(ev) {
        return ev.button === 0 && !ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey;
    }
    function findLinkTag(target) {
        while (target.tagName !== 'A') {
            const { parentNode } = target;
            if (!parentNode) {
                return null;
            }
            target = parentNode;
        }
        return target;
    }
}
let urlFullWithoutHash__previous = getUrlFullWithoutHash();
function onBrowserHistoryNavigation(callback) {
    window.addEventListener('popstate', (ev) => {
        // Skip hash changes
        const urlFullWithoutHash__current = getUrlFullWithoutHash();
        if (urlFullWithoutHash__current == urlFullWithoutHash__previous) {
            return;
        }
        urlFullWithoutHash__previous = urlFullWithoutHash__current;
        const scrollPosition = getScrollPositionFromHistory(ev.state);
        const scrollTarget = scrollPosition || 'scroll-to-top-or-hash';
        callback(scrollTarget);
    });
}
function changeUrl(url) {
    if (getUrlFull() === url)
        return;
    browserNativeScrollRestoration_disable();
    window.history.pushState(undefined, '', url);
    urlFullWithoutHash__previous = getUrlFullWithoutHash();
}
function getScrollPosition() {
    const scrollPosition = { x: window.scrollX, y: window.scrollY };
    return scrollPosition;
}
function setScrollPosition(scrollTarget) {
    if (scrollTarget === 'preserve-scroll') {
        return;
    }
    let scrollPosition;
    if (scrollTarget === 'scroll-to-top-or-hash') {
        const hash = getUrlHash();
        // We mirror the browser's native behavior
        if (hash && hash !== 'top') {
            const hashTarget = document.getElementById(hash) || document.getElementsByName(hash)[0];
            if (hashTarget) {
                hashTarget.scrollIntoView();
                return;
            }
        }
        scrollPosition = { x: 0, y: 0 };
    }
    else {
        assert('x' in scrollTarget && 'y' in scrollTarget);
        scrollPosition = scrollTarget;
    }
    const { x, y } = scrollPosition;
    window.scrollTo(x, y);
}
function getScrollPositionFromHistory(historyState = window.history.state) {
    return hasProp(historyState, 'scrollPosition') ? historyState.scrollPosition : null;
}
function autoSaveScrollPosition() {
    // Safari cannot handle more than 100 `history.replaceState()` calls within 30 seconds (https://github.com/brillout/vite-plugin-ssr/issues/46)
    window.addEventListener('scroll', throttle(saveScrollPosition, 100), { passive: true });
    onPageHide(saveScrollPosition);
}
function saveScrollPosition() {
    // Save scroll position
    const scrollPosition = getScrollPosition();
    window.history.replaceState({ scrollPosition }, '');
}
function getUrlHash() {
    let { hash } = window.location;
    if (hash === '')
        return null;
    assert(hash.startsWith('#'));
    hash = hash.slice(1);
    return hash;
}
let initialRenderIsDone = false;
// We use the browser's native scroll restoration mechanism only for the first render
function setupNativeScrollRestoration() {
    browserNativeScrollRestoration_enable();
    onPageHide(browserNativeScrollRestoration_enable);
    onPageShow(() => initialRenderIsDone && browserNativeScrollRestoration_disable());
}
function browserNativeScrollRestoration_disable() {
    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }
}
function browserNativeScrollRestoration_enable() {
    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
    }
}
function onPageHide(listener) {
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            listener();
        }
    });
}
function onPageShow(listener) {
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            listener();
        }
    });
}
function isVueApp() {
    return typeof window.__VUE__ !== 'undefined';
}
//# sourceMappingURL=useClientRouter.js.map