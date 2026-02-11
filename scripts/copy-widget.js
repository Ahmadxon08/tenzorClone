// scripts/copy-widget.js (ESM)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const indexHtml = path.join(distDir, 'index.html');
const widgetHtml = path.join(distDir, 'widget.html');

if (!fs.existsSync(distDir)) {
  console.error('Xato: dist papkasi topilmadi. Avval `npm run build` qiling yoki build jarayonini tekshiring.');
  process.exit(1);
}

if (!fs.existsSync(indexHtml)) {
  console.error('Xato: dist/index.html topilmadi. Build jarayonini tekshiring.');
  process.exit(1);
}

try {
  fs.copyFileSync(indexHtml, widgetHtml);
  console.log('OK: dist/index.html -> dist/widget.html nusxa olindi');
} catch (err) {
  console.error('Xato: nusxa olishda muammo:', err);
  process.exit(1);
}
