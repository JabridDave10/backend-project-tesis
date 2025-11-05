Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend Tesis Grado - Iniciando...  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Host "Docker detectado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR: Docker no esta instalado      " -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala Docker Desktop desde:" -ForegroundColor Yellow
    Write-Host "  https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Verificar si Docker Compose está disponible
$useDockerCompose = $true
try {
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker Compose detectado: $composeVersion" -ForegroundColor Green
    } else {
        $useDockerCompose = $false
        Write-Host "Docker Compose no encontrado, usando 'docker compose'..." -ForegroundColor Yellow
    }
} catch {
    $useDockerCompose = $false
    Write-Host "Docker Compose no encontrado, usando 'docker compose'..." -ForegroundColor Yellow
}

Write-Host ""

# Detener contenedores previos
Write-Host "Deteniendo contenedores previos..." -ForegroundColor Yellow
if ($useDockerCompose) {
    docker-compose down 2>&1 | Out-Null
} else {
    docker compose down 2>&1 | Out-Null
}

Write-Host ""

# Iniciar servicios con Docker Compose
Write-Host "Iniciando servicios con hot reload..." -ForegroundColor Yellow
Write-Host ""

if ($useDockerCompose) {
    docker-compose up --build -d
} else {
    docker compose up --build -d
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Servicios iniciados correctamente    " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Servicios disponibles:" -ForegroundColor Green
    Write-Host "  API:      http://localhost:3000" -ForegroundColor White
    Write-Host "  Swagger:  http://localhost:3000/api" -ForegroundColor White
    Write-Host "  pgAdmin:  http://localhost:5050 (admin@admin.com / admin)" -ForegroundColor White
    Write-Host ""
    Write-Host "Hot reload activado - Los cambios se aplicaran automaticamente" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para ver los logs del servidor:" -ForegroundColor Yellow
    Write-Host "  docker compose logs -f app" -ForegroundColor White
    Write-Host ""
    Write-Host "Para detener los servicios:" -ForegroundColor Yellow
    Write-Host "  docker compose down" -ForegroundColor White
    Write-Host ""
    
    # Mostrar logs del contenedor de la app
    Write-Host "Mostrando logs del servidor..." -ForegroundColor Cyan
    Write-Host ""
    if ($useDockerCompose) {
        docker-compose logs -f app
    } else {
        docker compose logs -f app
    }
} else {
    Write-Host ""
    Write-Host "Error al iniciar los servicios." -ForegroundColor Red
    Write-Host ""
    Write-Host "Para ver los logs de error:" -ForegroundColor Yellow
    if ($useDockerCompose) {
        Write-Host "  docker-compose logs" -ForegroundColor White
    } else {
        Write-Host "  docker compose logs" -ForegroundColor White
    }
    Write-Host ""
    exit 1
}

