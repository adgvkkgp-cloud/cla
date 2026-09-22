import { useState, useMemo, useRef, useEffect } from "react";
import { parts } from "./data";

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string; header: string; glow: string }> = {
  violet:  { bg: "bg-violet-950/40",  border: "border-violet-700/50",  badge: "bg-violet-700/30 text-violet-300 border-violet-600/40",   text: "text-violet-300", header: "from-violet-900/80 to-violet-950/60", glow: "shadow-violet-900/30" },
  blue:    { bg: "bg-blue-950/40",    border: "border-blue-700/50",    badge: "bg-blue-700/30 text-blue-300 border-blue-600/40",         text: "text-blue-300",   header: "from-blue-900/80 to-blue-950/60",   glow: "shadow-blue-900/30" },
  indigo:  { bg: "bg-indigo-950/40",  border: "border-indigo-700/50",  badge: "bg-indigo-700/30 text-indigo-300 border-indigo-600/40",   text: "text-indigo-300", header: "from-indigo-900/80 to-indigo-950/60", glow: "shadow-indigo-900/30" },
  cyan:    { bg: "bg-cyan-950/40",    border: "border-cyan-700/50",    badge: "bg-cyan-700/30 text-cyan-300 border-cyan-600/40",         text: "text-cyan-300",   header: "from-cyan-900/80 to-cyan-950/60",   glow: "shadow-cyan-900/30" },
  teal:    { bg: "bg-teal-950/40",    border: "border-teal-700/50",    badge: "bg-teal-700/30 text-teal-300 border-teal-600/40",         text: "text-teal-300",   header: "from-teal-900/80 to-teal-950/60",   glow: "shadow-teal-900/30" },
  emerald: { bg: "bg-emerald-950/40", border: "border-emerald-700/50", badge: "bg-emerald-700/30 text-emerald-300 border-emerald-600/40",text: "text-emerald-300",header: "from-emerald-900/80 to-emerald-950/60",glow: "shadow-emerald-900/30" },
  sky:     { bg: "bg-sky-950/40",     border: "border-sky-700/50",     badge: "bg-sky-700/30 text-sky-300 border-sky-600/40",           text: "text-sky-300",    header: "from-sky-900/80 to-sky-950/60",     glow: "shadow-sky-900/30" },
  yellow:  { bg: "bg-yellow-950/40",  border: "border-yellow-700/50",  badge: "bg-yellow-700/30 text-yellow-300 border-yellow-600/40",   text: "text-yellow-300", header: "from-yellow-900/80 to-yellow-950/60",glow: "shadow-yellow-900/30" },
  rose:    { bg: "bg-rose-950/40",    border: "border-rose-700/50",    badge: "bg-rose-700/30 text-rose-300 border-rose-600/40",         text: "text-rose-300",   header: "from-rose-900/80 to-rose-950/60",   glow: "shadow-rose-900/30" },
  orange:  { bg: "bg-orange-950/40",  border: "border-orange-700/50",  badge: "bg-orange-700/30 text-orange-300 border-orange-600/40",   text: "text-orange-300", header: "from-orange-900/80 to-orange-950/60",glow: "shadow-orange-900/30" },
  amber:   { bg: "bg-amber-950/40",   border: "border-amber-700/50",   badge: "bg-amber-700/30 text-amber-300 border-amber-600/40",       text: "text-amber-300",  header: "from-amber-900/80 to-amber-950/60", glow: "shadow-amber-900/30" },
  lime:    { bg: "bg-lime-950/40",    border: "border-lime-700/50",    badge: "bg-lime-700/30 text-lime-300 border-lime-600/40",         text: "text-lime-300",   header: "from-lime-900/80 to-lime-950/60",   glow: "shadow-lime-900/30" },
  purple:  { bg: "bg-purple-950/40",  border: "border-purple-700/50",  badge: "bg-purple-700/30 text-purple-300 border-purple-600/40",   text: "text-purple-300", header: "from-purple-900/80 to-purple-950/60",glow: "shadow-purple-900/30" },
  red:     { bg: "bg-red-950/40",     border: "border-red-700/50",     badge: "bg-red-700/30 text-red-300 border-red-600/40",           text: "text-red-300",    header: "from-red-900/80 to-red-950/60",     glow: "shadow-red-900/30" },
  pink:    { bg: "bg-pink-950/40",    border: "border-pink-700/50",    badge: "bg-pink-700/30 text-pink-300 border-pink-600/40",         text: "text-pink-300",   header: "from-pink-900/80 to-pink-950/60",   glow: "shadow-pink-900/30" },
  fuchsia: { bg: "bg-fuchsia-950/40", border: "border-fuchsia-700/50", badge: "bg-fuchsia-700/30 text-fuchsia-300 border-fuchsia-600/40",text: "text-fuchsia-300",header: "from-fuchsia-900/80 to-fuchsia-950/60",glow: "shadow-fuchsia-900/30" },
};

// Русский счёт: 1 часть, 2 части, 5 частей. Без этого в подвале
// стояло «41 части», а у части с единственным разделом — «1 разделов».
function plural(n: number, one: string, few: string, many: string) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = n % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

const partsWord = (n: number) => plural(n, "часть", "части", "частей");
const sectionsWord = (n: number) => plural(n, "раздел", "раздела", "разделов");
const entriesWord = (n: number) => plural(n, "позиция", "позиции", "позиций");

// Подпись вкладки — заголовок части без префикса «ЧАСТЬ N — ».
// Обрезать его здесь нельзя: слово рвалось посередине («АНАТОМИЯ
// И МОРФОЛОГИ»). Лента вкладок прокручивается вбок, места хватает.
function partLabel(title: string) {
  const dash = title.indexOf("—");
  return dash === -1 ? title : title.slice(dash + 1).trim();
}

// Высота строки позиции — для распорки под несмонтированным разделом,
// чтобы полоса прокрутки не прыгала. Замерено: на широком экране строка
// укладывается в одну линию (~68 px), на узком название и описание
// встают друг под друга (~88 px). Порог тот же, что у `sm:` в Tailwind.
const ROW_H_WIDE = 68;
const ROW_H_NARROW = 88;
const WIDE_QUERY = "(min-width: 640px)";

function useRowHeight() {
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide ? ROW_H_WIDE : ROW_H_NARROW;
}

/**
 * Тело раздела монтируется, только когда раздел попал в поле зрения
 * (с запасом в экран сверху и снизу). До этого на его месте стоит
 * распорка той же высоты.
 *
 * Без этого «↓ все» разворачивал все 3004 позиции разом: страница
 * вырастала до 220 000 px на десктопе и 285 000 px на телефоне,
 * и раскрытие занимало больше секунды.
 */
function LazyBody({ count, children }: { count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const rowH = useRowHeight();

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div ref={ref} style={shown ? undefined : { height: count * rowH }}>
      {shown ? children : null}
    </div>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [activePart, setActivePart] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  // Во время поиска разделы раскрыты по умолчанию, поэтому ручное
  // сворачивание нужно помнить отдельно — иначе клик по заголовку
  // не делал ничего.
  const [collapsedInSearch, setCollapsedInSearch] = useState<Set<string>>(new Set());

  const searching = search.trim().length > 0;

  const { total, totalSections } = useMemo(() => {
    let entries = 0;
    let sections = 0;
    for (const p of parts) {
      sections += p.sections.length;
      for (const s of p.sections) entries += s.entries.length;
    }
    return { total: entries, totalSections: sections };
  }, []);

  const toggleSection = (id: string) => {
    const flip = (prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    };
    if (searching) setCollapsedInSearch(flip);
    else setExpandedSections(flip);
  };

  const expandAll = () => {
    const all = new Set<string>();
    parts.forEach(p => p.sections.forEach(s => all.add(s.id)));
    setExpandedSections(all);
    setCollapsedInSearch(new Set());
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
    if (searching) {
      const all = new Set<string>();
      parts.forEach(p => p.sections.forEach(s => all.add(s.id)));
      setCollapsedInSearch(all);
    }
  };

  const resetSearch = () => {
    setSearch("");
    setCollapsedInSearch(new Set());
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return parts;
    return parts.map(part => ({
      ...part,
      sections: part.sections
        .map(section => {
          // Раздел, попавший по своему названию, показывается целиком:
          // раньше он оставался в выдаче с пустым телом и счётчиком «0».
          const sectionHit =
            section.title.toLowerCase().includes(q) ||
            section.subtitle.toLowerCase().includes(q);
          if (sectionHit) return section;
          return {
            ...section,
            entries: section.entries.filter(
              e =>
                e.name.toLowerCase().includes(q) ||
                e.desc.toLowerCase().includes(q) ||
                (e.tags && e.tags.some(t => t.toLowerCase().includes(q))),
            ),
          };
        })
        .filter(s => s.entries.length > 0),
    })).filter(p => p.sections.length > 0);
  }, [search]);

  const visibleParts = activePart ? filtered.filter(p => p.id === activePart) : filtered;

  const isOpen = (id: string) =>
    searching ? !collapsedInSearch.has(id) : expandedSections.has(id);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-zinc-100 font-mono">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-50 bg-[#0a0a12]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Title row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🪞</div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-zinc-100 leading-tight tracking-tight">
                    ПОЛНАЯ ТАКСОНОМИЯ ЛИЦА
                  </h1>
                  <div className="text-xs text-zinc-500 leading-tight">
                    Анатомия · Эстетика · Мимика · Типажи · Арт-теги
                  </div>
                </div>
              </div>
              <div className="flex gap-3 text-right">
                <div className="text-center">
                  <div className="text-lg font-bold text-violet-400">{total}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{entriesWord(total)}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-400">{totalSections}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{sectionsWord(totalSections)}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">{parts.length}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{partsWord(parts.length)}</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 flex-wrap items-center">
              <input
                type="text"
                placeholder="🔍 Поиск по названию, описанию, тегу..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-48 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-base sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
              />
              <button
                onClick={() => setShowTags(v => !v)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${showTags ? "bg-violet-900/40 border-violet-600/50 text-violet-300" : "bg-zinc-900 border-zinc-700 text-zinc-500"}`}
              >
                # теги
              </button>
              <button onClick={expandAll} className="px-3 py-1.5 rounded-lg text-xs border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all">
                ↓ все
              </button>
              <button onClick={collapseAll} className="px-3 py-1.5 rounded-lg text-xs border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all">
                ↑ свернуть
              </button>
            </div>

            {/* Part tabs — одна прокручиваемая вбок лента.
                При переносе по строкам 42 вкладки занимали 6 строк
                на десктопе и 25 на телефоне: шапка вырастала до 1464 px
                при экране 844 px, прилипала и навсегда закрывала собой
                нижние вкладки. */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 [scrollbar-width:thin]">
              <button
                onClick={() => setActivePart(null)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all border whitespace-nowrap shrink-0 ${
                  activePart === null
                    ? "bg-zinc-700 border-zinc-500 text-zinc-100"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Все части
              </button>
              {parts.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePart(activePart === p.id ? null : p.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all border whitespace-nowrap shrink-0 ${
                    activePart === p.id
                      ? "bg-violet-800/60 border-violet-600 text-violet-200"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {p.emoji} {partLabel(p.title)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {visibleParts.map(part => {
          const partEntries = part.sections.reduce((a, s) => a + s.entries.length, 0);
          return (
            <div key={part.id}>
              {/* Part Header */}
              <div className="mb-6 border-b border-zinc-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{part.emoji}</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
                      {part.title}
                    </h2>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {part.sections.length} {sectionsWord(part.sections.length)} · {partEntries} {entriesWord(partEntries)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {part.sections.map(section => {
                  const c = COLOR_MAP[section.color] || COLOR_MAP["violet"];
                  const open = isOpen(section.id);

                  return (
                    <div
                      key={section.id}
                      className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden shadow-lg ${c.glow}`}
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        aria-expanded={open}
                        className={`w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r ${c.header} hover:brightness-110 transition-all group`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className={`text-xs font-bold px-2 py-0.5 rounded-full border ${c.badge} shrink-0`}>
                            {section.entries.length}
                          </div>
                          <div>
                            <div className={`font-bold text-sm sm:text-base ${c.text} leading-tight`}>
                              {section.title}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">{section.subtitle}</div>
                          </div>
                        </div>
                        <div className={`text-lg transition-transform duration-200 ${open ? "rotate-180" : ""} ${c.text}`}>
                          ▾
                        </div>
                      </button>

                      {/* Section Entries */}
                      {open && (
                        <LazyBody count={section.entries.length}>
                          <div className="divide-y divide-zinc-800/50">
                            {section.entries.map(entry => (
                              <div key={entry.id} className="flex gap-0 hover:bg-white/[0.02] transition-colors">
                                {/* Number */}
                                <div className="flex items-start justify-center w-12 shrink-0 pt-3 pb-2">
                                  <span className={`text-xs font-bold tabular-nums ${c.text} opacity-60`}>
                                    {entry.id}
                                  </span>
                                </div>
                                {/* Content */}
                                <div className="flex-1 px-2 py-2.5 border-l border-zinc-800/50">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3">
                                    <div className="sm:w-56 shrink-0">
                                      <div className={`font-semibold text-sm leading-snug ${c.text}`}>
                                        {entry.name}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs text-zinc-400 leading-relaxed">
                                        {entry.desc}
                                      </div>
                                      {showTags && entry.tags && entry.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                          {entry.tags.map(tag => (
                                            <button
                                              key={tag}
                                              type="button"
                                              onClick={() => setSearch(tag)}
                                              title={`Искать «${tag}»`}
                                              className={`text-[10px] px-1.5 py-0.5 rounded border cursor-pointer hover:brightness-125 transition-all ${c.badge}`}
                                            >
                                              #{tag}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </LazyBody>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {visibleParts.length === 0 && (
          <div className="text-center py-20 text-zinc-600">
            <div className="text-4xl mb-3">🔎</div>
            <div className="text-sm">
              {searching
                ? <>Ничего не найдено по запросу «{search}»</>
                : <>В этой части нечего показать</>}
            </div>
            {searching && (
              <button onClick={resetSearch} className="mt-3 text-xs text-violet-400 hover:underline">
                Сбросить поиск
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="border-t border-zinc-800/60 mt-10 py-6 text-center">
        <div className="text-xs text-zinc-600">
          Полная таксономия лица · {total} {entriesWord(total)} · {totalSections} {sectionsWord(totalSections)} · {parts.length} {partsWord(parts.length)}
        </div>
        <div className="text-xs text-zinc-700 mt-1">
          Анатомия · Морфология · Мимика · Эстетика · Арт-теги (Danbooru/Gelbooru style)
        </div>
      </div>
    </div>
  );
}
