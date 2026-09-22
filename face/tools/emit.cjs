#!/usr/bin/env node
/**
 * Кладёт собранный одностраничник рядом с исходниками под именем,
 * принятым в этом репозитории: TAXONOMY_TELO.html у telo,
 * TAXONOMY_MEGA.html в корне — значит, TAXONOMY_FACE.html здесь.
 *
 * dist/ в .gitignore, поэтому без этого шага в репозиторий попадали
 * бы только исходники, а открыть таксономию без сборки было бы нельзя.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "dist", "index.html");
const DST = path.join(ROOT, "TAXONOMY_FACE.html");

if (!fs.existsSync(SRC)) {
  console.error("Нет dist/index.html — сначала vite build.");
  process.exit(1);
}

fs.copyFileSync(SRC, DST);
const kb = (fs.statSync(DST).size / 1024).toFixed(1);
console.log(`TAXONOMY_FACE.html — ${kb} КБ`);
