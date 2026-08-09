#Requires -Version 5.1
<#
.SYNOPSIS
    Раскладывает песни по папкам радиостанций (Hearts of Iron IV / Paradox music mods).

.DESCRIPTION
    Скрипт смотрит в папку, где он сам лежит, и ищет в ней ЛЮБЫЕ .txt-файлы,
    внутри которых есть строка вида:

        music_station = "radio_beijing"

    и блоки песен вида:

        music = {
            song = "di_er_meng"
            ...
        }

    Имя файла при этом не важно (0_radio_beijing.txt, my_station.txt — всё равно),
    станция определяется по содержимому.

    Для каждой найденной станции создаётся папка с её именем, и в неё
    КОПИРУЮТСЯ (оригиналы остаются на месте!) соответствующие аудиофайлы.
    Если песня встречается в нескольких станциях — она попадёт в каждую папку.

    Песня ищется среди файлов в три захода:
        1. по .asset-файлам мода (там задана связь name -> file);
        2. по точному имени файла (регистр не важен);
        3. по «упрощённому» имени: снимается диакритика и приводятся к одному
           виду разделители, поэтому song = "di_er_meng" находит файл
           Dì_èr_mèng.ogg, а "ai_ni_sanbai_liushi_nian" —
           Ài_nǐ_sānbǎi_liùshí_nian.ogg.

.PARAMETER Path
    Папка с музыкой. По умолчанию — папка, где лежит сам скрипт.

.PARAMETER Extensions
    Какие расширения считать аудиофайлами.

.PARAMETER DryRun
    Ничего не создавать и не копировать — только показать, что было бы сделано.

.PARAMETER Force
    Перезаписывать файлы, которые уже скопированы в папку станции.

.PARAMETER Exact
    Искать только точные совпадения имён (без упрощённых имён и .asset).

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
    [switch]$Force,
    [switch]$Exact
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }
try { [System.Text.Encoding]::RegisterProvider([System.Text.CodePagesEncodingProvider]::Instance) } catch { }

# --- вспомогательное ---------------------------------------------------------

# Файлы Paradox обычно UTF-8, но встречается и windows-1252.
$script:Fallback = $null
foreach ($cp in 1252, 'ISO-8859-1') {
    try { $script:Fallback = [System.Text.Encoding]::GetEncoding($cp); break } catch { }
}

function Read-ModText([string]$FilePath) {
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        return [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
    }
    try {
        $strict = New-Object System.Text.UTF8Encoding($false, $true)
        return $strict.GetString($bytes)
    } catch {
        if ($script:Fallback) { return $script:Fallback.GetString($bytes) }
        return [System.Text.Encoding]::UTF8.GetString($bytes)
    }
}

# то, что NFKD не раскладывает сам
$script:Special = [ordered]@{ 'ß' = 'ss'; 'ø' = 'o'; 'æ' = 'ae'; 'œ' = 'oe'; 'đ' = 'd'; 'ł' = 'l'; 'þ' = 'th'; 'ð' = 'd' }

function Get-NormKey([string]$Name) {
    # «Упрощённое» имя: Dì_èr_mèng -> di_er_meng, Ài_nǐ... -> ai_ni...
    # Иероглифы/кириллица не трогаются, чтобы разные имена не слиплись в одно.
    if ([string]::IsNullOrWhiteSpace($Name)) { return '' }
    $s = $Name.ToLowerInvariant()
    foreach ($pair in $script:Special.GetEnumerator()) { $s = $s.Replace($pair.Key, $pair.Value) }
    $s = $s.Normalize([System.Text.NormalizationForm]::FormKD)
    $sb = New-Object System.Text.StringBuilder
    foreach ($ch in $s.ToCharArray()) {
        if ([System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$sb.Append($ch)
        }
    }
    $s = [regex]::Replace($sb.ToString(), '[^\w]+', '_')
    return ([regex]::Replace($s, '_+', '_')).Trim('_')
}

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

$byName = @{}   # полное имя файла  -> файл
$byStem = @{}   # имя без расширения -> файл
$byNorm = @{}   # упрощённое имя     -> файл
$ambiguous = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
$audioFiles = New-Object System.Collections.Generic.List[object]

foreach ($f in Get-ChildItem -LiteralPath $root -File) {
    if (-not $exts.ContainsKey($f.Extension.ToLowerInvariant())) { continue }
    $audioFiles.Add($f)
    if (-not $byName.ContainsKey($f.Name))     { $byName[$f.Name] = $f }
    if (-not $byStem.ContainsKey($f.BaseName)) { $byStem[$f.BaseName] = $f }
    $key = Get-NormKey $f.BaseName
    if (-not $key) { continue }
    if ($byNorm.ContainsKey($key)) {
        if ($byNorm[$key].FullName -ne $f.FullName) { [void]$ambiguous.Add($key) }
    } else {
        $byNorm[$key] = $f
    }
}

# --- связки name -> file из .asset-файлов мода -------------------------------
$reBlock = [regex]'\{([^{}]*)\}'
$reName  = [regex]'(?<![\w])name[ \t]*=[ \t]*"([^"]+)"'
$reFile  = [regex]'(?<![\w])file[ \t]*=[ \t]*"([^"]+)"'
$reComment = [regex]'(?m)#.*$'

$assets = @{}
foreach ($a in Get-ChildItem -LiteralPath $root -File -Filter *.asset) {
    try { $text = $reComment.Replace((Read-ModText $a.FullName), '') } catch { continue }
    foreach ($b in $reBlock.Matches($text)) {
        $n = $reName.Match($b.Groups[1].Value)
        $fl = $reFile.Match($b.Groups[1].Value)
        if ($n.Success -and $fl.Success) {
            $k = Get-NormKey $n.Groups[1].Value
            if ($k -and -not $assets.ContainsKey($k)) { $assets[$k] = $fl.Groups[1].Value }
        }
    }
}

$msg = "Найдено аудиофайлов: {0}" -f $audioFiles.Count
if ($assets.Count) { $msg += ", связок в .asset: {0}" -f $assets.Count }
Write-Host $msg

function Find-SongFile([string]$Song) {
    if ($Exact) {
        $hit = $byStem[$Song]
        if ($hit) { return [pscustomobject]@{ File = $hit; How = 'exact' } }
        return $null
    }

    $key = Get-NormKey $Song

    $assetFile = $assets[$key]
    if ($assetFile) {
        $hit = $byName[$assetFile]
        if (-not $hit) { $hit = $byStem[[System.IO.Path]::GetFileNameWithoutExtension($assetFile)] }
        if (-not $hit) { $hit = $byNorm[(Get-NormKey ([System.IO.Path]::GetFileNameWithoutExtension($assetFile)))] }
        if ($hit) { return [pscustomobject]@{ File = $hit; How = 'asset' } }
    }

    $hit = $byStem[$Song]
    if ($hit) { return [pscustomobject]@{ File = $hit; How = 'exact' } }

    if ($key -and -not $ambiguous.Contains($key)) {
        $hit = $byNorm[$key]
        if ($hit) { return [pscustomobject]@{ File = $hit; How = 'norm' } }
    }
    return $null
}

function Get-Suggestions([string]$Song) {
    # похожие имена файлов — подсказка для отчёта
    $key = Get-NormKey $Song
    if (-not $key) { return @() }
    $hits = foreach ($k in $byNorm.Keys) {
        if ($k -ne $key -and ($k.Contains($key) -or $key.Contains($k))) { $byNorm[$k].Name }
    }
    return @($hits | Sort-Object -Unique | Select-Object -First 3)
}

# --- ищем файлы станций ------------------------------------------------------
# без привязки к началу строки: music = { song = "..." } в одну строку тоже валидно
$reStation = [regex]'(?<![\w])music_station[ \t]*=[ \t]*"([^"]+)"'
$reSong    = [regex]'(?<![\w])song[ \t]*=[ \t]*"([^"]+)"'
$invalid   = [System.IO.Path]::GetInvalidFileNameChars()

$stations = @()
foreach ($txt in Get-ChildItem -LiteralPath $root -File -Filter *.txt) {
    try {
        $text = Read-ModText $txt.FullName
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
$fuzzy     = [ordered]@{}
$used      = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)

foreach ($st in $stations) {
    $dest = Join-Path $root $st.Name
    if (-not $DryRun -and -not (Test-Path -LiteralPath $dest)) {
        New-Item -ItemType Directory -Path $dest | Out-Null
    }

    $copied = 0; $skipped = 0
    $missing = New-Object System.Collections.Generic.List[string]

    foreach ($song in $st.Songs) {
        $found = Find-SongFile $song
        if (-not $found) { $missing.Add($song); continue }
        $src = $found.File
        [void]$used.Add($src.FullName)
        if ($found.How -ne 'exact' -and -not $fuzzy.Contains($song)) {
            $fuzzy[$song] = "{0}  ({1})" -f $src.Name, $found.How
        }

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
    foreach ($miss in $missing) {
        $hint = Get-Suggestions $miss
        if ($hint.Count) { $report.Add("        - $miss   (похожие файлы: $($hint -join ', '))") }
        else             { $report.Add("        - $miss") }
    }
    $report.Add("")
}

Write-Host ""
Write-Host ("ИТОГО: скопировано {0}, пропущено (уже были) {1}, не найдено файлов {2}" -f $copiedAll, $skipAll, $missAll) -ForegroundColor Cyan

if ($fuzzy.Count) {
    Write-Host ("Сопоставлено не по точному имени: {0} (список в отчёте — стоит проглядеть)" -f $fuzzy.Count) -ForegroundColor DarkGray
    $report.Add("[сопоставлено не по точному имени файла: $($fuzzy.Count)]")
    foreach ($k in ($fuzzy.Keys | Sort-Object)) { $report.Add("        $k  ->  $($fuzzy[$k])") }
    $report.Add("")
}

if ($ambiguous.Count) {
    $report.Add("[файлы с одинаковыми упрощёнными именами — сопоставлялись только точно: $($ambiguous.Count)]")
    foreach ($k in ($ambiguous | Sort-Object)) { $report.Add("        - $k") }
    $report.Add("")
}

# --- песни, не попавшие ни в одну станцию ------------------------------------
$orphans = @($audioFiles | Where-Object { -not $used.Contains($_.FullName) } | Sort-Object Name)
if ($orphans.Count) {
    Write-Host ("Аудиофайлов не упомянуто ни в одной станции: {0} (список в отчёте)" -f $orphans.Count) -ForegroundColor DarkGray
    $report.Add("[файлы, не попавшие ни в одну станцию: $($orphans.Count)]")
    foreach ($o in $orphans) { $report.Add("        - $($o.Name)") }
    $report.Add("")
}

if (-not $DryRun) {
    $reportPath = Join-Path $root '_sort_music_report.txt'
    Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
    Write-Host "Отчёт: $reportPath"
}
