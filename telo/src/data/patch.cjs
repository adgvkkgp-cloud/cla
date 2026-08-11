// ════════════════════════════════════════════════════════════
// ПРАВКИ СУЩЕСТВУЮЩИХ РАЗДЕЛОВ
//
// Три задачи:
//  1. Снять рамку «NSFW» — её больше нет как понятия. Ничто не
//     помечается замком, «для взрослых» или «soft». Есть анатомия,
//     описанная так, как её описывает клиницист.
//  2. Заменить метафору и жаргон точным термином. Не «большой»,
//     а «макрофаллия»; не «попа», а «ягодичная область»; не
//     «SSBBW», а «ожирение III степени».
//  3. Развести возрастной и интимный слои. Интимная топография —
//     только взрослая и без возрастной лексики. Развитие — чистая
//     физиология роста, без арт-тегов вида teen-body.
// ════════════════════════════════════════════════════════════

// ── 1. Переименование разделов ──────────────────────────────
const sectionPatches = {
  "glutes-nsfw-extended": {
    newId: "glutes-morphology-extended",
    title: "Ягодичная область — морфология (расширенно)",
    subtitle: "Форма, объём, положение подъягодичной складки — анатомический референс",
    icon: "🫁",
  },
  "archetype-femboy": {
    newId: "morphotype-androgynous-male",
    title: "Морфотип: андрогинный мужской",
    subtitle: "Узкий плечевой пояс, низкая мышечная масса, гиноидное распределение жира",
    icon: "🧍",
  },
  "archetype-macho": {
    newId: "morphotype-hypermasculine",
    title: "Морфотип: гипермаскулинный",
    subtitle: "Широкий плечевой пояс, высокая мышечная масса, выраженный терминальный волосяной покров",
    icon: "🧍‍♂️",
  },
  "archetype-bbw": {
    newId: "morphotype-high-adiposity-female",
    title: "Морфотип: женский с высокой жировой массой",
    subtitle: "Соматические признаки алиментарного ожирения — анатомический референс",
    icon: "🧍‍♀️",
  },
  "archetype-tomboy": {
    newId: "morphotype-androgynous-female",
    title: "Морфотип: андрогинный женский",
    subtitle: "Узкий таз, низкая жировая масса, развитая скелетная мускулатура",
    icon: "🏃",
  },
  "intimate-zone-general": {
    newId: "inguinal-pubic-topography",
    title: "Паховая и лобковая область — топография",
    subtitle: "Поверхностная анатомия взрослого: ориентиры, складки, оволосение, морфометрия",
    icon: "🩺",
  },
  "intimate-neutral-extended": {
    newId: "lower-abdomen-topography",
    title: "Нижняя часть живота и паховые складки",
    subtitle: "Рельеф надлобковой области, паховые складки, кожные признаки",
    icon: "🩺",
  },
  "hair-body": {
    subtitle: "Терминальное и пушковое оволосение: грудь, спина, живот, лицо, конечности, лобковая область",
  },
  "statistics": {
    title: "Особые состояния и условия",
    subtitle: "Редкие типы, физиологические состояния и специфические случаи (взрослые)",
  },
};

// ── 2. Позиции, которые удаляются полностью ─────────────────
// «Пубертатный пушок» — описание лобкового оволосения в пубертате
// внутри арт-тегового набора. Это не переписывается в клинический
// вид, а убирается: андрогинный морфотип взрослого не нуждается в
// признаке полового созревания, а «мало волос на теле» уже описано
// во взрослых позициях оволосения.
const dropItems = {
  "archetype-femboy": ["Femboy: пубертатный пушок", "Femboy: небольшая выпуклость (bulge)"],
  "archetype-macho": ["Macho: большой bulge"],
  "archetype-tomboy": ["Tomboy: минимум лобкового волосяного покрова"],
  // Возрастная позиция в разделе взрослых состояний, с арт-тегами
  // teen-body / youth. Физиология роста осталась в age-physical-changes.
  "statistics": ["Тело подростка"],
};

// ── 3. Переписанные позиции ─────────────────────────────────
const itemPatches = {
  "glutes-nsfw-extended": {
    "Bubble butt (максимальный)": {
      name: "Полусферическая ягодица максимальной проекции",
      description: "Наибольшая переднезадняя проекция, округлый контур во всех плоскостях",
      tags: ["round-glutes", "high-projection", "spherical-contour"],
    },
    "Перевёрнутое сердце (heart-shaped)": {
      name: "V-образная ягодица (перевёрнутое сердце)",
      description: "Наибольшая ширина в нижней трети с сужением кверху; частый женский вариант",
      tags: ["heart-shaped-glutes", "inverted-heart", "wide-lower-glutes"],
    },
    "Полумесяц / high-set": {
      name: "Высоко посаженная ягодица",
      description: "Подъягодичная складка расположена высоко, нижний контур круто восходящий",
      tags: ["high-set-glutes", "high-gluteal-fold"],
    },
    "Low-set / низкие ягодицы": {
      name: "Низко посаженная ягодица",
      description: "Подъягодичная складка смещена книзу, вертикальный размер ягодицы увеличен",
      tags: ["low-set-glutes", "low-gluteal-fold", "elongated-glutes"],
    },
    "Ягодица с сильным «underbutt»": {
      name: "Выраженная подъягодичная складка",
      description: "Чёткая борозда на границе ягодицы и задней поверхности бедра",
      tags: ["gluteal-fold", "infragluteal-crease"],
    },
    "Двойной пузырь (double-bubble)": {
      name: "Разделённый контур ягодиц",
      description: "Две отчётливо очерченные половины с глубокой межъягодичной бороздой",
      tags: ["separated-glutes", "deep-gluteal-cleft"],
    },
    "Ягодица-«полка»": {
      name: "Ягодица с горизонтальной проекцией",
      description: "Резкий переход от поясницы к ягодице, проекция направлена кзади",
      tags: ["shelf-glutes", "posterior-projection", "lumbar-gluteal-step"],
    },
    "Ягодицы с «ямочками Венеры»": {
      name: "Пояснично-крестцовые ямки (ямки Венеры)",
      description: "Втяжения кожи над задними верхними подвздошными остями",
      tags: ["dimples-of-venus", "sacral-dimples", "psis-landmark"],
    },
    "Ягодица с жировыми боками": {
      name: "Латеральные жировые отложения бедра (галифе)",
      description: "Локальное отложение в области большого вертела и латеральной поверхности бедра",
      tags: ["trochanteric-fat", "saddlebags", "lateral-thigh-fat"],
    },
    "Ягодица томбоя / спортивная плоская": {
      name: "Ягодица атлетического сложения",
      description: "Низкая жировая прослойка, контур определяется большой ягодичной мышцей",
      tags: ["athletic-glutes", "low-body-fat-glutes", "muscle-defined-glutes"],
    },
    "Фембойские ягодицы": {
      name: "Ягодица малого объёма с округлым контуром (мужская)",
      description: "Небольшой мышечный и жировой объём при округлом, а не уплощённом контуре",
      tags: ["low-volume-glutes", "rounded-contour-male"],
      gender: "male",
    },
    "Мужские спортивные ягодицы": {
      name: "Гипертрофированная ягодичная мускулатура (мужская)",
      description: "Развитие большой ягодичной мышцы при силовой нагрузке, плотный контур",
      tags: ["hypertrophied-glutes", "male-athletic-glutes"],
      gender: "male",
    },
    "BBW-ягодицы": {
      name: "Ягодица с высокой жировой массой",
      description: "Значительный объём за счёт подкожной жировой клетчатки, мягкий контур",
      tags: ["high-adiposity-glutes", "soft-contour-glutes"],
    },
    "Целлюлит на ягодицах": {
      name: "Гиноидная липодистрофия ягодичной области",
      description: "Бугристый рельеф кожи из-за строения соединительнотканных перегородок; вариант нормы",
      tags: ["gynoid-lipodystrophy", "cellulite", "dimpled-skin"],
    },
    "Растяжки на ягодицах": {
      name: "Стрии ягодичной области",
      description: "Атрофические полосы кожи после быстрого изменения объёма",
      tags: ["striae", "stretch-marks", "atrophic-bands"],
    },
  },

  "archetype-femboy": {
    "Femboy: стройное тело": {
      name: "Низкая жировая и мышечная масса",
      description: "Малый обхват сегментов при сохранной длине костей",
      tags: ["low-muscle-mass", "low-body-fat", "slender-male"],
    },
    "Femboy: узкие плечи": {
      name: "Узкий плечевой пояс",
      description: "Биакромиальный размер меньше битрохантерного — нетипичное для мужчин соотношение",
      tags: ["narrow-biacromial", "low-shoulder-hip-ratio"],
    },
    "Femboy: женственные бёдра": {
      name: "Гиноидное соотношение таз/плечи",
      description: "Битрохантерный размер превышает биакромиальный",
      tags: ["gynoid-ratio-male", "wide-bitrochanteric"],
    },
    "Femboy: мягкая попа": {
      name: "Ягодичная область малого объёма, округлый контур",
      description: "Преобладание подкожной клетчатки над мышечным рельефом",
      tags: ["low-volume-glutes-male", "rounded-gluteal-contour"],
    },
    "Femboy: гладкая кожа": {
      name: "Минимальное терминальное оволосение тела",
      description: "Преобладание пушкового волоса; конституционально или после эпиляции",
      tags: ["minimal-terminal-hair", "vellus-dominant"],
    },
    "Femboy: тонкая талия": {
      name: "Малый обхват талии при узкой грудной клетке",
      description: "Низкое отношение талия/бедро для мужского сложения",
      tags: ["low-whr-male", "narrow-waist-male"],
    },
    "Femboy: тонкие руки и ноги": {
      name: "Малый обхват конечностей при удлинённых сегментах",
      description: "Тонкие рычаги, слабо выраженный мышечный рельеф",
      tags: ["slender-limbs", "long-segment-low-girth"],
    },
    "Femboy: мягкая пышная попа (thicc femboy)": {
      name: "Андрогинный морфотип с гиноидным отложением жира",
      description: "Сочетание мужского скелета с отложением жира в области бёдер и ягодиц",
      tags: ["gynoid-fat-distribution-male", "androgynous-morphotype"],
    },
    "Femboy: маленький кадык или его отсутствие": {
      name: "Слабо выраженный выступ гортани",
      description: "Малый угол щитовидного хряща, сглаженный контур передней поверхности шеи",
      tags: ["low-laryngeal-prominence", "smooth-anterior-neck"],
    },
    "Femboy: мягкие черты лица": {
      name: "Сглаженный краниофациальный рельеф",
      description: "Слабый надбровный валик, округлый контур нижней челюсти, крупная глазная щель",
      tags: ["low-brow-ridge", "rounded-mandible", "soft-craniofacial"],
    },
  },

  "archetype-macho": {
    "Macho: широкие плечи": {
      name: "Широкий плечевой пояс",
      description: "Большой биакромиальный размер, высокое отношение плечи/талия",
      tags: ["wide-biacromial", "high-shoulder-waist-ratio", "v-taper"],
    },
    "Macho: квадратная челюсть": {
      name: "Выраженный гониальный угол нижней челюсти",
      description: "Широкая ветвь и угол нижней челюсти, прямоугольный контур лица",
      tags: ["prominent-gonial-angle", "wide-mandible", "square-jaw"],
    },
    "Macho: волосатое тело": {
      name: "Обильное терминальное оволосение туловища и конечностей",
      description: "Плотный волосяной покров груди, живота, спины и бёдер",
      tags: ["dense-terminal-hair", "hairy-torso", "hairy-limbs"],
    },
    "Macho: толстая шея": {
      name: "Большой обхват шеи",
      description: "Гипертрофия грудино-ключично-сосцевидной мышцы и верхней трапеции",
      tags: ["thick-neck", "hypertrophied-scm", "upper-trap-mass"],
    },
    "Macho: мощный пресс (не кубики)": {
      name: "Плотная брюшная стенка без рельефа прямой мышцы",
      description: "Толстая мускулатура кора при жировой прослойке, скрывающей сухожильные перемычки",
      tags: ["thick-abdominal-wall", "non-defined-abs", "powerlifter-core"],
    },
    "Macho: массивные руки": {
      name: "Большой обхват плеча и предплечья",
      description: "Гипертрофия двуглавой и трёхглавой мышц, крупная кисть",
      tags: ["large-arm-girth", "hypertrophied-arms", "large-hands"],
    },
    "Macho: «папочка»-бёдра": {
      name: "Большой обхват бедра при широком тазе",
      description: "Развитая четырёхглавая мышца и плотная жировая прослойка",
      tags: ["large-thigh-girth", "wide-pelvis-male", "stocky-build"],
    },
    "Macho: выраженный лобок и пах": {
      name: "Подвздошно-паховая борозда (V-линия)",
      description: "Рельеф по нижнему краю наружной косой мышцы и паховой связке при низком проценте жира",
      tags: ["iliac-furrow", "v-lines", "inguinal-ligament-relief", "adonis-belt"],
    },
    "Macho: грубая кожа": {
      name: "Гиперкератоз ладоней и выраженный венозный рисунок",
      description: "Мозоли, плотная кожа кистей, просвечивающие подкожные вены",
      tags: ["palmar-hyperkeratosis", "calloused-hands", "visible-veins"],
    },
    "Macho: волосатый лобок": {
      name: "Оволосение лобковой области по мужскому типу",
      description: "Ромбовидное распространение терминального волоса с переходом к пупку",
      tags: ["male-pattern-pubic-hair", "rhomboid-escutcheon"],
    },
    "Macho: развитые ягодичные (squat ass)": {
      name: "Гипертрофия ягодичных мышц силового типа",
      description: "Плотный мышечный контур, сформированный приседаниями и тягами",
      tags: ["hypertrophied-glutes", "strength-trained-glutes"],
    },
  },

  "archetype-bbw": {
    "BBW: большая мягкая грудь": {
      name: "Молочная железа большого объёма с птозом",
      description: "Значительный железисто-жировой объём, опущение по классификации Регнó",
      tags: ["large-breast-volume", "breast-ptosis", "glandular-fatty"],
    },
    "BBW: мягкий живот": {
      name: "Округлый живот с подкожным отложением",
      description: "Равномерное отложение подкожной жировой клетчатки передней брюшной стенки",
      tags: ["subcutaneous-abdominal-fat", "rounded-abdomen"],
    },
    "BBW: складки живота": {
      name: "Кожно-жировые складки передней брюшной стенки",
      description: "Один или несколько горизонтальных валиков при избытке клетчатки",
      tags: ["abdominal-folds", "skin-folds"],
    },
    "BBW: огромные бёдра и ягодицы": {
      name: "Гиноидное распределение жировой ткани",
      description: "Преимущественное отложение в области таза, ягодиц и бёдер",
      tags: ["gynoid-fat-distribution", "pear-distribution"],
    },
    "BBW: толстые ляжки": {
      name: "Большой обхват бедра со смыканием по внутренней поверхности",
      description: "Контакт медиальных поверхностей бёдер при сведённых стопах",
      tags: ["large-thigh-girth", "medial-thigh-contact"],
    },
    "BBW: мягкие руки": {
      name: "Отложение жировой клетчатки на плече",
      description: "Увеличение обхвата плеча, провисание задней поверхности",
      tags: ["upper-arm-adiposity", "brachial-fat"],
    },
    "BBW: двойной подбородок": {
      name: "Субментальное жировое отложение",
      description: "Складка под нижней челюстью, сглаживание шейно-подбородочного угла",
      tags: ["submental-fat", "double-chin", "obtuse-cervicomental-angle"],
    },
    "BBW: растяжки": {
      name: "Стрии живота, бёдер и молочных желёз",
      description: "Атрофические полосы после растяжения кожи",
      tags: ["striae-distensae", "stretch-marks"],
    },
    "BBW: целлюлит": {
      name: "Гиноидная липодистрофия бёдер и ягодиц",
      description: "Бугристость кожи, обусловленная строением соединительнотканных перегородок",
      tags: ["gynoid-lipodystrophy", "cellulite"],
    },
    "BBW: «apron belly» (фартучный живот)": {
      name: "Абдоминальный панникул (фартучный живот)",
      description: "Нависание кожно-жирового лоскута передней брюшной стенки над лобковой областью",
      tags: ["abdominal-pannus", "panniculus", "apron-abdomen"],
    },
    "BBW: пышная интимная зона": {
      name: "Выраженная надлобковая жировая подушка",
      description: "Увеличение объёма mons pubis за счёт подкожной клетчатки",
      tags: ["suprapubic-fat-pad", "prominent-mons-pubis"],
    },
    "BBW: «back fat» и складки спины": {
      name: "Жировые складки спины",
      description: "Валики по линии бюстгальтера и в поясничной области",
      tags: ["back-folds", "posterior-trunk-adiposity"],
    },
    "SSBBW: сверхпышная": {
      name: "Ожирение III степени (морбидное)",
      description: "ИМТ 40 и выше; ограничение подвижности, изменение опорного контура тела",
      tags: ["class-3-obesity", "morbid-obesity", "bmi-40-plus"],
    },
  },

  "archetype-tomboy": {
    "Tomboy: спортивное тело": {
      name: "Атлетическое сложение с низкой жировой массой",
      description: "Развитая скелетная мускулатура при малой толщине подкожной клетчатки",
      tags: ["athletic-female", "low-body-fat-female", "muscle-defined"],
    },
    "Tomboy: плоская или маленькая грудь": {
      name: "Молочная железа малого объёма",
      description: "Небольшой железистый объём, слабо выраженная проекция",
      tags: ["small-breast-volume", "low-projection"],
    },
    "Tomboy: узкие бёдра": {
      name: "Узкий таз (андроидное соотношение)",
      description: "Малый битрохантерный размер, отношение талия/бедро приближается к мужскому",
      tags: ["narrow-pelvis-female", "android-ratio", "high-whr-female"],
    },
    "Tomboy: мускулистые ноги": {
      name: "Гипертрофия мускулатуры нижней конечности",
      description: "Развитая четырёхглавая и икроножная мышцы",
      tags: ["hypertrophied-quadriceps", "developed-calves", "athletic-legs"],
    },
    "Tomboy: плоский животик": {
      name: "Плоская брюшная стенка с видимым рельефом",
      description: "Низкая жировая прослойка, различимые сухожильные перемычки",
      tags: ["flat-abdomen", "visible-rectus-definition"],
    },
    "Tomboy: спортивная попа": {
      name: "Ягодичная область атлетического типа",
      description: "Умеренный объём, контур определяется мышцей, а не клетчаткой",
      tags: ["athletic-glutes-female", "muscle-defined-glutes"],
    },
    "Thicc tomboy": {
      name: "Атлетический верх при гиноидном отложении жира",
      description: "Развитая мускулатура плечевого пояса с отложением в области бёдер и ягодиц",
      tags: ["athletic-upper-gynoid-lower", "mixed-distribution"],
    },
    "Tomboy: небольшая грудь с видимыми мышцами": {
      name: "Малый объём железы при развитой большой грудной мышце",
      description: "Мышечный контур преобладает над железистым",
      tags: ["small-breast-developed-pectoralis", "muscle-over-gland"],
    },
    "Tomboy: мальчишеский пах": {
      name: "Узкая лобковая область, прямой контур таза",
      description: "Малая ширина лобкового треугольника, слабо выраженный переход талия — бедро",
      tags: ["narrow-pubic-area", "straight-pelvic-contour"],
    },
  },

  // ── Паховая и лобковая область: клинический референс ──────
  "intimate-zone-general": {
    "Bulge (выраженность через одежду)": {
      name: "Контур наружных половых органов под одеждой (мужской)",
      description: "Проступающий рельеф; зависит от объёма органов, кроя изделия и положения тела",
      tags: ["male-genital-contour", "clothed-outline"],
    },
    "Маленький bulge": {
      name: "Слабо выраженный контур под одеждой",
      description: "Рельеф почти не читается при свободном крое",
      tags: ["minimal-contour", "loose-fit"],
    },
    "Крупный bulge": {
      name: "Отчётливо выраженный контур под одеждой",
      description: "Рельеф читается при облегающем крое",
      tags: ["pronounced-contour", "tight-fit"],
    },
    "Мошоночная часть bulge": {
      name: "Мошонка: положение и тонус",
      description: "Контур меняется при сокращении мышцы, поднимающей яичко, и от температуры среды",
      tags: ["scrotal-contour", "cremasteric-response"],
    },
    "Camel toe": {
      name: "Контур больших половых губ под облегающей тканью",
      description: "Проступающая срединная борозда вульвы при плотном крое изделия",
      tags: ["labial-contour", "clothed-outline-female"],
    },
    "Mons pubis выраженный": {
      name: "Выраженный лобковый бугор (mons pubis)",
      description: "Значительный объём жировой подушки над лобковым симфизом",
      tags: ["prominent-mons-pubis", "suprapubic-fat-pad"],
    },
    "Mons pubis плоский": {
      name: "Уплощённый лобковый бугор",
      description: "Тонкая жировая подушка, различим контур лобкового симфиза",
      tags: ["flat-mons-pubis", "low-suprapubic-fat"],
    },
    "Линия бикини": {
      name: "Линия белья на бедре",
      description: "Граница загара или депиляции по краю изделия",
      tags: ["bikini-line", "garment-border"],
    },
    "V-линии / Adonis belt (мужской)": {
      name: "Подвздошно-паховая борозда (мужская)",
      description: "Рельеф по паховой связке и нижнему краю наружной косой мышцы",
      tags: ["iliac-furrow", "inguinal-ligament-relief", "adonis-belt"],
    },
    "V-линии у девушек": {
      name: "Подвздошно-паховая борозда (женская)",
      description: "Тот же рельеф при низкой жировой массе у женщин",
      tags: ["iliac-furrow-female", "lower-abdominal-relief"],
    },
    "Натуральная «буш» (full bush)": {
      name: "Естественное оволосение лобковой области",
      description: "Терминальный волос без обработки; форма зоны роста индивидуальна",
      tags: ["natural-pubic-hair", "untrimmed"],
    },
    "Бритая зона": {
      name: "Полная депиляция лобковой области",
      description: "Удаление волоса бритьём, воском или аппаратными методами",
      tags: ["full-depilation", "shaved-pubic"],
    },
    "Узкая полоска (landing strip)": {
      name: "Депиляция с сохранением вертикальной полосы",
      description: "Узкая полоса терминального волоса по срединной линии",
      tags: ["strip-depilation", "vertical-strip"],
    },
    "Треугольник (triangle trim)": {
      name: "Депиляция с сохранением треугольника",
      description: "Оформленная зона роста треугольной формы",
      tags: ["triangle-trim", "shaped-depilation"],
    },
    "Сердечко (heart trim)": {
      name: "Фигурная депиляция",
      description: "Зона роста оформлена по заданному контуру",
      tags: ["shaped-depilation", "decorative-trim"],
    },
  },

  "intimate-neutral-extended": {
    "Линия бикини (гладкая)": {
      name: "Депилированная линия белья",
      description: "Гладкая кожа по краю изделия без терминального волоса",
      tags: ["depilated-bikini-line"],
    },
    "Натуральное оволосение лобка": {
      name: "Терминальное оволосение лобковой области",
      description: "Естественная плотность и распространение волоса",
      tags: ["terminal-pubic-hair"],
    },
    "Аккуратно подстрижено (trimmed)": {
      name: "Укороченное оволосение лобковой области",
      description: "Волос подстрижен без удаления зоны роста",
      tags: ["trimmed-pubic-hair"],
    },
    "Полностью гладко": {
      name: "Полная депиляция области",
      description: "Терминальный волос удалён целиком",
      tags: ["full-depilation"],
    },
    "Дорожка волос (happy trail)": {
      name: "Белая линия живота с оволосением",
      description: "Полоса терминального волоса по linea alba от пупка книзу",
      tags: ["linea-alba-hair", "abdominal-midline-hair"],
    },
    "V-линии паха (мышечные)": {
      name: "Подвздошно-паховая борозда",
      description: "Косые борозды к лобковой области при низкой жировой массе",
      tags: ["iliac-furrow", "v-lines"],
    },
    "Мягкий низ живота (pooch)": {
      name: "Округлость нижнего отдела живота",
      description: "Физиологическая выпуклость ниже пупка над лобковой областью",
      tags: ["lower-abdominal-convexity"],
    },
    "Жировая подушка над лобком (FUPA)": {
      name: "Надлобковая жировая подушка",
      description: "Локальное отложение клетчатки над лобковым симфизом",
      tags: ["suprapubic-fat-pad"],
    },
    "Косточки таза видны (худоба)": {
      name: "Контурирование передних верхних подвздошных остей",
      description: "Костные ориентиры таза различимы при низкой жировой массе",
      tags: ["visible-asis", "iliac-crest-relief"],
    },
    "Складка бедро-таз (паховая)": {
      name: "Паховая складка",
      description: "Естественная борозда между брюшной стенкой и передней поверхностью бедра",
      tags: ["inguinal-crease", "hip-crease"],
    },
    "Растяжки в зоне бёдер/паха": {
      name: "Стрии паховой области и бёдер",
      description: "Атрофические полосы кожи после изменения объёма",
      tags: ["striae", "stretch-marks"],
    },
  },

  // ── Точечные правки по всей таксономии ───────────────────
  "back": {
    "Жировые складки на спине": {
      description: "Отложение подкожной клетчатки по боковой поверхности спины, валики по линии белья",
      tags: ["back-fat", "posterior-trunk-adiposity", "flank-folds"],
    },
  },
  "hair-body": {
    "Натуральные лобковые волосы": {
      name: "Естественное оволосение лобковой области",
      description: "Терминальный волос без обработки",
      tags: ["natural-pubic-hair", "untrimmed"],
    },
    "Подстриженные лобковые волосы": {
      name: "Укороченное оволосение лобковой области",
      description: "Волос подстрижен, зона роста сохранена",
      tags: ["trimmed-pubic-hair"],
    },
    "Бритая интимная зона": {
      name: "Депиляция лобковой области",
      description: "Удаление терминального волоса бритьём или воском",
      tags: ["depilated-pubic", "shaved-pubic"],
    },
    "Лобковая дорожка (landing strip)": {
      name: "Депиляция с сохранением вертикальной полосы",
      description: "Узкая полоса волоса по срединной линии",
      tags: ["strip-depilation"],
    },
  },
  "hips-thighs": {
    "Широкие бёдра": { tags: ["wide-hips", "broad-hips", "wide-bitrochanteric"] },
  },
  "hips-pelvis-detail": {
    "Широкий таз (детородные бёдра)": {
      name: "Широкий таз (гинекоидный тип)",
      description: "Большой поперечный размер входа в малый таз, широкий битрохантерный размер",
      tags: ["gynecoid-pelvis", "wide-pelvis", "broad-bitrochanteric"],
    },
  },
  "female-hips": {
    "Детородные широкие бёдра": {
      name: "Широкий таз гинекоидного типа",
      description: "Большая межостная и битрохантерная ширина",
      tags: ["gynecoid-pelvis", "wide_hips"],
    },
  },
  "female-booru-extended": {
    "wide_hips": { tags: ["wide_hips", "broad_pelvis"] },
  },
  // Возрастные позиции: снимаем арт-теги, оставляем физиологию
  "age-physical-changes": {
    "Препубертатный (8–11)": {
      description: "Стадия роста до полового созревания: низкая мышечная масса, высокая относительная сила",
      tags: ["prepubertal-stage", "growth-physiology"],
    },
    "Ранний пубертат (12–14)": {
      description: "Начало пубертатного скачка роста, опережающий рост длинных костей",
      tags: ["early-pubertal-stage", "growth-spurt"],
    },
    "Поздний пубертат (15–18)": {
      description: "Завершение формирования пропорций, закрытие зон роста",
      tags: ["late-pubertal-stage", "epiphyseal-closure"],
    },
  },
  "male-special-categories": {
    "Атлетичная молодость": {
      name: "Атлетичный молодой взрослый",
      description: "Мужчина 18–25 лет: пик анаболического ответа и скорости восстановления",
      tags: ["young-adult-athletic", "peak-anabolic-response"],
    },
  },
  "exaggerated-appearance": {
    "Юный гипертроф с тонкими костями": {
      name: "Молодой атлет с непропорционально развитым верхом",
      description: "Гипертрофия плечевого пояса при тонком костяке и отстающих ногах",
      tags: ["young-overbuild", "thin-frame-overbulk", "skeletal-limitation"],
    },
  },
  "hidden-strength": {
    "Маленький борец-вольник": {
      name: "Борец малой весовой категории",
      description: "Вес около 60 кг при способности контролировать соперника на 30 кг тяжелее",
      tags: ["lightweight-grappler", "technique-strength"],
    },
  },
  "age-decade-archetypes": {
    "Подростковое тело (15-19)": {
      name: "Тело в фазе завершения роста",
      description: "Незавершённое окостенение, угловатость контуров, высокий основной обмен",
      tags: ["growth-completion-stage", "lanky-proportions"],
    },
  },
  "body-proportions-extended": {
    "1:5–1:6 голова к телу (чибиш/детский)": {
      name: "1:5–1:6 голова к телу (стилизованные пропорции)",
      description: "Голова занимает большую долю роста — приём стилизации в рисунке",
      tags: ["head-body-1to5", "stylized-proportions"],
    },
  },
  "male-facial-hair": {
    "Тонкие подростковые усики": {
      name: "Редкая первичная растительность над губой",
      description: "Тонкий, неплотный волос — ранняя стадия роста усов",
      tags: ["sparse-mustache", "peach-fuzz"],
    },
  },
};

// ── 4. Глобальные текстовые замены ──────────────────────────
const textRewrites = [
  [/для NSFW-референса/gi, "для анатомического референса"],
  [/NSFW-классификация/gi, "морфологическая классификация"],
  [/очень популярный NSFW-тег/gi, "распространённый арт-тег"],
  [/специфический NSFW-арт-тег/gi, "специфический арт-тег"],
  [/NSFW-арт-тег/gi, "арт-тег"],
  [/NSFW-тег/gi, "арт-тег"],
  [/\bNSFW\b/gi, "анатомический"],
  [/«секс-линии»/gi, "подвздошно-паховые борозды"],
  [/«sex lines»/gi, "подвздошно-паховые борозды"],
];

const tagRewrites = [
  [/^sex-lines$/i, "iliac-furrow"],
  [/^child[-_]?bearing[-_]?hips$/i, "wide-pelvis"],
  [/^child[-_]?ratio$/i, "stylized-ratio"],
  [/^teen[-_]?body$/i, "growth-stage"],
  [/^child[-_]?body$/i, "prepubertal-stage"],
  [/^pre-?teen[-_]?physique$/i, "prepubertal-stage"],
  [/^teen[-_]?athlete$/i, "young-adult-athlete"],
  [/^teen[-_]?overbuild$/i, "young-overbuild"],
  [/^fat-ass.*$/i, "high-adiposity-glutes"],
  [/^huge-soft-ass$/i, "high-adiposity-glutes"],
  [/^big-soft-boobs$/i, "large-breast-volume"],
  [/^cottage-cheese-ass$/i, "dimpled-skin"],
  [/^tiger-stripes.*$/i, "striae"],
  [/^immobile-fat$/i, "class-3-obesity"],
  [/^ssbbw$/i, "class-3-obesity"],
  [/^super-bbw$/i, "class-3-obesity"],
  [/^bbw-(.*)$/i, "high-adiposity-$1"],
  [/^girlish-ass$/i, "rounded-gluteal-contour"],
  [/^twink-ass$/i, "low-volume-glutes"],
];

// ── 5. Порядок: интимная топография уходит вниз ─────────────
// Она не первая и не в середине основной анатомии — идёт после
// всей морфометрии, перед генеративными переборами.
const moveToEnd = [
  "inguinal-pubic-topography",
  "lower-abdomen-topography",
  "nipples-areola-art",
];

module.exports = { sectionPatches, dropItems, itemPatches, textRewrites, tagRewrites, moveToEnd };
