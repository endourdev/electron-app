@echo off
setlocal enabledelayedexpansion

set DIST_DIR=dist
set CHECK_FILE=.last_hash

echo 🔍 Surveillance du dossier "%DIST_DIR%"...

:loop
REM Crée une signature du dossier
powershell -command ^
 "Get-ChildItem %DIST_DIR% -Recurse | Get-FileHash | ForEach-Object { $_.Hash } | Out-String | Get-FileHash | Select -ExpandProperty Hash" > current_hash.txt

IF NOT EXIST %CHECK_FILE% (
    copy current_hash.txt %CHECK_FILE% >nul
    goto wait
)

fc %CHECK_FILE% current_hash.txt >nul
IF %ERRORLEVEL% EQU 0 goto wait

echo 🚀 Changement détecté !

copy current_hash.txt %CHECK_FILE% >nul

REM Renommage des fichiers (espaces → -)
for %%F in ("%DIST_DIR%\*.*") do (
    set "OLD=%%~nxF"
    set "NEW=!OLD: =-!"
    if not "!OLD!"=="!NEW!" (
        ren "%%F" "!NEW!"
        echo 🔁 Renommé: !OLD! → !NEW!
    )
)

REM Récupération de la version depuis le premier EXE
set VERSION=0.0.0
for %%F in ("%DIST_DIR%\*.exe") do (
    set FILE=%%~nxF
    goto extract_version
)

:extract_version
REM Exemple: Electron-App-Setup-0.0.1.exe → 0.0.1
for %%A in (%FILE%) do set NAME=%%~nA
for %%A in (%NAME:-= %) do set VERSION=%%A

echo 📦 Version détectée: %VERSION%

REM Création de la release GitHub avec tous les fichiers
gh release create v%VERSION% "%DIST_DIR%\*" ^
 --title "Release v%VERSION%" ^
 --notes "Build automatique depuis dist"

echo ✅ Release v%VERSION% créée !

:wait
timeout /t 5 >nul
goto loop