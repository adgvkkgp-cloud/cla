// Общий движок генераторов: оси с тегами, правила допуска, пояснение к конкретной паре.
// Описание собирается из предложений — каждое с заглавной, через точку (в v1 было «; Заглавная»).
const fs = require('fs'), path = require('path');
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const sent = parts => parts.filter(Boolean).map(p => cap(p.trim().replace(/[.;]+$/, ''))).join('. ');

// Ось из v1 (по имени) с правками текста и тегами: spec = {имя: 'теги' | ['теги', 'новый текст' , 'новое имя']}
function axis(v1axis, spec, extra = []) {
  const byName = new Map(v1axis.map(x => [x.n, x]));
  const out = [];
  for (const [n, s] of Object.entries(spec)) {
    const [tags, d2, n2] = Array.isArray(s) ? s : [s];
    const src = byName.get(n);
    if (!src && !d2) throw new Error('ось: нет «' + n + '» и нет текста');
    out.push({n: n2 || n, d: d2 || src.d, t: new Set(tags.split(/\s+/).filter(Boolean))});
  }
  for (const [n, d, tags] of extra) out.push({n, d, t: new Set(tags.split(/\s+/).filter(Boolean))});
  return out;
}
const has = (x, ...tags) => tags.some(t => x.t.has(t));
const all = (x, ...tags) => tags.every(t => x.t.has(t));

function run(g) {
  const items = [];
  for (const a of g.A) for (const b of g.B) {
    const r = g.rule(a, b);
    if (r === null || r === false || r === undefined) continue;
    const note = typeof r === 'string' ? r : '';
    items.push([g.name(a, b), sent(g.desc ? g.desc(a, b, note) : [note, a.d, b.d])]);
  }
  return {id: g.id, emoji: g.emoji, name: g.title, color: g.color, desc: g.about, gen: true, items};
}

module.exports = {axis, has, all, run, cap, sent, v1: id => JSON.parse(fs.readFileSync(path.join(__dirname, 'v1', id + '.json'), 'utf8'))};
