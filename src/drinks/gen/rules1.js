// Генераторы, пересобранные на тегах: чай × добавка, кофе × способ, чай × способ, повод × напиток, ботаникал × применение
const {axis, has, run, v1} = require('./engine');

function teaadd() {
  const g = v1('g_teaadd');
  const A = axis(g.A, {
    'Зелёный чай': 'green', 'Белый чай': 'white delicate', 'Шэн пуэр молодой': 'puer sheng', 'Улун слабоокисленный': 'oolong light delicate',
    'Жёлтый чай': 'yellow delicate', 'Улун тёмный обжаренный': 'oolong dark roast', 'Чёрный чай (красный)': 'black', 'Ассам CTC': 'black strong milky',
    'Цейлон': 'black', 'Дянь Хун': 'black', 'Лапсанг сушонг': 'black smoke', 'Шу пуэр': 'puer shu strong', 'Матча': 'green powder',
    'Ходзича': 'green roast', 'Каркаде': 'herbal sour', 'Ройбуш': 'herbal mild', 'Мятный настой': 'herbal mint', 'Ромашковый настой': 'herbal mild',
    'Иван-чай': 'herbal mild', 'Масала-база': 'black strong milky spiced',
  });
  const B = axis(g.B, {
    'лимон': ['citrus', 'Кислота освежает и осветляет тёмный настой'], 'бергамот': ['floral berg', 'Классика эрл грея: масло цедры, а не сок'],
    'мёд': 'sweet', 'мята': 'herb', 'мелисса': 'herb', 'жасмин': ['floral jas', 'Ароматизация живыми цветами, а не маслом'], 'роза': 'floral',
    'лаванда': 'floral', 'персик': 'fruit', 'маракуйя': 'fruit iced', 'сырная пенка': 'cheese', 'лёд и холодная подача': 'ice',
    'молоко': 'milk', 'сливки': 'milk', 'сгущённое молоко': 'milk sweet', 'растительное молоко': 'milk', 'лайм': 'citrus', 'апельсин': 'citrus',
    'сахар': 'sweet', 'варенье вприкуску': 'sweet ru jam', 'имбирь': 'spice ginger', 'корица': 'spice', 'кардамон': 'spice', 'гвоздика': 'spice',
    'бадьян': 'spice', 'чёрный перец': 'spice', 'чабрец': 'herb ru', 'облепиха': 'fruit ru', 'малина': 'fruit ru', 'чёрная смородина': ['fruit ru', 'Ягоды и лист смородины: лист ароматнее ягоды'],
    'брусника': 'fruit ru', 'груша': 'fruit', 'яблоко сушёное': 'fruit', 'тапиока': 'tapioca', 'соль': 'salt', 'масло': 'butter',
    'ром или бренди': 'alc', 'виски': 'alc', 'шиповник': 'fruit ru',
  });
  const CL = {'Чёрный чай (красный)|бергамот': 'Эрл грей', 'Цейлон|бергамот': 'Эрл грей на цейлоне — самый частый вариант', 'Зелёный чай|мята': 'Марокканский чай с мятой',
    'Зелёный чай|жасмин': 'Жасминовый чай Фуцзяни', 'Улун слабоокисленный|жасмин': 'Жасминовый улун', 'Ассам CTC|молоко': 'Английский чай с молоком',
    'Масала-база|молоко': 'Масала-чай', 'Шу пуэр|масло': 'Тибетский чай по-ча: масло яка и соль', 'Шу пуэр|соль': 'Плиточный чай с солью — монгольская и тибетская основа',
    'Зелёный чай|соль': 'Кашмирский нун-чай: соль и сода дают розовый цвет', 'Ассам CTC|сгущённое молоко': 'Тех тарик и тайский чай',
    'Чёрный чай (красный)|тапиока': 'Классический бабл-ти', 'Матча|молоко': 'Матча-латте', 'Ходзича|молоко': 'Ходзича-латте',
    'Чёрный чай (красный)|лимон': 'Русский чай с лимоном', 'Чёрный чай (красный)|варенье вприкуску': 'Русское чаепитие из самовара',
    'Чёрный чай (красный)|ром или бренди': 'Чайный грог', 'Масала-база|имбирь': 'Адрак-чай', 'Улун тёмный обжаренный|сырная пенка': 'Тайваньский чиз-ти',
    'Чёрный чай (красный)|чабрец': 'Дачная классика с чабрецом', 'Иван-чай|чёрная смородина': 'Копорский сбор с листом смородины'};
  return run({id: 'g_teaadd', emoji: g.emoji, title: 'Чай × добавка', color: g.color,
    about: 'Сгенерированная матрица по правилам: молоко — только к плотным и обжаренным, цветы — к лёгким, соль и масло — к плиточному; для известных пар назван напиток',
    A, B, rule: (a, b) => {
      const ok =
        has(b, 'milk') ? has(a, 'strong', 'roast', 'powder') || (has(a, 'black') && !has(a, 'smoke')) || a.n === 'Ройбуш' :
        has(b, 'citrus') ? !has(a, 'milky', 'powder', 'roast', 'puer', 'white', 'yellow') || a.n === 'Матча' && b.n === 'лимон' :
        has(b, 'berg') ? has(a, 'black', 'green') && !has(a, 'smoke', 'milky', 'powder', 'roast') || a.n === 'Ройбуш' :
        has(b, 'jas') ? has(a, 'green', 'white') && !has(a, 'powder', 'roast') || has(a, 'oolong') && has(a, 'light') :
        has(b, 'floral') ? (has(a, 'black', 'green', 'white') || ['Ройбуш', 'Ромашковый настой', 'Каркаде'].includes(a.n)) && !has(a, 'smoke', 'milky', 'powder', 'roast') :
        has(b, 'herb') ? (has(a, 'green', 'black') && !has(a, 'smoke', 'powder', 'roast', 'milky') || has(a, 'herbal')) && !(b.n === 'мята' && a.n === 'Мятный настой') :
        has(b, 'fruit') ? (has(a, 'black', 'green', 'white', 'herbal') && !has(a, 'smoke', 'milky', 'powder', 'roast')) && !(has(b, 'iced') && has(a, 'white')) :
        has(b, 'jam') ? has(a, 'black', 'herbal', 'green') && !has(a, 'milky', 'powder', 'roast') :
        has(b, 'sweet') ? !has(a, 'white', 'yellow', 'delicate') || b.n === 'мёд' && !has(a, 'oolong') :
        has(b, 'spice') ? (has(a, 'black', 'herbal') && !has(a, 'smoke')) || has(a, 'puer') && has(a, 'shu') || has(b, 'ginger') && has(a, 'green') && !has(a, 'powder') :
        has(b, 'ice') ? !has(a, 'spiced') :
        has(b, 'cheese') ? has(a, 'black', 'oolong', 'powder') && !has(a, 'smoke', 'spiced') :
        has(b, 'tapioca') ? has(a, 'black', 'powder', 'roast') && !has(a, 'smoke') || has(a, 'oolong') :
        has(b, 'salt') ? a.n === 'Шу пуэр' || a.n === 'Зелёный чай' :
        has(b, 'butter') ? a.n === 'Шу пуэр' :
        has(b, 'alc') ? has(a, 'black', 'strong') || a.n === 'Иван-чай' : false;
      if (!ok) return null;
      return CL[a.n + '|' + b.n] || true;
    },
    name: (a, b) => `${a.n} + ${b.n}`, desc: (a, b, note) => [note, b.d, a.d]});
}

function coffbrew() {
  const g = v1('g_coffbrew');
  const t = {};
  for (const x of g.A) t[x.n] = 'washed';
  Object.assign(t, {
    'Эфиопия Иргачеффе мытая': 'floral bright', 'Эфиопия Гуджи натуральная': 'fruity natural', 'Эфиопия Харрар': 'fruity natural wild',
    'Кения AA': 'bright berry', 'Бурунди Кайянза': 'floral bright', 'Руанда Ньямасеке': 'bright berry', 'Танзания Килиманджаро': 'bright body',
    'Йемен Мокка Матари': 'wild spice natural', 'Колумбия Уила': 'balanced', 'Колумбия Нариньо': 'bright', 'Бразилия Серрадо': 'choc low',
    'Бразилия натуральная Моджиана': 'choc low natural espresso', 'Гватемала Антигуа': 'choc spice', 'Гватемала Уэуэтенанго': 'bright floral',
    'Коста-Рика Тарразу хани': 'balanced sweet', 'Гондурас Маркала': 'balanced choc', 'Сальвадор Пакамара': 'complex', 'Мексика Чьяпас': 'choc low',
    'Панама Гейша': 'floral bright rare', 'Ямайка Блю Маунтин': 'balanced low', 'Гавайи Кона': 'balanced low', 'Индонезия Суматра Мандхелинг': 'earthy low body',
    'Сулавеси Тораджа': 'earthy spice body', 'Индия Муссонный Малабар': 'earthy low body', 'Вьетнам робуста': 'robusta', 'Уганда робуста': 'robusta',
    'Анаэробная ферментация (любое происхождение)': 'funky',
  });
  const spec = {}; for (const [k, v] of Object.entries(t)) spec[k] = v;
  const A = axis(g.A, spec);
  const B = axis(g.B, {'V60': 'filter clear', 'Кемекс': 'filter clear', 'Калита Вейв': 'filter', 'Аэропресс': 'any', 'Сифон': 'filter',
    'Флеш-брю': 'cold aroma', 'Эспрессо-тоник': 'cold bright', 'Каппинг': 'any', 'Эспрессо': 'espresso', 'Колд-брю': 'cold sweet',
    'Френч-пресс': 'body', 'Капельная кофеварка': 'filter', 'Ристретто': 'espresso sweet', 'Молочный напиток (латте, капучино)': 'milk',
    'Мока (гейзер)': 'strong', 'Турка': 'strong', 'Фин вьетнамский': 'strong phin'});
  const CL = {'Эфиопия Иргачеффе мытая|V60': 'Эталонная пара третьей волны', 'Панама Гейша|Каппинг': 'Аукцион Best of Panama оценивает именно так',
    'Вьетнам робуста|Фин вьетнамский': 'Кофе по-вьетнамски со сгущёнкой', 'Бразилия натуральная Моджиана|Эспрессо': 'Основа классических эспрессо-смесей',
    'Индия Муссонный Малабар|Эспрессо': 'Плотная крема итальянских смесей', 'Йемен Мокка Матари|Турка': 'Историческая пара: отсюда кофе и пришёл в джезву',
    'Кения AA|Флеш-брю': 'Чёрная смородина во льду звучит ярче всего', 'Анаэробная ферментация (любое происхождение)|Колд-брю': 'Сладкие «ликёрные» ноты без кислоты'};
  return run({id: 'g_coffbrew', emoji: g.emoji, title: 'Происхождение кофе × способ заваривания', color: g.color,
    about: 'Сгенерированная матрица по правилам: светлое цветочное — в фильтр, плотное шоколадное — в эспрессо и молоко, робуста — в фин и турку',
    A, B, rule: (a, b) => {
      const k = [...b.t];
      const ok = has(b, 'any') ||
        has(a, 'robusta') ? has(b, 'espresso', 'strong', 'milk', 'body') || b.n === 'Колд-брю' :
        has(a, 'floral', 'bright', 'berry') ? has(b, 'filter', 'cold') || b.n === 'Эспрессо' && !has(a, 'rare') :
        has(a, 'choc', 'earthy', 'low') ? has(b, 'espresso', 'milk', 'body', 'strong') || b.n === 'Колд-брю' || b.n === 'Капельная кофеварка' :
        has(a, 'fruity', 'wild', 'funky') ? has(b, 'filter', 'cold') || b.n === 'Френч-пресс' || has(a, 'wild') && has(b, 'strong') && !has(b, 'phin') :
        has(b, 'filter', 'espresso', 'milk', 'cold', 'body') && !has(b, 'phin');
      if (!ok || (has(b, 'phin') && !has(a, 'robusta', 'choc'))) return null;
      return CL[a.n + '|' + b.n] || true;
    },
    name: (a, b) => `${a.n} → ${b.n}`, desc: (a, b, note) => [note, b.d, a.d]});
}

function teaway() {
  const g = v1('g_teaway');
  const A = axis(g.A, {
    'Лунцзин': 'green cn', 'Билочунь': 'green cn delicate', 'Сенча': 'green jp', 'Гёкуро': 'green jp delicate', 'Байхао Иньчжэнь': 'white delicate',
    'Бай Му Дань': 'white pressable', 'Тэ Гуань Инь': 'oolong light', 'Да Хун Пао': 'oolong roast', 'Дун Дин': 'oolong roast', 'Дун Фан Мэй Жэнь': 'oolong light',
    'Дянь Хун': 'red', 'Кимун': 'red', 'Ассам': 'black strong', 'Дарджилинг второго сбора': 'black darj', 'Лапсанг сушонг': 'black smoke',
    'Шэн пуэр': 'puer pressed', 'Шу пуэр': 'puer pressed dark', 'Лю Бао': 'dark pressed', 'Фу Чжуань': 'dark pressed', 'Матча': 'powder',
    'Ходзича': 'roast jp', 'Каркаде': 'herbal sour', 'Ройбуш': 'herbal mild', 'Мята и мелисса': 'herbal mint', 'Ромашка': 'herbal mild', 'Иван-чай ферментированный': 'herbal ru',
  });
  const B = axis(g.B, {
    'гунфу-ча в гайвани': 'gongfu', 'европейское заваривание в чайнике': 'euro', 'в стеклянном чайнике с фильтром': 'glass', 'холодное заваривание (cold brew)': 'cold',
    'по-мароккански с мятой и сахаром': 'maroc', 'со льдом на лимонной базе': 'iced', 'в бабл-ти с тапиокой': 'bubble', 'в чайной церемонии': 'ceremony',
    'гунфу в исинском чайнике': 'yixing', 'в термосе': 'thermos', 'в самоваре с заваркой отдельно': 'samovar', 'в армуду по-азербайджански': 'armudu',
    'по-турецки в чайданлыке': 'turk', 'варкой с молоком и специями': 'masala', 'с молоком по-британски': 'brit', 'в латте с молоком': 'latte',
    'с проливом на прессовке': 'cake', 'венчиком тясэн': ['chasen', 'Только для порошкового чая: вода 70–80 °C и быстрые движения зигзагом'],
  });
  const R = {
    gongfu: a => !has(a, 'herbal', 'powder') && !has(a, 'jp'), euro: a => has(a, 'black', 'red', 'herbal', 'roast') && !has(a, 'pressed'),
    glass: a => has(a, 'green', 'white', 'herbal') && !has(a, 'jp'), cold: a => has(a, 'green', 'white', 'herbal', 'red') || has(a, 'oolong') && has(a, 'light') || a.n === 'Шу пуэр',
    maroc: a => a.n === 'Мята и мелисса' || a.n === 'Лунцзин', iced: a => has(a, 'black', 'red', 'herbal') && !has(a, 'smoke') && a.n !== 'Ромашка',
    bubble: a => has(a, 'powder') || a.n === 'Ассам' || a.n === 'Тэ Гуань Инь' || a.n === 'Ходзича' || a.n === 'Дянь Хун',
    ceremony: a => has(a, 'powder') || a.n === 'Гёкуро' || has(a, 'oolong') || has(a, 'puer'), yixing: a => has(a, 'oolong', 'puer', 'dark', 'red'),
    thermos: a => has(a, 'dark', 'herbal') || a.n === 'Шу пуэр', samovar: a => has(a, 'black', 'red') && !has(a, 'smoke') || a.n === 'Иван-чай ферментированный',
    armudu: a => a.n === 'Ассам' || a.n === 'Дянь Хун', turk: a => a.n === 'Ассам', masala: a => a.n === 'Ассам',
    brit: a => has(a, 'black', 'red') && a.n !== 'Дарджилинг второго сбора', latte: a => has(a, 'powder', 'roast') || ['Ассам', 'Ройбуш'].includes(a.n),
    cake: a => has(a, 'pressed', 'pressable'), chasen: a => has(a, 'powder'),
  };
  const CL = {'Матча|в чайной церемонии': 'Тяною: японская чайная церемония', 'Ассам|по-турецки в чайданлыке': 'Так пьют чёрный чай от Ризе до Стамбула',
    'Да Хун Пао|гунфу в исинском чайнике': 'Классика утёсных улунов Уишаня', 'Мята и мелисса|по-мароккански с мятой и сахаром': 'Марокканский «атай» — на ганпаудере с пучком мяты',
    'Ассам|варкой с молоком и специями': 'Индийский масала-чай', 'Шэн пуэр|с проливом на прессовке': 'Блин 357 г, отломленный ножом', 'Гёкуро|в чайной церемонии': 'Сэнтядо — церемония листового чая'};
  return run({id: 'g_teaway', emoji: g.emoji, title: 'Чай × школа заваривания', color: g.color,
    about: 'Сгенерированная матрица по правилам: зелёный не варят с молоком, пуэр не заваривают «по-британски», тясэн нужен только матче',
    A, B, rule: (a, b) => { const k = [...b.t][0]; if (!R[k](a)) return null; return CL[a.n + '|' + b.n] || true; },
    name: (a, b) => `${a.n} — ${b.n}`, desc: (a, b, note) => [note, b.d, a.d]});
}

function occ() {
  const g = v1('g_occ');
  const A = axis(g.A, {
    'Утро рабочего дня': 'morning nolalc', 'Поздний завтрак в выходной': 'brunch', 'Обеденный перерыв': 'work nolalc', 'Аперитив перед ужином': 'aperitif',
    'Долгий ужин': 'dinner', 'Дижестив после еды': 'digestif', 'Жара за 30 °C': 'heat', 'Мороз и зимняя улица': 'cold',
    'Разговор на три часа': 'long', 'Шумная вечеринка': 'party', 'Спортивная трансляция': 'sport', 'Дегустация вслепую': 'tasting',
    'Работа за текстом': 'work nolalc', 'Вечер перед сном': 'sleep nolalc nocaf', 'Тренировка и после неё': 'sport_active nolalc',
    'Перелёт и акклиматизация': ['flight nolalc', 'Сухой воздух и высота кабины: вода в приоритете, алкоголь действует сильнее'],
    'Простуда': 'sick nolalc', 'Похмелье': 'hangover nolalc', 'Свидание': 'date', 'Деловая встреча': 'business nolalc', 'Праздничный тост': 'toast',
    'Пикник и шашлык': 'picnic', 'Баня и сауна': 'sauna nolalc', 'За рулём': 'drive nolalc', 'Беременность и кормление': 'preg nolalc lowcaf',
  });
  const B = axis(g.B, {
    'эспрессо и фильтр-кофе': ['caf coffee', 'От 60–80 мг кофеина в эспрессо до 200 мг в большой чашке фильтра'], 'капучино и латте': ['caf coffee', 'Молоко делает напиток сытнее и мягче для желудка'],
    'колд-брю': 'caf coffee cold', 'зелёный чай и матча': 'caf tea', 'чёрный чай с молоком': 'caf tea', 'игристое брют': 'alc wine bubbles', 'просекко и лёгкое игристое': 'alc wine bubbles light',
    'пшеничное пиво': 'alc beer', 'морс и компот': 'soft', 'комбуча': 'soft trace', 'безалкогольный спритц': 'soft bitter', 'белое сухое': 'alc wine',
    'херес фино': 'alc wine fort', 'аперитивный спритц': 'alc light bitter', 'негрони и стирред': 'alc strong bitter', 'розе': 'alc wine light', 'красное лёгкое': 'alc wine',
    'красное плотное': 'alc wine heavy', 'оранжевое вино': 'alc wine', 'стаут и портер': 'alc beer heavy', 'сидр сухой': 'alc light', 'сакэ': 'alc',
    'хайбол': 'alc light', 'портвейн и сладкое креплёное': 'alc fort sweet', 'виски нит': 'alc strong', 'амаро и травяной биттер': 'alc strong bitter',
    'вода с электролитами': 'soft hydr', 'изотоник': 'soft hydr', 'кокосовая вода': 'soft hydr', 'лимонад и содовая с цитрусом': 'soft',
    'светлый лагер': 'alc beer light', 'квас и айран': 'soft trace', 'имбирный настой с мёдом': 'soft hot', 'хот тодди и глинтвейн': 'alc hot',
    'какао и горячий шоколад': 'soft hot', 'сауэр-коктейль': 'alc', 'IPA': 'alc beer', 'шоты': 'alc strong shots', 'декаф': 'coffee decaf',
    'травяной тизан': 'soft hot nocaf', 'молоко с мёдом': ['soft hot nocaf', 'Тёплый ритуал; триптофана в стакане слишком мало, чтобы усыплять'],
    'простая вода': 'soft water', 'безалкогольное пиво': 'soft trace', 'рассол и солёное': ['soft salt', 'Натрий и вода, а не кислота, дают эффект'],
  });
  const R = {
    morning: b => has(b, 'coffee', 'tea') || b.n === 'простая вода', brunch: b => has(b, 'bubbles', 'coffee', 'soft') && !has(b, 'hydr', 'salt'),
    work: b => has(b, 'coffee', 'tea', 'water') || ['морс и компот', 'комбуча', 'безалкогольное пиво', 'лимонад и содовая с цитрусом'].includes(b.n),
    aperitif: b => has(b, 'bubbles', 'bitter') || b.n === 'херес фино' || b.n === 'белое сухое',
    dinner: b => has(b, 'wine') && !has(b, 'fort') || b.n === 'простая вода' || b.n === 'сидр сухой' || b.n === 'сакэ',
    digestif: b => has(b, 'strong', 'fort') && !has(b, 'shots') || b.n === 'эспрессо и фильтр-кофе' || b.n === 'травяной тизан',
    heat: b => (has(b, 'light', 'soft', 'cold') || b.n === 'светлый лагер') && !has(b, 'hot', 'heavy'),
    cold: b => has(b, 'hot') || b.n === 'стаут и портер' || b.n === 'чёрный чай с молоком',
    long: b => has(b, 'light') || has(b, 'soft') && !has(b, 'hydr', 'salt') || b.n === 'розе', party: b => has(b, 'light', 'beer', 'soft', 'shots') && !has(b, 'heavy', 'hydr', 'salt'),
    sport: b => has(b, 'beer') || b.n === 'безалкогольное пиво' || b.n === 'хайбол', tasting: b => ['простая вода', 'виски нит', 'белое сухое', 'красное лёгкое', 'красное плотное', 'херес фино', 'сакэ', 'эспрессо и фильтр-кофе', 'зелёный чай и матча'].includes(b.n),
    sleep: b => has(b, 'nocaf', 'water', 'decaf'), sport_active: b => has(b, 'hydr', 'water') || b.n === 'безалкогольное пиво',
    flight: b => has(b, 'water', 'hydr') || b.n === 'травяной тизан', sick: b => has(b, 'hot') && !has(b, 'alc') || has(b, 'water') || b.n === 'морс и компот',
    hangover: b => has(b, 'water', 'hydr', 'salt') || b.n === 'квас и айран', date: b => has(b, 'wine', 'bubbles') && !has(b, 'heavy') || b.n === 'сауэр-коктейль' || b.n === 'безалкогольный спритц',
    business: b => has(b, 'coffee', 'tea', 'water') || b.n === 'безалкогольный спритц' || b.n === 'лимонад и содовая с цитрусом',
    toast: b => has(b, 'bubbles') || b.n === 'безалкогольный спритц', picnic: b => has(b, 'light', 'beer') && !has(b, 'heavy') || b.n === 'квас и айран' || b.n === 'лимонад и содовая с цитрусом',
    sauna: b => has(b, 'water', 'hydr') || b.n === 'травяной тизан' || b.n === 'морс и компот' || b.n === 'квас и айран',
    drive: b => !has(b, 'alc'), preg: b => !has(b, 'alc') && !has(b, 'shots') && b.n !== 'эспрессо и фильтр-кофе' && b.n !== 'колд-брю',
  };
  return run({id: 'g_occ', emoji: g.emoji, title: 'Повод × напиток', color: g.color,
    about: 'Сгенерированная матрица по правилам: за рулём, в бане, при беременности и после тренировки алкоголь исключён правилом, а не советом',
    A, B, rule: (a, b) => { const k = [...a.t].find(t => R[t]); if (!R[k](b)) return null; if (has(a, 'nolalc') && has(b, 'alc')) return null;
      if (has(a, 'nocaf') && has(b, 'caf')) return null;
      if ((has(a, 'preg') || has(a, 'drive')) && has(b, 'trace')) return null; return true; },
    name: (a, b) => `${a.n} → ${b.n}`, desc: (a, b, note) => [note, b.d, a.d]});
}

function botan() {
  const g = v1('g_botan');
  // где ботаникал реально используют: gd gc ve bi am li ab gl bb bl te co sy sh na kk nd cd
  const USE = {
    'Можжевельник': 'gd gc bi am na bb sy nd', 'Кориандр': 'gd gc ve bi am li bb nd', 'Корень дягиля': 'gd gc ve bi am li ab nd', 'Корень ириса': 'gd gc ve li nd',
    'Лимонная цедра': 'gd gc ve bi am li gl bl te sy sh na kk nd cd', 'Апельсиновая цедра горькая': 'gd gc ve bi am li gl bl te sy na nd cd',
    'Кардамон': 'gd gc ve bi am li gl te co sy na nd', 'Корица': 'gc ve bi am li gl bl te co sy na nd', 'Гвоздика': 've bi am li gl te sy na',
    'Бадьян': 'ab li gl te sy na am', 'Фенхель': 'ab ve am li te na nd', 'Анис': 'ab li am bi na sy te', 'Полынь горькая': 've ab bi am li na',
    'Горечавка': 'bi am ve li nd', 'Хинная кора': 've bi am li sy nd', 'Померанец (горький апельсин)': 'gd gc ve bi am li gl bl sy na nd cd',
    'Имбирь': 'gc bi am li gl bb te co sy sh na kk nd cd', 'Мускатный орех': 've bi am li gl te co sy na bl', 'Ваниль': 've am li sy co te na bl bi',
    'Лакрица': 'gd am li bi ab te na bb nd', 'Ревень': 'am bi li ve sy sh cd kk na gc', 'Артишок': 'am bi', 'Ромашка': 'gc ve am li bl te sy cd kk nd',
    'Лаванда': 'gd gc li bi sy te cd kk nd', 'Роза': 'gc li bi sy te cd kk nd', 'Бузина': 'gc li sy te kk nd cd', 'Мята': 'gc am bi li sy te cd kk na nd sh',
    'Розмарин': 'gd gc ve am bi sy te cd sh na nd', 'Тимьян': 'gd gc ve am li sy te na cd nd', 'Огурец': 'gc sy sh nd cd bl kk',
    'Чёрный перец': 'gd gc bi am te co sy na nd sh bl', 'Розовый перец': 'gd gc bi sy na nd', 'Кубеба': 'gd gc bi am na nd',
    'Зерна рая (грайнс оф парадайз)': 'gd gc bi bb nd', 'Хмель': 'bb bl gd gc bi te kk sy nd', 'Дубовая щепа': 'na bi bl sy nd',
    'Кофейное зерно': 'li am bi bl na sy nd kk', 'Какао-нибс': 'li bi am bl na sy co te nd', 'Чайный лист': 'gd gc li bi bl kk sy cd na nd', 'Соль': 'cd sy sh bb co te',
  };
  const CODE = {'джине (перегонка)': 'gd', 'джине (компаунд)': 'gc', 'вермуте': 've', 'биттере': 'bi', 'амаро': 'am', 'ликёре': 'li', 'абсенте и анисовых': 'ab',
    'глинтвейне': 'gl', 'пиве (кипячение)': 'bb', 'пиве (позднее добавление)': 'bl', 'чае (настой)': 'te', 'кофе (в помол)': 'co', 'сиропе': 'sy', 'шрабе': 'sh',
    'настойке на спирте': 'na', 'квасе и комбуче': 'kk', 'безалкогольном дистилляте': 'nd', 'кордиале': 'cd'};
  const sA = {}; for (const k of Object.keys(USE)) sA[k] = USE[k];
  sA['Лимонная цедра'] = [USE['Лимонная цедра'], 'Лимонен; масла живут в кожуре, а не в соке'];
  sA['Имбирь'] = [USE['Имбирь'], 'Гингерол в свежем, ещё более жгучий шогаол — в сушёном'];
  sA['Ваниль'] = [USE['Ваниль'], 'Ванилин: стручок орхидеи, единственной пряности из этого семейства'];
  sA['Лакрица'] = [USE['Лакрица'], 'Глицирризин слаще сахара в десятки раз'];
  sA['Горечавка'] = [USE['Горечавка'], 'Генциопикрин и амарогентин: чистая горечь без аромата'];
  const A = axis(g.A, sA);
  const sB = {}; for (const [k, v] of Object.entries(CODE)) sB[k] = v;
  sB['глинтвейне'] = ['gl', '60–70 °C и 20 минут: кипятить нельзя'];
  const REN = {'джине (перегонка)': 'дистиллированном джине', 'джине (компаунд)': 'компаундном джине', 'пиве (кипячение)': 'пиве при кипячении',
    'пиве (позднее добавление)': 'пиве при позднем охмелении', 'чае (настой)': 'чайном настое', 'кофе (в помол)': 'кофе прямо в помоле'};
  for (const [k, v] of Object.entries(REN)) sB[k] = [Array.isArray(sB[k]) ? sB[k][0] : sB[k], undefined, v];
  const B = axis(g.B, sB);
  const CL = {'Можжевельник|дистиллированном джине': 'Единственный обязательный ботаникал джина', 'Полынь горькая|вермуте': 'Само слово «вермут» — от немецкого Wermut, полынь',
    'Полынь горькая|абсенте и анисовых': 'Абсент: туйон в разрешённых дозах безвреден', 'Хинная кора|сиропе': 'Тоник-сироп — основа домашнего тоника',
    'Горечавка|ликёре': 'Сюз и сален — горечавковые аперитивы', 'Ревень|амаро': 'Апероль и рабарбаро Zucca', 'Артишок|амаро': 'Cynar',
    'Бузина|ликёре': 'St-Germain', 'Мята|ликёре': 'Крем де мант', 'Кофейное зерно|ликёре': 'Калуа и Tia Maria', 'Какао-нибс|ликёре': 'Крем де какао',
    'Анис|абсенте и анисовых': 'Узо, пастис, ракы', 'Померанец (горький апельсин)|ликёре': 'Кюрасао и трипл сек', 'Лимонная цедра|ликёре': 'Лимончелло',
    'Кориандр|пиве при кипячении': 'Витбир и гозе', 'Соль|пиве при кипячении': 'Гозе', 'Можжевельник|пиве при кипячении': 'Финский сахти',
    'Чайный лист|квасе и комбуче': 'Комбуча и есть сброженный чай', 'Огурец|компаундном джине': 'Огуречная эссенция после перегонки — приём Hendrick\'s',
    'Кардамон|кофе прямо в помоле': 'Арабский кофе', 'Корица|кофе прямо в помоле': 'Кафе де олья', 'Ваниль|ликёре': 'Galliano и Licor 43',
    'Лакрица|ликёре': 'Салмиакки', 'Корень дягиля|ликёре': 'Шартрез и бенедиктин', 'Хмель|пиве при кипячении': 'Горечь: альфа-кислоты изомеризуются в кипятке',
    'Хмель|пиве при позднем охмелении': 'Аромат: масла сохраняются', 'Соль|кофе прямо в помоле': 'Тайваньский и вьетнамский солёный кофе',
    'Имбирь|квасе и комбуче': 'Имбирное пиво на «имбирной закваске»', 'Мята|квасе и комбуче': 'Мятный квас'};
  return run({id: 'g_botan', emoji: g.emoji, title: 'Ботаникал × применение', color: g.color,
    about: 'Сгенерированная матрица по таблице применения: в v1 каждая из 40 специй стояла во всех 18 процессах — теперь только там, где её действительно используют',
    A, B, rule: (a, b) => { const k = [...b.t][0]; if (!a.t.has(k)) return null; return CL[a.n + '|' + b.n] || true; },
    name: (a, b) => `${a.n} в ${b.n}`, desc: (a, b, note) => [note, a.d, b.d]});
}

module.exports = () => [teaadd(), coffbrew(), teaway(), occ(), botan()];
