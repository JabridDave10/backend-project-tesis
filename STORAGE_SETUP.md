# Configuración de Storage con Supabase S3

Este documento explica cómo configurar y usar el sistema de almacenamiento de archivos con Supabase Storage mediante el protocolo S3.

## Configuración Inicial

### 1. Variables de Entorno

Asegúrate de configurar las siguientes variables en tu archivo `.env`:

```env
# Supabase S3 Storage Configuration
SUPABASE_S3_ENDPOINT=https://kblaaodijyhfhfvijkmo.storage.supabase.co/storage/v1/s3
SUPABASE_S3_REGION=us-east-2
SUPABASE_S3_ACCESS_KEY=tu_access_key_aqui
SUPABASE_S3_SECRET_KEY=tu_secret_key_aqui
SUPABASE_S3_BUCKET=nombre-del-bucket
```

### 2. Crear Bucket en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a Storage > Buckets
3. Crea un nuevo bucket llamado `drivers-licenses` (o el nombre que prefieras)
4. Configura el bucket como **público** si quieres que las URLs sean accesibles sin autenticación

### 3. Configurar Políticas de Seguridad (RLS)

En Supabase Storage, configura las políticas de Row Level Security:

```sql
-- Permitir lectura pública
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'drivers-licenses');

-- Permitir subida con autenticación (opcional, ya que usamos S3 API)
CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'drivers-licenses');
```

## Uso del Endpoint de Upload

### Subir Licencia de Conductor

**Endpoint:** `POST /drivers/:id/upload-license`

**Método:** `multipart/form-data`

**Parámetros:**
- `id` (path param): ID del conductor
- `file` (form-data): Archivo de la licencia

**Tipos de archivo permitidos:**
- JPG / JPEG
- PNG
- PDF

**Tamaño máximo:** 5MB

### Ejemplo con cURL

```bash
curl -X POST \
  http://localhost:3000/drivers/1/upload-license \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/ruta/a/licencia.jpg'
```

### Ejemplo con JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/drivers/1/upload-license', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
// {
//   message: 'Licencia subida exitosamente',
//   data: {
//     id_driver: 1,
//     license_photo: 'https://...supabase.co/storage/v1/object/public/drivers-licenses/licenses/uuid.jpg',
//     ...
//   }
// }
```

### Ejemplo con Postman

1. Selecciona método `POST`
2. URL: `http://localhost:3000/drivers/1/upload-license`
3. En la pestaña **Body**, selecciona `form-data`
4. Agrega una key llamada `file` de tipo `File`
5. Selecciona el archivo de la licencia
6. Envía la petición

## Respuestas del Endpoint

### Éxito (200 OK)

```json
{
  "message": "Licencia subida exitosamente",
  "data": {
    "id_driver": 1,
    "id_user": 5,
    "license_number": "ABC123456",
    "license_type": "B",
    "license_expiry_date": "2025-12-31",
    "license_photo": "https://kblaaodijyhfhfvijkmo.storage.supabase.co/storage/v1/object/public/drivers-licenses/licenses/uuid-123.jpg",
    "years_experience": 5,
    "status": "disponible",
    "created_at": "2024-01-15T10:00:00.000Z",
    "modified_at": "2024-01-15T15:30:00.000Z"
  }
}
```

### Errores

#### Archivo no proporcionado (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "No se proporcionó ningún archivo",
  "error": "Bad Request"
}
```

#### Tipo de archivo no permitido (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Tipo de archivo no permitido. Solo se aceptan: JPG, JPEG, PNG, PDF",
  "error": "Bad Request"
}
```

#### Archivo demasiado grande (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "El archivo es demasiado grande. Tamaño máximo: 5MB",
  "error": "Bad Request"
}
```

#### Conductor no encontrado (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Conductor con ID 999 no encontrado",
  "error": "Not Found"
}
```

## Características del Sistema

### Gestión Automática de Archivos

- **Reemplazo automático:** Si el conductor ya tiene una licencia subida, el archivo anterior se elimina automáticamente al subir uno nuevo
- **Nombres únicos:** Cada archivo se guarda con un UUID único para evitar conflictos
- **Organización:** Los archivos se guardan en la carpeta `licenses/` dentro del bucket

### Estructura de Carpetas en el Bucket

```
drivers-licenses/
└── licenses/
    ├── uuid-1.jpg
    ├── uuid-2.png
    ├── uuid-3.pdf
    └── ...
```

## Módulo Storage

El módulo Storage es reutilizable y puede ser usado por otros módulos (vehicles, routes, etc.) para subir diferentes tipos de archivos.

### Métodos Disponibles

```typescript
// Subir archivo
await storageService.uploadFile(file, 'folder-name');

// Eliminar archivo
await storageService.deleteFile(fileUrl);

// Verificar si existe
const exists = await storageService.fileExists(fileUrl);

// Obtener URL pública
const url = storageService.getPublicUrl(key);

// Validar tipo de archivo
const isValid = storageService.validateFileType(mimetype, allowedTypes);

// Validar tamaño
const isSizeValid = storageService.validateFileSize(size, maxSize);
```

## Extensión para Otros Módulos

Para agregar upload de archivos a otros módulos (por ejemplo, vehículos):

1. Importar `StorageModule` en el módulo deseado
2. Inyectar `StorageService` en el servicio
3. Agregar endpoint con `@UseInterceptors(FileInterceptor('file'))`
4. Usar `storageService.uploadFile(file, 'vehicles')` para subir

## Troubleshooting

### Error: "Supabase S3 configuration is missing"

Verifica que todas las variables de entorno estén configuradas correctamente en el archivo `.env`

### Error al subir archivo: "Access Denied"

Verifica que:
1. Las credenciales S3 (Access Key y Secret Key) sean correctas
2. El bucket exista en Supabase
3. Las políticas de seguridad permitan la subida

### URL del archivo no es accesible

Si el bucket es privado, necesitarás configurar URLs firmadas. Para buckets públicos, asegúrate de que las políticas RLS permitan acceso público de lectura.

## Seguridad

- Las credenciales S3 deben mantenerse **SECRETAS** y nunca subirse al repositorio
- El archivo `.env` está incluido en `.gitignore` para prevenir exposición accidental
- Usa `.env.example` como plantilla para nuevos entornos
- En producción, usa variables de entorno del servidor, no archivos `.env`

## Referencias

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [AWS SDK S3 Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
