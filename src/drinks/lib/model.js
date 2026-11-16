// Рабочая модель: категории версии 1 + операции правки.
// Позиции адресуются по категории и ИСХОДНОМУ номеру в v1 (1-based, как в выгрузках),
// либо по точному названию. Ошибка адресации останавливает сборку.
const fs = require('fs'), path = require('path');

function load() {
  const v1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../v1/curated.json'), 'utf8'));
  const cats = new Map();
  for (const c of v1) {
    const {items, ...meta} = c;
    cats.set(c.id, {meta, items: items.map(([n, d], i) => ({n, d, _c: c.id, _i: i + 1}))});
  }
  return cats;
}

function makeT(cats, log) {
  const where = (cat, ref) => {
    for (const [id, c] of cats) {
      const k = c.items.findIndex(it => typeof ref === 'number'
        ? it._c === cat && it._i === ref
        : (it._c === cat || id === cat) && it.n === ref);
      if (k >= 0) return {c, k, id};
    }
    throw new Error(`fix: не найдено ${cat} #${ref}`);
  };
  const need = id => { const c = cats.get(id); if (!c) throw new Error('fix: нет категории ' + id); return c; };
  const T = {
    set(cat, ref, {n, d}) { const {c, k} = where(cat, ref); if (n) c.items[k].n = n; if (d) c.items[k].d = d; log.push(['set', cat, ref]); return T; },
    n(cat, ref, n) { return T.set(cat, ref, {n}); },
    d(cat, ref, d) { return T.set(cat, ref, {d}); },
    del(cat, ...refs) { for (const r of refs) { const {c, k} = where(cat, r); c.items.splice(k, 1); log.push(['del', cat, r]); } return T; },
    mv(cat, to, ...refs) { const dst = need(to); for (const r of refs) { const {c, k} = where(cat, r); dst.items.push(c.items.splice(k, 1)[0]); log.push(['mv', cat, r, to]); } return T; },
    add(cat, items) { const c = need(cat); for (const [n, d] of items) c.items.push({n, d, _c: cat, _i: 'new'}); log.push(['add', cat, items.length]); return T; },
    cat(id, meta) { if (!cats.has(id)) cats.set(id, {meta: {id, ...meta}, items: []}); else Object.assign(cats.get(id).meta, meta); return T; },
    merge(from, to) { const s = need(from), dst = need(to); dst.items.push(...s.items); cats.delete(from); log.push(['merge', from, to]); return T; },
    drop(id) { need(id); cats.delete(id); log.push(['drop', id]); return T; },
  };
  return T;
}

module.exports = {load, makeT};
