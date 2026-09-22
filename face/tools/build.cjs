#!/usr/bin/env node
/**
 * Собирает TAXONOMY_FACE.html из src/viewer.html, src/data.js
 * и src/palette.json.
 *
 * Ни одной зависимости: только fs и path из самого node. Ни npm,
 * ни node_modules, ни сборщика. Раньше, чтобы поменять в таксономии
 * одну строку, требовался `npm install` на 96 МБ с React, Vite
 * и Tailwind.
 *
 * Палитра в src/palette.json снята замером вычисленных стилей
 * прежней сборки, а не подобрана на глаз, — поэтому вид сохранился
 * до значения цвета.
 *
 *   node tools/build.cjs
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "TAXONOMY_FACE.html");

function paletteCss(palette) {
  const lines = [];
  for (const [name, c] of Object.entries(palette)) {
    if (name.startsWith("_")) continue;
    lines.push(
      `.c-${name}{` +
        `--bg:${c.cardBg};` +
        `--bd:${c.cardBd};` +
        `--hdr:${c.hdrBg};` +
        `--badge-bg:${c.badgeBg};` +
        `--badge-bd:${c.badgeBd};` +
        `--fg:${c.titleCol}}`,
    );
  }
  return lines.join("\n");
}

function main() {
  const viewer = fs.readFileSync(path.join(SRC, "viewer.html"), "utf8");
  const data = fs.readFileSync(path.join(SRC, "data.js"), "utf8");
  const palette = JSON.parse(fs.readFileSync(path.join(SRC, "palette.json"), "utf8"));

  const colors = Object.keys(palette).filter(k => !k.startsWith("_"));
  if (colors.length !== 16) {
    console.error(`В палитре ${colors.length} цветов, ожидалось 16.`);
    process.exit(1);
  }

  // Закрывающий тег внутри данных разорвал бы <script> посреди
  // корпуса, и страница молча осталась бы пустой.
  if (/<\/script/i.test(data)) {
    console.error("В данных встречается </script — вставка в страницу небезопасна.");
    process.exit(1);
  }

  let html = viewer
    .replace("/*__PALETTE__*/", paletteCss(palette))
    .replace("/*__DATA__*/", () => data);

  if (html.includes("__PALETTE__") || html.includes("__DATA__")) {
    console.error("Не найдено место для подстановки в src/viewer.html.");
    process.exit(1);
  }

  fs.writeFileSync(OUT, html);
  const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`TAXONOMY_FACE.html — ${kb} КБ, палитра: ${colors.length} цветов`);
}

main();
