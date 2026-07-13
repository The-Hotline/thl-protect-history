# thl-protect-history

A lightweight, dependency-free browser history protection utility from the [National Domestic Violence Hotline](https://www.thehotline.org). Prevents visits to a website from accumulating in the browser's history stack and integrates with your site's safety exit button, protecting survivors who may share a device with an abuser.

---

## How It Works

Once embedded, this utility intercepts navigation — link clicks, programmatic redirects, and new-tab navigations — and replaces each history entry rather than adding to it. By the time a visitor uses the safety exit button, there is no trail of visited pages to trace back through.

Double-tap Escape exits (common on survivor-facing sites) are left alone — the utility does not interfere with them, and does not clear session state when they fire.

---

## Installation

### 1. Add the embed script

Add the following script tag to the `<head>` of every page on your site, filling in the exit button configuration described below:

```html
<script type="module" src="https://cdn.thehotline.us/thl-protect-history/thl-protect-history.js?{exit-button-config}"></script>
```

### 2. Configure exit button behavior

**This configuration is required for most implementations.** Without it, the utility will intercept clicks on your exit button and break its behavior.

#### Identify the exit button(s)

Determine a CSS selector that identifies your exit button(s). Make sure the selector matches only safety exit buttons.

**CSS-syntax selectors**
* id → `#{id}` (most reliable)
* class → `.{class_name}`
* other attribute → `[attribute_name="attribute_value"]`

**Examples**

```html
<button id="exit-button">Exit</button>
```
* Notes: Simple case — the `id` is on the exit button itself.
* Selector: `#exit-button`
* Embed URL: `...thl-protect-history.js?exit-btn-selector=#exit-button`

---

```html
<p class="exit1-wrap">
  <a href="./" @click.prevent="$dispatch('exit')">
    <i class="icon-close-thick"></i> <span>exit</span>
  </a>
</p>
```
* Notes: The exit link itself is the `<a>`, but `exit-btn-selector=a` would match every `<a>` on the page. Instead, target the parent wrapper.
* Selector: `.exit1-wrap`
* Embed URL: `...thl-protect-history.js?exit-btn-selector=.exit1-wrap`

---

```html
<header>
  <div class="exit-button">
    <a href="./" @click.prevent="$dispatch('exit')">
  </div>
</header>
<footer>
  <div class="exit-button">
    <a href="./" @click.prevent="$dispatch('exit')">
  </div>
</footer>
```
* Notes: Multiple exit buttons on the page. Use the common class name.
* Selector: `.exit-button`
* Embed URL: `...thl-protect-history.js?exit-btn-selector=.exit-button`

#### Choose the exit destination

By default, the utility redirects your exit button to **https://live-local-weather.com** and clears session state on click.

If you prefer to keep your existing exit button destination, add `exit-to-live-local-weather=false`. The utility will still clear session state on click, but will not redirect — your exit button's existing behavior runs unchanged.

* Query params:
  * `exit-btn-selector={your-selector}`
  * `exit-to-live-local-weather=false`
* Embed URL: `...thl-protect-history.js?exit-btn-selector=#exit-button&exit-to-live-local-weather=false`

#### Opt out of exit integration - *advanced*

If you can confirm through testing that your exit button is not affected by this utility and you want to keep its current behavior, you can silence the console warning about a missing exit-btn-selector:
* Query param: exit-btn-selector=false
* Embed URL: ...thl-protect-history.js?exit-btn-selector=false

Note that session state will not be cleared when a visitor uses your exit button, so history protection may persist across visits within the same browser session.

If your exit button uses a JavaScript framework (Alpine, React, Vue, etc.), an `addEventListener` handler, or any custom logic beyond a plain `href` or inline `onclick`, you must provide a selector. Otherwise the utility will intercept the click before your handler runs.

### 3. Optional color parameters

Three optional query parameters let you match the banner to your site's color scheme. All values are **6-digit hex codes without the `#`**.

| Parameter | Applies to | Default |
|---|---|---|
| `bg-color` | Banner background | `e3e3e3` |
| `text-color` | Text color | `333333` |
| `btn-color` | Button text color | `a93e92` |

Invalid or absent values fall back to the defaults automatically.

**Example:**

```html
<script type="module" src="https://cdn.thehotline.us/thl-protect-history/thl-protect-history.js?exit-btn-selector=.exit1-wrap&bg-color=c9c9c9&btn-color=812eec&text-color=ba5d9c"></script>
```

---

## Limitations

This utility covers the most common navigation patterns, but cannot intercept everything:

- **Global event listeners using `location.href =` or `location.assign()`** attached via `addEventListener` cannot be intercepted. Avoid these patterns in your own code on protected pages.
- **`history.pushState()` and `history.replaceState()`** are not intercepted. Avoid these, or override them explicitly if third-party code uses them.
- **Meta refresh tags** (`<meta http-equiv="refresh">`) are not interceptable by JavaScript and should be avoided on protected pages.
- **Third-party or marketing scripts** (analytics, chat widgets, ad tags, etc.) that navigate before the page has fully loaded may not be caught. Audit any third-party scripts you use regularly.
- **Dynamic link targets** — if your site sets a link's destination using a variable, template literal, or function call rather than a plain URL string, that link will be left untouched and a warning will be logged to the browser console for developer review.

---

## Google Tag Manager Note

If your team uses Google Tag Manager's **preview/debug mode**, the `window.open` intercept is automatically disabled during those sessions so debugging works normally. This is intentional — it only applies to GTM debug sessions and does not affect live visitor traffic.

---

## Support

**This project is provided as-is. We are not able to respond to implementation questions or troubleshooting requests.**

If this README isn't enough to get you going, this utility may be a good fit for a web developer or volunteer tech consultant with basic website development experience.

---

## License

MIT © [National Domestic Violence Hotline](https://www.thehotline.org)