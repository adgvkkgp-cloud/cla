#!/usr/bin/env python3
"""Раскладывает песни по папкам радиостанций (Hearts of Iron IV / Paradox music mods).

То же самое, что sort_music.ps1, только на Python — на случай, если удобнее так
(или если работаете не под Windows).

Скрипт смотрит в папку, где он сам лежит, и ищет в ней ЛЮБЫЕ .txt-файлы,
внутри которых есть строка вида

    music_station = "radio_beijing"

и блоки песен

    music = {
        song = "di_er_meng"
        ...
    }

Имя txt-файла не важно — станция определяется по содержимому.
Для каждой станции создаётся папка с её именем, и в неё КОПИРУЮТСЯ
(оригиналы остаются на месте!) соответствующие аудиофайлы.

Песня ищется среди файлов в три захода:
    1. по .asset-файлам мода (там задана связь name -> file);
    2. по точному имени файла (регистр не важен);
    3. по «упрощённому» имени: снимаются диакритические знаки и приводятся
       к одному виду разделители, поэтому song = "di_er_meng" находит
       файл Dì_èr_mèng.ogg, а "ai_ni_sanbai_liushi_nian" —
       Ài_nǐ_sānbǎi_liùshí_nian.ogg.

Примеры:
    python sort_music.py
    python sort_music.py --dry-run
    python sort_music.py --path "D:/Steam/steamapps/workshop/content/394360/2213783261/music"
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
import unicodedata
from pathlib import Path

# без привязки к началу строки: music = { song = "..." } в одну строку тоже валидно
RE_STATION = re.compile(r'(?<![\w])music_station[ \t]*=[ \t]*"([^"]+)"')
RE_SONG = re.compile(r'(?<![\w])song[ \t]*=[ \t]*"([^"]+)"')
RE_COMMENT = re.compile(r"#.*$", re.MULTILINE)
# блок вида  music = { name = "..." file = "....ogg" volume = 0.6 }  из .asset-файлов
RE_BLOCK = re.compile(r"\{([^{}]*)\}")
RE_NAME = re.compile(r'(?<![\w])name[ \t]*=[ \t]*"([^"]+)"')
RE_FILE = re.compile(r'(?<![\w])file[ \t]*=[ \t]*"([^"]+)"')

DEFAULT_EXTS = (".ogg", ".wav", ".mp3", ".flac")
BAD_CHARS = '<>:"/\\|?*'
# то, что NFKD не раскладывает сам
SPECIAL = str.maketrans({"ß": "ss", "ø": "o", "æ": "ae", "œ": "oe", "đ": "d", "ł": "l", "þ": "th", "ð": "d"})


def read_text(path: Path) -> str:
    """Файлы Paradox обычно UTF-8, но встречается и windows-1252."""
    data = path.read_bytes()
    if data.startswith(b"\xef\xbb\xbf"):
        return data.decode("utf-8-sig")
    for enc in ("utf-8", "cp1252"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def norm_key(name: str) -> str:
    """«Упрощённое» имя: Dì_èr_mèng -> di_er_meng, Ài_nǐ... -> ai_ni...

    Снимает диакритику, приводит к нижнему регистру, все разделители — в '_'.
    Иероглифы/кириллица не трогаются (чтобы разные имена не слиплись в одно).
    """
    s = unicodedata.normalize("NFKD", name).lower().translate(SPECIAL)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^\w]+", "_", s, flags=re.UNICODE)
    return re.sub(r"_+", "_", s).strip("_")


def safe_folder_name(name: str) -> str:
    for ch in BAD_CHARS:
        name = name.replace(ch, "_")
    return name.strip().rstrip(".")


class AudioIndex:
    """Указатель на аудиофайлы папки: точное имя, упрощённое имя, .asset-связки."""

    def __init__(self, root: Path, exts: tuple[str, ...]):
        self.files: list[Path] = [f for f in sorted(root.iterdir())
                                  if f.is_file() and f.suffix.lower() in exts]
        self.by_name: dict[str, Path] = {}   # полное имя файла -> файл
        self.by_stem: dict[str, Path] = {}   # имя без расширения -> файл
        self.by_norm: dict[str, Path] = {}   # упрощённое имя -> файл
        self.ambiguous: set[str] = set()     # упрощённые имена, совпавшие у разных файлов

        for f in self.files:
            self.by_name.setdefault(f.name.lower(), f)
            self.by_stem.setdefault(f.stem.lower(), f)
            key = norm_key(f.stem)
            if not key:
                continue
            if key in self.by_norm and self.by_norm[key] != f:
                self.ambiguous.add(key)
            else:
                self.by_norm.setdefault(key, f)

        self.assets: dict[str, str] = {}     # имя песни из .asset -> имя файла
        for asset in sorted(root.glob("*.asset")):
            if not asset.is_file():
                continue
            text = RE_COMMENT.sub("", read_text(asset))
            for block in RE_BLOCK.findall(text):
                name, file = RE_NAME.search(block), RE_FILE.search(block)
                if name and file:
                    self.assets.setdefault(norm_key(name.group(1)), file.group(1))

    def find(self, song: str) -> tuple[Path | None, str]:
        """-> (файл, как нашли). '' если не нашли."""
        key = norm_key(song)

        asset_file = self.assets.get(key)
        if asset_file:
            hit = (self.by_name.get(asset_file.lower())
                   or self.by_stem.get(Path(asset_file).stem.lower())
                   or self.by_norm.get(norm_key(Path(asset_file).stem)))
            if hit:
                return hit, "asset"

        hit = self.by_stem.get(song.lower())
        if hit:
            return hit, "exact"

        if key not in self.ambiguous:
            hit = self.by_norm.get(key)
            if hit:
                return hit, "norm"
        return None, ""

    def suggest(self, song: str, limit: int = 3) -> list[str]:
        """Похожие имена файлов — подсказка для отчёта."""
        key = norm_key(song)
        if not key:
            return []
        out = [f.name for k, f in self.by_norm.items()
               if k != key and (k.startswith(key) or key.startswith(k) or k in key or key in k)]
        return sorted(out)[:limit]


def collect_stations(root: Path) -> list[tuple[str, str, list[str]]]:
    """Список (имя файла, имя станции, песни без повторов)."""
    stations = []
    for txt in sorted(root.glob("*.txt")):
        if not txt.is_file():
            continue
        text = RE_COMMENT.sub("", read_text(txt))
        m = RE_STATION.search(text)
        if not m:
            continue  # не файл станции
        songs, seen = [], set()
        for name in RE_SONG.findall(text):
            name = name.strip()
            key = name.lower()
            if name and key not in seen:
                seen.add(key)
                songs.append(name)
        stations.append((txt.name, safe_folder_name(m.group(1)), songs))
    return stations


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--path", default=None, help="папка с музыкой (по умолчанию — папка скрипта)")
    parser.add_argument("--ext", nargs="+", default=list(DEFAULT_EXTS), help="расширения аудиофайлов")
    parser.add_argument("--dry-run", action="store_true", help="только показать план, ничего не делать")
    parser.add_argument("--force", action="store_true", help="перезаписывать уже скопированные файлы")
    parser.add_argument("--exact", action="store_true",
                        help="только точные совпадения имён (без упрощённых имён и .asset)")
    args = parser.parse_args(argv)

    root = Path(args.path).resolve() if args.path else Path(__file__).resolve().parent
    exts = tuple(e.lower() if e.startswith(".") else "." + e.lower() for e in args.ext)

    print(f"Папка: {root}")
    if args.dry_run:
        print("РЕЖИМ ПРОСМОТРА (--dry-run): ничего не будет создано и скопировано.")

    index = AudioIndex(root, exts)
    print(f"Найдено аудиофайлов: {len(index.files)}"
          + (f", связок в .asset: {len(index.assets)}" if index.assets else ""))

    stations = collect_stations(root)
    if not stations:
        print("Файлы станций (с 'music_station = ...') рядом со скриптом не найдены.")
        print("Положите скрипт в папку music и запустите ещё раз.")
        return 1
    print(f"Найдено станций: {len(stations)}\n")

    report: list[str] = []
    copied_all = skipped_all = missing_all = 0
    fuzzy: dict[str, str] = {}     # песня -> файл, найденный не по точному имени
    used: set[Path] = set()

    for txt_name, station, songs in stations:
        dest = root / station
        if not args.dry_run:
            dest.mkdir(exist_ok=True)

        copied = skipped = 0
        missing: list[str] = []

        for song in songs:
            if args.exact:
                src = index.by_stem.get(song.lower())
                how = "exact" if src else ""
            else:
                src, how = index.find(song)
            if src is None:
                missing.append(song)
                continue
            used.add(src)
            if how != "exact":
                fuzzy.setdefault(song, f"{src.name}  ({how})")

            target = dest / src.name
            if target.exists() and not args.force:
                skipped += 1
                continue
            if not args.dry_run:
                shutil.copy2(src, target)  # копируем, оригинал остаётся на месте
            copied += 1

        copied_all += copied
        skipped_all += skipped
        missing_all += len(missing)

        print(f"{station:<24} песен: {len(songs):>4} | скопировано: {copied:>4} | "
              f"уже было: {skipped:>4} | нет файла: {len(missing):>4}")

        report.append(f"[{station}]  (из {txt_name})")
        report.append(f"    песен в станции : {len(songs)}")
        report.append(f"    скопировано     : {copied}")
        report.append(f"    уже было        : {skipped}")
        report.append(f"    нет аудиофайла  : {len(missing)}")
        for miss in missing:
            hint = index.suggest(miss)
            report.append(f"        - {miss}" + (f"   (похожие файлы: {', '.join(hint)})" if hint else ""))
        report.append("")

    print(f"\nИТОГО: скопировано {copied_all}, пропущено (уже были) {skipped_all}, "
          f"не найдено файлов {missing_all}")

    if fuzzy:
        print(f"Сопоставлено не по точному имени: {len(fuzzy)} (список в отчёте — стоит проглядеть)")
        report.append(f"[сопоставлено не по точному имени файла: {len(fuzzy)}]")
        report += [f"        {song}  ->  {name}" for song, name in sorted(fuzzy.items())]
        report.append("")

    if index.ambiguous:
        report.append(f"[файлы с одинаковыми упрощёнными именами — сопоставлялись только точно: "
                      f"{len(index.ambiguous)}]")
        report += [f"        - {k}" for k in sorted(index.ambiguous)]
        report.append("")

    orphans = sorted((f.name for f in index.files if f not in used), key=str.lower)
    if orphans:
        print(f"Аудиофайлов не упомянуто ни в одной станции: {len(orphans)} (список в отчёте)")
        report.append(f"[файлы, не попавшие ни в одну станцию: {len(orphans)}]")
        report += [f"        - {o}" for o in orphans]
        report.append("")

    if not args.dry_run:
        report_path = root / "_sort_music_report.txt"
        report_path.write_text("\n".join(report), encoding="utf-8")
        print(f"Отчёт: {report_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
