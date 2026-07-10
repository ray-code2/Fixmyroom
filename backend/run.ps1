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

mvn spring-boot:run
