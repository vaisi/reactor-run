/* Builds www/ (what the iOS and Android apps load) from game/reactor-run.html, the same file the web version is published from.
   The app copy runs fully offline: Three.js and both fonts are bundled instead of coming from a CDN and Google Fonts. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'game', 'reactor-run.html');
const WWW = path.join(ROOT, 'www');
const NM = path.join(ROOT, 'node_modules');
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.147.0/';

const fail = msg => { console.error('build-web: ' + msg); process.exit(1); };
if (!fs.existsSync(SRC)) fail('missing ' + path.relative(ROOT, SRC));
if (!fs.existsSync(path.join(NM, 'three'))) fail('run "npm install" first');

fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(path.join(WWW, 'fonts'), { recursive: true });
let html = fs.readFileSync(SRC, 'utf8');

/* 1. Three.js from the app bundle */
const vendored = new Set();
html = html.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.147\.0\/([^"']+)/g, (m, rel) => { vendored.add(rel); return 'vendor/three/' + rel; });
if (!vendored.size) fail('no Three.js script tags found (expected ' + CDN + '...)');
for (const rel of vendored) {
  const from = path.join(NM, 'three', rel), to = path.join(WWW, 'vendor', 'three', rel);
  if (!fs.existsSync(from)) fail('three@0.147.0 has no ' + rel);
  fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to);
}
fs.copyFileSync(path.join(NM, 'three', 'LICENSE'), path.join(WWW, 'vendor', 'three', 'LICENSE'));

/* 2. Fonts from the app bundle (latin + latin-ext, woff2 only) */
const FONTS = [['big-shoulders-display', [700, 900]], ['chakra-petch', [400, 600]]];
let css = '';
for (const [pkg, weights] of FONTS) {
  const dir = path.join(NM, '@fontsource', pkg);
  if (!fs.existsSync(dir)) fail('missing @fontsource/' + pkg + ' (run "npm install")');
  for (const w of weights) {
    for (const block of fs.readFileSync(path.join(dir, w + '.css'), 'utf8').split(/(?=\/\* )/)) {
      const name = (block.match(/^\/\* (\S+) \*\//) || [])[1];
      if (!name || !/-latin(-ext)?-\d+-normal$/.test(name)) continue;
      const file = name + '.woff2';
      fs.copyFileSync(path.join(dir, 'files', file), path.join(WWW, 'fonts', file));
      css += block.replace(/src:[^;]+;/, `src: url(./${file}) format('woff2');`).trim() + '\n\n';
    }
  }
  fs.copyFileSync(path.join(dir, 'LICENSE'), path.join(WWW, 'fonts', 'LICENSE-' + pkg + '.txt'));
}
fs.writeFileSync(path.join(WWW, 'fonts', 'fonts.css'), css);
html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts/fonts.css">');
if (/fonts\.googleapis|cdn\.jsdelivr/.test(html)) fail('an external URL is still in the page');

/* 3. Safe areas: Capacitor injects --safe-area-inset-* on Android because older Android WebViews report wrong env() values */
html = html.replace(/env\(safe-area-inset-(top|right|bottom|left)(?:,\s*0px)?\)/g, (m, side) => `var(--safe-area-inset-${side},env(safe-area-inset-${side},0px))`);

/* 4. A complete document: head (title + styles), then the game */
html = html.replace(/<meta name="claude:[^>]*>\s*/g, '');
const cut = html.indexOf('</style>') + '</style>'.length;
if (cut < 8) fail('no <style> block found');
const head = html.slice(0, cut), body = html.slice(cut);
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#07080a">
<meta name="format-detection" content="telephone=no">
<script>/* never leave the launch screen up if the game fails to start */ setTimeout(function () { try { var s = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.SplashScreen; if (s) s.hide(); } catch (e) {} }, 6000);</script>
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;
fs.writeFileSync(path.join(WWW, 'index.html'), page);

const kb = f => Math.round(fs.statSync(f).size / 1024);
console.log(`build-web: www/index.html ${kb(path.join(WWW, 'index.html'))} KB, ${vendored.size} Three.js files, ${fs.readdirSync(path.join(WWW, 'fonts')).filter(f => f.endsWith('.woff2')).length} font files`);
