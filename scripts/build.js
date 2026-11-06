const fs = require('node:fs');
const path = require('node:path');
const source = path.join(__dirname, '..', 'public');
const target = path.join(__dirname, '..', 'dist');
fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
for (const name of ['index.html', 'app.js', 'style.css']) if (!fs.existsSync(path.join(target, name))) throw new Error(`Missing ${name}`);
console.log('Build complete: dist/');
