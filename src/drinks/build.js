// Сборка таксономии напитков v2: v1 + правки (fixes) + новое (content) + генераторы → DRINKS_TAXONOMY_MEGA.html
// Запуск из корня репозитория: node src/drinks/build.js [--dry]
const fs = require('fs'), path = require('path');
const {load, makeT} = require('./lib/model');
const {audit} = require('./audit');
const S = require('./structure');
const DIR = __dirname, OUT = path.resolve(DIR, '../../DRINKS_TAXONOMY_MEGA.html');

const cats = load(), log = [], T = makeT(cats, log);
const apply = dir => fs.readdirSync(path.join(DIR, dir)).filter(f => f.endsWith('.js')).sort().forEach(f => require(path.join(DIR, dir, f))(T));
apply('fixes');
const nFix = log.length;
apply('content');
for (const [from, to] of Object.entries(S.merge)) T.merge(from, to);

const gens = [require('./gen/fruit')(), ...require('./gen/simple')(), ...require('./gen/rules1')(), ...require('./gen/rules2')(), ...require('./gen/pairing')()];
const genById = new Map(gens.map(g => [g.id, g]));

const clean = s => s.replace(/́/g, '').replace(/\s+/g, ' ').trim();
const used = new Set(), CATS = [];
for (const [g, ids] of S) for (const id of ids) {
  if (used.has(id)) throw new Error('категория дважды: ' + id);
  used.add(id);
  let c;
  if (genById.has(id)) { const x = genById.get(id); c = {id, emoji: x.emoji, name: x.name, color: x.color, desc: x.desc, items: x.items}; }
  else if (cats.has(id)) { const x = cats.get(id); c = {...x.meta, items: x.items.map(it => [it.n, it.d])}; }
  else throw new Error('нет категории ' + id);
  const meta = (S.meta || {})[id] || {};
  let items = c.items.map(([n, d]) => [clean(n), clean(d)]);
  if ((S.sort || {})[id] === 'alpha') items.sort((a, b) => a[0].localeCompare(b[0], 'en'));
  CATS.push({g, id, emoji: meta.emoji || c.emoji, name: meta.name || c.name, color: meta.color || c.color, desc: clean(meta.desc || c.desc), items});
}
const lost = [...cats.keys()].filter(id => !used.has(id) && cats.get(id).items.length);
if (lost.length) throw new Error('категории вне структуры: ' + lost.join(', '));
const empty = CATS.filter(c => !c.items.length).map(c => c.id);
if (empty.length) throw new Error('пустые категории: ' + empty.join(', '));

const r = audit(CATS);
console.log('правок v1:', nFix, '| операций всего:', log.length);
console.log(JSON.stringify(r.stats));
for (const w of r.warn.slice(0, 20)) console.log('  предупреждение:', w);
if (r.errors.length) { for (const e of r.errors.slice(0, 60)) console.log('  ОШИБКА:', e); console.log('ошибок:', r.errors.length); process.exit(1); }
if (process.argv.includes('--dry')) process.exit(0);
const tpl = fs.readFileSync(path.join(DIR, 'template.html'), 'utf8');
if (!tpl.includes('/*@CATS@*/[]')) throw new Error('в шаблоне нет метки данных');
const esc = s => s.replace(/&/g, '&amp;');
const SAFE = CATS.map(c => ({...c, name: esc(c.name), desc: esc(c.desc), items: c.items.map(([n, d]) => [esc(n), esc(d)])}));
fs.writeFileSync(OUT, tpl.replace('/*@CATS@*/[]', () => JSON.stringify(SAFE)));
console.log('записано', OUT, Math.round(fs.statSync(OUT).size / 1024) + ' КБ');
