#!/usr/bin/env node
// Собирает src/data/sections.ts в atlas/data.js (window.__TAXONOMY__).
// Запуск из корня папки atlas:  node tools/build-data.cjs
//
// Требуется esbuild — он ставится вместе с остальными зависимостями (npm install).
// Сборка детерминирована: одинаковый исходник даёт побайтово одинаковый data.js.

const path = require("path");
const fs = require("fs");

let esbuild;
try {
  esbuild = require("esbuild");
} catch (e) {
  console.error("Не найден esbuild. Выполните npm install в папке atlas.");
  process.exit(1);
}

const root = path.resolve(__dirname, "..");
const entry = path.join(root, "src", "data", "sections.ts");
const out = path.join(root, "data.js");

const built = esbuild.buildSync({
  entryPoints: [entry],
  bundle: true,
  format: "cjs",
  write: false,
  platform: "node",
  logLevel: "warning",
});

const mod = { exports: {} };
new Function("module", "exports", "require", built.outputFiles[0].text)(mod, mod.exports, require);

const sections = mod.exports.sections;
if (!Array.isArray(sections) || !sections.length) {
  console.error("sections пуст — сборка прервана");
  process.exit(1);
}

// ── проверка целостности ────────────────────────────────────
const norm = (t) => t.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/g, "");
const problems = [];
const sectionIds = new Set();
let total = 0;

for (const s of sections) {
  if (sectionIds.has(s.id)) problems.push(`повтор id раздела: ${s.id}`);
  sectionIds.add(s.id);
  for (const field of ["id", "title", "subtitle", "icon", "color", "level"]) {
    if (!s[field]) problems.push(`${s.id}: пустое поле раздела «${field}»`);
  }
  const titles = new Set();
  s.entries.forEach((e, i) => {
    total++;
    if (e.id !== i + 1) problems.push(`${s.id}: нарушена нумерация на «${e.title}»`);
    if (!e.title || !e.description) problems.push(`${s.id}: пустое поле у позиции ${e.id}`);
    const k = norm(e.title);
    if (titles.has(k)) problems.push(`${s.id}: повтор заголовка «${e.title}»`);
    titles.add(k);
  });
}

if (problems.length) {
  console.error(`Найдено проблем: ${problems.length}`);
  problems.slice(0, 40).forEach((p) => console.error("  " + p));
  process.exit(1);
}

fs.writeFileSync(out, "window.__TAXONOMY__ = " + JSON.stringify(sections) + ";");
console.log(`Готово: ${sections.length} разделов, ${total} позиций → ${path.relative(process.cwd(), out)}`);
