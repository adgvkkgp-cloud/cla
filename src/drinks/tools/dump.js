// Выгрузка категорий v1 для вычитки: node tools/dump.js id1 id2 ...
const v1 = require('../v1/curated.json');
for (const id of process.argv.slice(2)) {
  const c = v1.find(x => x.id === id); if (!c) { console.log('?', id); continue; }
  console.log(`\n### ${c.id} — ${c.name} (${c.items.length}) :: ${c.desc}`);
  c.items.forEach(([n, d], i) => console.log(`${i + 1}. ${n} — ${d}`));
}
