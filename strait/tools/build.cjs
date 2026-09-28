#!/usr/bin/env node
/**
 * Собирает STRAIT.html из src/viewer.html и src/data.js — один файл,
 * который открывается двойным щелчком.
 *
 * Ни одной зависимости: только fs и path. Перед сборкой проверяет
 * данные и роняет её, если что-то разошлось:
 *   • по 55 доктрин в каждом каноне, номера 1..55 без дыр;
 *   • названия не повторяются внутри канона;
 *   • координаты в пределах: n, pk, tb — от −100 до 100, y — от 0 до 100;
 *   • ни одного пустого текстового поля;
 *   • по 12 оптик в каждом каноне, 5 документов, 10 рычагов,
 *     по 12 вскрытий в каждом каноне;
 *   • в данных нет «</script» — иначе вставка разорвала бы страницу.
 *
 *   node tools/build.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "STRAIT.html");

function load() {
  const txt = fs.readFileSync(path.join(SRC, "data.js"), "utf8");
  const mod = { exports: {} };
  new Function("module", "window", txt)(mod, undefined);
  return { txt, S: mod.exports };
}

function check(S) {
  const p = [];
  const nonEmpty = (v, where) => { if (typeof v !== "string" || !v.trim()) p.push(`пустое поле: ${where}`); };
  for (const c of ["w", "e"]) {
    const ds = S.doctrines.filter((d) => d.canon === c);
    if (ds.length !== 55) p.push(`канон ${c}: доктрин ${ds.length}, ожидалось 55`);
    ds.forEach((d, i) => {
      if (d.num !== i + 1) p.push(`${d.id}: номер ${d.num}, ожидался ${i + 1}`);
      if (d.id !== c + d.num) p.push(`${d.id}: id не совпадает с номером`);
      for (const k of ["n", "pk", "tb"]) if (!(d[k] >= -100 && d[k] <= 100)) p.push(`${d.id}: ${k}=${d[k]} вне −100…100`);
      if (!(d.y >= 0 && d.y <= 100)) p.push(`${d.id}: y=${d.y} вне 0…100`);
      for (const k of ["name", "src", "thesis", "rPK", "rTB", "real"]) nonEmpty(d[k], `${d.id}.${k}`);
      if (c === "e") nonEmpty(d.cn, `${d.id}.cn`);
    });
    const names = ds.map((d) => d.name.toLowerCase());
    names.forEach((n, i) => { if (names.indexOf(n) !== i) p.push(`канон ${c}: повтор названия «${n}»`); });
    const op = S.optics.filter((o) => o.canon === c);
    if (op.length !== 12) p.push(`канон ${c}: оптик ${op.length}, ожидалось 12`);
    op.forEach((o) => { nonEmpty(o.name, o.key + ".name"); nonEmpty(o.sub, o.key + ".sub"); nonEmpty(o.worse, o.key + ".worse");
      if (!o.paras.length) p.push(o.key + ": нет абзацев"); o.paras.forEach((x, i) => nonEmpty(x, `${o.key}.paras[${i}]`)); });
    const sp = S.abyss.flatMap((g) => g.specs).filter((s) => s.canon === c);
    if (sp.length !== 12) p.push(`канон ${c}: вскрытий ${sp.length}, ожидалось 12`);
    sp.forEach((s) => { nonEmpty(s.who, s.name + ".who"); nonEmpty(s.breaks, s.name + ".breaks"); });
  }
  const keys = S.optics.map((o) => o.key);
  keys.forEach((k, i) => { if (keys.indexOf(k) !== i) p.push(`повтор ключа оптики ${k}`); });
  if (S.docs.length !== 5) p.push(`документов ${S.docs.length}, ожидалось 5`);
  S.docs.forEach((d) => { if (!["cn", "us", "jp"].includes(d.origin)) p.push(`${d.title}: неизвестное происхождение «${d.origin}»`);
    for (const b of d.blocks) { if (!["p", "fair", "ann"].includes(b[0])) p.push(`${d.title}: блок «${b[0]}»`);
      b.slice(1).forEach((x) => nonEmpty(x, d.title)); } });
  nonEmpty(S.docsSum, "docsSum");
  if (S.levers.length !== 10) p.push(`рычагов ${S.levers.length}, ожидалось 10`);
  return p;
}

function main() {
  const { txt, S } = load();
  const problems = check(S);
  if (/<\/script/i.test(txt)) problems.push("в данных встречается </script");
  console.log(`доктрин ${S.doctrines.length}, оптик ${S.optics.length}, документов ${S.docs.length}, ` +
    `рычагов ${S.levers.length}, вскрытий ${S.abyss.reduce((a, g) => a + g.specs.length, 0)}`);
  console.log(`ПРОБЛЕМЫ (${problems.length})`);
  problems.slice(0, 30).forEach((x) => console.log("  " + x));
  if (problems.length) process.exit(1);

  const viewer = fs.readFileSync(path.join(SRC, "viewer.html"), "utf8");
  if (!viewer.includes("/*__DATA__*/")) { console.error("в src/viewer.html нет места для данных"); process.exit(1); }
  fs.writeFileSync(OUT, viewer.replace("/*__DATA__*/", () => txt));
  console.log(`STRAIT.html — ${(fs.statSync(OUT).size / 1024).toFixed(1)} КБ`);
}

main();
