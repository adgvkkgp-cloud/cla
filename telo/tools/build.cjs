#!/usr/bin/env node
// Собирает таксономию телосложения и вклеивает её в одностраничник.
//
//   node tools/build.cjs
//
// Порядок: base.json → правки (patch.cjs) → новые разделы
// (additions.cjs) → перестановка → проверки → HTML.

const fs = require("path") && require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const base = JSON.parse(fs.readFileSync(path.join(root, "src/data/base.json"), "utf8"));
const patch = require(path.join(root, "src/data/patch.cjs"));
const patch2 = require(path.join(root, "src/data/patch2.cjs"));
const patch3 = require(path.join(root, "src/data/patch3.cjs"));

let additions = [];
for (const f of ["src/data/additions.cjs", "src/data/additions2.cjs"]) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) additions = additions.concat(require(p));
}

const report = [];
const warn = (m) => report.push(m);

// ── 1. Правки существующих разделов ─────────────────────────
let data = base.map((s) => ({ ...s, items: s.items.map((i) => ({ ...i })) }));

// удаление позиций
for (const [secId, names] of Object.entries(patch.dropItems || {})) {
  const sec = data.find((s) => s.id === secId);
  if (!sec) { warn(`dropItems: нет раздела ${secId}`); continue; }
  for (const n of names) {
    const before = sec.items.length;
    sec.items = sec.items.filter((i) => i.name !== n);
    if (sec.items.length === before) warn(`dropItems: не найдено «${n}» в ${secId}`);
  }
}

// правки позиций (обе части патча)
for (const table of [patch.itemPatches, patch2.itemPatches, patch3.itemPatches]) {
  for (const [secId, map] of Object.entries(table || {})) {
    const sec = data.find((s) => s.id === secId);
    if (!sec) { warn(`itemPatches: нет раздела ${secId}`); continue; }
    for (const [oldName, upd] of Object.entries(map)) {
      const it = sec.items.find((i) => i.name === oldName);
      if (!it) { warn(`itemPatches: не найдено «${oldName}» в ${secId}`); continue; }
      Object.assign(it, upd);
    }
  }
}

// достройка имён в генеративных разделах до уникальных
let renamed = 0;
for (const sec of data) renamed += patch2.fixGeneratedNames(sec);
if (renamed) console.log(`Достроено имён в генеративных разделах: ${renamed}`);

// правки разделов (в т.ч. переименование id)
for (const [secId, upd] of Object.entries(patch.sectionPatches || {})) {
  const sec = data.find((s) => s.id === secId);
  if (!sec) { warn(`sectionPatches: нет раздела ${secId}`); continue; }
  const { newId, ...rest } = upd;
  Object.assign(sec, rest);
  if (newId) sec.id = newId;
}

// глобальные замены в тексте и тегах
const applyText = (s) => {
  if (typeof s !== "string") return s;
  let out = s;
  for (const [re, to] of patch.textRewrites || []) out = out.replace(re, to);
  return out;
};
const applyTag = (t) => {
  let out = t;
  for (const [re, to] of patch.tagRewrites || []) if (re.test(out)) { out = out.replace(re, to); break; }
  return out;
};
for (const sec of data) {
  sec.title = applyText(sec.title);
  sec.subtitle = applyText(sec.subtitle);
  for (const it of sec.items) {
    it.name = applyText(it.name);
    it.description = applyText(it.description);
    if (Array.isArray(it.tags)) it.tags = [...new Set(it.tags.map(applyTag))];
  }
}

// ── 2. Новые разделы ────────────────────────────────────────
const existingIds = new Set(data.map((s) => s.id));
for (const sec of additions) {
  if (existingIds.has(sec.id)) { warn(`additions: раздел ${sec.id} уже существует`); continue; }
  existingIds.add(sec.id);
  data.push(sec);
}

// ── 3. Перестановка: интимная топография — в конец ──────────
const tail = [];
for (const id of patch.moveToEnd || []) {
  const idx = data.findIndex((s) => s.id === id);
  if (idx < 0) { warn(`moveToEnd: нет раздела ${id}`); continue; }
  tail.push(data.splice(idx, 1)[0]);
}
// генеративные переборы всегда в самом низу, интимная топография — перед ними
const gen = data.filter((s) => s.id.startsWith("gen-"));
data = data.filter((s) => !s.id.startsWith("gen-"));
data = data.concat(tail, gen);

// ── 4. Проверки ─────────────────────────────────────────────
const problems = [];
const seenSec = new Set();
let total = 0;

// вокабуляр, которого в таксономии быть не должно
const banned = [
  [/\bnsfw\b/i, "рамка NSFW"],
  [/🔒/, "иконка-замок"],
  [/\bssbbw\b/i, "жаргон SSBBW"],
  [/\bbbw\b/i, "жаргон BBW"],
  [/\bcamel[- ]?toe\b/i, "жаргон camel toe"],
  [/\bfat-ass\b/i, "жаргон"],
  [/\bsex-lines\b/i, "эротическая рамка"],
];
// возрастная лексика рядом с интимной — не допускается
const minorRe = /лоли|shota|loli|подрост|школьн|малолет|тинейдж|\bteen\b|pre-?teen|\bchild\b|детск|препубертат|пубертат|мальчик|девочк/i;
const intimateRe = /лобк|паховая|пахов|гениталий|гениталии|мошонк|вульв|половые губы|половог члена|полового члена|макрофалл|микропен|депиляц|mons pubis|genital|pubic/i;

for (const sec of data) {
  if (seenSec.has(sec.id)) problems.push(`повтор id раздела: ${sec.id}`);
  seenSec.add(sec.id);
  for (const f of ["id", "title", "subtitle", "icon", "color", "category"]) {
    if (!sec[f]) problems.push(`${sec.id}: пустое поле «${f}»`);
  }
  const secText = `${sec.title} ${sec.subtitle}`;
  const names = new Set();
  sec.items.forEach((it, i) => {
    total++;
    if (it.id !== i + 1) it.id = i + 1; // нумерация внутри раздела всегда сплошная
    if (!it.name || !it.description) problems.push(`${sec.id}: пустое поле у позиции ${it.id}`);
    if (names.has(it.name)) problems.push(`${sec.id}: повтор позиции «${it.name}»`);
    names.add(it.name);

    const text = `${it.name} ${it.description} ${(it.tags || []).join(" ")}`;
    for (const [re, label] of banned) {
      if (re.test(text) || re.test(secText)) problems.push(`${sec.id} / ${it.name}: ${label}`);
    }
    // ключевая проверка: возрастная лексика не пересекается с интимной
    const scope = `${secText} ${text}`;
    if (minorRe.test(scope) && intimateRe.test(scope)) {
      problems.push(`${sec.id} / ${it.name}: возрастная лексика в интимном контексте`);
    }
  });
}

console.log(`Разделов: ${data.length}, позиций: ${total}`);
if (report.length) {
  console.log(`\nЗамечания сборки (${report.length}):`);
  report.forEach((r) => console.log("  " + r));
}
if (problems.length) {
  console.error(`\nПРОВЕРКА НЕ ПРОЙДЕНА (${problems.length}):`);
  problems.slice(0, 60).forEach((p) => console.error("  " + p));
  process.exit(1);
}
console.log("Проверки пройдены.");

// ── 5. Сборка HTML ──────────────────────────────────────────
// data.json пишется всегда: он же используется для проверок и выгрузок
fs.writeFileSync(path.join(root, "data.json"), JSON.stringify(data));

const tplPath = path.join(root, "src/template.html");
if (!fs.existsSync(tplPath)) {
  console.log("Шаблон не найден — записан только data.json");
  process.exit(0);
}
const tpl = fs.readFileSync(tplPath, "utf8");
const marker = "/*__TAXONOMY__*/";
if (!tpl.includes(marker)) { console.error("В шаблоне нет метки " + marker); process.exit(1); }
const html = tpl.replace(marker, JSON.stringify(data));
const outPath = path.join(root, "..", "TAXONOMY_TELO.html");
fs.writeFileSync(outPath, html);
console.log(`Готово: ${path.relative(process.cwd(), outPath)} (${(html.length / 1048576).toFixed(2)} МБ)`);
