// Проверки качества и метрики. Используется build.js; отдельно: node audit.js v1 — метрики версии 1.
const kx = s => s.toLowerCase().replace(/ё/g, 'е').replace(/\([^)]*\)/g, '').replace(/[^a-zа-я0-9]+/g, ' ').trim();
function audit(CATS) {
  const errors = [], warn = [], items = [];
  for (const c of CATS) for (const [n, d] of c.items) items.push({c: c.id, gen: c.id.startsWith('g_'), n, d});
  // дубли названий
  const seen = new Map(), dups = [];
  for (const it of items) { const k = kx(it.n); if (seen.has(k)) dups.push([it.n, seen.get(k), it.c]); else seen.set(k, it.c); }
  for (const d of dups) errors.push('дубль названия: ' + d.join(' | '));
  for (const it of items) {
    const t = it.n + ' — ' + it.d;
    if (/[<>]/.test(t)) errors.push('HTML-символ: ' + t.slice(0, 80));
    if (/́|[​-‏­﻿]/.test(t)) errors.push('невидимый символ или ударение: ' + t.slice(0, 80));
    if (/[А-Яа-яЁё][A-Za-z]|[A-Za-z][А-Яа-яЁё]/.test(t.replace(/[0-9A-Za-z]+-[А-Яа-яЁё]+|[А-Яа-яЁё]+-[0-9A-Za-z]+/g, ''))) errors.push('смесь кириллицы и латиницы в слове: ' + t.slice(0, 90));
    if (!it.d || it.d.length < 20) warn.push('короткое описание: ' + it.n + ' — ' + it.d);
    if (/ {2}|\s[,.;:]|\.\.(?!\.)/.test(t)) errors.push('лишние пробелы или знаки: ' + t.slice(0, 80));
  }
  // «; Заглавная» в сгенерированных описаниях — след склейки двух фраз через точку с запятой
  const capAfterSemi = items.filter(it => it.gen && /; [А-ЯЁ]/.test(it.d));
  const descCount = new Map(); for (const it of items) descCount.set(it.d, (descCount.get(it.d) || 0) + 1);
  const repeatedDesc = [...descCount.values()].filter(v => v > 1).reduce((s, v) => s + v, 0);
  const stats = {
    categories: CATS.length, sections: new Set(CATS.map(c => c.g)).size, items: items.length,
    generated: items.filter(i => i.gen).length, curated: items.filter(i => !i.gen).length,
    dupNames: dups.length, genCapAfterSemicolon: capAfterSemi.length, repeatedDescriptions: repeatedDesc,
    shortDescriptions: items.filter(i => i.d.length < 30).length,
  };
  return {stats, errors, warn, capAfterSemi};
}
module.exports = {audit, kx};
if (require.main === module && process.argv[2] === 'v1') {
  const cp = require('child_process');
  const h = cp.execSync('git show fb006df:DRINKS_TAXONOMY_MEGA.html', {cwd: __dirname, maxBuffer: 64 << 20}).toString('utf8');
  const C = JSON.parse(h.slice(h.indexOf('const CATS = ') + 13, h.indexOf(';\n\nconst plu')));
  const r = audit(C); console.log(JSON.stringify(r.stats, null, 1)); console.log('ошибок', r.errors.length);
}
