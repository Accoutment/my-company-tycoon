#!/usr/bin/env node
/* ------------------------------------------------------------------
   MY COMPANY TYCOON - build script
   รวมทุกไฟล์กลับเป็น HTML ไฟล์เดียวพร้อมแจก (ฝังรูป/เสียงเป็น base64)

       node build.js              -> dist/MY_COMPANY_TYCOON.html
       node build.js v195         -> dist/MY_COMPANY_TYCOON_v195.html
------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ver  = process.argv[2] || '';
const outName = 'MY_COMPANY_TYCOON' + (ver ? '_' + ver : '') + '.html';
const outPath = path.join(ROOT, 'dist', outName);

const MIME = { webp:'image/webp', png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg',
               gif:'image/gif', svg:'image/svg+xml', mp3:'audio/mpeg', wav:'audio/wav',
               ogg:'audio/ogg', woff2:'font/woff2' };

let inlinedAssets = 0, missing = [];
const cache = new Map();

/* asset path -> data URI */
function toDataURI(rel) {
  const clean = rel.replace(/^(\.\.\/)+/, '');          // '../assets/..' -> 'assets/..'
  if (cache.has(clean)) return cache.get(clean);
  const abs = path.join(ROOT, clean);
  if (!fs.existsSync(abs)) { missing.push(clean); return null; }
  const ext = path.extname(clean).slice(1).toLowerCase();
  const uri = 'data:' + (MIME[ext] || 'application/octet-stream')
            + ';base64,' + fs.readFileSync(abs).toString('base64');
  cache.set(clean, uri);
  inlinedAssets++;
  return uri;
}

const ASSET_RE = /(?:\.\.\/)*assets\/(?:img|audio|other)\/[0-9a-f]{8,}\.[A-Za-z0-9]+/g;

function embedAssets(text) {
  return text.replace(ASSET_RE, m => toDataURI(m) || m);
}

function readPart(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) { console.error('  !! ไม่พบไฟล์: ' + rel); process.exit(1); }
  return embedAssets(fs.readFileSync(abs, 'utf8'));
}

console.log('\n>> build: ' + outName);
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let nJs = 0, nCss = 0;

/* <script id=".." src="js/..."></script>  ->  <script id="..">CODE</script> */
html = html.replace(
  /<script([^>]*?)\ssrc=["'](js\/[^"']+)["']([^>]*)>\s*<\/script>/g,
  (m, a, src, b) => {
    nJs++;
    const code = readPart(src).replace(/<\/script/gi, '<\\/script');
    return '<script' + (a + b).replace(/\s+/g, ' ').trimEnd() + '>' + code + '</script>';
  });

/* <link id=".." rel="stylesheet" href="css/.."> -> <style id="..">CSS</style> */
html = html.replace(
  /<link([^>]*?)href=["'](css\/[^"']+)["']([^>]*)>/g,
  (m, a, href, b) => {
    nCss++;
    const attrs = (a + b).replace(/rel=["']stylesheet["']/i, '').replace(/\s+/g, ' ').trim();
    return '<style' + (attrs ? ' ' + attrs : '') + '>' + readPart(href) + '</style>';
  });

html = embedAssets(html);                                 // assets referenced in index.html

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(outPath, html);

console.log('   js  inlined : ' + nJs);
console.log('   css inlined : ' + nCss);
console.log('   assets      : ' + inlinedAssets);
if (missing.length) {
  console.log('   !! asset หาย ' + missing.length + ' ไฟล์ (เหลือ path เดิมไว้):');
  [...new Set(missing)].slice(0, 10).forEach(f => console.log('      - ' + f));
}
console.log('   ขนาดไฟล์    : ' + (html.length / 1048576).toFixed(2) + ' MB');
console.log('   เสร็จ -> dist/' + outName + '\n');
