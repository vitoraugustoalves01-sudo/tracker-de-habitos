#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const src  = path.join(__dirname, 'src');
const dist = path.join(__dirname, 'dist');
if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

fs.readdirSync(src).forEach(f => fs.copyFileSync(path.join(src, f), path.join(dist, f)));

// Ícone SVG — monograma serifado com barra em ciano e marca de registro em
// magenta, sobre o fundo papel do design system (Broadsheet).
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="40" fill="#f3f2f2"/>
  <g transform="translate(26,16) scale(3.5)">
    <text x="1" y="38" font-family="'Source Serif 4', Georgia, serif" font-weight="600" font-size="42" fill="#201e1d">H</text>
    <rect x="6" y="19" width="27" height="5" fill="#0088b0"/>
    <circle cx="34.5" cy="40.5" r="2.5" fill="#d6006c"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(dist, 'icon.svg'), icon);

// Atualiza manifest para usar SVG
let manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.json'), 'utf8'));
manifest.icons = [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }];
fs.writeFileSync(path.join(dist, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('✅ Build ok → dist/');
