const path = require("path");
const fs = require("fs");

const ROOT = path.join(__dirname, "..");

// Цвета, которые умеет рисовать вьюер. Раздел с чужим цветом
// остался бы вовсе без оформления.
const COLORS = [
  "violet", "blue", "indigo", "cyan", "teal", "emerald", "sky", "yellow",
  "rose", "orange", "amber", "lime", "purple", "red", "pink", "fuchsia",
];

// Данные читаются как обычный текст и исполняются в пустой области
// видимости: ни esbuild, ни require не нужны, поэтому проверка
// работает на голом node без node_modules.
function loadData() {
  const src = fs.readFileSync(path.join(ROOT, "src", "data.js"), "utf8");
  const mod = { exports: {} };
  new Function("module", "window", src)(mod, undefined);
  if (!Array.isArray(mod.exports.parts)) {
    console.error("src/data.js не отдал массив частей.");
    process.exit(2);
  }
  return mod.exports;
}

function main() {
  const { parts } = loadData();
  const problems = [];
  const seenSection = new Map();
  const seenName = new Map();
  const seenPart = new Set();

  let entries = 0;
  let sections = 0;

  for (const part of parts) {
    if (seenPart.has(part.id)) problems.push(`повторяющийся id части: ${part.id}`);
    seenPart.add(part.id);
    if (!part.title?.trim()) problems.push(`часть ${part.id}: пустой заголовок`);
    if (!part.emoji?.trim()) problems.push(`часть ${part.id}: нет эмодзи`);
    if (!part.sections.length) problems.push(`часть ${part.id}: нет разделов`);

    for (const s of part.sections) {
      sections += 1;
      if (seenSection.has(s.id)) {
        problems.push(`повторяющийся id раздела: ${s.id} (${seenSection.get(s.id)} и ${part.id})`);
      }
      seenSection.set(s.id, part.id);

      if (!s.title?.trim()) problems.push(`раздел ${s.id}: пустой заголовок`);
      if (!s.subtitle?.trim()) problems.push(`раздел ${s.id}: пустой подзаголовок`);
      if (!COLORS.includes(s.color)) problems.push(`раздел ${s.id}: неизвестный цвет «${s.color}»`);
      if (!s.entries.length) problems.push(`раздел ${s.id}: нет позиций`);

      s.entries.forEach((e, i) => {
        entries += 1;
        const where = `${s.id} :: «${e.name}»`;
        if (e.id !== i + 1) problems.push(`${where}: нумерация ${e.id}, ожидалось ${i + 1}`);
        if (!e.name?.trim()) problems.push(`${s.id}: позиция ${i + 1} без названия`);
        if (!e.desc?.trim()) problems.push(`${where}: пустое описание`);
        if (!e.tags?.length) problems.push(`${where}: нет тегов`);
        if (e.tags?.some(t => !t.trim())) problems.push(`${where}: пустой тег`);

        const k = e.name.trim().toLowerCase();
        if (seenName.has(k)) {
          problems.push(
            `повтор названия «${e.name}»: ${seenName.get(k)} и ${s.id}. ` +
            `Если это одно и то же — слить; если разные рамки — назвать по-разному`,
          );
        } else {
          seenName.set(k, s.id);
        }
      });
    }
  }

  const palette = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "palette.json"), "utf8"));
  for (const c of COLORS) {
    if (!palette[c]) problems.push(`в src/palette.json нет цвета «${c}»`);
  }

  console.log(`частей ${parts.length}, разделов ${sections}, позиций ${entries}`);
  console.log(`ПРОБЛЕМЫ (${problems.length})`);
  for (const p of problems.slice(0, 40)) console.log("  " + p);
  if (problems.length > 40) console.log(`  … и ещё ${problems.length - 40}`);
  process.exit(problems.length ? 1 : 0);
}

main();
