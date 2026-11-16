// Генератор, чья матрица пар в v1 была разумной: берём её, правим тексты, убираем ошибочные пары,
// добавляем реальные примеры для конкретных сочетаний.
const {axis, run, v1} = require('./engine');
module.exports = (id, o = {}) => {
  const g = v1(id);
  const specA = {}, specB = {};
  for (const x of g.A) specA[x.n] = ['', (o.fixA || {})[x.n]];
  for (const x of g.B) specB[x.n] = ['', (o.fixB || {})[x.n]];
  for (const [k, v] of Object.entries(o.renA || {})) specA[k][2] = v;
  for (const [k, v] of Object.entries(o.renB || {})) specB[k][2] = v;
  const A = axis(g.A, specA), B = axis(g.B, specB);
  const oldA = g.A.map(x => x.n), oldB = g.B.map(x => x.n);
  const pairs = new Set(g.pairs.map(([a, b]) => oldA[a] + '|' + oldB[b]));
  for (const p of o.add || []) pairs.add(p);
  for (const p of o.drop || []) { if (!pairs.delete(p)) throw new Error(id + ': нет пары ' + p); }
  const orig = x => (o.renA && Object.keys(o.renA).find(k => o.renA[k] === x.n)) || x.n;
  const origB = x => (o.renB && Object.keys(o.renB).find(k => o.renB[k] === x.n)) || x.n;
  return run({
    id, emoji: o.emoji || g.emoji, title: o.title || g.name, color: g.color, about: o.about || g.desc, A, B,
    rule: (a, b) => {
      const k = orig(a) + '|' + origB(b);
      if (!pairs.has(k) || (o.dropRule && o.dropRule(orig(a), origB(b)))) return null;
      return (o.notes || {})[k] || true;
    },
    name: (a, b) => o.nameFmt ? o.nameFmt(a.n, b.n.charAt(0).toLowerCase() + b.n.slice(1)) : a.n + g.sep + b.n,
    desc: (a, b, note) => g.order === 'AB' ? [note, a.d, b.d] : [note, b.d, a.d],
  });
};
