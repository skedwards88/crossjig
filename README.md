# Crossjig

A word based jigsaw puzzle

**Players:** 1

**Time:** 5 minutes

[Play Now!](https://crossjig.com/)

<img src="src/images/icon_512.png" alt="game icon" width="70"/>

Do you have feedback or ideas for improvement? [Open an issue](https://github.com/skedwards88/crossjig/issues/new).

Want more games? Visit [SECT Games](https://skedwards88.github.io/).

## Development

To build, run `npm run build`.

To run locally with live reloading and no service worker, run `npm run dev`. (If a service worker was previously registered, you can unregister it in Chrome developer tools: `Application` > `Service workers` > `Unregister`.)

To run locally and register the service worker, run `npm start`.

To deploy, push to `main` or manually trigger the GitHub Actions `deploy.yml` workflow. During deployment, the prebuild script will compress some png images into the webp format. You can also compress these images by running `npm run compressImages` if you have the [webp compression tool](https://developers.google.com/speed/webp/docs/precompiled) installed.
