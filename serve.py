#!/usr/bin/env python3
"""
Сервер для открытия таксономий с телефона.

Запуск — двойной щелчок по «Запустить.bat» (Windows) или
«Запустить.command» (macOS), либо `python3 serve.py`.

Что делает:
  • поднимает сервер на всю локальную сеть (порт 8080 по возможности);
  • находит адрес компьютера в сети — тот, по которому достучится телефон;
  • кладёт ссылку на Атлас в буфер обмена;
  • открывает в браузере страницу с QR-кодом и кнопкой «Копировать»;
  • печатает тот же QR-код прямо в окне.

Навести камеру телефона на QR — и Атлас открыт. Телефон должен быть
в той же сети Wi-Fi, что и компьютер.

Только стандартная библиотека Python 3.7+: ни pip, ни npm. QR-код
считается здесь же, без сторонних пакетов.

Ключи:
  --port N        порт (по умолчанию 8080)
  --no-browser    не открывать браузер
  --no-clipboard  не трогать буфер обмена
"""

import argparse
import errno
import gzip
import html
import json
import mimetypes
import os
import socket
import subprocess
import sys
import threading
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))
SIGNATURE = "cla-taxonomy-server"

# Что открывать. Позиция попадает в меню, только если файл на месте.
TARGETS = [
    ("atlas", "Атлас человека", "atlas/Atlas.dc.html",
     "Нужен интернет на телефоне: Атлас подгружает React с unpkg.com."),
    ("face", "Таксономия лица", "face/TAXONOMY_FACE.html", ""),
    ("telo", "Таксономия телосложения", "telo/TAXONOMY_TELO.html", ""),
    ("food", "Мега-таксономия еды", "TAXONOMY_MEGA.html", ""),
]


# ════════════════════════════════════════════════════════════════
# QR-КОД
#
# Кодирование байтовым режимом, уровень коррекции M (восстанавливает
# ~15 % повреждённых модулей), версии 1–10 — до 213 байт, с запасом
# на любой адрес в локальной сети. Алгоритм по ISO/IEC 18004:
# данные → коды Рида — Соломона → чередование блоков → укладка
# зигзагом → маска с наименьшим штрафом → служебные биты формата.
# ════════════════════════════════════════════════════════════════

# Уровень M, индекс — номер версии.
_ECC_PER_BLOCK = [None, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26]
_NUM_BLOCKS = [None, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5]
_FORMAT_ECL_M = 0  # биты уровня коррекции в строке формата


def _raw_modules(ver):
    r = (16 * ver + 128) * ver + 64
    if ver >= 2:
        n = ver // 7 + 2
        r -= (25 * n - 10) * n - 55
        if ver >= 7:
            r -= 36
    return r


def _data_codewords(ver):
    return _raw_modules(ver) // 8 - _ECC_PER_BLOCK[ver] * _NUM_BLOCKS[ver]


def _gf_mul(x, y):
    z = 0
    for i in reversed(range(8)):
        z = (z << 1) ^ ((z >> 7) * 0x11D)
        z ^= ((y >> i) & 1) * x
    return z


def _rs_divisor(degree):
    res = [0] * (degree - 1) + [1]
    root = 1
    for _ in range(degree):
        for j in range(degree):
            res[j] = _gf_mul(res[j], root)
            if j + 1 < degree:
                res[j] ^= res[j + 1]
        root = _gf_mul(root, 0x02)
    return res


def _rs_remainder(data, divisor):
    res = [0] * len(divisor)
    for b in data:
        factor = b ^ res.pop(0)
        res.append(0)
        for i, coef in enumerate(divisor):
            res[i] ^= _gf_mul(coef, factor)
    return res


def _alignment_positions(ver, size):
    if ver == 1:
        return []
    n = ver // 7 + 2
    step = (ver * 8 + n * 3 + 5) // (n * 4 - 4) * 2
    return list(reversed([size - 7 - i * step for i in range(n - 1)] + [6]))


_MASKS = [
    lambda x, y: (x + y) % 2 == 0,
    lambda x, y: y % 2 == 0,
    lambda x, y: x % 3 == 0,
    lambda x, y: (x + y) % 3 == 0,
    lambda x, y: (x // 3 + y // 2) % 2 == 0,
    lambda x, y: x * y % 2 + x * y % 3 == 0,
    lambda x, y: (x * y % 2 + x * y % 3) % 2 == 0,
    lambda x, y: ((x + y) % 2 + x * y % 3) % 2 == 0,
]


def _penalty(m):
    n = len(m)
    lines = [row for row in m] + [list(col) for col in zip(*m)]
    p = 0
    # 1: ряд одного цвета длиной пять и больше
    for line in lines:
        run = 1
        for i in range(1, n):
            if line[i] == line[i - 1]:
                run += 1
            else:
                if run >= 5:
                    p += run - 2
                run = 1
        if run >= 5:
            p += run - 2
    # 2: квадраты 2×2 одного цвета
    for y in range(n - 1):
        for x in range(n - 1):
            if m[y][x] == m[y][x + 1] == m[y + 1][x] == m[y + 1][x + 1]:
                p += 3
    # 3: узор, похожий на искатель, — сбивает сканеры
    a = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0]
    b = a[::-1]
    for line in lines:
        for i in range(n - 10):
            seg = [int(v) for v in line[i:i + 11]]
            if seg == a or seg == b:
                p += 40
    # 4: доля тёмных модулей далека от половины
    dark = sum(sum(1 for v in row if v) for row in m)
    total = n * n
    p += ((abs(dark * 20 - total * 10) + total - 1) // total - 1) * 10
    return p


def qr_matrix(text):
    """Матрица QR-кода: список строк из True/False, True — тёмный модуль."""
    data = text.encode("utf-8")

    for ver in range(1, 11):
        count_bits = 8 if ver < 10 else 16
        capacity = _data_codewords(ver) * 8
        if 4 + count_bits + 8 * len(data) <= capacity:
            break
    else:
        raise ValueError("слишком длинная строка для QR-кода версий 1–10")

    bits = []

    def put(value, n):
        bits.extend((value >> i) & 1 for i in reversed(range(n)))

    put(0b0100, 4)  # байтовый режим
    put(len(data), count_bits)
    for byte in data:
        put(byte, 8)
    put(0, min(4, capacity - len(bits)))  # терминатор
    put(0, (-len(bits)) % 8)
    pad = 0xEC
    while len(bits) < capacity:
        put(pad, 8)
        pad ^= 0xEC ^ 0x11
    codewords = [
        int("".join(str(b) for b in bits[i:i + 8]), 2) for i in range(0, len(bits), 8)
    ]

    # Коды Рида — Соломона по блокам и чередование.
    num_blocks = _NUM_BLOCKS[ver]
    ecc_len = _ECC_PER_BLOCK[ver]
    raw = _raw_modules(ver) // 8
    num_short = num_blocks - raw % num_blocks
    short_len = raw // num_blocks
    divisor = _rs_divisor(ecc_len)
    blocks, k = [], 0
    for i in range(num_blocks):
        dat = codewords[k:k + short_len - ecc_len + (0 if i < num_short else 1)]
        k += len(dat)
        ecc = _rs_remainder(dat, divisor)
        if i < num_short:
            dat = dat + [0]
        blocks.append(dat + ecc)
    stream = []
    for i in range(len(blocks[0])):
        for j, blk in enumerate(blocks):
            if i != short_len - ecc_len or j >= num_short:
                stream.append(blk[i])

    # Служебные узоры.
    size = ver * 4 + 17
    mod = [[False] * size for _ in range(size)]
    fn = [[False] * size for _ in range(size)]

    def setf(x, y, dark):
        mod[y][x] = dark
        fn[y][x] = True

    for i in range(size):
        setf(6, i, i % 2 == 0)
        setf(i, 6, i % 2 == 0)
    for cx, cy in ((3, 3), (size - 4, 3), (3, size - 4)):
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                x, y = cx + dx, cy + dy
                if 0 <= x < size and 0 <= y < size:
                    setf(x, y, max(abs(dx), abs(dy)) not in (2, 4))
    pos = _alignment_positions(ver, size)
    last = len(pos) - 1
    for i, ax in enumerate(pos):
        for j, ay in enumerate(pos):
            if (i, j) in ((0, 0), (0, last), (last, 0)):
                continue
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    setf(ax + dx, ay + dy, max(abs(dx), abs(dy)) != 1)

    def draw_format(mask):
        d = _FORMAT_ECL_M << 3 | mask
        rem = d
        for _ in range(10):
            rem = (rem << 1) ^ ((rem >> 9) * 0x537)
        v = (d << 10 | rem) ^ 0x5412
        bit = lambda i: (v >> i) & 1 == 1
        for i in range(6):
            setf(8, i, bit(i))
        setf(8, 7, bit(6))
        setf(8, 8, bit(7))
        setf(7, 8, bit(8))
        for i in range(9, 15):
            setf(14 - i, 8, bit(i))
        for i in range(8):
            setf(size - 1 - i, 8, bit(i))
        for i in range(8, 15):
            setf(8, size - 15 + i, bit(i))
        setf(8, size - 8, True)  # всегда тёмный модуль

    draw_format(0)  # резервирует место; настоящие биты — после выбора маски
    if ver >= 7:
        rem = ver
        for _ in range(12):
            rem = (rem << 1) ^ ((rem >> 11) * 0x1F25)
        v = ver << 12 | rem
        for i in range(18):
            dark = (v >> i) & 1 == 1
            a, b = size - 11 + i % 3, i // 3
            setf(a, b, dark)
            setf(b, a, dark)

    # Укладка данных зигзагом снизу справа.
    i = 0
    total_bits = len(stream) * 8
    right = size - 1
    while right >= 1:
        if right == 6:
            right = 5
        for vert in range(size):
            for j in range(2):
                x = right - j
                upward = ((right + 1) & 2) == 0
                y = size - 1 - vert if upward else vert
                if not fn[y][x] and i < total_bits:
                    mod[y][x] = (stream[i >> 3] >> (7 - (i & 7))) & 1 == 1
                    i += 1
        right -= 2

    # Маска с наименьшим штрафом.
    def masked(mask):
        f = _MASKS[mask]
        return [
            [mod[y][x] ^ (not fn[y][x] and f(x, y)) for x in range(size)]
            for y in range(size)
        ]

    best, best_score = 0, None
    for mask in range(8):
        draw_format(mask)
        score = _penalty(masked(mask))
        if best_score is None or score < best_score:
            best, best_score = mask, score
    draw_format(best)
    return masked(best)


def qr_svg(text, border=4):
    m = qr_matrix(text)
    n = len(m)
    path = "".join(
        f"M{x + border},{y + border}h1v1h-1z"
        for y in range(n) for x in range(n) if m[y][x]
    )
    s = n + 2 * border
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" '
        f'shape-rendering="crispEdges" role="img" aria-label="QR-код">'
        f'<rect width="{s}" height="{s}" fill="#fff"/>'
        f'<path d="{path}" fill="#000"/></svg>'
    )


def qr_terminal(text, border=2):
    """QR-код полублоками. Цвета заданы явно — чёрное на белом, — чтобы
    код читался и в тёмном, и в светлом окне терминала."""
    m = qr_matrix(text)
    n = len(m)

    def dark(x, y):
        return 0 <= x < n and 0 <= y < n and m[y][x]

    out = []
    for y in range(-border, n + border, 2):
        row = []
        for x in range(-border, n + border):
            t, b = dark(x, y), dark(x, y + 1)
            row.append("█" if t and b else "▀" if t else "▄" if b else " ")
        out.append("\x1b[30;107m" + "".join(row) + "\x1b[0m")
    return "\n".join(out)


# ════════════════════════════════════════════════════════════════
# СЕТЬ
# ════════════════════════════════════════════════════════════════

def _is_private(ip):
    if ip.startswith(("10.", "192.168.")):
        return True
    if ip.startswith("172."):
        try:
            return 16 <= int(ip.split(".")[1]) <= 31
        except ValueError:
            return False
    return False


def lan_addresses():
    """Адреса компьютера в локальной сети, лучший — первым.

    Первым идёт адрес интерфейса, через который уходит маршрут наружу:
    `connect` у UDP-сокета пакетов не шлёт, а только выбирает маршрут."""
    found = []
    for probe in ("8.8.8.8", "10.255.255.255", "192.168.255.255"):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect((probe, 1))
            ip = s.getsockname()[0]
            s.close()
            if ip not in found:
                found.append(ip)
            break
        except OSError:
            continue
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip = info[4][0]
            if ip not in found:
                found.append(ip)
    except OSError:
        pass
    found = [ip for ip in found if not ip.startswith(("127.", "169.254.", "0."))]
    first = found[:1]
    rest = sorted(found[1:], key=lambda ip: not _is_private(ip))
    return first + rest


def copy_to_clipboard(text):
    if sys.platform == "win32":
        commands = [["clip"]]
    elif sys.platform == "darwin":
        commands = [["pbcopy"]]
    else:
        commands = [["wl-copy"], ["xclip", "-selection", "clipboard"], ["xsel", "--clipboard", "--input"]]
    for cmd in commands:
        try:
            subprocess.run(cmd, input=text.encode("utf-8"), check=True, timeout=3,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return True
        except (OSError, subprocess.SubprocessError):
            continue
    return False


def already_running(port):
    """Если на порту уже наш сервер — повторный запуск просто откроет его."""
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/__ping", timeout=1) as r:
            return r.read().decode("utf-8", "replace").strip() == SIGNATURE
    except Exception:
        return False


# ════════════════════════════════════════════════════════════════
# СТРАНИЦА-МЕНЮ
# ════════════════════════════════════════════════════════════════

PAGE_CSS = """
*{box-sizing:border-box}
/* Без !important правило .card{display:flex} перебивает атрибут hidden,
   и видны все карточки разом, а не выбранная. */
[hidden]{display:none!important}
:root{--bg:#0a0b10;--card:#14151d;--line:#262838;--text:#eceef4;--muted:#8b90a6;--accent:#8b7cf6;--ok:#4ade80}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  padding:24px 16px calc(24px + env(safe-area-inset-bottom,0px))}
main{max-width:760px;margin:0 auto}
h1{font-size:22px;margin:0 0 4px}
.sub{color:var(--muted);margin:0 0 20px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.tab{background:var(--card);border:1px solid var(--line);color:var(--muted);border-radius:8px;padding:8px 14px;font:inherit;cursor:pointer}
.tab.on{color:var(--text);border-color:var(--accent);background:#1e1b33}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;display:flex;gap:24px;flex-wrap:wrap;align-items:center}
.qr{width:240px;max-width:100%;aspect-ratio:1;border-radius:10px;overflow:hidden;flex:0 0 auto;background:#fff}
.qr svg{display:block;width:100%;height:100%}
.info{flex:1 1 260px;min-width:0}
.info h2{margin:0 0 6px;font-size:18px}
.link{display:block;font:14px/1.4 ui-monospace,Consolas,monospace;background:#0d0e14;border:1px solid var(--line);
  border-radius:8px;padding:10px 12px;color:var(--text);word-break:break-all;margin:10px 0;user-select:all}
.row{display:flex;gap:8px;flex-wrap:wrap}
.btn{background:var(--accent);color:#fff;border:0;border-radius:8px;padding:10px 18px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block}
.btn.ghost{background:transparent;color:var(--muted);border:1px solid var(--line);font-weight:400}
.note{color:var(--muted);font-size:13px;margin-top:10px}
.ok{color:var(--ok);font-size:13px;min-height:1.5em;margin-top:6px}
details{margin-top:20px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 16px}
summary{cursor:pointer;color:var(--muted)}
details li{margin:6px 0}
details code{font-family:ui-monospace,Consolas,monospace;background:#0d0e14;padding:1px 6px;border-radius:4px}
.stop{margin-top:20px;text-align:center}
.big{display:block;text-decoration:none;color:var(--text);background:var(--card);border:1px solid var(--line);
  border-radius:14px;padding:18px 20px;margin-bottom:12px;font-size:18px;font-weight:600}
.big small{display:block;color:var(--muted);font-weight:400;font-size:13px;margin-top:2px}
"""


def _targets():
    return [t for t in TARGETS if os.path.isfile(os.path.join(ROOT, t[2]))]


def page_desktop(port, ips, copied):
    ip = ips[0] if ips else None
    targets = _targets()
    if not ip:
        body = (
            "<h1>Адрес в сети не найден</h1>"
            "<p class='sub'>Компьютер, похоже, не подключён к сети. Подключитесь к Wi-Fi "
            "и запустите сервер заново.</p>"
        )
        return _wrap("Таксономии", body)

    tabs, cards = [], []
    for i, (key, title, rel, note) in enumerate(targets):
        url = f"http://{ip}:{port}/{rel}"
        on = " on" if i == 0 else ""
        tabs.append(f'<button class="tab{on}" data-k="{key}">{html.escape(title)}</button>')
        cards.append(
            f'<div class="card" data-k="{key}"{"" if i == 0 else " hidden"}>'
            f'<div class="qr">{qr_svg(url)}</div>'
            f'<div class="info"><h2>{html.escape(title)}</h2>'
            f'Наведите камеру телефона на QR-код — или скопируйте ссылку и отправьте себе.'
            f'<code class="link">{html.escape(url)}</code>'
            f'<div class="row"><button class="btn" data-copy="{html.escape(url)}">Копировать ссылку</button>'
            f'<a class="btn ghost" href="/{rel}" target="_blank">Открыть здесь</a></div>'
            f'<div class="ok"></div>'
            + (f'<div class="note">{html.escape(note)}</div>' if note else "")
            + "</div></div>"
        )

    alt = ""
    if len(ips) > 1:
        items = "".join(
            f"<li><code>http://{html.escape(a)}:{port}/</code></li>" for a in ips[1:]
        )
        alt = f"<li>У компьютера несколько адресов. Если основной не открывается, попробуйте другие:<ul>{items}</ul></li>"

    copied_line = (
        '<p class="ok">Ссылка на Атлас уже скопирована в буфер обмена.</p>' if copied else ""
    )
    body = f"""
<h1>Открыть на телефоне</h1>
<p class="sub">Сервер работает. Телефон должен быть в той же сети Wi-Fi, что и этот компьютер.</p>
{copied_line}
<div class="tabs">{''.join(tabs)}</div>
{''.join(cards)}
<details>
<summary>Телефон не открывает ссылку</summary>
<ul>
<li><b>Windows при первом запуске спросит разрешение для Python</b> в брандмауэре.
Нужно разрешить — иначе телефон не достучится.</li>
<li>Сеть в Windows должна быть <b>«Частной»</b>, а не «Общедоступной»: Параметры → Сеть и Интернет → свойства сети.
В общедоступной сети входящие подключения закрыты.</li>
<li>Гостевая сеть роутера часто изолирует устройства друг от друга. Подключите оба к основной.</li>
<li>Если на компьютере включён VPN, адрес может оказаться не тем. Выключите VPN или попробуйте другой адрес ниже.</li>
{alt}
<li>Адрес компьютера в сети может смениться после перезагрузки роутера — тогда просто запустите сервер снова,
QR-код будет новый.</li>
</ul>
</details>
<div class="stop"><button class="btn ghost" id="stop">Остановить сервер</button></div>
<script>
document.querySelectorAll('.tab').forEach(function(t){{
  t.onclick=function(){{
    document.querySelectorAll('.tab').forEach(function(x){{x.classList.toggle('on',x===t)}});
    document.querySelectorAll('.card').forEach(function(c){{c.hidden=c.dataset.k!==t.dataset.k}});
  }};
}});
function done(btn,ok){{
  var s=btn.closest('.info').querySelector('.ok');
  s.textContent=ok?'Скопировано.':'Не удалось — выделите ссылку и скопируйте вручную.';
}}
document.querySelectorAll('[data-copy]').forEach(function(b){{
  b.onclick=function(){{
    var t=b.dataset.copy;
    if(navigator.clipboard&&window.isSecureContext){{
      navigator.clipboard.writeText(t).then(function(){{done(b,true)}},function(){{fallback()}});
    }} else fallback();
    function fallback(){{
      var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();
      var ok=false;try{{ok=document.execCommand('copy')}}catch(e){{}}ta.remove();done(b,ok);
    }}
  }};
}});
document.getElementById('stop').onclick=function(){{
  fetch('/__stop',{{method:'POST'}}).then(function(){{
    document.body.innerHTML='<main><h1>Сервер остановлен</h1><p class="sub">Окно можно закрыть. Чтобы запустить снова — ещё раз «Запустить».</p></main>';
  }});
}};
</script>"""
    return _wrap("Открыть на телефоне", body)


def page_phone():
    links = "".join(
        f'<a class="big" href="/{rel}">{html.escape(title)}'
        + (f"<small>{html.escape(note)}</small>" if note else "")
        + "</a>"
        for _, title, rel, note in _targets()
    )
    body = (
        "<h1>Таксономии</h1>"
        "<p class='sub'>Страницу можно добавить на экран «Домой» — но открываться она будет, "
        "только пока на компьютере работает сервер.</p>" + links
    )
    return _wrap("Таксономии", body)


def _wrap(title, body):
    return (
        "<!doctype html><html lang='ru'><head><meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'>"
        # Своя иконка прямо в странице — иначе браузер просит /favicon.ico
        # и получает 404 в консоль.
        "<link rel='icon' href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' "
        "viewBox='0 0 100 100'><text y='.9em' font-size='90'>📱</text></svg>\">"
        f"<title>{html.escape(title)}</title><style>{PAGE_CSS}</style></head>"
        f"<body><main>{body}</main></body></html>"
    )


# ════════════════════════════════════════════════════════════════
# СЕРВЕР
# ════════════════════════════════════════════════════════════════

# Сжимаемые типы. data.js Атласа весит больше 9 МБ; сжатый — в разы
# меньше, и на телефоне по Wi-Fi это ощутимо.
GZIP_EXT = {".js", ".html", ".json", ".css", ".svg", ".webmanifest", ".txt"}
TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json",
    ".txt": "text/plain; charset=utf-8",
}


class Handler(SimpleHTTPRequestHandler):
    server_version = "cla-taxonomy/1"
    state = {}
    _gz_cache = {}
    _gz_lock = threading.Lock()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # Явные типы: на Windows mimetypes берёт их из реестра, где .js
    # бывает записан как text/plain.
    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return TYPES.get(ext) or mimetypes.guess_type(path)[0] or "application/octet-stream"

    # Телефон не должен держать в кеше старый data.js после пересборки.
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass

    def _local(self):
        return self.client_address[0] in ("127.0.0.1", "::1", "::ffff:127.0.0.1")

    def _send(self, code, body, ctype="text/html; charset=utf-8"):
        data = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/__ping":
            return self._send(200, SIGNATURE, "text/plain; charset=utf-8")
        if path in ("/", "/index.html"):
            host = (self.headers.get("Host") or "").split(":")[0]
            if host in ("127.0.0.1", "localhost", "[::1]"):
                s = self.state
                return self._send(200, page_desktop(s["port"], s["ips"], s["copied"]))
            return self._send(200, page_phone())
        if self._gzip():
            return
        return super().do_GET()

    def do_POST(self):
        if urlsplit(self.path).path == "/__stop" and self._local():
            self._send(200, "ok", "text/plain; charset=utf-8")
            threading.Thread(target=self.server.shutdown, daemon=True).start()
            return
        self._send(404, "not found", "text/plain; charset=utf-8")

    def _gzip(self):
        if "gzip" not in (self.headers.get("Accept-Encoding") or ""):
            return False
        fs_path = self.translate_path(self.path)
        if os.path.splitext(fs_path)[1].lower() not in GZIP_EXT or not os.path.isfile(fs_path):
            return False
        mtime = os.stat(fs_path).st_mtime_ns
        with self._gz_lock:
            hit = self._gz_cache.get(fs_path)
        if not hit or hit[0] != mtime:
            with open(fs_path, "rb") as f:
                hit = (mtime, gzip.compress(f.read(), 6))
            with self._gz_lock:
                self._gz_cache[fs_path] = hit
        body = hit[1]
        self.send_response(200)
        self.send_header("Content-Type", self.guess_type(fs_path))
        self.send_header("Content-Encoding", "gzip")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Vary", "Accept-Encoding")
        self.end_headers()
        self.wfile.write(body)
        return True


def main():
    if sys.version_info < (3, 7):
        print("Нужен Python 3.7 или новее.")
        sys.exit(1)

    ap = argparse.ArgumentParser(description="Сервер таксономий для телефона")
    ap.add_argument("--port", type=int, default=8080)
    ap.add_argument("--no-browser", action="store_true")
    ap.add_argument("--no-clipboard", action="store_true")
    args = ap.parse_args()

    if sys.platform == "win32":
        os.system("")  # включает цветной вывод в консоли Windows 10+

    # Повторный запуск не плодит серверы: если наш уже работает —
    # просто открываем его страницу.
    if already_running(args.port):
        print(f"Сервер уже запущен: http://127.0.0.1:{args.port}/")
        if not args.no_browser:
            webbrowser.open(f"http://127.0.0.1:{args.port}/")
        return

    server = None
    for port in [args.port] + [p for p in (8000, 8888, 8765, 0) if p != args.port]:
        try:
            server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
            break
        except OSError as e:
            if e.errno not in (errno.EADDRINUSE, getattr(errno, "WSAEADDRINUSE", -1), 10048, 10013):
                raise
    if server is None:
        print("Не удалось занять ни один порт.")
        sys.exit(1)
    port = server.server_address[1]

    ips = lan_addresses()
    targets = _targets()
    atlas_url = None
    if ips and targets:
        atlas_url = f"http://{ips[0]}:{port}/{targets[0][2]}"
    copied = bool(atlas_url) and not args.no_clipboard and copy_to_clipboard(atlas_url)
    Handler.state = {"port": port, "ips": ips, "copied": copied}

    local = f"http://127.0.0.1:{port}/"
    line = "─" * 60
    print(line)
    print("  Сервер таксономий запущен")
    print(line)
    if atlas_url:
        print(f"\n  Атлас для телефона:\n    {atlas_url}")
        if copied:
            print("    (уже скопирована в буфер обмена)")
        print(f"\n  Меню всех таксономий на телефоне:\n    http://{ips[0]}:{port}/\n")
        try:
            print(qr_terminal(atlas_url))
        except Exception:
            pass
        print("\n  Наведите камеру телефона на QR-код.")
        print("  Телефон должен быть в той же сети Wi-Fi.")
    else:
        print("\n  Адрес в локальной сети не найден — подключитесь к Wi-Fi.")
    print(f"\n  Страница с QR-кодом и кнопкой «Копировать»: {local}")
    print("  Остановить — закрыть это окно или Ctrl+C.")
    print(line, flush=True)

    if not args.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(local)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("\nСервер остановлен.")


if __name__ == "__main__":
    main()
