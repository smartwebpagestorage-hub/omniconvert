# OmniConvert Studio - Windows 10 & 11 Desktop Application Installer
# Created by Niraj Kumar, Section Supervisor, RO, Faridabad

$ErrorActionPreference = "Stop"

$sourceDir = $PSScriptRoot
if (-not $sourceDir) { $sourceDir = (Get-Location).Path }

$localAppData = [System.Environment]::GetFolderPath('LocalApplicationData')
$installDir = Join-Path $localAppData "Programs\OmniConvert"

# Permanently copy all files to PC if running from external drive / pen drive
if ($sourceDir.TrimEnd('\') -ne $installDir.TrimEnd('\')) {
    Write-Host "Installing OmniConvert Studio to permanent location: $installDir ..." -ForegroundColor Cyan
    robocopy $sourceDir $installDir /MIR /XD .git node_modules .gemini /XF OmniConvert-Setup.exe /R:1 /W:1 | Out-Null
}

$installedExe = Join-Path $installDir "OmniConvert.exe"
$iconPath = Join-Path $installDir "assets\icon.ico"

# Create Shortcuts pointing to the permanent PC location
$wsh = New-Object -ComObject WScript.Shell

$shortcutPaths = @(
    [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'OmniConvert Studio.lnk'),
    [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Programs'), 'OmniConvert Studio.lnk')
)

foreach ($scPath in $shortcutPaths) {
    $shortcut = $wsh.CreateShortcut($scPath)
    $shortcut.TargetPath = $installedExe
    $shortcut.WorkingDirectory = $installDir
    $shortcut.Description = "OmniConvert Studio - Developed by Niraj Kumar, Section Supervisor, RO, Faridabad"
    if (Test-Path $iconPath) {
        $shortcut.IconLocation = "$iconPath,0"
    }
    $shortcut.Save()
    Write-Host "Created shortcut: $scPath" -ForegroundColor Green
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  OmniConvert Studio is successfully installed!" -ForegroundColor Green
Write-Host "  Files permanently copied to: $installDir" -ForegroundColor White
Write-Host "  You can now SAFELY REMOVE your Pen Drive!" -ForegroundColor Yellow
Write-Host "  Desktop and Start Menu shortcuts created." -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Cyan
