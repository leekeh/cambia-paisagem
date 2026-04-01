# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

TODO:

- translate email to portuguese
- add domain for hosting: https://resend.com/domains

QR code to go to the tour page.
transfer service from airport to hotel and back.

tourlisbon.pt

calendar in the flow of the modal

web mcp just for fun.

redirect on the server automatically to the correct language based on the browser settings. => do after finishing onRequest middlewaremode

## Image optimization

Although we also use the built-in Astro image optimization, we want to optimize the images before adding them to the project, to reduce the size of the repository. To optimize the images, run the following command in the terminal:

```sh
./optimize.sh
```

This script will reduce the quality of the images to 80% and resize them to a maximum dimension of 860 pixels, while maintaining the aspect ratio. The optimized images will be saved in the same directory as the original images, with snake case names and the webp format. The script requires `imagemagick` to be installed on your system. You can install it using Homebrew on macOS:

```sh
brew install imagemagick
```

You can tweak the optimization settings by changing the `QUALITY` and `MAX_DIMENSION` variables in the script. The script will process all images in the specified directories, so make sure to add any new directories that contain images to the `DIRECTORIES` array.
