# Cambia Paisagem

A platform for booking private tours in Lisbon, Portugal. Hosted at [cambiatours.com](https://cambiatours.com). Built with [Astro](https://astro.build) and deployed on [Cloudflare Pages](https://pages.cloudflare.com).

- [Domain settings](https://dash.cloudflare.com/808edf93dcf4598bd94f25d7cb6e1b19/cambiatours.com)
- [Cloudflare Pages settings](https://dash.cloudflare.com/808edf93dcf4598bd94f25d7cb6e1b19/workers/services/view/cambia-paisagem/production)

## Commands 👩‍💻

All commands are run from the root of the project, from a terminal:

| Command                    | Action                                           |
| :------------------------- | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm run dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm run build`           | Build your production site to `./dist/`          |
| `pnpm run preview`         | Preview your build locally, before deploying     |
| `pnpm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro -- --help` | Get help using the Astro CLI                     |

## Code guidelines 🤖

Use Astro if possible to improve static rendering and performance. We use React for interactive UI, with Mantine for components. Use plain CSS for styling, using CSS modules. Use CSS variables for colors and fonts. If you are missing a variable, add it to the `:root` selector in `src/styles/global.css`. For icons, use the [Tabler Icons](https://tabler-icons.io/) library. Follow these guidelines to maintain consistency and readability in the codebase. Ensure images are optimized before pushing them to the repository, using the provided optimization script.

## Image optimization 📸

Although we also use the built-in Astro image optimization features, we want to optimize the images before adding them to the project, to reduce the size of the repository. To optimize the images, run the following command in the terminal:

```sh
./optimize.sh
```

This script will reduce the quality of the images to 80% and resize them to a maximum dimension of 860 pixels, while maintaining the aspect ratio. The optimized images will be saved in the same directory as the original images, with snake case names and the png format. The script requires `imagemagick` to be installed on your system. You can install it using Homebrew on macOS:

```sh
brew install imagemagick
```

You can tweak the optimization settings by changing the `QUALITY` and `MAX_DIMENSION` variables in the script. The script will process all images in the specified directories, so make sure to add any new directories that contain images to the `DIRECTORIES` array.

## To do list ✏️

- improve email template
- send a confirmation email to the user after they submit the contact form, with the details of their request and a link to the tour page.
- add domain for hosting: https://resend.com/domains
- generate QR codes to go to the tour page.
- add transfer service from airport to hotel and back.
- add tours received in email
- properly configure environmental variables for production and development
- Add support for web mcp to send email requests
- add rate limiting to the contact api
- redirect on the server automatically to the correct language based on the browser settings. Dependent on https://github.com/withastro/astro/pull/15686
