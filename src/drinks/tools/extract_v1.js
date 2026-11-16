// Однократно: достаёт из коммита fb006df (версия 1 таксономии напитков)
// рукописные категории (без генераторов g_*) и шаблон интерфейса.
// Запуск: node tools/extract_v1.js
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const html = cp.execSync('git show fb006df:DRINKS_TAXONOMY_MEGA.html', {cwd: ROOT, maxBuffer: 64 << 20}).toString('utf8');
const a = html.indexOf('const CATS = ') + 'const CATS = '.length;
const b = html.indexOf(';\n\nconst plu');
const CATS = JSON.parse(html.slice(a, b));
const curated = CATS.filter(c => !c.id.startsWith('g_'));
// одна позиция — одна строка: удобно для diff
const lines = ['['];
curated.forEach((c, ci) => {
  const {items, ...meta} = c;
  lines.push(' ' + JSON.stringify(meta).slice(0, -1) + ',"items":[');
  items.forEach((it, ii) => lines.push('  ' + JSON.stringify(it) + (ii < items.length - 1 ? ',' : '')));
  lines.push(' ]}' + (ci < curated.length - 1 ? ',' : ''));
});
lines.push(']');
fs.writeFileSync(path.join(ROOT, 'v1/curated.json'), lines.join('\n') + '\n');
fs.writeFileSync(path.join(ROOT, 'template.html'), html.slice(0, a) + '/*@CATS@*/[]' + html.slice(b));
console.log('v1: категорий', CATS.length, 'рукописных', curated.length,
  'позиций', curated.reduce((s, c) => s + c.items.length, 0));
