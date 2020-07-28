const fs = require('fs');
const path = require('path');

const packageJson = require('./package.json');

packageJson.main = 'index.js';
packageJson.types = 'index.d.ts';
delete packageJson.files;
delete packageJson.scripts;

fs.writeFileSync(path.resolve(__dirname, 'dist/package.json'), JSON.stringify(packageJson));
fs.copyFileSync(path.resolve(__dirname, 'README.md'), path.resolve(__dirname, 'dist/README.md'));
fs.copyFileSync(path.resolve(__dirname, 'LICENSE'), path.resolve(__dirname, 'dist/LICENSE'));