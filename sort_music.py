#!/usr/bin/env python3
"""Раскладывает песни по папкам радиостанций (Hearts of Iron IV / Paradox music mods).

То же самое, что sort_music.ps1, только на Python — на случай, если удобнее так
(или если работаете не под Windows).

Скрипт смотрит в папку, где он сам лежит, и ищет в ней ЛЮБЫЕ .txt-файлы,
внутри которых есть строка вида

    music_station = "radio_madrid"

и блоки песен

    music = {
        song = "a_las_barricadas"
        ...
    }

Имя txt-файла не важно — станция определяется по содержимому.
Для каждой станции создаётся папка с её именем, и в неё КОПИРУЮТСЯ
(оригиналы остаются на месте!) соответствующие аудиофайлы.

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
from pathlib import Path

RE_STATION = re.compile(r'^[ \t]*music_station[ \t]*=[ \t]*"([^"]+)"', re.MULTILINE)
RE_SONG = re.compile(r'^[ \t]*song[ \t]*=[ \t]*"([^"]+)"', re.MULTILINE)
RE_COMMENT = re.compile(r"#.*$", re.MULTILINE)

DEFAULT_EXTS = (".ogg", ".wav", ".mp3", ".flac")
BAD_CHARS = '<>:"/\\|?*'


def read_text(path: Path) -> str:
    """Файлы Paradox обычно UTF-8, но встречается и windows-1252."""
    data = path.read_bytes()
    for enc in ("utf-8-sig", "utf-8", "cp1252"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def safe_folder_name(name: str) -> str:
    for ch in BAD_CHARS:
        name = name.replace(ch, "_")
    return name.strip().rstrip(".")


def collect_audio(root: Path, exts: tuple[str, ...]) -> dict[str, Path]:
    """Имя без расширения (в нижнем регистре) -> файл."""
    audio: dict[str, Path] = {}
    for f in sorted(root.iterdir()):
        if f.is_file() and f.suffix.lower() in exts:
            audio.setdefault(f.stem.lower(), f)
    return audio


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
    args = parser.parse_args(argv)

    root = Path(args.path).resolve() if args.path else Path(__file__).resolve().parent
    exts = tuple(e.lower() if e.startswith(".") else "." + e.lower() for e in args.ext)

    print(f"Папка: {root}")
    if args.dry_run:
        print("РЕЖИМ ПРОСМОТРА (--dry-run): ничего не будет создано и скопировано.")

    audio = collect_audio(root, exts)
    print(f"Найдено аудиофайлов: {len(audio)}")

    stations = collect_stations(root)
    if not stations:
        print("Файлы станций (с 'music_station = ...') рядом со скриптом не найдены.")
        print("Положите скрипт в папку music и запустите ещё раз.")
        return 1
    print(f"Найдено станций: {len(stations)}\n")

    report: list[str] = []
    copied_all = skipped_all = missing_all = 0
    used: set[str] = set()

    for txt_name, station, songs in stations:
        dest = root / station
        if not args.dry_run:
            dest.mkdir(exist_ok=True)

        copied = skipped = 0
        missing: list[str] = []

        for song in songs:
            used.add(song.lower())
            src = audio.get(song.lower())
            if src is None:
                missing.append(song)
                continue
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
        report += [f"        - {m}" for m in missing]
        report.append("")

    print(f"\nИТОГО: скопировано {copied_all}, пропущено (уже были) {skipped_all}, "
          f"не найдено файлов {missing_all}")

    orphans = sorted(k for k in audio if k not in used)
    if orphans:
        print(f"Аудиофайлов не упомянуто ни в одной станции: {len(orphans)} (список в отчёте)")
        report.append(f"[файлы, не упомянутые ни в одной станции: {len(orphans)}]")
        report += [f"        - {audio[o].name}" for o in orphans]
        report.append("")

    if not args.dry_run:
        report_path = root / "_sort_music_report.txt"
        report_path.write_text("\n".join(report), encoding="utf-8")
        print(f"Отчёт: {report_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
