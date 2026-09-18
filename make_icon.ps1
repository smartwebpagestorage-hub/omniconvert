Add-Type -AssemblyName System.Drawing
$size = 128
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Background brush
$rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(79, 70, 229)), ([System.Drawing.Color]::FromArgb(219, 39, 119)), 45.0
$g.FillEllipse($brush, 4, 4, ($size - 8), ($size - 8))

# Pen for symbol
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), 7.0
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

# Draw converter arrows
$g.DrawLine($pen, 36, 48, 92, 48)
$g.DrawLine($pen, 76, 32, 92, 48)
$g.DrawLine($pen, 76, 64, 92, 48)

$g.DrawLine($pen, 92, 80, 36, 80)
$g.DrawLine($pen, 52, 64, 36, 80)
$g.DrawLine($pen, 52, 96, 36, 80)

$assetsPath = "C:\Users\hp\.gemini\antigravity-ide\scratch\omni-converter\assets"
$bmp.Save("$assetsPath\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fileStream = New-Object System.IO.FileStream "$assetsPath\icon.ico", 'Create'
$icon.Save($fileStream)
$fileStream.Close()

$g.Dispose()
$bmp.Dispose()
Write-Output 'Generated icon.png and icon.ico successfully!'
