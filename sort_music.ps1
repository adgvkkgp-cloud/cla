#Requires -Version 5.1
<#
.SYNOPSIS
    Раскладывает песни по папкам радиостанций (Hearts of Iron IV / Paradox music mods).

.DESCRIPTION
    Скрипт смотрит в папку, где он сам лежит, и ищет в ней ЛЮБЫЕ .txt-файлы,
    внутри которых есть строка вида:

        music_station = "radio_madrid"

    и блоки песен вида:

        music = {
            song = "a_las_barricadas"
            ...
        }

    Имя файла при этом не важно (0_radio_madrid.txt, my_station.txt — всё равно),
    станция определяется по содержимому.

    Для каждой найденной станции создаётся папка с её именем, и в неё
    КОПИРУЮТСЯ (оригиналы остаются на месте!) соответствующие аудиофайлы.
    Если песня встречается в нескольких станциях — она попадёт в каждую папку.

.PARAMETER Path
    Папка с музыкой. По умолчанию — папка, где лежит сам скрипт.

.PARAMETER Extensions
    Какие расширения считать аудиофайлами.

.PARAMETER DryRun
    Ничего не создавать и не копировать — только показать, что было бы сделано.

.PARAMETER Force
    Перезаписывать файлы, которые уже скопированы в папку станции.

.EXAMPLE
    .\sort_music.ps1
    .\sort_music.ps1 -DryRun
    .\sort_music.ps1 -Path "D:\Steam\steamapps\workshop\content\394360\2213783261\music"
#>
[CmdletBinding()]
param(
    [string]$Path,
    [string[]]$Extensions = @('.ogg', '.wav', '.mp3', '.flac'),
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

# --- рабочая папка: та, где лежит скрипт -------------------------------------
if (-not $Path) {
    $Path = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
}
$root = (Resolve-Path -LiteralPath $Path).Path
Write-Host "Папка: $root" -ForegroundColor Cyan
if ($DryRun) { Write-Host "РЕЖИМ ПРОСМОТРА (-DryRun): ничего не будет создано и скопировано." -ForegroundColor Yellow }

# --- собираем аудиофайлы, лежащие прямо в этой папке -------------------------
$exts = @{}
foreach ($e in $Extensions) { $exts[$e.ToLowerInvariant()] = $true }

$audio = @{}   # имя без расширения -> объект файла (регистр не важен)
foreach ($f in Get-ChildItem -LiteralPath $root -File) {
    if ($exts.ContainsKey($f.Extension.ToLowerInvariant()) -and -not $audio.ContainsKey($f.BaseName)) {
        $audio[$f.BaseName] = $f
    }
}
Write-Host ("Найдено аудиофайлов: {0}" -f $audio.Count)

# --- ищем файлы станций ------------------------------------------------------
$reStation = [regex]'(?m)^[ \t]*music_station[ \t]*=[ \t]*"([^"]+)"'
$reSong    = [regex]'(?m)^[ \t]*song[ \t]*=[ \t]*"([^"]+)"'
$reComment = [regex]'(?m)#.*$'
$invalid   = [System.IO.Path]::GetInvalidFileNameChars()

$stations = @()
foreach ($txt in Get-ChildItem -LiteralPath $root -File -Filter *.txt) {
    try {
        $text = [System.IO.File]::ReadAllText($txt.FullName, [System.Text.Encoding]::UTF8)
    } catch {
        Write-Warning ("Не удалось прочитать {0}: {1}" -f $txt.Name, $_.Exception.Message)
        continue
    }
    $text = $reComment.Replace($text, '')          # выкидываем комментарии

    $m = $reStation.Match($text)
    if (-not $m.Success) { continue }              # это не файл станции — пропускаем

    $songs = New-Object System.Collections.Generic.List[string]
    $seen  = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
    foreach ($s in $reSong.Matches($text)) {
        $name = $s.Groups[1].Value.Trim()
        if ($name -and $seen.Add($name)) { $songs.Add($name) }
    }

    $folder = $m.Groups[1].Value.Trim()
    foreach ($c in $invalid) { $folder = $folder.Replace($c, '_') }

    $stations += [pscustomobject]@{
        File   = $txt.Name
        Name   = $folder
        Songs  = $songs
    }
}

if ($stations.Count -eq 0) {
    Write-Host "Файлы станций (с 'music_station = ...') рядом со скриптом не найдены." -ForegroundColor Red
    Write-Host "Положите скрипт в папку music и запустите ещё раз."
    return
}
Write-Host ("Найдено станций: {0}" -f $stations.Count)
Write-Host ""

# --- раскладываем ------------------------------------------------------------
$report    = New-Object System.Collections.Generic.List[string]
$copiedAll = 0; $skipAll = 0; $missAll = 0

foreach ($st in $stations) {
    $dest = Join-Path $root $st.Name
    if (-not $DryRun -and -not (Test-Path -LiteralPath $dest)) {
        New-Item -ItemType Directory -Path $dest | Out-Null
    }

    $copied = 0; $skipped = 0
    $missing = New-Object System.Collections.Generic.List[string]

    foreach ($song in $st.Songs) {
        $src = $audio[$song]
        if (-not $src) { $missing.Add($song); continue }

        $target = Join-Path $dest $src.Name
        if ((Test-Path -LiteralPath $target) -and -not $Force) { $skipped++; continue }
        if (-not $DryRun) { Copy-Item -LiteralPath $src.FullName -Destination $target -Force }
        $copied++
    }

    $copiedAll += $copied; $skipAll += $skipped; $missAll += $missing.Count

    $line = "{0,-24} песен: {1,4} | скопировано: {2,4} | уже было: {3,4} | нет файла: {4,4}" -f `
            $st.Name, $st.Songs.Count, $copied, $skipped, $missing.Count
    Write-Host $line -ForegroundColor $(if ($missing.Count) { 'Yellow' } else { 'Green' })

    $report.Add("[$($st.Name)]  (из $($st.File))")
    $report.Add("    песен в станции : $($st.Songs.Count)")
    $report.Add("    скопировано     : $copied")
    $report.Add("    уже было        : $skipped")
    $report.Add("    нет аудиофайла  : $($missing.Count)")
    foreach ($miss in $missing) { $report.Add("        - $miss") }
    $report.Add("")
}

Write-Host ""
Write-Host ("ИТОГО: скопировано {0}, пропущено (уже были) {1}, не найдено файлов {2}" -f $copiedAll, $skipAll, $missAll) -ForegroundColor Cyan

# --- песни, не попавшие ни в одну станцию ------------------------------------
$used = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($st in $stations) { foreach ($s in $st.Songs) { [void]$used.Add($s) } }
$orphans = @($audio.Keys | Where-Object { -not $used.Contains($_) } | Sort-Object)

if ($orphans.Count) {
    Write-Host ("Аудиофайлов не упомянуто ни в одной станции: {0} (список в отчёте)" -f $orphans.Count) -ForegroundColor DarkGray
    $report.Add("[файлы, не упомянутые ни в одной станции: $($orphans.Count)]")
    foreach ($o in $orphans) { $report.Add("        - $o") }
    $report.Add("")
}

if (-not $DryRun) {
    $reportPath = Join-Path $root '_sort_music_report.txt'
    Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
    Write-Host "Отчёт: $reportPath"
}
