// JavaScript file
// National Domestic Violence Hotline Protect History Utility
// author: Chad Cleveland | National Domestic Violence Hotline | TheHotline.org

// Last Modified: '2026-07-10 12:47';
const thl_protectHistoryLastModified = '2026-07-10 12:47';

/*
Copyright (c) Effective as of timestamp above. National Domestic Violence Hotline.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/*  
  Protect History Utility
  
  Ensures that visits to TheHotline.org properties do not accumulate in the browser's history, protecting survivors who may share a device with an abuser.
  
  Achieved by replacing all same-tab navigations and coded new-tab navigations with location.replace(), which overwrites the current history entry rather than pushing a new one. By the time a visitor uses the safety exit button, there is no history stack to trace back.
  
  Known limitations:
  - Global event listeners added via addEventListener that use location.href = or location.assign() are not interceptable by this utility. Avoid using them in any code on these pages.
  - history.pushState() / history.replaceState() are not intercepted. Avoid using them, or override them explicitly if third-party code uses them.
  - <meta http-equiv="refresh"> navigations are not interceptable by JavaScript.
  - Vendor or third-party scripts that navigate before DOMContentLoaded or window.load may not be caught. Audit third-party scripts regularly.
  - If a URL cannot be safely extracted (variable, template literal, or function call rather than a plain string literal), the element is left completely untouched — original behavior is preserved. A console warning is logged for manual review.
  
  User-intentional new tabs (Ctrl+click, Cmd+click, middle-click, right-click > "Open in new tab", long-press) are respected.
*/
const THL_PROTECT_HISTORY_DEBUG_MODE = true;

const THL_PROTECT_HISTORY_NOTICE_EN = "<span>For added privacy: Hide your history.</span><div class='thl-protect-history-buttons'><button id='thl-protect-history-toggle'>Enable</button> <button id='thl-protect-history-dismiss'>Dismiss</button> <button id='thl-protect-history-learn-more'>Learn More</button></div>";

const THL_PROTECT_HISTORY_ENABLED_NOTICE_EN = "<span>History protection is enabled. To disable it, reload the page.</span><div class='thl-protect-history-buttons'><button id='thl-protect-history-dismiss'>Dismiss</button> <button id='thl-protect-history-learn-more'>Learn More</button></div>";

const THL_PROTECT_HISTORY_LEARN_MORE_EN = "History protection keeps the pages you visit here from showing up in your browser's history — so if someone else uses this device later, they won't see where you've been. To disable it, reload the page.\n\nTo fully clear your visit, use the exit button when you're done.\n\nHeads up: the back button won't work while this is on, pages opened in a new tab or window will show in history, and it may not catch every link. So, for extra privacy, pair it with your browser's private or incognito mode and manually clear your history when done.\n\nBrought to you by the National Domestic Violence Hotline.";

const THL_PROTECT_HISTORY_NOTICE_ES = "<span>Para mayor privacidad: Oculta tu historial.</span><div class='thl-protect-history-buttons'><button id='thl-protect-history-toggle'>Activar</button> <button id='thl-protect-history-dismiss'>Descartar</button> <button id='thl-protect-history-learn-more'>Más información</button></div>";

const THL_PROTECT_HISTORY_ENABLED_NOTICE_ES = "<span>La protección de historial está activada. Para desactivarla, recarga la página.</span><div class='thl-protect-history-buttons'><button id='thl-protect-history-dismiss'>Descartar</button> <button id='thl-protect-history-learn-more'>Más información</button></div>";

const THL_PROTECT_HISTORY_LEARN_MORE_ES = "La protección de historial evita que las páginas que visitas aquí aparezcan en el historial de tu navegador — así, si alguien más usa este dispositivo después, no verá dónde has estado. Para desactivarla, recarga la página.\n\nPara borrar tu visita por completo, usa el botón de salida cuando termines.\n\nTen en cuenta: el botón de atrás no funcionará mientras esté activada, las páginas abiertas en una pestaña o ventana nueva sí aparecerán en el historial, y es posible que no detecte todos los enlaces. Para mayor privacidad, combínala con el modo privado o de incógnito de tu navegador y borra tu historial manualmente al terminar.\n\nCortesía de The National Domestic Violence Hotline.";

let THL_PROTECT_HISTORY_NOTICE = THL_PROTECT_HISTORY_NOTICE_EN;
let THL_PROTECT_HISTORY_ENABLED_NOTICE = THL_PROTECT_HISTORY_ENABLED_NOTICE_EN;
let THL_PROTECT_HISTORY_LEARN_MORE = THL_PROTECT_HISTORY_LEARN_MORE_EN;

const THL_PROTECT_HISTORY_SESSION_KEY = "thl_protect_history_enabled";
const THL_PROTECT_HISTORY_DISMISSED_KEY = "thl_protect_history_dismissed";

const THL_PROTECT_HISTORY_CSS = `/* National Domestic Violence Hotline - Protect History Utility CSS */
#thl-protect-history-bar {
    padding: 0;
    background-color: #e3e3e3;
    font-size: 13px;
}
#thl-protect-history-bar span {
    color: inherit;
    font: inherit;
    font-weight: bold;
    border: none;
    background: none;
    text-decoration: none;
    display: inline-block;
    margin: 4px 6px;
    vertical-align: bottom;
}
#thl-protect-history-bar .thl-protect-history-buttons {
    display: inline-block;
    white-space: nowrap;
}

#thl-protect-history-bar button {
    color: #a93e92;
    font: inherit;
    border: none;
    background: none;
    text-decoration: underline;
    margin: 0;
    padding: 0px 12px 4px 6px;
    cursor: pointer;
    vertical-align: text-bottom;
}
`;

thl_initProtectHistoryUtility();
function thl_initProtectHistoryUtility() {
    console.log("National Domestic Violence Hotline - Protect History Utility.\n   To implement on your site, contact software@thehotline.org", thl_protectHistoryLastModified);

    let thl_protectHistoryLanguage = "en";
    if (location.hostname.includes("espanol.") || location.href.includes("lang=es")) {
        thl_protectHistoryLanguage = "es";
    }
    THL_PROTECT_HISTORY_NOTICE = thl_protectHistoryLanguage === "es" ? THL_PROTECT_HISTORY_NOTICE_ES : THL_PROTECT_HISTORY_NOTICE_EN;
    THL_PROTECT_HISTORY_ENABLED_NOTICE = thl_protectHistoryLanguage === "es" ? THL_PROTECT_HISTORY_ENABLED_NOTICE_ES : THL_PROTECT_HISTORY_ENABLED_NOTICE_EN;
    THL_PROTECT_HISTORY_LEARN_MORE = thl_protectHistoryLanguage === "es" ? THL_PROTECT_HISTORY_LEARN_MORE_ES : THL_PROTECT_HISTORY_LEARN_MORE_EN;

    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry && navEntry.type === "reload") {
        sessionStorage.removeItem(THL_PROTECT_HISTORY_SESSION_KEY);
        sessionStorage.removeItem(THL_PROTECT_HISTORY_DISMISSED_KEY);
        if (THL_PROTECT_HISTORY_DEBUG_MODE) {
            console.log("[thl_initProtectHistoryUtility] Reload detected — cleared session state");
        }
    }

    if (THL_PROTECT_HISTORY_DEBUG_MODE) {
        console.log("[thl_initProtectHistoryUtility]Current history protection state:", sessionStorage.getItem(THL_PROTECT_HISTORY_SESSION_KEY));
    }
    if (sessionStorage.getItem(THL_PROTECT_HISTORY_SESSION_KEY) === "true") {
        thl_initProtectHistory();
    } else if (sessionStorage.getItem(THL_PROTECT_HISTORY_DISMISSED_KEY) !== "true") {
        thl_createProtectHistoryBar();
    }
}
function thl_injectProtectHistoryCss() {
    if (THL_PROTECT_HISTORY_DEBUG_MODE) {
        console.log("[thl_injectProtectHistoryCss] Injecting CSS");
    }
    const thl_protectHistoryStyleEle = document.createElement("style");
    thl_protectHistoryStyleEle.id = "thl-protect-history-css";
    thl_protectHistoryStyleEle.innerHTML = THL_PROTECT_HISTORY_CSS;
    document.head.appendChild(thl_protectHistoryStyleEle);

    const scriptTag = [...document.querySelectorAll("script[src]")].find((s) => s.src.includes("thl-protect-history.js"));
    const params = scriptTag ? new URL(scriptTag.src).searchParams : new URLSearchParams();

    const hexRe = /^[0-9a-fA-F]{6}$/;
    function resolveColor(paramName, fallback) {
        const val = params.get(paramName);
        return val && hexRe.test(val) ? `#${val}` : fallback;
    }

    const bgColor = resolveColor("bg-color", "#e3e3e3");
    const textColor = resolveColor("text-color", "#333333");
    const btnColor = resolveColor("btn-color", "#a93e92");

    const overrideCss = `
        #thl-protect-history-bar {
            background-color: ${bgColor};
            color: ${textColor};
        }
        #thl-protect-history-bar button {
            color: ${btnColor};
        }
    `;
    const thl_protectHistoryOverrideStyleEle = document.createElement("style");
    thl_protectHistoryOverrideStyleEle.id = "thl-protect-history-override-css";
    thl_protectHistoryOverrideStyleEle.innerHTML = overrideCss;
    document.head.appendChild(thl_protectHistoryOverrideStyleEle);
}
function thl_createProtectHistoryBar() {
    if (THL_PROTECT_HISTORY_DEBUG_MODE) {
        console.log("[thl_initProtectHistoryUtility] Creating protect history bar");
    }
    thl_injectProtectHistoryCss();
    const thl_protectHistoryBar = document.createElement("div");
    thl_protectHistoryBar.id = "thl-protect-history-bar";
    thl_protectHistoryBar.innerHTML = THL_PROTECT_HISTORY_NOTICE;
    document.body.prepend(thl_protectHistoryBar);
    thl_initProtectHistoryBarButtons();
    if (THL_PROTECT_HISTORY_DEBUG_MODE) {
        console.log("[thl_initProtectHistoryUtility] Protect history bar created", thl_protectHistoryBar);
    }
}

function thl_updateProtectHistoryBar() {
    const thl_protectHistoryBar = document.getElementById("thl-protect-history-bar");
    if (thl_protectHistoryBar) {
        thl_protectHistoryBar.innerHTML = THL_PROTECT_HISTORY_ENABLED_NOTICE;
        thl_initProtectHistoryBarButtons();
    }
}

function thl_initProtectHistoryBarButtons() {
    const toggle = document.getElementById("thl-protect-history-toggle");
    if (toggle) toggle.addEventListener("click", thl_enableHistoryProtection);

    const dismiss = document.getElementById("thl-protect-history-dismiss");
    if (dismiss) dismiss.addEventListener("click", thl_dismissHistoryProtection);

    const learnMore = document.getElementById("thl-protect-history-learn-more");
    if (learnMore) learnMore.addEventListener("click", thl_learnMore);

    if (THL_PROTECT_HISTORY_DEBUG_MODE) {
        console.log("[thl_initProtectHistoryBarButtons] Wired buttons:", { toggle: !!toggle, dismiss: !!dismiss, learnMore: !!learnMore });
    }
}

function thl_dismissHistoryProtection() {
    sessionStorage.setItem(THL_PROTECT_HISTORY_DISMISSED_KEY, "true");
    const thl_protectHistoryBar = document.getElementById("thl-protect-history-bar");
    if (thl_protectHistoryBar) {
        thl_protectHistoryBar.remove();
    }
}

function thl_learnMore() {
    alert(THL_PROTECT_HISTORY_LEARN_MORE);
}

function thl_enableHistoryProtection() {
    sessionStorage.setItem(THL_PROTECT_HISTORY_SESSION_KEY, "true");

    thl_updateProtectHistoryBar();

    thl_initProtectHistory();
}

function thl_initProtectHistory() {
    thl_overrideWindowOpen();
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", thl_catchClicks);
    } else {
        thl_catchClicks();
    }
    if (document.readyState === "complete") {
        thl_catchInlineClickEvents();
    } else {
        window.addEventListener("load", thl_catchInlineClickEvents);
    }
}

function thl_overrideWindowOpen() {
    /* 
      Intercept window.open — forces any programmatic new-tab navigation into the same tab via location.replace().
      If Google Tag Manager debug cookie is present, do not override window.open.
    */
    try {
        const isGtmDebug = document.cookie.includes("gtm_debug");
        if (!isGtmDebug) {
            window.open = (url) => {
                try {
                    if (url) location.replace(url);
                } catch (err) {
                    console.warn("[thl_catchClicks] window.open intercept failed:", err);
                }
            };
        }
    } catch (err) {
        console.warn(`[thl_catchClicks] failed to initialize`, err);
    }
}

/* 
  Intercept all link clicks via event delegation.
  Skips user-intentional new tabs, downloads, and non-navigable hrefs.
*/

function thl_catchClicks() {
    document.addEventListener("click", (e) => {
        try {
            const link = e.target.closest("a[href]");
            if (!link) return;

            // Respect user-intentional new tabs: keyboard modifier or middle-click
            if (e.ctrlKey || e.metaKey || e.button === 1) return;

            // Respect download links
            if (link.hasAttribute("download")) return;

            const href = link.getAttribute("href");

            // Skip non-navigable hrefs
            if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

            e.preventDefault();
            location.replace(href);
        } catch (err) {
            console.warn("[thl_catchClicks] click intercept failed:", err);
        }
    });
}

/*
  Scrub inline onclick handlers containing location.href.
  Removes the inline handler and replaces it with a location.replace() listener.

  If a URL cannot be safely extracted (variable, template literal, or function call rather than a plain string literal), the element is left completely untouched — original behavior is preserved. A console warning is logged for manual review.
*/
function thl_catchInlineClickEvents() {
    document.querySelectorAll("[onclick]").forEach((el) => {
        try {
            const handler = el.getAttribute("onclick");
            if (!handler.includes("location.href")) return;

            const url = thl_extractHrefUrl(handler, el);

            if (url) {
                el.removeAttribute("onclick");
                el.addEventListener("click", (e) => {
                    if (e.ctrlKey || e.metaKey || e.button === 1) return;
                    e.preventDefault();
                    location.replace(url);
                });
            }
        } catch (err) {
            console.warn("[thl_catchClicks] onclick scrub failed on element:", el, err);
        }
    });
}

/*
  Extracts a plain string URL from an onclick attribute value containing a location.href assignment. Uses the browser's URL parser for validation rather than regex. Returns null if the URL cannot be safely determined.
*/
function thl_extractHrefUrl(handler, el) {
    try {
        // Split on location.href and take everything after the first occurrence
        const afterHref = handler.split("location.href")[1];
        if (!afterHref) return null;

        // Find the first quote character (single or double)
        const quoteIndex = afterHref.search(/['"]/);
        if (quoteIndex === -1) {
            console.warn("[thl_catchClicks] Could not extract URL from onclick — may use a variable or template literal. Element left untouched for manual review.", el);
            return null;
        }

        const quoteChar = afterHref[quoteIndex];
        const urlStart = quoteIndex + 1;
        const urlEnd = afterHref.indexOf(quoteChar, urlStart);
        if (urlEnd === -1) return null;

        const candidate = afterHref.slice(urlStart, urlEnd);

        // Validate using the browser's own URL parser
        const parsed = new URL(candidate, location.origin);
        return parsed.href;
    } catch {
        console.warn("[thl_catchClicks] URL extraction failed for onclick handler:", handler, el);
        return null;
    }
}
