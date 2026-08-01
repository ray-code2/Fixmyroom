# Loads .env into the process environment, then runs the Spring Boot app.
# Needed because `mvn spring-boot:run` does not read .env on its own.

$envFile = Join-Path $PSScriptRoot '.env'

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    if ($line -notmatch '^[A-Za-z_][A-Za-z0-9_]*=') { return }

    $idx = $line.IndexOf('=')
    $key = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1)
    $value = ($value -replace '\s+#.*$', '').Trim().Trim('"').Trim("'")

    [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
}

# Resolve Maven command (mvnw.cmd in backend dir -> system PATH `mvn` -> IntelliJ/IDE bundled `mvn.cmd`)
$mvnCmd = $null

$mvnwPath = Join-Path $PSScriptRoot 'mvnw.cmd'
if (Test-Path $mvnwPath) {
    $mvnCmd = $mvnwPath
} elseif (Get-Command 'mvn' -ErrorAction SilentlyContinue) {
    $mvnCmd = 'mvn'
} else {
    $ideMvn = Get-ChildItem -Path "C:\Program Files\JetBrains" -Filter "mvn.cmd" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    if ($ideMvn -and (Test-Path $ideMvn)) {
        $mvnCmd = $ideMvn
    }
}

if (-not $mvnCmd) {
    Write-Error "Maven could not be found. Please install Maven, add it to your PATH, or run via IntelliJ / VS Code."
    exit 1
}

& $mvnCmd spring-boot:run
