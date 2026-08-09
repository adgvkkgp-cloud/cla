import { useState, useMemo, useEffect } from "react";
import { sections, Section, Entry } from "./data/sections";

const LEVEL_COLORS: Record<string, string> = {
  "Базовый / Фундаментальный": "bg-blue-100 text-blue-800",
  "Базовый / Эндокринология": "bg-purple-100 text-purple-800",
  "Базовый / Анатомия": "bg-red-100 text-red-800",
  "Средний / Нейронауки": "bg-violet-100 text-violet-800",
  "Средний / Психология": "bg-emerald-100 text-emerald-800",
  "Средний / Сексология": "bg-rose-100 text-rose-800",
  "Высший / Социология": "bg-amber-100 text-amber-800",
  "Высший / Эволюционная биология": "bg-stone-100 text-stone-800",
  "Продвинутый / Гендерные исследования": "bg-indigo-100 text-indigo-800",
  "Прикладной / Отношения": "bg-sky-100 text-sky-800",
  "Комплексный / Возрастная психология": "bg-green-100 text-green-800",
  "Культурологический": "bg-orange-100 text-orange-800",
  "Глоссарий / Психопатология": "bg-red-100 text-red-800",
  "Глоссарий / Когнитивистика": "bg-violet-100 text-violet-800",
  "Глоссарий / Нейронауки": "bg-indigo-100 text-indigo-800",
  "Глоссарий / Философия": "bg-emerald-100 text-emerald-800",
  "Глоссарий / Психотерапия": "bg-teal-100 text-teal-800",
  "Глоссарий / Психология": "bg-pink-100 text-pink-800",
  "Черты / Личность": "bg-emerald-100 text-emerald-800",
  "Черты / Внешность": "bg-pink-100 text-pink-800",
  "Черты / Внешность и мимика": "bg-pink-100 text-pink-800",
  "Черты / Голос и мимика": "bg-violet-100 text-violet-800",
  "Черты / Голос и речь": "bg-violet-100 text-violet-800",
  "Черты / Тело и движения": "bg-indigo-100 text-indigo-800",
  "Черты / Поведение и манеры": "bg-amber-100 text-amber-800",
  "Черты / Сексуальность": "bg-rose-100 text-rose-800",
  "Черты / Социальное": "bg-sky-100 text-sky-800",
  "Черты / Социальность": "bg-sky-100 text-sky-800",
  "Черты / Ум и воля": "bg-violet-100 text-violet-800",
  "Черты / Ум": "bg-violet-100 text-violet-800",
  "Черты / Воля": "bg-slate-100 text-slate-800",
  "Черты / Эмоции": "bg-rose-100 text-rose-800",
  "Черты / Темперамент": "bg-orange-100 text-orange-800",
  "Черты / Привычки": "bg-stone-100 text-stone-800",
  "Черты / Склонности": "bg-stone-100 text-stone-800",
  "Черты / Способности": "bg-teal-100 text-teal-800",
  "Черты / Грани по аспектам": "bg-cyan-100 text-cyan-800",
  "Черты / Степень": "bg-zinc-100 text-zinc-800",
  "Черты / Шкалы": "bg-zinc-100 text-zinc-800",
};

function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = Boolean(entry.detail || entry.male || entry.female);

  return (
    <div
      className={`border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 ${
        expanded ? "shadow-lg" : "hover:shadow-md"
      } bg-white`}
    >
      <button
        onClick={() => hasMore && setExpanded(!expanded)}
        className={`w-full text-left ${hasMore ? "" : "cursor-default"}`}
      >
        <div className="flex items-start gap-4 p-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900 leading-tight">
                {entry.title}
                {entry.tag && (
                  <span className="ml-2 align-middle text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
                    {entry.tag}
                  </span>
                )}
              </h3>
              {hasMore && (
                <svg
                  className={`flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    expanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{entry.description}</p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {entry.detail && (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-slate-50 rounded-xl p-4 border border-slate-100">
              {entry.detail}
            </p>
          )}
          {(entry.male || entry.female) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entry.male && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">♂</span>
                    <span className="font-semibold text-blue-800 text-sm uppercase tracking-wide">
                      Мужчина
                    </span>
                  </div>
                  <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
                    {entry.male}
                  </p>
                </div>
              )}
              {entry.female && (
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">♀</span>
                    <span className="font-semibold text-rose-800 text-sm uppercase tracking-wide">
                      Женщина
                    </span>
                  </div>
                  <p className="text-sm text-rose-900 leading-relaxed whitespace-pre-line">
                    {entry.female}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState<string>("all");
  const [expandAll, setExpandAll] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const totalEntries = useMemo(
    () => sections.reduce((s, sec) => s + sec.entries.length, 0),
    [],
  );
  const levels = useMemo(
    () => Array.from(new Set(sections.map((s) => s.level))),
    [],
  );

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return sections
      .filter((sec) => activeLevel === "all" || sec.level === activeLevel)
      .map((sec) => {
        if (!q) return sec;
        const entries = sec.entries.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            (e.detail || "").toLowerCase().includes(q) ||
            (e.male || "").toLowerCase().includes(q) ||
            (e.female || "").toLowerCase().includes(q) ||
            (e.tag || "").toLowerCase().includes(q),
        );
        return { ...sec, entries };
      })
      .filter((sec) => sec.entries.length > 0);
  }, [q, activeLevel]);

  const shownEntries = filtered.reduce((s, sec) => s + sec.entries.length, 0);

  const tocGroups = useMemo(() => {
    const base = sections.filter(
      (sec) => activeLevel === "all" || sec.level === activeLevel,
    );
    return levels
      .map((lv) => ({ lv, secs: base.filter((s) => s.level === lv) }))
      .filter((g) => g.secs.length > 0);
  }, [activeLevel, levels]);

  const jump = (id: string) => {
    setTocOpen(false);
    requestAnimationFrame(() => {
      const el = document.getElementById("sec-" + id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      {/* HERO */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-10 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-4 left-10 text-8xl">♂</div>
          <div className="absolute top-4 right-10 text-8xl">♀</div>
          <div className="absolute bottom-4 left-1/4 text-6xl">⚤</div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="text-5xl">♂</span>
            <div className="text-4xl font-black tracking-tight">vs</div>
            <span className="text-5xl">♀</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
            Человек: психика, тело и общество
          </h1>
          <p className="text-slate-300 text-base md:text-lg mb-1">
            Полная таксономия: эндокринология · психология · психика ·
            социология · обществознание
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm text-slate-300">
            <span className="bg-white/10 rounded-full px-4 py-1">
              📚 {sections.length} разделов
            </span>
            <span className="bg-white/10 rounded-full px-4 py-1">
              📋 {totalEntries.toLocaleString("ru")} тем
            </span>
            <span className="bg-white/10 rounded-full px-4 py-1">
              🧬 {levels.length} уровней
            </span>
          </div>
        </div>
      </div>

      {/* STICKY TOOLBAR */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTocOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl px-3 py-2 transition flex-shrink-0"
            title="Оглавление"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="hidden sm:inline">Разделы</span>
          </button>

          <div className="flex-1 min-w-[180px] flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по темам, описаниям, ♂/♀…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            )}
          </div>

          <select
            value={activeLevel}
            onChange={(e) => setActiveLevel(e.target.value)}
            className="text-sm bg-slate-100 hover:bg-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none max-w-[180px] cursor-pointer transition"
            title="Фильтр по уровню"
          >
            <option value="all">Все уровни</option>
            {levels.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>

          <button
            onClick={() => setExpandAll((v) => !v)}
            className="text-sm text-slate-600 hover:text-slate-900 font-medium bg-slate-100 hover:bg-slate-200 rounded-xl px-3 py-2 transition flex-shrink-0"
          >
            {expandAll ? "Свернуть" : "Развернуть"}
          </button>
        </div>

        {/* result line */}
        <div className="max-w-5xl mx-auto px-4 pb-2 text-xs text-gray-500">
          {search || activeLevel !== "all"
            ? `Показано: ${shownEntries.toLocaleString("ru")} тем в ${filtered.length} разделах`
            : `Всего ${totalEntries.toLocaleString("ru")} тем в ${sections.length} разделах`}
          {activeLevel !== "all" && (
            <button
              onClick={() => setActiveLevel("all")}
              className="ml-2 text-slate-600 underline hover:text-slate-900"
            >
              сбросить уровень
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 mt-5 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium">Ничего не найдено</p>
            <p className="text-sm mt-1">Попробуйте другой запрос или сбросьте фильтр</p>
          </div>
        ) : (
          filtered.map((section) => (
            <SectionBlockControlled
              key={section.id}
              section={section}
              forceOpen={expandAll || Boolean(q)}
            />
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-slate-900 text-slate-400 text-center py-8 px-4 text-sm">
        <div className="flex justify-center gap-6 text-2xl mb-3">
          <span>♂</span>
          <span>⚧</span>
          <span>♀</span>
        </div>
        <p className="max-w-2xl mx-auto">
          Энциклопедия создана на основе данных нейробиологии, эволюционной
          психологии, сексологии и социологии. Все различия описаны как
          статистические тенденции, а не абсолютные правила — каждый человек
          уникален.
        </p>
      </div>

      {/* TOC DRAWER */}
      {tocOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setTocOpen(false)}
          />
          <div className="relative w-[88%] max-w-sm h-full bg-white shadow-2xl overflow-y-auto animate-[slidein_0.2s_ease]">
            <div className="sticky top-0 bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-bold">Оглавление</div>
                <div className="text-xs text-slate-300">
                  {tocGroups.reduce((s, g) => s + g.secs.length, 0)} разделов
                </div>
              </div>
              <button
                onClick={() => setTocOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              {tocGroups.map((g) => (
                <div key={g.lv} className="mb-4">
                  <div
                    className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md inline-block mb-1 ${
                      LEVEL_COLORS[g.lv] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {g.lv}
                  </div>
                  <ul>
                    {g.secs.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => jump(s.id)}
                          className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition text-sm text-slate-700"
                        >
                          <span className="text-base">{s.icon}</span>
                          <span className="flex-1 leading-snug">{s.title}</span>
                          <span className="text-[11px] text-gray-400">
                            {s.entries.length}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BACK TO TOP */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-700 flex items-center justify-center transition"
          title="Наверх"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

function SectionBlockControlled({
  section,
  forceOpen,
}: {
  section: Section;
  forceOpen: boolean;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = forceOpen || localOpen;

  const levelColor = LEVEL_COLORS[section.level] || "bg-gray-100 text-gray-700";

  return (
    <div
      id={"sec-" + section.id}
      className="mb-6 rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white scroll-mt-28"
    >
      <button onClick={() => setLocalOpen(!localOpen)} className="w-full text-left">
        <div
          className={`bg-gradient-to-r ${section.color} p-5 flex items-start md:items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow flex-shrink-0">
              {section.icon}
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
                {section.title}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">{section.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${levelColor}`}>
              {section.level}
            </span>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <span>{section.entries.length} позиций</span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {open && (
        <div className="p-4 grid grid-cols-1 gap-3">
          {section.entries.map((entry, i) => (
            <EntryCard key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
