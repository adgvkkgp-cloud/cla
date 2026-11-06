#!/usr/bin/env node
// Собирает таксономию телосложения и вклеивает её в одностраничник.
//
//   node tools/build.cjs
//
// Источники — src/sections/*.cjs по порядку имён файлов. Вид получает
// определение из рода и отличия; сборка падает, если род не найден,
// деление состоит из одного вида, имя повторяется где-либо в корпусе,
// возрастная лексика встретилась рядом с интимной или цвет раздела
// не стилизован в шаблоне.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PALETTE = {
  teal: "from-emerald-500 to-teal-600", indigo: "from-blue-500 to-indigo-600",
  rose: "from-pink-500 to-rose-600", amber: "from-amber-400 to-orange-500",
  cyan: "from-blue-600 to-cyan-500", slate: "from-slate-600 to-blue-700",
  pink: "from-rose-400 to-pink-600", stone: "from-stone-500 to-slate-700",
  red: "from-orange-500 to-red-600", aqua: "from-cyan-500 to-teal-600",
  yellow: "from-yellow-400 to-orange-500", fuchsia: "from-fuchsia-500 to-purple-600",
  green: "from-green-500 to-emerald-600", violet: "from-violet-500 to-purple-700",
  lime: "from-lime-500 to-green-600", crimson: "from-red-600 to-rose-700",
  sky: "from-sky-400 to-blue-500", zinc: "from-slate-600 to-zinc-700",
  brown: "from-amber-600 to-orange-700", neutral: "from-stone-500 to-neutral-600",
};

const dir = path.join(root, "src/sections");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".cjs")).sort();
const sections = files.flatMap((f) => require(path.join(dir, f)));

const problems = [];
const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[«»"]/g, "").replace(/\s+/g, " ").trim();

// ── 1. Позиции и имена ──────────────────────────────────────
const byName = new Map(); // норм. имя → { sec, row, node }
for (const s of sections) {
  for (const r of s.rows) {
    const [name, def] = r;
    if (typeof name !== "string" || !name.trim()) { problems.push(`${s.id}: пустое имя`); continue; }
    const k = norm(name);
    if (byName.has(k)) problems.push(`повтор имени «${name}»: ${byName.get(k).sec.id} и ${s.id}`);
    else byName.set(k, { sec: s, name, def });
  }
}
const find = (ref) => byName.get(norm(ref.split("|")[0]));

// ── 2. Определения ─────────────────────────────────────────
const PREP = /^(с|со|без|в|во|на|по|при|от|до|из|под|над|между|через|для|около|вдоль|против|среди|у|за|перед|после|ниже|выше|свыше|менее|более|больше|меньше|путём|вокруг|внутри|сверх|не (?:менее|более|ниже|выше|больше|меньше))\s/i;
const end = (t) => (/[.!?]$/.test(t) ? t : t + ".");
const headOf = (ref) => {
  const [n, h] = ref.split("|");
  return h || n.replace(/\s*\([^)]*\)/g, "").trim();
};
const divisions = new Map(); // ключ деления → число видов
const describe = (s, name, def) => {
  if (typeof def === "string") return end(def.trim());
  if (!def || !def.k) { problems.push(`${s.id} / ${name}: нет определения`); return ""; }
  if (def.k === "G") {
    const p = find(def.genus);
    if (!p) { problems.push(`${s.id} / ${name}: нет рода «${def.genus}»`); return ""; }
    if (norm(p.name) === norm(name)) { problems.push(`${s.id} / ${name}: вид сам себе род`); return ""; }
    const isBasis = p.def && p.def.k === "B";
    const head = isBasis ? headOf(p.def.genus) : headOf(def.genus);
    const key = isBasis ? "B:" + norm(p.name) : "G:" + norm(p.name);
    divisions.set(key, (divisions.get(key) || 0) + 1);
    // «+» в начале отличия — приставить без запятой (родительный падеж и т. п.)
    const glued = def.diff.startsWith("+");
    const d = def.diff.replace(/^\+/, "").trim();
    const sep = glued || (PREP.test(d) && !/^\S+\s+котор/i.test(d)) ? " " : ", ";
    return end(head + sep + d) + (def.note ? " " + end(def.note.trim()) : "");
  }
  const ref = def.k === "B" ? def.genus : def.k === "P" ? def.whole : def.of;
  if (!find(ref)) problems.push(`${s.id} / ${name}: нет «${ref}»`);
  if (def.k === "B") divisions.set("B:" + norm(name), divisions.get("B:" + norm(name)) || 0);
  return end(def.text.trim());
};

// Цепочка родов не должна замыкаться.
for (const [k, v] of byName) {
  let cur = v, seen = new Set([k]);
  while (cur && cur.def && cur.def.k === "G") {
    const p = find(cur.def.genus); if (!p) break;
    const pk = norm(p.name);
    if (seen.has(pk)) { problems.push(`цикл родов через «${v.name}»`); break; }
    seen.add(pk);
    cur = p.def && p.def.k === "B" ? find(p.def.genus) : p;
  }
}

// ── 3. Разделы в формат вьюера ─────────────────────────────
const banned = [
  [/\bnsfw\b/i, "рамка NSFW"], [/🔒/, "иконка-замок"], [/\bs?s?bbw\b/i, "жаргон BBW"],
  [/\bcamel[- ]?toe\b/i, "жаргон camel toe"], [/\bfat-ass\b/i, "жаргон"], [/\bsex-lines\b/i, "эротическая рамка"],
  [/booru/i, "теги имиджборд"], [/\bthicc\b/i, "жаргон thicc"], [/\bmoobs\b/i, "жаргон"],
  [/\bperky\b|\bsaggy\b|bubble[- ]butt|underboob|tan[- ]lines/i, "жаргон тегов"], [/арт-тег|арт-референс/i, "рамка тегов"],
];
const minorRe = /лоли|shota|loli|подрост|школьн|малолет|тинейдж|\bteen\b|pre-?teen|\bchild\b|детск|препубертат|пубертат|мальчик|девочк|младен|ребён|ребен|дошкол|юношеск/i;
const intimateRe = /лобк|паховая|пахов|гениталий|гениталии|половой член|половог[оa] член|мошонк|яичк|вульв|половы[ех] губ|клитор|влагалищ|макрофалл|микропен|головк[аиуе] полового|крайн(?:яя|ей) плот|mons pubis|genital|pubic|penis|scrot|vulva|clitor/i;

const out = [];
let total = 0, species = 0;
const seenSec = new Set();
for (const s of sections) {
  if (seenSec.has(s.id)) problems.push(`повтор id раздела: ${s.id}`);
  seenSec.add(s.id);
  const color = PALETTE[s.color];
  if (!color) problems.push(`${s.id}: цвет «${s.color}» вне палитры`);
  for (const f of ["id", "title", "subtitle", "icon"]) if (!s[f]) problems.push(`${s.id}: пустое поле «${f}»`);
  const secText = `${s.title} ${s.subtitle}`;
  const items = s.rows.map((r, i) => {
    const [name, def, tags, g] = r;
    const description = describe(s, name, def);
    if (def && def.k === "G") species++;
    const it = {
      id: i + 1, name, description,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      gender: g || s.gender,
    };
    if (!["male", "female", "any"].includes(it.gender)) problems.push(`${s.id} / ${name}: пол «${it.gender}»`);
    if (description && norm(description.replace(/\.$/, "")) === norm(name)) problems.push(`${s.id} / ${name}: описание повторяет имя`);
    if (/\s{2,}|\s[,.;:]/.test(description)) problems.push(`${s.id} / ${name}: лишние пробелы`);
    const text = `${name} ${description} ${it.tags.join(" ")}`;
    for (const [re, label] of banned) if (re.test(text) || re.test(secText)) problems.push(`${s.id} / ${name}: ${label}`);
    // ключевая проверка: возрастная лексика не встречается рядом с интимной
    const scope = `${secText} ${text}`;
    if (minorRe.test(scope) && intimateRe.test(scope)) problems.push(`${s.id} / ${name}: возрастная лексика в интимном контексте`);
    total++;
    return it;
  });
  if (intimateRe.test(items.map((i) => i.name + " " + i.description).join(" ")) && minorRe.test(secText + " " + items.map((i) => i.name + " " + i.description).join(" ")))
    problems.push(`${s.id}: возрастная лексика в разделе с интимной`);
  out.push({ id: s.id, title: s.title, subtitle: s.subtitle, icon: s.icon, color, category: s.category, items });
}
for (const [k, n] of divisions) if (n < 2) problems.push(`деление «${k.slice(2)}» из ${n} вида`);

const bases = [...divisions.keys()].filter((k) => k.startsWith("B:")).length;
console.log(`Разделов: ${out.length}, позиций: ${total}, видов: ${species}, делений: ${divisions.size} (с основанием-карточкой ${bases})`);
if (problems.length) {
  console.error(`\nПРОВЕРКА НЕ ПРОЙДЕНА (${problems.length}):`);
  problems.slice(0, 80).forEach((p) => console.error("  " + p));
  process.exit(1);
}
console.log("Проверки пройдены.");

// ── 4. Сборка HTML ─────────────────────────────────────────
fs.writeFileSync(path.join(root, "data.json"), JSON.stringify(out));
const tpl = fs.readFileSync(path.join(root, "src/template.html"), "utf8");
const marker = "/*__TAXONOMY__*/";
if (!tpl.includes(marker)) { console.error("В шаблоне нет метки " + marker); process.exit(1); }
for (const c of Object.values(PALETTE)) for (const cls of c.split(" ")) if (!tpl.includes(cls)) { console.error(`Класс ${cls} не стилизован в шаблоне`); process.exit(1); }
const html = tpl.replace(marker, JSON.stringify(out));
const outPath = path.join(root, "TAXONOMY_TELO.html");
fs.writeFileSync(outPath, html);
console.log(`Готово: ${path.relative(process.cwd(), outPath)} (${(html.length / 1048576).toFixed(2)} МБ)`);
