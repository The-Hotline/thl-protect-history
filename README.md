# thl-protect-history

A lightweight, dependency-free browser history protection utility from the [National Domestic Violence Hotline](https://www.thehotline.org). Prevents visits to a website from accumulating in the browser's history stack, protecting survivors who may share a device with an abuser.

---

## How It Works

When someone visits a website, visitors can enable this utility to intercept navigation — link clicks, programmatic redirects, and new-tab navigations — and replace each history entry rather than adding to it. By the time a visitor uses the safety exit button, there is no trail of visited pages to trace back through.


---

## Installation

Add the following script tag to the `<head>` of every page on your site:

```html
<script type="module" src="https://cdn.thehotline.us/thl-protect-history/thl-protect-history.js"></script>
```

No initialization or configuration is required.

---

## Optional Color Parameters

Three optional query parameters let you match the banner to your site's color scheme. All values are **6-digit hex codes without the `#`**.

| Parameter | Applies to | Default |
|---|---|---|
| `bg-color` | Banner background | `e3e3e3` |
| `text-color` | Text color | `333333` |
| `btn-color` | Button text color | `a93e92` |

Invalid or absent values fall back to the defaults automatically.

**Example:**

```html
<script type="module" src="https://cdn.thehotline.us/thl-protect-history/thl-protect-history.js?bg-color=c9c9c9&btn-color=812eec&text-color=ba5d9c"></script>
```

---

## Limitations

This utility covers the most common navigation patterns, but cannot intercept everything:

- **Third-party or marketing scripts** (analytics, chat widgets, ad tags, etc.) that navigate the page on their own may not be caught. Audit any third-party scripts you use regularly.
- **Meta refresh tags** (`<meta http-equiv="refresh">`) are not interceptable by JavaScript and should be avoided on protected pages.
- **Dynamic link targets** — if your site sets a link's destination using a variable or script logic rather than a plain URL, that link will be left untouched and a warning will be logged to the browser console for developer review.

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