Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = Join-Path (Get-Location) "relisys.blueprint"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

$files = @(
    "conf.yml",
    "LICENSE",
    "admin/admin.style.css",
    "admin/view.blade.php",
    "admin/wrapper.blade.php",
    "assets/icon.svg",
    "assets/icon.jpg",
    "assets/reliSYS_R_logo.svg",
    "client/client.style.css",
    "client/wrapper.blade.php",
    "public/theme-engine.js",
    "public/sidebar.js",
    "public/ui.js",
    "public/charts.js"
)

foreach ($f in $files) {
    $localPath = $f -replace "/", "\"
    if (Test-Path $localPath) {
        $resolved = (Resolve-Path $localPath).Path
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $resolved, $f, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        Write-Host "Added $f"
    } else {
        Write-Warning "Missing: $localPath"
    }
}

$zip.Dispose()
Write-Host "relisys.blueprint created successfully."
