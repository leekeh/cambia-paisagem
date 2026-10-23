# Cambia Paisagem

A platform for booking private tours in Lisbon, Portugal. Hosted at [cambiatours.com](https://cambiatours.com). Built with [Astro](https://astro.build) and deployed on [Cloudflare Pages](https://pages.cloudflare.com).

- [Domain settings](https://dash.cloudflare.com/808edf93dcf4598bd94f25d7cb6e1b19/cambiatours.com)
- [Cloudflare Pages settings](https://dash.cloudflare.com/808edf93dcf4598bd94f25d7cb6e1b19/workers/services/view/cambia-paisagem/production)

## Commands 👩‍💻

All commands are run from the root of the project, from a terminal:

| Command                       | Action                                                                         |
| :---------------------------- | :----------------------------------------------------------------------------- |
| `pnpm install`                | Installs dependencies                                                          |
| `pnpm run dev`                | Starts local dev server at `localhost:4321`                                    |
| `pnpm run build`              | Build your production site to `./dist/`                                        |
| `pnpm run preview`            | Preview your build locally, before deploying                                   |
| `pnpm run optimize-resources` | Optimize `.png`, `.jpg`, `.avif` resources in the assets directory             |
| `pnpm run generate-qr-codes`  | Generates a QR Code for each available tour. Output can be found at `./output` |
| `pnpm run astro ...`          | Run CLI commands like `astro add`, `astro check`                               |
| `pnpm run astro -- --help`    | Get help using the Astro CLI                                                   |

## Code guidelines 🤖

Use Astro if possible to improve static rendering and performance. We use React for interactive UI, with Mantine for components. Use plain CSS for styling, using CSS modules. Use CSS variables for colors and fonts. If you are missing a variable, add it to the `:root` selector in `src/styles/global.css`. For icons, use the [Tabler Icons](https://tabler-icons.io/) library. Follow these guidelines to maintain consistency and readability in the codebase. Ensure images are optimized before pushing them to the repository, using the provided optimization script.

## Image optimization 📸

Although we also use the built-in Astro image optimization features, we want to optimize the images before adding them to the project, to reduce the size of the repository. To optimize the images, run the following command in the terminal:

```sh
./optimize_resources.sh
```

This script will reduce the quality of the images to 80% and resize them to a maximum dimension of 860 pixels, while maintaining the aspect ratio. The optimized images will be saved in the same directory as the original images, with snake case names and the png format. The script requires `imagemagick` to be installed on your system. You can install it using Homebrew on macOS:

```sh
brew install imagemagick
```

You can tweak the optimization settings by changing the `QUALITY` and `MAX_DIMENSION` variables in the script. The script will process all images in the specified directories, so make sure to add any new directories that contain images to the `DIRECTORIES` array.

## Generating QR Code for the Tours 🤳

Individual QR codes can be generated for each tour, linking them directly to it's page on the `https://www.cambiatours.com` website. To generate the QR codes, run the following command in the terminal:

```sh
./generate_qr_codes.sh
```

The script requires `qrencode` to be installed on your system. You can install it using Homebrew on macOS:

```sh
brew install qrencode
```

The generated QR codes will be named after it's tour's name and can be found at `./output`

## WebMCP 🤖

The site exposes its contact, tour booking, and transfer booking forms as [WebMCP](https://webmachinelearning.github.io/webmcp/) tools via `document.modelContext`, so an AI agent browsing the site on a user's behalf can send a message or submit a booking request directly. Each tool opens the relevant (visible) form, fills it in, runs the same validation as a manual submission, and submits it to the existing API routes.

- `search_tours` — registered in [ToursFilter.tsx](src/components/ToursFilter.tsx) on the tours listing page. Read-only: filters/sorts by duration and price, same as the visible controls, and returns the matching tours.
- `send_contact_message` — registered in [ContactForm.tsx](src/components/ContactForm.tsx) on the contact page.
- `book_tour` — registered in [BookingModal.tsx](src/components/BookingModal.tsx) on each tour's detail page.
- `request_<transfer_type>_transfer` — registered in [TransferBookingModal.tsx](src/components/TransferBookingModal.tsx) for each transfer offered on the homepage.

Tool registration is handled by the shared [useWebMcpTool](src/hooks/useWebMcpTool.ts) hook, which no-ops in browsers that don't support `document.modelContext` yet. WebMCP is currently only available behind an origin trial / the `chrome://flags/#enable-webmcp-testing` flag in recent Chrome builds, so most visitors won't trigger it. Types come from the [webmcp-types](https://www.npmjs.com/package/webmcp-types) package, referenced in [src/webmcp.d.ts](src/webmcp.d.ts).

## Spam protection 🛡️

The contact, tour booking, and transfer API routes (`/api/contact-form`, `/api/tour-booking`, `/api/transfer`) are protected two ways:

- **[Turnstile](https://developers.cloudflare.com/turnstile/)** (`src/lib/turnstile.ts`, `src/hooks/useTurnstile.ts`) — a widget on each form that must resolve before submission; verified server-side via Cloudflare's `siteverify` endpoint. **Fails closed**: if `TURNSTILE_SECRET_KEY` isn't configured, submissions are rejected rather than silently allowed through.
- **Rate limiting** (`src/lib/rateLimit.ts`) — a Workers [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) keyed by IP + route. **Fails open**: if the `RATE_LIMITER` binding isn't present, requests aren't blocked — this is defense-in-depth, not the primary gate.

Both are designed to coexist with the WebMCP tools above: the tools fill in and submit the same live, on-page form a human would (see [BookingModal.tsx](src/components/BookingModal.tsx)'s `waitUntilReady()`/ref pattern), so Turnstile's widget runs in that real page the same way, and `handleSubmit` waits (`waitForToken`) for a token to resolve before posting — whether the submission was triggered by a click or by an agent's tool call.

**Required setup — Cloudflare dashboard:**

1. **Turnstile** (needed before deploying this, or the forms will reject all submissions):
   - Dashboard → **Turnstile** → **Add widget**. Name it, add your domain (`cambiatours.com`, and `localhost` if you want to test against the real widget instead of test keys), mode **Managed**, create.
   - Copy the **Site Key** → set as `PUBLIC_TURNSTILE_SITE_KEY` in the Pages project's **Settings → Environment variables** (plain, not encrypted — it's public).
   - Copy the **Secret Key** → set as `TURNSTILE_SECRET_KEY` in the same place, but as a **Secret/Encrypted** variable.
   - Set both for both Production and Preview environments.
2. **Rate limiting**: can't be added from the dashboard (no UI for this binding type yet) — see the to-do item below, this needs a `wrangler.jsonc` committed to the repo instead.

For local development, `.dev.vars.example` and `.env.example` document Cloudflare's official ["always passes" test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) so you don't need a real Turnstile account to run `pnpm dev`.

## To do list ✏️

- ~~improve email template~~
- ~~send a confirmation email to the user after they submit the contact form, with the details of their request and a link to the tour page.~~
- ~~add domain for hosting: https://resend.com/domains~~
- ~~generate QR codes to go to the tour page.~~
- ~~add transfer service from airport to hotel and back.~~
- ~~add tours received in email~~
- ~~properly configure environmental variables for production and development~~
- ~~Add support for web mcp to send email requests~~
- ~~add rate limiting to the contact apis~~ (Turnstile is live; the `RATE_LIMITER` binding still needs a `wrangler.jsonc` — see "Spam protection" above)
- redirect on the server automatically to the correct language based on the browser settings. Dependent on https://github.com/withastro/astro/pull/15686
- ~~fix env vars in production~~
