// Разбор генераторов версии 1 на оси и матрицу пар — чтобы пересобрать их кодом.
// Проверяет, что из осей восстанавливается каждая исходная позиция.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const html = cp.execSync('git show fb006df:DRINKS_TAXONOMY_MEGA.html', {cwd: ROOT, maxBuffer: 64 << 20}).toString('utf8');
const CATS = JSON.parse(html.slice(html.indexOf('const CATS = ') + 13, html.indexOf(';\n\nconst plu')));
const SEP = {g_pair:' + ',g_cocktail:' на базе: ',g_cask:' — ',g_grape:' в регионе: ',g_coffadd:' + ',g_teaadd:' + ',g_fruit:' → ',g_high:' + ',g_beerfood:' к: ',g_serve:' — ',g_defect:': ',g_namix:' + ',g_winestyle:' → ',g_hopstyle:' в стиле: ',g_botan:' в ',g_occ:' → ',g_coffbrew:' → ',g_teaway:' — ',g_glassice:' — ',g_smoothie:' + '};
const split = s => s.split('; ');
for (const c of CATS.filter(c => c.id.startsWith('g_'))) {
  const sep = SEP[c.id], rows = [];
  for (const [n, d] of c.items) {
    const nn = c.id === 'g_smoothie' ? n.replace(/^Смузи /, '') : n;
    const i = nn.indexOf(sep); rows.push({a: nn.slice(0, i), b: nn.slice(i + sep.length), d});
  }
  // для каждой оси: кандидаты-описания — общий префикс/суффикс по клаузам
  const group = key => { const g = {}; for (const r of rows) (g[r[key]] = g[r[key]] || []).push(split(r.d)); return g; };
  const lcp = arr => { let k = 0; while (arr.every(x => x.length > k && x[k] === arr[0][k])) k++; return arr[0].slice(0, k); };
  const lcs = arr => { const r = arr.map(x => [...x].reverse()); return lcp(r).reverse(); };
  const GA = group('a'), GB = group('b');
  // порядок: описание A впереди, если у A общий префикс непуст у большинства
  let aFirst = 0, bFirst = 0;
  for (const v of Object.values(GA)) if (v.length > 1) { lcp(v).length ? aFirst++ : bFirst++; }
  const order = aFirst >= bFirst ? 'AB' : 'BA';
  const A = Object.keys(GA), B = Object.keys(GB);
  const ad = {}, bd = {};
  for (const k of A) ad[k] = order === 'AB' ? lcp(GA[k]) : lcs(GA[k]);
  for (const k of B) bd[k] = order === 'AB' ? lcs(GB[k]) : lcp(GB[k]);
  // восстановление и остаток (середина, если есть)
  let ok = 0, mid = 0; const pairs = [];
  for (const r of rows) {
    const p = split(r.d), x = order === 'AB' ? ad[r.a] : bd[r.b], y = order === 'AB' ? bd[r.b] : ad[r.a];
    const rest = p.slice(x.length, p.length - y.length);
    if ([...x, ...rest, ...y].join('; ') === r.d) ok++;
    if (rest.length) mid++;
    pairs.push([A.indexOf(r.a), B.indexOf(r.b), rest.join('; ')]);
  }
  const out = {id: c.id, name: c.name, emoji: c.emoji, desc: c.desc, color: c.color, sep, order,
    A: A.map(k => ({n: k, d: ad[k].join('; ')})), B: B.map(k => ({n: k, d: bd[k].join('; ')})), pairs};
  fs.writeFileSync(path.join(ROOT, 'gen/v1', c.id + '.json'), JSON.stringify(out, null, 1));
  console.log(c.id.padEnd(12), order, 'восстановлено', ok + '/' + rows.length, 'с серединой', mid,
    'пустых A', A.filter(k => !ad[k].length).length, 'пустых B', B.filter(k => !bd[k].length).length);
}
