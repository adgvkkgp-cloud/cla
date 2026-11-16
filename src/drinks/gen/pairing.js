// Еда × напиток: правила взаимодействия вкусов. Каждая пара получает объяснение именно для неё —
// в v1 описание пары было склейкой двух общих фраз («жир...; кислота...»), которые ничего не объясняли.
const {axis, has, run, v1} = require('./engine');

// правила: [условие(еда, напиток), баллы, объяснение]
const RULES = [
  [(f, d) => has(f, 'shell') && has(d, 'mineral', 'salty'), 3, 'йод и соль моря ищут минеральное и солёное в бокале'],
  [(f, d) => has(f, 'salt') && has(d, 'sweet'), 3, 'солёное со сладким — классический контраст: соль приглушает сахар, сахар смягчает соль'],
  [(f, d) => has(f, 'red') && has(d, 'tannic'), 3, 'белок и жир мяса связывают танин: вино мягчеет, мясо кажется сочнее'],
  [(f, d) => has(f, 'sweet') && has(d, 'sweet'), 3, 'напиток должен быть не менее сладким, чем десерт, — иначе покажется кислым'],
  [(f, d) => has(f, 'spicy') && has(d, 'offdry', 'lowalc'), 3, 'лёгкая сладость и низкий спирт гасят остроту'],
  [(f, d) => has(f, 'fat') && has(d, 'acid'), 2, 'кислота режет жир и освежает нёбо'],
  [(f, d) => has(f, 'fat') && has(d, 'bubbles'), 1, 'пузырьки смывают жир с нёба'],
  [(f, d) => has(f, 'salt') && has(d, 'bubbles', 'acid') && !has(f, 'sweet'), 2, 'соль и кислота освежают друг друга, как лимон к рыбе'],
  [(f, d) => has(f, 'acid') && has(d, 'acid'), 2, 'кислоте блюда нужна кислота в бокале, иначе напиток покажется плоским'],
  [(f, d) => has(f, 'smoke') && has(d, 'smoke', 'oak'), 2, 'дым к дыму и обжарке — подобное к подобному'],
  [(f, d) => has(f, 'umami') && has(d, 'umami', 'salty', 'oxid'), 2, 'умами к умами: херес, сакэ, выдержанный чай этим и живут'],
  [(f, d) => has(f, 'earthy') && has(d, 'earthy'), 2, 'земля к земле: грибы и трюфель любят подлесок пино и выдержанных вин'],
  [(f, d) => has(f, 'herbal') && has(d, 'herbal'), 2, 'зелёное к зелёному: травянистое блюдо — к травянистому напитку'],
  [(f, d) => has(f, 'caramel') && has(d, 'caramel', 'oxid'), 2, 'карамель к карамели: печёное, орех и жжёный сахар звучат в унисон'],
  [(f, d) => has(f, 'bitter') && has(d, 'sweet', 'body') && !has(d, 'tannic'), 2, 'горечи какао нужен в ответ сахар или плотность'],
  [(f, d) => has(f, 'delicate') && has(d, 'light'), 2, 'лёгкое к лёгкому: деликатное блюдо не перекрыть'],
  [(f, d) => has(f, 'fried') && has(d, 'bubbles', 'acid', 'hoppy'), 2, 'газ, горечь и кислота смывают кляр'],
  [(f, d) => has(f, 'cream') && has(d, 'oak', 'creamy'), 2, 'сливочное к сливочному: масляный тон напитка подхватывает соус'],
  [(f, d) => has(f, 'fruit') && has(d, 'sweet') && has(d, 'acid'), 2, 'кислотный каркас сладкого вина держит фруктовую кислоту десерта'],
  [(f, d) => has(f, 'cold') && has(d, 'sweet') && has(d, 'body'), 2, 'вязкий сладкий напиток прямо на мороженое — испанский десерт'],
  [(f, d) => has(f, 'aromatic') && has(d, 'arom'), 2, 'ароматика к ароматике: пряное блюдо и цветочный сорт'],
  [(f, d) => has(f, 'fat', 'salt') && has(d, 'icecold'), 2, 'ледяной нейтральный спирт как контраст к жирному и солёному'],
  [(f, d) => f.reg && d.reg && [...f.reg].some(r => d.reg.has(r)), 2, 'местная пара: одна кухня и один погреб'],
  // запреты и минусы
  [(f, d) => has(f, 'fish', 'shell') && has(d, 'tannic'), -9, ''],
  [(f, d) => has(f, 'spicy') && has(d, 'strong'), -9, ''],
  [(f, d) => has(f, 'sweet') && !has(d, 'sweet') && has(d, 'acid', 'tannic', 'dry'), -9, ''],
  [(f, d) => has(f, 'spicy') && has(d, 'tannic', 'hoppy'), -3, ''],
  [(f, d) => has(f, 'umami') && has(d, 'tannic'), -2, ''],
  [(f, d) => has(f, 'acid') && has(d, 'oak') && !has(d, 'acid'), -2, ''],
  [(f, d) => has(f, 'delicate') && has(d, 'body', 'strong', 'smoke'), -3, ''],
  [(f, d) => has(f, 'cold') && !(has(d, 'sweet') && has(d, 'body')), -9, ''],
  [(f, d) => has(f, 'red') && has(d, 'light') && !has(d, 'acid'), -1, ''],
  [(f, d) => has(f, 'pungent') && !has(d, 'sweet'), -3, ''],
  [(f, d) => has(f, 'cream') && has(d, 'tannic'), -3, ''],
];
function score(f, d) {
  let s = 0, best = [], veto = false;
  for (const [cond, pts, why] of RULES) if (cond(f, d)) { s += pts; if (pts <= -9) veto = true; if (pts > 0) best.push([pts, why]); }
  if (veto) return null;
  best.sort((a, b) => b[0] - a[0]);
  return {s, why: best.slice(0, 2).map(x => x[1])};
}
const reg = s => new Set(s.split(/\s+/).filter(Boolean));

function wineFood() {
  const g = v1('g_pair');
  const F = axis(g.A, {
    'Устрицы': 'shell salt delicate', 'Икра': 'salt fat shell', 'Гребешки': 'delicate shell', 'Креветки на гриле': 'shell smoke delicate',
    'Крабы и лобстер': 'shell fat cream', 'Мидии в белом вине': 'shell salt acid', 'Суши и сашими': 'fish delicate umami acid', 'Копчёный лосось': 'fish fat smoke salt',
    'Белая рыба на пару': 'fish delicate', 'Жареная рыба в кляре': 'fish fried fat', 'Селёдка и солёная рыба': 'fish salt fat', 'Козий сыр': 'acid salt',
    'Твёрдый выдержанный сыр': 'salt umami fat', 'Голубой сыр': 'salt fat pungent', 'Мягкий сыр с белой плесенью': 'fat cream earthy', 'Салат с уксусной заправкой': 'acid herbal',
    'Спаржа': 'herbal delicate', 'Грибы жареные': 'umami earthy', 'Трюфель': 'earthy umami', 'Ризотто с пармезаном': 'cream umami fat',
    'Паста с томатным соусом': 'acid umami', 'Паста карбонара': 'fat salt cream', 'Пицца маргарита': 'acid fat', 'Стейк рибай': 'red fat smoke',
    'Ягнёнок с травами': 'red fat herbal', 'Утиная грудка': 'red fat', 'Свинина жареная': 'fat caramel', 'Курица гриль': 'delicate smoke',
    'Барбекю со сладким соусом': 'smoke sweetish fat', 'Колбасы и сало': 'fat salt', 'Хамон и прошутто': 'salt fat umami', 'Паштет и террин': 'fat',
    'Борщ': 'acid earthy', 'Пельмени со сметаной': 'fat cream', 'Плов': 'fat aromatic', 'Шашлык': 'red smoke fat acid', 'Хачапури': 'fat salt cream',
    'Острая азиатская кухня': 'spicy aromatic', 'Карри': 'spicy aromatic fat', 'Дим-сам': 'delicate umami', 'Утка по-пекински': 'fat caramel sweetish',
    'Том-ям': 'spicy acid aromatic', 'Кимчи и ферментированное': 'acid spicy salt umami', 'Тапас и оливки': 'salt bitterish', 'Тёмный шоколад': 'bitter sweet',
    'Молочный шоколад и десерты со сливками': 'sweet cream', 'Фруктовый тарт': 'sweet fruit acid', 'Мороженое': 'cold sweet', 'Яблочный пирог': 'sweet caramel fruit',
    'Сырная тарелка': 'salt fat umami',
  });
  const R = {'Устрицы': 'fr', 'Мидии в белом вине': 'fr be', 'Козий сыр': 'loire', 'Ризотто с пармезаном': 'it', 'Паста с томатным соусом': 'it', 'Паста карбонара': 'it',
    'Пицца маргарита': 'it', 'Хамон и прошутто': 'es it', 'Тапас и оливки': 'es', 'Борщ': 'ru', 'Пельмени со сметаной': 'ru', 'Хачапури': 'ge', 'Шашлык': 'ge ru',
    'Селёдка и солёная рыба': 'ru nord', 'Суши и сашими': 'jp', 'Дим-сам': 'cn', 'Утка по-пекински': 'cn', 'Ягнёнок с травами': 'fr es', 'Мягкий сыр с белой плесенью': 'fr',
    'Яблочный пирог': 'fr nord', 'Колбасы и сало': 'de ru'};
  for (const f of F) f.reg = reg(R[f.n] || '');
  const D = axis(g.B, {
    'Брют шампанское': 'bubbles acid mineral', 'Просекко': 'bubbles light fruity', 'Кава брют': 'bubbles acid', 'Ламбруско сухое': 'bubbles acid fruity',
    'Шабли': 'acid mineral light', 'Мюскадэ sur lie': 'acid mineral light salty', 'Альбариньо': 'acid mineral light', 'Совиньон блан': 'acid herbal light',
    'Шардоне в дубе': 'oak body creamy', 'Рислинг сухой': 'acid mineral arom', 'Грюнер вельтлинер': 'acid herbal', 'Портвейн тони': 'sweet oxid caramel body',
    'Херес фино': 'salty dry umami light', 'Херес олоросо': 'oxid caramel body dry', 'Мадера сершиал': 'acid oxid caramel', 'Пилснер': 'bubbles hoppy light',
    'Хеллес': 'bubbles light', 'Витбир': 'bubbles light herbal', 'Хефевайцен': 'bubbles light', 'IPA': 'bubbles hoppy',
    'Зелёный чай сенча': 'tea umami herbal light lowalc', 'Улун обжаренный': 'tea caramel lowalc', 'Пуэр шу': 'tea earthy lowalc', 'Чёрный чай без сахара': 'tea tannic lowalc',
    'Комбуча': 'acid bubbles lowalc', 'Тоник с цитрусом': 'bubbles lowalc hoppy', 'Томатный сок со специями': 'umami salty lowalc', 'Водка ледяная': 'strong icecold',
    'Односолодовый торфяной': 'strong smoke', 'Бурбон': 'strong oak caramel', 'Мескаль': 'strong smoke', 'Граппа': 'strong dry', 'Кальвадос': 'strong caramel',
    'Рислинг полусухой': 'offdry acid arom lowalc', 'Гевюрцтраминер': 'arom offdry body', 'Оранжевое вино': 'tannic acid', 'Прованское розе': 'acid light dry',
    'Каберне совиньон': 'tannic body oak', 'Бароло': 'tannic acid earthy', 'Шираз': 'tannic body oak', 'Мальбек': 'tannic body', 'Амароне': 'body sweetish oak',
    'Сотерн': 'sweet acid body', 'Токай асу': 'sweet acid', 'Портер': 'caramel body', 'Имперский стаут': 'sweet body caramel strongish', 'Пино нуар': 'light acid earthy',
    'Божоле крю': 'light acid fruity', 'Кьянти Классико': 'acid tannic', 'Гёз': 'acid bubbles', 'Берлинер вайссе': 'acid light bubbles lowalc', 'Сидр сухой': 'acid bubbles light',
  });
  const DR = {'Брют шампанское': 'fr', 'Мюскадэ sur lie': 'fr loire', 'Шабли': 'fr', 'Херес фино': 'es', 'Херес олоросо': 'es', 'Кава брют': 'es', 'Ламбруско сухое': 'it',
    'Кьянти Классико': 'it', 'Бароло': 'it', 'Совиньон блан': 'loire', 'Водка ледяная': 'ru nord', 'Сидр сухой': 'fr nord', 'Кальвадос': 'fr', 'Зелёный чай сенча': 'jp',
    'Улун обжаренный': 'cn', 'Пуэр шу': 'cn', 'Гёз': 'be', 'Оранжевое вино': 'ge', 'Портвейн тони': 'pt', 'Хефевайцен': 'de', 'Пилснер': 'de'};
  for (const d of D) d.reg = reg(DR[d.n] || '');
  // пиво уходит в отдельную категорию «Пивной стиль × блюдо»
  const BEER = new Set(['Пилснер', 'Хеллес', 'Витбир', 'Хефевайцен', 'IPA', 'Портер', 'Имперский стаут', 'Гёз', 'Берлинер вайссе']);
  return run({id: 'g_pair', emoji: g.emoji, title: 'Еда × вино, чай и крепкое: паринг', color: g.color,
    about: 'Сгенерированная матрица по правилам взаимодействия вкусов: жир и кислота, соль и сладость, танин и белок, острота и спирт; у каждой пары — своё объяснение',
    A: F, B: D.filter(d => !BEER.has(d.n)),
    rule: (f, d) => { const r = score(f, d); if (!r || r.s < 3) return null; return r.why.join('; '); },
    name: (f, d) => `${f.n} + ${d.n}`, desc: (f, d, note) => [note, f.d + '; ' + d.d]});
}

function beerFood() {
  const g = v1('g_beerfood');
  const B = axis(g.A, {
    'Чешский пилс': 'bubbles hoppy light malt cz', 'Немецкий пилс': 'bubbles hoppy light de', 'Хеллес': 'bubbles light malt de', 'Кёльш': 'bubbles light de',
    'Мексиканский светлый лагер': 'bubbles light mex', 'Витбир': 'bubbles light herbal be', 'Хефевайцен': 'bubbles light wheat de', 'Пшеничный американский': 'bubbles light',
    'Пейл-эль': 'hoppy malt', 'Американский IPA': 'hoppy bitter', 'NEIPA': 'fruity hoppysoft', 'Двойной IPA': 'hoppy bitter strong',
    'Английский биттер': 'hoppy malt light uk', 'ESB': 'malt caramel hoppy uk', 'Мэрцен и Октоберфест': 'malt caramel de', 'Бок и доппельбок': 'malt caramel body sweetish de',
    'Портер': 'roast caramel body uk', 'Сухой стаут': 'roast dry ie', 'Милк-стаут': 'roast sweet body', 'Имперский стаут': 'roast sweet body strong',
    'Барливайн': 'caramel sweet body strong', 'Раухбир': 'smoke malt de', 'Бельгийский дюббель': 'caramel fruity body be', 'Бельгийский триппель': 'dry strong spicyyeast be',
    'Сезон': 'dry bubbles spicyyeast herbal be', 'Ламбик и гёз': 'acid bubbles be', 'Крик и фрамбуаз': 'acid fruity sweetish be', 'Берлинер вайссе': 'acid light de',
    'Гозе': 'acid salty de', 'Фруктовый сауэр': 'acid fruity sweetish', 'Фландрский красный': 'acid oak fruity be', 'Безалкогольное пиво': 'light lowalc',
  });
  const F = axis(g.B, {
    'устрицы и сырые морепродукты': ['shell salt delicate', 'Йод, соль и минеральность; жира нет'], 'жареная рыба и фиш-энд-чипс': ['fried fat fish uk', 'Кляр, жир и соль'], 'суши и сашими': ['delicate fish umami', 'Рис с уксусом, сырая рыба, умами соевого соуса'],
    'мидии и белое мясо птицы': ['delicate shell be', 'Сладковатое нежное мясо, сливочные и винные соусы'], 'острая азиатская кухня': ['spicy aromatic', 'Капсаицин, сахар, рыбный соус и травы'], 'бургер и жареное мясо': ['fat red smoke', 'Жир, обжаренная корочка, соль'],
    'колбаски и квашеная капуста': ['fat salt acid de', 'Жир, соль и молочная кислота капусты'], 'паста с томатом': ['acid umami', 'Кислота томата и умами'], 'пицца': ['fat acid', 'Тесто, томатная кислота, тянущийся сыр'], 'жареная курица': ['fried fat', 'Хрустящая панировка и сочное мясо'],
    'тако и мексиканская кухня': ['spicy acid mex', 'Лайм, кинза, кукуруза, чили'], 'копчёности и ветчина': ['smoke salt fat', 'Дым, соль и жир'], 'солёные снеки и чипсы': ['salt fat fried', 'Соль и жир, больше ничего'], 'сельдь и солёная рыба': ['salt fat fish', 'Соль и рыбий жир на пределе'],
    'борщ и щи': ['acid earthy', 'Кислота, свёкла или капуста, сметана'], 'плов': ['fat aromatic', 'Жирный рис, морковь, зира'], 'салат с козьим сыром': ['acid herbal', 'Кислота заправки и сыра, травы'], 'карри и индийская кухня': ['spicy aromatic fat', 'Специи, жир, сладость и жар'],
    'сыры мягкие с белой плесенью': ['fat cream', 'Сливочность и грибной тон'], 'ягодный десерт': ['sweet fruit acid', 'Сахар и ягодная кислота'], 'хумус и меззе': ['herbal acid', 'Нут, тахини, лимон, травы'], 'барбекю и рёбра': ['smoke sweetish fat caramel', 'Дым, сладкий соус, жир'],
    'сыры твёрдые выдержанные': ['salt umami fat', 'Соль, умами, кристаллы тирозина'], 'шашлык': ['red smoke fat', 'Дым углей, жир, кислый маринад'], 'стейк': ['red fat smoke', 'Обжаренная корка и жир'], 'свинина с яблоками': ['fat caramel fruit', 'Жир и печёный фрукт'],
    'суп-гуляш и рагу': ['fat umami red', 'Паприка, тушёное мясо, плотный соус'], 'грибы': ['umami earthy', 'Умами и земля'], 'яблочный пирог': ['sweet caramel fruit', 'Печёное яблоко, корица, карамель'], 'орехи и сухофрукты': ['caramel sweetish', 'Жир орехов и концентрированная сладость'],
    'веганская кухня на бобовых': ['earthy umami', 'Землистость, плотность, умами'], 'шоколадный десерт': ['sweet bitter', 'Горечь и жир какао, сахар'], 'ванильное мороженое': ['cold sweet', 'Холод, сливки и ваниль'], 'сыры голубые': ['salt fat', 'Соль и плесневая острота'], 'утка и дичь': ['red fat', 'Плотное тёмное мясо с жиром'],
  });
  const BR = [
    [(d, f) => has(d, 'roast') && has(f, 'bitter', 'sweet') && !has(f, 'fruit'), 3, 'обжарка солода и какао совпадают'],
    [(d, f) => has(d, 'roast') && has(d, 'dry') && has(f, 'shell'), 3, 'сухой стаут и устрицы — дублинская классика: жжёная горечь и йод'],
    [(d, f) => has(d, 'malt', 'caramel') && has(f, 'caramel', 'smoke', 'red'), 2, 'солод дружит с карамелизацией и обжаркой'],
    [(d, f) => has(d, 'hoppy', 'bitter', 'bubbles') && has(f, 'fat', 'fried'), 2, 'горечь и газ режут жир'],
    [(d, f) => has(d, 'hoppy', 'bitter', 'bubbles') && has(f, 'fried'), 2, 'газ и горечь смывают с нёба жир жарки'],
    [(d, f) => has(d, 'hoppy', 'bitter') && has(f, 'salt') && has(f, 'fat'), 2, 'горечь хмеля уравновешивает соль и жир'],
    [(d, f) => has(d, 'fruity') && !has(d, 'hoppy', 'bitter') && has(f, 'spicy', 'aromatic'), 2, 'фруктовость и низкая горечь смягчают специи'],
    [(d, f) => has(d, 'acid') && has(f, 'fat', 'cream'), 2, 'кислое пиво ведёт себя как вино: режет жир'],
    [(d, f) => has(d, 'smoke') && has(f, 'smoke'), 2, 'дым к дыму'],
    [(d, f) => has(d, 'light') && has(f, 'delicate'), 2, 'лёгкое к лёгкому'],
    [(d, f) => has(d, 'salty', 'acid') && has(f, 'shell', 'salt'), 2, 'соль и кислота пива к морскому и солёному'],
    [(d, f) => has(d, 'sweet', 'fruity') && has(f, 'sweet'), 2, 'сладкое и фруктовое пиво держит десерт'],
    [(d, f) => has(d, 'light', 'malt') && has(f, 'spicy') && !has(d, 'bitter', 'strong'), 2, 'мягкий солод и низкая горечь гасят остроту'],
    [(d, f) => has(d, 'herbal', 'spicyyeast') && has(f, 'herbal', 'aromatic'), 2, 'пряные дрожжи и травы к пряному блюду'],
    [(d, f) => has(d, 'body', 'strong') && has(f, 'red', 'umami') && !has(f, 'delicate'), 2, 'плотное пиво к плотному блюду'],
    [(d, f) => has(d, 'sweet', 'body') && has(f, 'cold'), 3, 'пиво прямо в креманку: битер-флоат и стаут-флоат'],
    [(d, f) => has(d, 'acid') && has(f, 'acid'), 2, 'кислота к кислоте, как вино к уксусной заправке'],
    [(d, f) => has(d, 'roast', 'body', 'sweet') && has(f, 'salt') && has(f, 'fat') && !has(f, 'fish'), 2, 'солёное с плотным и сладковатым — контраст'],
    [(d, f) => ['de', 'uk', 'be', 'mex', 'ie', 'cz'].some(r => has(d, r) && has(f, r)), 2, 'местная пара: одна кухня и одна пивоварня'],
    [(d, f) => has(d, 'bitter', 'hoppy') && has(f, 'spicy'), -9, ''],
    [(d, f) => has(d, 'strong', 'body') && has(f, 'delicate'), -9, ''],
    [(d, f) => has(f, 'sweet') && has(d, 'bitter', 'dry') && !has(d, 'roast'), -9, ''],
    [(d, f) => has(f, 'cold') && !(has(d, 'sweet') && has(d, 'body')), -9, ''],
    [(d, f) => has(d, 'roast') && has(f, 'fish') && !has(f, 'shell'), -3, ''],
  ];
  const sc = (d, f) => { let s = 0, best = []; for (const [c, p, w] of BR) if (c(d, f)) { if (p <= -9) return null; s += p; if (p > 0) best.push([p, w]); }
    best.sort((a, b) => b[0] - a[0]); return {s, why: best.slice(0, 2).map(x => x[1])}; };
  return run({id: 'g_beerfood', emoji: g.emoji, title: 'Пивной стиль × блюдо', color: g.color,
    about: 'Сгенерированная матрица по правилам: горечь режет жир, солод дружит с карамелизацией, обжарка — с какао, кислое пиво ведёт себя как вино; горькое к острому не ставится',
    A: B, B: F, rule: (d, f) => { const r = sc(d, f); if (!r || r.s < 3) return null; return r.why.join('; '); },
    name: (d, f) => `${d.n} к: ${f.n}`, desc: (d, f, note) => [note, f.d, d.d]});
}

module.exports = () => [wineFood(), beerFood()];
