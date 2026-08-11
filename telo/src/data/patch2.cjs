// ════════════════════════════════════════════════════════════
// ПРАВКИ, ЧАСТЬ 2 — то, что нашла проверка сборки.
//
//  1. Жаргон субкультурных сообществ (BBW / SSBBW / camel toe /
//     fat-ass / sex-lines), оставшийся в 14 разделах помимо тех,
//     что переписаны в части 1. Там, где клиническое имя уже было
//     верным, правятся только теги.
//  2. Дефект генератора: в разделе глаз имя позиции не включало
//     ось «посадка», поэтому 720 имён повторялись по 6 раз при
//     различающихся описаниях. Имя достраивается до уникального.
// ════════════════════════════════════════════════════════════

const itemPatches = {
  // ── имя уже клиническое, чинятся только теги ──────────────
  "general-body-types-natural": {
    "Ожирение 2 степени": { tags: ["obese-class-2", "bmi-35-39"] },
    "Ожирение 3 степени (морбидное)": { tags: ["obese-class-3", "morbid-obesity", "bmi-40-plus"] },
  },
  "abs-belly": {
    "V-линии (ингуинальные)": {
      description: "V-образный рельеф по паховой связке, направленный книзу от косых мышц",
      tags: ["v-lines", "v-cut", "iliac-furrow", "adonis-belt", "inguinal-lines"],
    },
    "Живот фартуком (panis)": {
      name: "Живот фартуком (панникул)",
      description: "Кожно-жировой фартук передней брюшной стенки, нависающий над лобковой областью",
      tags: ["apron-belly", "panniculus", "belly-overhang"],
    },
  },
  "chest-female": {
    "Грудь при лишнем весе": {
      description: "Увеличение объёма молочной железы за счёт жировой ткани при наборе веса",
      tags: ["fatty-breast-tissue", "heavy-breasts", "high-adiposity-chest"],
    },
  },
  "glutes-buttocks": {
    "Жировые ягодицы": {
      name: "Ягодица с преобладанием жировой ткани",
      description: "Объём формируется подкожной клетчаткой, а не мышцей; мягкий подвижный контур",
      tags: ["adipose-dominant-glutes", "soft-contour-glutes"],
    },
  },
  "body-fat-percentage": {
    "Тучная (33%+ — женщины)": {
      name: "Ожирение (33 % и выше — женщины)",
      description: "Высокая жировая масса, сглаженный мышечный рельеф, округлый контур",
      tags: ["obese-female", "high-body-fat-female"],
    },
  },

  // ── имя требует замены ────────────────────────────────────
  "female-natural-overall": {
    "BBW (Big Beautiful Woman)": {
      name: "Женское сложение с высокой жировой массой",
      description: "Значительный избыток массы тела при гиноидном распределении жировой ткани",
      tags: ["high-adiposity-female", "plus-size", "gynoid-distribution"],
    },
    "SSBBW (Super-size BBW)": {
      name: "Женское сложение при ожирении III степени",
      description: "ИМТ 40 и выше; изменение опорного контура тела, ограничение подвижности",
      tags: ["obese-class-3", "morbid-obesity", "bmi-40-plus"],
    },
  },
  "female-danbooru-tags": {
    "camel toe": {
      name: "Контур больших половых губ под тканью",
      description: "Проступающая срединная борозда вульвы при облегающем крое изделия",
      tags: ["labial-contour", "tight-clothing"],
    },
    "softcore bbw": {
      name: "Полное женское тело (мягкий контур)",
      description: "Высокая жировая масса, сглаженный рельеф, округлые линии",
      tags: ["high-adiposity-female", "soft-contour", "plus-size-art"],
    },
  },
  "female-booru-extended": {
    "bbw": {
      name: "high_adiposity_female",
      description: "Крупное женское сложение с высокой жировой массой",
      tags: ["high_adiposity", "plus_size"],
    },
    "ssbbw": {
      name: "obese_class_3",
      description: "Ожирение III степени, ИМТ 40 и выше",
      tags: ["obese_class_3", "morbid_obesity"],
    },
  },
  "thicc-spectrum": {
    "BBW-thicc": {
      name: "Высокая жировая масса с акцентом на бёдра и ягодицы",
      description: "Гиноидное распределение при значительном общем объёме",
      tags: ["high_adiposity", "gynoid_distribution", "plus_size"],
    },
  },
  "bodyfat-visual-female": {
    "38-42% (полнота/BBW)": {
      name: "38–42 % жира (женщины)",
      description: "Крупное мягкое тело, мышечный рельеф не читается, выраженные складки",
      tags: ["40_percent_female", "high_adiposity"],
    },
    "43%+ (ожирение/SSBBW)": {
      name: "43 % и выше (женщины)",
      description: "Очень высокая жировая масса, множественные кожно-жировые складки",
      tags: ["45_percent_female", "obese_class_3"],
    },
  },
};

// ── Дефект генератора: имя без оси «посадка» ────────────────
// Описание имеет вид «Глаза <форма>, <цвет>, <посадка>, <особенность>».
// Имя было «<Форма>, <цвет> (<особенность>)» — без посадки, отсюда
// шесть одинаковых имён на каждую комбинацию. Достраиваем имя из
// описания, чтобы позиция опознавалась однозначно.
function fixGeneratedNames(section) {
  if (section.id !== "gen-glaza-forma-cvet-posadka-osobennost") return 0;
  let fixed = 0;
  for (const it of section.items) {
    const m = /^Глаза\s+(.+?),\s*(.+?),\s*(.+?),\s*(.+)$/.exec(it.description || "");
    if (!m) continue;
    const [, shape, colour, set, feature] = m;
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const name = `${cap(shape)}, ${colour}, ${set} (${feature})`;
    if (name !== it.name) { it.name = name; fixed++; }
  }
  return fixed;
}

module.exports = { itemPatches, fixGeneratedNames };
