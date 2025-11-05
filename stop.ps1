Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deteniendo servicios...            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker Compose está disponible
$useDockerCompose = $true
try {
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        $useDockerCompose = $false
    }
} catch {
    $useDockerCompose = $false
}

if ($useDockerCompose) {
    docker-compose down
} else {
    docker compose down
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Servicios detenidos correctamente." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Error al detener los servicios." -ForegroundColor Red
    Write-Host ""
    exit 1
}

