#!/usr/bin/env node
/**
 * Проверка целостности данных. Роняет сборку, если корпус разошёлся
 * сам с собой.
 *
 * Главная проверка — повторяющиеся названия. Именно так корпус
 * и испортился: части дописывались поверх существующих, и одна
 * и та же черта попадала в него по второму и третьему разу, каждый
 * раз с чуть другим описанием. Вручную это не отлавливается — к тому
 * моменту, как повторов стало 152, заметить их в файле на 4700 строк
 * было уже нельзя.
 *
 * Черта, которую нужно назвать дважды в разных рамках, называется
 * по-разному: «Высокие скулы» (анатомия), «Высокие скулы как канон
 * красоты», «Высокие скулы (южноазиатский тип)».
 */

const path = require("path");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");

const ROOT = path.join(__dirname, "..");

// Цвета, которые умеет рисовать App.tsx. Раздел с чужим цветом
// молча отрисуется фиолетовым.
const COLORS = [
  "violet", "blue", "indigo", "cyan", "teal", "emerald", "sky", "yellow",
  "rose", "orange", "amber", "lime", "purple", "red", "pink", "fuchsia",
];

function loadData() {
  const esbuild = path.join(ROOT, "node_modules", ".bin", "esbuild");
  if (!fs.existsSync(esbuild)) {
    console.error("Нет node_modules/.bin/esbuild — сначала `npm install`.");
    process.exit(2);
  }
  const out = path.join(os.tmpdir(), `face-check-${process.pid}.cjs`);
  execFileSync(esbuild, [
    path.join(ROOT, "src", "data.ts"),
    "--bundle", "--format=cjs", `--outfile=${out}`, "--log-level=error",
  ]);
  try {
    return require(out);
  } finally {
    fs.unlinkSync(out);
  }
}

function main() {
  const { parts, TOTAL_COUNT } = loadData();
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

  if (TOTAL_COUNT !== entries) {
    problems.push(`TOTAL_COUNT = ${TOTAL_COUNT}, а позиций ${entries}`);
  }

  console.log(`частей ${parts.length}, разделов ${sections}, позиций ${entries}`);
  console.log(`ПРОБЛЕМЫ (${problems.length})`);
  for (const p of problems.slice(0, 40)) console.log("  " + p);
  if (problems.length > 40) console.log(`  … и ещё ${problems.length - 40}`);
  process.exit(problems.length ? 1 : 0);
}

main();
