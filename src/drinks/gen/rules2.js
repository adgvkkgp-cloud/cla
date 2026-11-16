// Сорт × стиль вина, хмель × стиль пива, смузи — на тегах и с реальными примерами
const {axis, has, run, v1} = require('./engine');

function winestyle() {
  const g = v1('g_winestyle');
  const T = {
    'Шардоне': 'W oak sparkle tank lees age mlf', 'Совиньон блан': 'W acid arom oak botry late tank lees', 'Рислинг': 'W acid arom sparkle tank late botry ice age',
    'Шенен блан': 'W acid oak sparkle botry late lees age mlf', 'Семильон': 'W oak botry late age mlf', 'Гевюрцтраминер': 'W arom late botry ice',
    'Вионье': 'W arom oak late mlf', 'Мускат': 'W arom tank late botry sun fortsw solera passito', 'Пино гри': 'W arom late botry tank sparkle',
    'Грюнер вельтлинер': 'W acid sparkle lees ice', 'Ассиртико': 'W acid lees age amph', 'Альбариньо': 'W acid arom lees',
    'Верментино': 'W lees amph', 'Фурминт': 'W acid botry late sparkle age', 'Ркацители': 'W qvevri amph', 'Треббьяно': 'W neutral passito amph',
    'Глера': 'W tank arom', 'Педро Хименес': 'W sun fortsw solera', 'Паломино': 'W flor solera neutral',
    'Каберне совиньон': 'R tannic oak age', 'Мерло': 'R oak age', 'Каберне фран': 'R oak age sparkle carbo ice', 'Пино нуар': 'R light oak age sparkle carbo',
    'Гамэ': 'R light carbo', 'Сира': 'R oak age carbo fortsw', 'Гренаш': 'R oak age carbo fortsw amph', 'Мурведр': 'R tannic oak age',
    'Темпранильо': 'R oak age carbo amph fortsw', 'Санджовезе': 'R acid oak age', 'Неббиоло': 'R tannic acid oak age passito', 'Барбера': 'R acid oak',
    'Дольчетто': 'R light', 'Корвина': 'R passito oak age', 'Мальбек': 'R oak age', 'Карменер': 'R oak', 'Примитиво': 'R oak passito fortsw late',
    'Пинотаж': 'R oak', 'Турига насьональ': 'R tannic fortsw age oak', 'Саперави': 'R tannic acid qvevri amph age', 'Ксиномавро': 'R tannic acid age sparkle',
    'Блауфренкиш': 'R acid oak age sparkle', 'Аглианико': 'R tannic oak age', 'Танна': 'R tannic oak age', 'Зинфандель': 'R oak late fortsw',
    'Красностоп золотовский': 'R tannic oak age',
  };
  const fixA = {'Мускат': 'Семейство, чьё вино пахнет самим виноградом', 'Пинотаж': 'Кросс пино нуара и сенсо, ЮАР, 1925',
    'Гамэ': 'Особенно хорош в карбонической мацерации'};
  const sA = {}; for (const [k, v] of Object.entries(T)) sA[k] = fixA[k] ? [v, fixA[k]] : v;
  const A = axis(g.A, sA);
  const B = axis(g.B, {
    'сухое тихое без дуба': 'dry', 'сухое с выдержкой в дубе': 'oak', 'выдержка на осадке (sur lie)': 'lees', 'батонаж': 'batonnage', 'малолактика': 'mlf',
    'оранжевое (на мезге)': 'orange', 'квеври': 'qvevri', 'игристое традиционным методом': 'sparkle', 'игристое танковым методом': 'tank', 'пет-нат': 'petnat',
    'из подвяленного винограда': 'passito', 'солнечная сушка ягод': 'sun', 'креплёное сладкое': 'fortsw', 'креплёное сухое под флором': 'flor',
    'выдержка в системе солера': 'solera', 'выдержка в амфоре': 'amph', 'позднего сбора': 'late', 'ботритизированное': 'botry', 'розовое игристое': 'rosesp',
    'айсвайн': 'ice', 'без сульфитов': 'nosulf', 'длинная бутылочная выдержка': ['age', 'Третичные тона: кожа, трюфель, сухофрукты'],
    'розе прямым отжимом': 'rose', 'розе методом сенье': 'rose', 'полукарбоническая': 'carbo', 'карбоническая мацерация': 'carbo',
  });
  const R = {
    dry: a => !has(a, 'sun') && a.n !== 'Паломино', oak: a => has(a, 'oak'), lees: a => has(a, 'lees') || a.n === 'Шардоне',
    batonnage: a => ['Шардоне', 'Шенен блан', 'Семильон', 'Совиньон блан', 'Вионье'].includes(a.n), mlf: a => has(a, 'R') && !has(a, 'light') || has(a, 'mlf'),
    orange: a => has(a, 'W') && !has(a, 'sun', 'flor', 'tank') && a.n !== 'Педро Хименес', qvevri: a => has(a, 'qvevri'),
    sparkle: a => has(a, 'sparkle'), tank: a => has(a, 'tank'), petnat: a => (has(a, 'W') && !has(a, 'sun', 'flor')) || has(a, 'light') || a.n === 'Каберне фран',
    passito: a => has(a, 'passito'), sun: a => has(a, 'sun'), fortsw: a => has(a, 'fortsw'), flor: a => has(a, 'flor'), solera: a => has(a, 'solera'),
    amph: a => has(a, 'amph', 'qvevri'), late: a => has(a, 'late'), botry: a => has(a, 'botry'), rosesp: a => ['Пино нуар', 'Гренаш', 'Ксиномавро', 'Каберне фран', 'Блауфренкиш', 'Глера'].includes(a.n),
    ice: a => has(a, 'ice'), nosulf: a => !has(a, 'sun', 'flor', 'fortsw'), age: a => has(a, 'age'),
    rose: a => has(a, 'R') && !['Танна', 'Аглианико', 'Каберне совиньон', 'Красностоп золотовский'].includes(a.n),
    carbo: a => has(a, 'carbo'),
  };
  const CL = {
    'Шардоне|игристое традиционным методом': 'Блан де блан Шампани', 'Пино нуар|игристое традиционным методом': 'Блан де нуар', 'Шенен блан|ботритизированное': 'Вувре моэлле, Котто-дю-Лайон',
    'Семильон|ботритизированное': 'Сотерн', 'Рислинг|ботритизированное': 'Беренауслезе и ТБА', 'Фурминт|ботритизированное': 'Токай асу', 'Рислинг|айсвайн': 'Айсвайн Мозеля и Ниагары',
    'Каберне фран|айсвайн': 'Красный айсвайн Онтарио', 'Глера|игристое танковым методом': 'Просекко', 'Мускат|игристое танковым методом': 'Асти и москато д\'Асти',
    'Корвина|из подвяленного винограда': 'Амароне и речото', 'Неббиоло|из подвяленного винограда': 'Сфорцато ди Вальтеллина', 'Треббьяно|из подвяленного винограда': 'Вин санто',
    'Педро Хименес|солнечная сушка ягод': 'PX Монтильи-Морилес и Хереса', 'Мускат|солнечная сушка ягод': 'Москатель Малаги', 'Турига насьональ|креплёное сладкое': 'Портвейн',
    'Гренаш|креплёное сладкое': 'Баньюльс и Мори', 'Мускат|креплёное сладкое': 'Мускат Бом-де-Вениз', 'Паломино|креплёное сухое под флором': 'Фино и мансанилья',
    'Паломино|выдержка в системе солера': 'Херес', 'Ркацители|квеври': 'Кахетинское янтарное', 'Саперави|квеври': 'Красное вино квеври Кахетии', 'Гамэ|карбоническая мацерация': 'Божоле нуво',
    'Гренаш|розе прямым отжимом': 'Розе Прованса', 'Зинфандель|розе прямым отжимом': 'Уайт зинфандель', 'Мурведр|розе прямым отжимом': 'Бандоль розе',
    'Гевюрцтраминер|позднего сбора': 'Вандаж тардив Эльзаса', 'Шардоне|сухое с выдержкой в дубе': 'Мёрсо и калифорнийское шардоне', 'Совиньон блан|сухое с выдержкой в дубе': 'Фюме блан, Пессак-Леоньян',
    'Ассиртико|сухое тихое без дуба': 'Санторини', 'Рислинг|длинная бутылочная выдержка': 'Сухой рислинг Клэра и Мозеля: петроль с возрастом', 'Темпранильо|сухое с выдержкой в дубе': 'Риоха гран резерва',
    'Неббиоло|длинная бутылочная выдержка': 'Бароло', 'Санджовезе|длинная бутылочная выдержка': 'Брунелло', 'Каберне совиньон|длинная бутылочная выдержка': 'Медок',
    'Сира|длинная бутылочная выдержка': 'Эрмитаж', 'Пино нуар|длинная бутылочная выдержка': 'Бургундия гран крю', 'Мальбек|длинная бутылочная выдержка': 'Каор',
    'Танна|длинная бутылочная выдержка': 'Мадиран', 'Аглианико|длинная бутылочная выдержка': 'Таурази', 'Ксиномавро|длинная бутылочная выдержка': 'Науса',
    'Шардоне|батонаж': 'Классика белой Бургундии', 'Грюнер вельтлинер|айсвайн': 'Австрийский айсвайн', 'Пино нуар|розовое игристое': 'Розовое шампанское',
    'Блауфренкиш|сухое с выдержкой в дубе': 'Бургенланд', 'Красностоп золотовский|сухое с выдержкой в дубе': 'Донские красные', 'Ксиномавро|игристое традиционным методом': 'Игристое розовое Аминдео',
  };
  return run({id: 'g_winestyle', emoji: g.emoji, title: 'Сорт винограда × стиль вина', color: g.color,
    about: 'Сгенерированная матрица по правилам: что из какого сорта делают на самом деле; для известных пар названо вино или регион',
    A, B, rule: (a, b) => { const k = [...b.t][0]; if (!R[k](a)) return null; return CL[a.n + '|' + b.n] || true; },
    name: (a, b) => `${a.n} → ${b.n}`, desc: (a, b, note) => [note, b.d, a.d]});
}

function hopstyle() {
  const g = v1('g_hopstyle');
  const T = {
    'Saaz': 'noble cz', 'Hallertauer Mittelfrüh': 'noble de', 'Tettnanger': 'noble de', 'Spalt': 'noble de', 'Styrian Goldings': 'eng slo',
    'Fuggle': 'eng', 'East Kent Goldings': 'eng', 'Challenger': 'eng', 'Target': 'eng bitter', 'Bramling Cross': 'eng fruit',
    'Cascade': 'us citrus classic', 'Centennial': 'us citrus bitter', 'Amarillo': 'us citrus', 'Citra': 'us trop', 'Mosaic': 'us trop',
    'Chinook': 'us pine bitter', 'Simcoe': 'us pine trop', 'Columbus': 'us dank bitter', 'Magnum': 'de bitter', 'Herkules': 'de bitter', 'Warrior': 'us bitter',
    'Galaxy': 'au trop', 'Nelson Sauvin': 'nz trop wine', 'Motueka': 'nz citrus', 'Riwaka': 'nz trop', 'Nectaron': 'nz trop', 'Idaho 7': 'us trop pine',
    'Sabro': 'us trop', 'Strata': 'us trop dank', 'El Dorado': 'us trop', 'Sorachi Ace': 'jp odd', 'Hüll Melon': 'de mod', 'Saphir': 'de noble-ish', 'Perle': 'de',
  };
  const sA = {}; for (const [k, v] of Object.entries(T)) sA[k] = v;
  sA['Sorachi Ace'] = [T['Sorachi Ace'], 'Лемонграсс и укроп: японская селекция (Sapporo, 1984), прославилась в США'];
  sA['Hüll Melon'] = [T['Hüll Melon'], 'Дыня и клубника: немецкая селекция 2012 года'];
  sA['Citra'] = [T['Citra'], 'Маракуйя и манго; самый выращиваемый ароматный сорт США'];
  const A = axis(g.A, sA);
  const sB = {}; for (const x of g.B) sB[x.n] = x.n.replace(/[ -]/g, '_');
  const B = axis(g.B, sB);
  const AROMA = a => has(a, 'trop', 'citrus', 'pine') && !has(a, 'eng', 'noble');
  const R = {
    'чешский_пилс': a => a.n === 'Saaz', 'немецкий_пилс': a => has(a, 'de', 'noble') && !has(a, 'mod') && a.n !== 'Saaz' || a.n === 'Saaz',
    'хеллес_и_мэрцен': a => has(a, 'de', 'noble') && !has(a, 'mod'), 'кёльш': a => ['Spalt', 'Hallertauer Mittelfrüh', 'Tettnanger', 'Perle'].includes(a.n),
    'альтбир': a => ['Spalt', 'Perle', 'Magnum', 'Tettnanger'].includes(a.n), 'портер': a => has(a, 'eng') || ['Magnum', 'Cascade'].includes(a.n),
    'хмелевой_лагер': a => AROMA(a) || has(a, 'noble') || a.n === 'Hüll Melon', 'витбир': a => ['Saaz', 'Hallertauer Mittelfrüh', 'Styrian Goldings', 'Tettnanger'].includes(a.n),
    'хефевайцен': a => ['Hallertauer Mittelfrüh', 'Tettnanger', 'Perle', 'Magnum'].includes(a.n), 'сезон': a => ['Styrian Goldings', 'Saaz', 'East Kent Goldings', 'Sorachi Ace', 'Motueka', 'Nelson Sauvin'].includes(a.n),
    'бельгийский_триппель': a => ['Saaz', 'Styrian Goldings', 'Hallertauer Mittelfrüh', 'Magnum'].includes(a.n), 'берлинер_вайссе': a => ['Hallertauer Mittelfrüh', 'Perle', 'Magnum'].includes(a.n),
    'фруктовый_сауэр': a => ['Magnum', 'Hallertauer Mittelfrüh', 'Perle'].includes(a.n), 'гозе': a => ['Hallertauer Mittelfrüh', 'Perle', 'Magnum'].includes(a.n),
    'английский_биттер': a => has(a, 'eng'), 'ESB_и_олд_эль': a => has(a, 'eng'), 'английский_IPA': a => has(a, 'eng') && a.n !== 'Styrian Goldings',
    'сухой_стаут': a => ['East Kent Goldings', 'Fuggle', 'Challenger', 'Target', 'Magnum'].includes(a.n), 'имперский_стаут': a => has(a, 'bitter') || ['East Kent Goldings', 'Fuggle', 'Cascade', 'Centennial'].includes(a.n),
    'барливайн': a => has(a, 'eng') || ['Cascade', 'Centennial', 'Chinook', 'Simcoe', 'Columbus'].includes(a.n),
    'американский_IPA': a => (has(a, 'us', 'nz', 'au') && !has(a, 'bitter')) || ['Centennial', 'Chinook', 'Columbus'].includes(a.n),
    'вест_кост_IPA': a => has(a, 'us') && !has(a, 'trop') || ['Simcoe', 'Citra', 'Mosaic', 'Nelson Sauvin'].includes(a.n), 'колд_IPA': a => (has(a, 'us', 'nz') && !has(a, 'bitter')) || a.n === 'Saaz',
    'американский_пейл_эль': a => has(a, 'us', 'nz', 'au') && !has(a, 'bitter', 'dank'), 'NEIPA': a => has(a, 'trop') || ['Amarillo', 'Motueka', 'Idaho 7'].includes(a.n),
    'двойной_IPA': a => has(a, 'us', 'nz', 'au') && a.n !== 'Warrior', 'сессионный_IPA': a => AROMA(a) && !has(a, 'bitter'),
    'безалкогольное_хмелевое': a => AROMA(a) && !has(a, 'bitter', 'dank'), 'хмелевая_вода': a => AROMA(a) && !has(a, 'bitter') || a.n === 'Sorachi Ace',
    'брют_IPA': a => ['Nelson Sauvin', 'Citra', 'Mosaic', 'Motueka', 'Galaxy', 'Hüll Melon'].includes(a.n),
  };
  const CL = {'Saaz|чешский пилс': 'Пилснер Урквелл и вся чешская классика', 'Hallertauer Mittelfrüh|хеллес и мэрцен': 'Мюнхенская классика', 'Cascade|американский пейл-эль': 'Сьерра-Невада Пейл Эль (1980)',
    'East Kent Goldings|английский IPA': 'Историческая английская основа', 'Fuggle|английский биттер': 'Землистая подпись британского паба', 'Sorachi Ace|сезон': 'Brooklyn Sorachi Ace',
    'Styrian Goldings|сезон': 'Saison Dupont', 'Motueka|хмелевой лагер': 'Новозеландский пилснер', 'Simcoe|вест-кост IPA': 'Смолистая подпись Западного побережья',
    'Citra|NEIPA': 'Основа большинства мутных IPA', 'Nelson Sauvin|брют IPA': 'Винный крыжовник при нулевом сахаре', 'Columbus|двойной IPA': 'Горькая база «двойных»',
    'Saaz|колд IPA': 'Благородная пряность поверх лагерной сухости', 'Galaxy|NEIPA': 'Австралийская маракуйя'};
  return run({id: 'g_hopstyle', emoji: g.emoji, title: 'Хмель × стиль пива', color: g.color,
    about: 'Сгенерированная матрица по правилам: благородные сорта — в лагеры, английские — в эли, тропические — в мутные IPA; для известных пар назван эталон',
    A, B, rule: (a, b) => { const k = [...b.t][0]; if (!R[k] || !R[k](a)) return null; return CL[a.n + '|' + b.n] || true; },
    name: (a, b) => `${a.n} в стиле: ${b.n}`, desc: (a, b, note) => [note, b.d, a.d]});
}

function smoothie() {
  const g = v1('g_smoothie');
  const A = axis([], {}, [
    ['Банан', 'Крахмал и пектин: главный загуститель без молочного жира', 'sweet starch'],
    ['Авокадо', 'Жир даёт кремовость без сливок, сладости нет', 'fat neutral'],
    ['Манго', 'Плотное пюре и тропическая сладость', 'sweet trop'],
    ['Хурма', 'Спелая — как джем; недозрелая вяжет танином', 'sweet'],
    ['Печёная тыква', 'Сладость выше сырой, тело плотное', 'veg sweet'],
    ['Варёная свёкла', 'Земля и сахар; цвет перекрашивает всё', 'veg earthy'],
    ['Овсянка запаренная', 'Бета-глюканы загущают и делают смузи завтраком', 'grain'],
    ['Замороженный банан', 'Холод и густота без льда', 'sweet starch frozen'],
  ]);
  const B = axis(g.B, {
    'клубника': 'berry mild', 'малина': 'berry sour', 'черника': 'berry mild', 'ежевика': 'berry tannic', 'вишня': 'stone sour', 'облепиха': 'sour strong oily',
    'клюква': 'sour strong', 'ананас': 'trop protease', 'маракуйя': 'trop sour', 'киви': 'protease sour', 'апельсин': 'citrus juice', 'лайм': 'citrus sour',
    'яблоко зелёное': 'pome sour', 'персик': 'stone mild', 'гранат': 'tannic sour',
  });
  const liquid = (a, b) =>
    has(b, 'protease') ? 'Лучше на кокосовой воде или соке: молочный белок с этим ферментом горчит через час' :
    has(b, 'strong') ? 'Лучше на воде или яблочном соке и не больше четверти объёма: в молоке такая кислота свернёт белок' :
    has(a, 'veg') ? 'Лучше на апельсиновом или яблочном соке: кислота оживляет землистую сладость' :
    has(a, 'fat') ? 'Лучше на миндальном или овсяном молоке: жир авокадо любит нейтральную основу' :
    has(a, 'grain') ? 'Лучше на молоке или кефире: овсянка требует жидкости больше, чем кажется' :
    has(b, 'citrus') ? 'Лучше на воде или кокосовой воде: цитрус уже даёт и кислоту, и жидкость' :
    'Лучше на йогурте или кефире: белок и кислота дают тело';
  const OK = (a, b) => !(has(a, 'veg') && has(b, 'trop')) && !(a.n === 'Варёная свёкла' && ['персик', 'киви', 'клубника'].includes(b.n)) &&
    !(has(a, 'fat') && has(b, 'strong')) && !(has(a, 'grain') && has(b, 'trop', 'citrus') && b.n !== 'апельсин');
  return run({id: 'g_smoothie', emoji: g.emoji, title: 'Смузи: тело × кислота × основа', color: g.color,
    about: 'Сгенерированная матрица: чем загустить, чем оживить и на чём развести; основа выбирается правилом (белок, фермент, кислота), а не по кругу, как в v1',
    A, B, rule: (a, b) => OK(a, b) ? liquid(a, b) : null,
    name: (a, b) => `Смузи: ${a.n.toLowerCase()} + ${b.n}`, desc: (a, b, note) => [a.d, b.d, note]});
}

module.exports = () => [winestyle(), hopstyle(), smoothie()];
