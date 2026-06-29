// JavaScript file
// National Domestic Violence Hotline Protect History Utility
// author: Chad Cleveland | National Domestic Violence Hotline | TheHotline.org
// copyright: © National Domestic Violence Hotline. All rights reserved. Effective as of timestamp below.

// Last Modified: '2026-06-29 16:01';
const thl_protectHistoryLastModified = '2026-06-29 16:01';
console.log("National Domestic Violence Hotline - Protect History Utility.\n   To implement on your site, contact software@thehotline.org", thl_protectHistoryLastModified);

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
  
  User-intentional new tabs (Ctrl+click, Cmd+click, middle-click, right-click > "Open in new tab", long-press) are always respected and never interfered with.
*/

thl_initProtectHistory();

function thl_initProtectHistory() {
    thl_bufferHistory();
    thl_overrideWindowOpen();
    document.addEventListener("DOMContentLoaded", () => thl_catchClicks());
    window.addEventListener("load", () => thl_catchInlineClickEvents());
}

function thl_bufferHistory() {
    // Buffer any uncaught history entries
    history.pushState(null, "", "https://google.com");
    history.pushState(null, "", "https://google.com?q=weather");
    history.pushState(null, "", "https://google.com?q=news");
    history.pushState(null, "", "https://google.com?q=local+news");
    history.pushState(null, "", "https://google.com?q=weather");
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
