import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Where the app is served from. Defaults to relative paths ("./") so `dist/` works on any static host
 * or from a sub-folder. The GitHub Pages workflow sets BASE_PATH=/<repo-name>/ for a project site.
 */
const base = process.env.BASE_PATH || './';

/**
 * Static hosts like GitHub Pages serve 404.html for unknown paths. GoaBound is a single page, so any
 * stray URL (old bookmark, typo, trailing path) is sent back to the app instead of a dead end.
 * Only emitted for an absolute base, where the app's real address is known.
 */
function spaFallback(): Plugin {
  return {
    name: 'goabound-404-fallback',
    apply: 'build',
    generateBundle() {
      if (!base.startsWith('/')) return;
      const target = JSON.stringify(base);
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>GoaBound · Redirecting</title>
    <meta http-equiv="refresh" content="0; url=${base}" />
    <script>location.replace(${target} + location.search + location.hash);</script>
    <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fbf6ec;color:#10233d;font:16px/1.5 system-ui,sans-serif}a{color:#b9431f}</style>
  </head>
  <body>
    <p>Heading back to <a href="${base}">GoaBound</a>…</p>
  </body>
</html>
`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  base,
});
