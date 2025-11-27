<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Netcup VPS Sentinel

This project contains everything you need to run the Netcup VPS Sentinel app locally and deploy it to a static host.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app: `npm run dev`

## Build for deployment

1. Install dependencies: `npm install`
2. Build the production bundle: `npm run build`
3. Deploy the generated static files from `dist/browser/` to your hosting provider.

### One-click Nginx deploy

If your host already serves `/usr/share/nginx/html`, run `./deploy.sh` on the server. It will install dependencies, build the app, clear the Nginx web root, and copy the contents of `dist/browser/` so Nginx serves the Angular bundle instead of the default welcome page.
