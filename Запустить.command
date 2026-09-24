#!/bin/bash
# Двойной щелчок в Finder: сервер для открытия таксономий на телефоне.
# В Linux — запустить из терминала: ./Запустить.command
cd "$(dirname "$0")" || exit 1

if command -v python3 >/dev/null 2>&1; then
  exec python3 serve.py "$@"
fi

echo
echo "  Python 3 не найден. Установите его: https://www.python.org/downloads/"
echo
read -n 1 -s -r -p "  Нажмите любую клавишу…"
echo
