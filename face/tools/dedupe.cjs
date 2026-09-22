#!/usr/bin/env node
/**
 * Слияние повторов в src/data.ts.
 *
 * В корпусе 143 названия встречались не по одному разу — 152 лишние
 * копии. Они появились оттого, что части XXXV–XLI дописывались поверх
 * уже существующих, а не в них: глаза описаны в части III и заново
 * в XXXVII, booru-теги — в XVII, XXIV и XXXVIII.
 *
 * Разбираются они двумя способами:
 *
 *   СЛИЯНИЕ — одно и то же в одной и той же рамке. Позиция остаётся
 *   в профильном разделе (PRIORITY), получает лучшее из описаний
 *   и объединение тегов, прочие копии удаляются.
 *
 *   УТОЧНЕНИЕ — одна и та же черта, но в разных рамках: «Высокие
 *   скулы» как анатомия, как канон красоты и как признак фенотипа.
 *   Копии остаются, но получают уточнённые названия (RENAME), чтобы
 *   в корпусе не было двух позиций с одинаковым названием.
 *
 * Лучшее описание выбирается не по длине: «Лицевой индекс > 90»
 * короче, чем «Лицевой индекс высокий», но несёт порог, а второе
 * его теряет. Поэтому описание с числом или знаком сравнения
 * выигрывает у описания без них.
 */

const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "src", "data.ts");

// Профильные разделы бьют общие: цвет радужки живёт в «Цвет и детали
// радужки», а не в общем «Глаза — Цвет, Детали, Элементы». Чем раньше
// в списке, тем выше приоритет.
const PRIORITY = [
  // эмоции
  "ekman-basic", "complex-emotions", "micro-expressions",
  // глаза
  "iris-color", "eyelids-folds", "eye-position", "eye-shape-deep",
  "eyelashes-deep", "anime-eyes", "gaze-direction", "eye_expressions",
  // нос
  "nose-overall", "nose-tip", "nostrils-wings",
  // рот и зубы
  "teeth-smile-deep", "lip-shape", "lip-contour", "smile_types",
  // лоб, брови, скулы, подбородок
  "skin-aging-face", "browridge-glabella", "forehead", "brow-shape-deep",
  "brow-thickness", "eyebrows", "cheekbones", "chin-deep", "jaw",
  // кожа
  "skin-conditions", "skin-markers-face", "skin-texture-face", "skin-tone-face",
  // волосы
  "hair-color-deep", "hair-texture-deep", "hair-length-cut",
  "bangs-fringe", "hairstyles-styling",
  // прочее
  "facial-piercings", "eye-makeup", "lighting-effects",
  "androgynous-archetypes", "villain-hero-faces", "proportions",
  "ears", "neck", "eyes", "lips", "nose", "skin", "hair",
  // арт-теги
  "art_tags", "booru-expressions", "booru-mouth", "booru-eyes",
  "booru-face-effects",
];

// Одна и та же черта в разных рамках. Копия не удаляется, а получает
// уточнённое название — рамка становится частью имени.
const RENAME = {
  "Высокие скулы": {
    "beauty-standards": "Высокие скулы как канон красоты",
    "south-asian-features": "Высокие скулы (южноазиатский тип)",
  },
  "Полные губы": {
    "south-asian-features": "Полные губы (южноазиатский тип)",
    "african-features": "Полные губы (африканский тип)",
  },
  "Волнистые волосы": {
    "south-asian-features": "Волнистые волосы (южноазиатский тип)",
  },
  "Овальное лицо": {
    "south-asian-features": "Овальное лицо (южноазиатский тип)",
  },
  "Широкий нос": {
    "african-features": "Широкий нос (африканский тип)",
  },
  "Большие выразительные глаза": {
    "south-asian-features": "Крупные тёмные глаза (южноазиатский тип)",
  },
  "Позитивный кантальный наклон": {
    "beauty-standards": "Кантальный наклон как канон красоты",
  },
  "Гладкая кожа": {
    "youthful-features": "Гладкая кожа без морщин (юность)",
  },
  "Маленький нос": {
    "youthful-features": "Маленький нос (неотенический признак)",
  },
  "Большие глаза относительно лица": {
    "feature-proportions-detail": "Доля площади глаз в лице",
  },
  "Кривая улыбка": {
    "flaws-as-charm": "Кривая улыбка как обаяние",
  },
  "Ямочка на подбородке": {
    "flaws-as-charm": "Ямочка на подбородке как примета",
  },
  "Трикстер/шут": {
    "anime-tropes": "Трикстер (аниме-троп)",
  },
  "Светящиеся глаза": {
    "fantasy-faces": "Светящиеся глаза (нечеловеческое)",
  },
};

const ENTRY_RE =
  /^(\s*)\{\s*id:\s*(\d+),\s*name:\s*"((?:[^"\\]|\\.)*)",\s*desc:\s*"((?:[^"\\]|\\.)*)"(?:,\s*tags:\s*\[([^\]]*)\])?\s*\},?\s*$/;
const SECTION_RE = /^\s*id:\s*"([a-z0-9_-]+)",\s*$/i;

function parseTags(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map(s => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function fmtEntry(indent, id, name, desc, tags) {
  const t = tags.length ? `, tags: [${tags.map(x => `"${x}"`).join(", ")}]` : "";
  return `${indent}{ id: ${id}, name: "${name}", desc: "${desc}"${t} },`;
}

// Описание с числом или знаком сравнения информативнее: оно несёт
// порог, а не оценку на глаз.
function score(desc) {
  return (/[0-9<>%°]/.test(desc) ? 1000 : 0) + desc.length;
}

function rank(sectionId) {
  const i = PRIORITY.indexOf(sectionId);
  return i === -1 ? PRIORITY.length : i;
}

function main() {
  const lines = fs.readFileSync(DATA, "utf8").split("\n");

  // Первый проход: собрать все позиции с их разделами.
  const found = [];
  let currentSection = null;
  lines.forEach((line, i) => {
    const s = SECTION_RE.exec(line);
    if (s) {
      currentSection = s[1];
      return;
    }
    const m = ENTRY_RE.exec(line);
    if (m) {
      found.push({
        line: i,
        indent: m[1],
        id: Number(m[2]),
        name: m[3],
        desc: m[4],
        tags: parseTags(m[5]),
        section: currentSection,
      });
    }
  });

  const byName = new Map();
  for (const e of found) {
    const k = e.name.trim().toLowerCase();
    if (!byName.has(k)) byName.set(k, []);
    byName.get(k).push(e);
  }

  const drop = new Set();
  const edits = new Map(); // line -> {desc, tags, name}
  const log = { merged: [], renamed: [] };

  for (const [, copies] of byName) {
    if (copies.length < 2) continue;
    const ren = RENAME[copies[0].name];

    // Уточнение: переименовать копии в названных разделах.
    let remaining = copies;
    if (ren) {
      remaining = [];
      for (const c of copies) {
        if (ren[c.section]) {
          edits.set(c.line, { name: ren[c.section] });
          log.renamed.push(`${c.section} :: «${c.name}» → «${ren[c.section]}»`);
        } else {
          remaining.push(c);
        }
      }
    }
    if (remaining.length < 2) continue;

    // Слияние: победитель — профильный раздел.
    const keeper = remaining.reduce((a, b) => (rank(b.section) < rank(a.section) ? b : a));
    const best = remaining.reduce((a, b) => (score(b.desc) > score(a.desc) ? b : a));
    const tags = [];
    for (const c of remaining) for (const t of c.tags) if (!tags.includes(t)) tags.push(t);

    const prev = edits.get(keeper.line) || {};
    edits.set(keeper.line, { ...prev, desc: best.desc, tags });
    for (const c of remaining) if (c !== keeper) drop.add(c.line);

    log.merged.push(
      `«${keeper.name}» → ${keeper.section}\n` +
        `      описание: «${best.desc}»${best !== keeper ? ` (взято из ${best.section})` : ""}\n` +
        `      удалено: ${remaining.filter(c => c !== keeper).map(c => c.section).join(", ")}`,
    );
  }

  // Второй проход: применить правки и удаления.
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (drop.has(i)) continue;
    const ed = edits.get(i);
    if (!ed) {
      out.push(lines[i]);
      continue;
    }
    const e = found.find(f => f.line === i);
    out.push(
      fmtEntry(e.indent, e.id, ed.name ?? e.name, ed.desc ?? e.desc, ed.tags ?? e.tags),
    );
  }

  // Третий проход: перенумеровать позиции внутри каждого раздела,
  // иначе после удалений в нумерации появятся дыры.
  let counter = 0;
  for (let i = 0; i < out.length; i++) {
    if (SECTION_RE.test(out[i])) {
      counter = 0;
      continue;
    }
    const m = ENTRY_RE.exec(out[i]);
    if (m) {
      counter += 1;
      out[i] = fmtEntry(m[1], counter, m[3], m[4], parseTags(m[5]));
    }
  }

  fs.writeFileSync(DATA, out.join("\n"));

  console.log(`Слито: ${log.merged.length} названий, удалено строк: ${drop.size}`);
  console.log(`Уточнено названий: ${log.renamed.length}`);
  if (process.argv.includes("--verbose")) {
    console.log("\n── СЛИЯНИЯ ──");
    for (const m of log.merged) console.log("  " + m);
    console.log("\n── УТОЧНЕНИЯ ──");
    for (const r of log.renamed) console.log("  " + r);
  }
}

main();
