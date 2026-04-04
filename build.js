#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SA_KEY  = process.env.SA_KEY_JSON;
const SHEET_ID = process.env.SHEET_ID;

if (!SA_KEY || !SHEET_ID) {
  console.error('❌ SA_KEY_JSON e SHEET_ID precisam estar definidos');
  process.exit(1);
}

try { JSON.parse(SA_KEY); } catch(e) {
  console.error('❌ SA_KEY_JSON inválido:', e.message);
  process.exit(1);
}

const src  = path.join(__dirname, 'src');
const dist = path.join(__dirname, 'dist');
if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

fs.readdirSync(src).forEach(f => fs.copyFileSync(path.join(src, f), path.join(dist, f)));

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

// JSON.stringify(SA_KEY) produz a string com escapes corretos e aspas duplas externas
// O placeholder no HTML é: JSON.parse('__SA_KEY_JSON__')
// Substituímos pela string JSON com aspas duplas — funciona direto como argumento do parse
const saKeyAsJsString = JSON.stringify(SA_KEY);

html = html
  .replace("'__SA_KEY_JSON__'", saKeyAsJsString)
  .replace('__SHEET_ID__', SHEET_ID);

fs.writeFileSync(path.join(dist, 'index.html'), html);

// Ícone SVG
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="40" fill="#0d0d0d"/>
  <text x="96" y="125" font-size="100" text-anchor="middle" font-family="sans-serif" fill="#2563eb">H</text>
</svg>`;
fs.writeFileSync(path.join(dist, 'icon.svg'), icon);

// Atualiza manifest para usar SVG
let manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.json'), 'utf8'));
manifest.icons = [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }];
fs.writeFileSync(path.join(dist, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('✅ Build ok → dist/');
