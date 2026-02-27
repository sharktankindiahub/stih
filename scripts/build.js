#!/usr/bin/env node
/**
 * Build script: copies public/ to dist/ and injects
 * a <meta name="app-environment"> tag based on APP_ENV.
 */
const fs = require('fs');
const path = require('path');

const ENV = process.env.APP_ENV || 'production';
const SRC = path.join(__dirname, '..', 'public');
const DEST = path.join(__dirname, '..', 'dist');

// Clean and recreate dist/
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true });
}
fs.mkdirSync(DEST, { recursive: true });

// Copy all files from public/ to dist/
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDir(SRC, DEST);

// Inject environment meta tag into index.html
const indexPath = path.join(DEST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(
  '<meta charset="UTF-8" />',
  `<meta charset="UTF-8" />\n    <meta name="app-environment" content="${ENV}" />`
);
fs.writeFileSync(indexPath, html);

console.log(`Build complete → dist/ [APP_ENV=${ENV}]`);
