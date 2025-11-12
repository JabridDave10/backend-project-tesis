# Guía de Subida de Fotos para Conductores

## Resumen de Implementación

Se ha implementado un sistema completo de subida de archivos para fotos de perfil y licencias de conductores, con la siguiente estructura:

## Backend

### Nuevos Endpoints

#### 1. POST /users/:id/upload-photo
Sube la foto de perfil de un usuario.

**Parámetros:**
- `id` (path): ID del usuario
- `file` (form-data): Archivo de imagen (JPG, PNG)

**Validaciones:**
- Tipos permitidos: `image/jpeg`, `image/jpg`, `image/png`
- Tamaño máximo: 5MB

**Estructura de carpeta:**
```
CC-{identification}-{first_name}-{last_name}/
  └── foto-perfil-{identification}.jpg
```

**Ejemplo con cURL:**
```bash
curl -X POST \
  http://localhost:3000/users/1/upload-photo \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/ruta/a/foto.jpg'
```

#### 2. POST /drivers/:id/upload-license
Sube la foto de licencia de un conductor (ya existía).

**Parámetros:**
- `id` (path): ID del conductor
- `file` (form-data): Archivo de imagen o PDF (JPG, PNG, PDF)

**Validaciones:**
- Tipos permitidos: `image/jpeg`, `image/jpg`, `image/png`, `application/pdf`
- Tamaño máximo: 5MB

**Estructura de carpeta:**
```
CC-{identification}-{first_name}-{last_name}/
  └── licencia-{identification}.jpg
```

### Estructura de Carpetas en Supabase

Ambos archivos se almacenan en la misma carpeta personalizada:

```
bucket/
└── CC-1234567890-Juan-Perez/
    ├── foto-perfil-1234567890.jpg
    └── licencia-1234567890.pdf
```

### Características

- **Versionado Automático**: Si se sube una nueva foto/licencia, la anterior se versiona con timestamp
- **Sanitización de Nombres**: Los nombres de carpetas se limpian automáticamente (sin caracteres especiales, tildes, etc.)
- **Validación de Tamaños y Tipos**: Validación estricta antes de subir
- **Gestión de Errores**: Manejo robusto de errores con mensajes descriptivos

## Frontend

### Nuevo Componente: FileUpload

Componente reutilizable ubicado en `src/components/ui/FileUpload.tsx`

**Características:**
- Preview de la imagen seleccionada
- Validación de tipo y tamaño en el cliente
- Botones para cambiar o eliminar archivo
- Mensajes de error claros
- Completamente personalizable

**Uso:**
```tsx
<FileUpload
  label="Foto de Perfil"
  accept="image/jpeg,image/jpg,image/png"
  maxSizeMB={5}
  onFileSelect={setProfilePhoto}
  helperText="Formato: JPG, PNG. Tamaño máximo: 5MB"
/>
```

### Flujo de Creación de Conductor Actualizado

#### Paso 1: Información del Usuario
1. Usuario completa el formulario con datos personales
2. Usuario selecciona una foto de perfil (opcional)
3. Al hacer clic en "Siguiente":
   - Se crea el usuario en la base de datos
   - Si hay foto, se sube automáticamente a `POST /users/:id/upload-photo`
   - Se pasa al Paso 2

#### Paso 2: Información del Conductor
1. Usuario completa datos de conductor (licencia, experiencia, etc.)
2. Usuario selecciona foto de licencia (opcional)
3. Al hacer clic en "Crear Conductor":
   - Se crea el conductor en la base de datos
   - Si hay foto de licencia, se sube a `POST /drivers/:id/upload-license`
   - Se redirige a la lista de conductores

### Nuevos Métodos en DriversService

```typescript
// Subir foto de perfil
await driversService.uploadUserPhoto(userId, file)

// Subir licencia
await driversService.uploadDriverLicense(driverId, file)
```

## Pruebas

### 1. Probar Frontend
1. Navegar a: `http://localhost:3001/dashboard/empleados/conductores/agregar`
2. Completar Paso 1 con todos los datos
3. Seleccionar una foto de perfil
4. Hacer clic en "Siguiente"
5. Completar Paso 2 con datos del conductor
6. Seleccionar foto de licencia
7. Hacer clic en "Crear Conductor"
8. Verificar que se cree correctamente

### 2. Verificar en Supabase Storage
1. Ir a Supabase Dashboard > Storage
2. Abrir el bucket configurado
3. Verificar que exista la carpeta `CC-{identification}-{nombre}-{apellido}`
4. Verificar que contenga ambos archivos:
   - `foto-perfil-{identification}.jpg`
   - `licencia-{identification}.jpg` o `.pdf`

### 3. Probar con Postman

**Subir Foto de Perfil:**
```
POST http://localhost:3000/users/1/upload-photo
Body > form-data
Key: file (type: File)
Value: [Seleccionar archivo]
```

**Subir Licencia:**
```
POST http://localhost:3000/drivers/1/upload-license
Body > form-data
Key: file (type: File)
Value: [Seleccionar archivo]
```

## Archivos Modificados

### Backend
- `src/modules/users/users.module.ts` - Importar StorageModule
- `src/modules/users/users.service.ts` - Agregar método `uploadPhoto()`
- `src/modules/users/users.controller.ts` - Agregar endpoint `POST /:id/upload-photo`

### Frontend
- `src/components/ui/FileUpload.tsx` - Nuevo componente
- `src/services/driversService.ts` - Agregar métodos `uploadUserPhoto()` y `uploadDriverLicense()`
- `src/views/conductores/AddDriverView.tsx` - Actualizar para usar FileUpload
- `src/types/userTypes.ts` - Agregar campos `photo` e `id_role`

## Troubleshooting

### Error: "No se proporcionó ningún archivo"
- Verificar que el nombre del campo en FormData sea `file`
- Verificar que el archivo esté seleccionado

### Error: "Tipo de archivo no permitido"
- Verificar la extensión del archivo
- Para foto de perfil: solo JPG, PNG
- Para licencia: JPG, PNG, PDF

### Error: "El archivo es demasiado grande"
- Reducir el tamaño del archivo a menos de 5MB
- Comprimir la imagen si es necesario

### Error: "Usuario/Conductor no encontrado"
- Verificar que el ID sea correcto
- Verificar que el usuario/conductor exista en la base de datos

### La foto no aparece en Supabase
- Verificar las variables de entorno de S3 en el backend
- Verificar las políticas de seguridad del bucket
- Revisar los logs del backend para errores

## Mejoras Futuras

1. **Compresión de imágenes**: Reducir automáticamente el tamaño antes de subir
2. **Crop de imágenes**: Permitir recortar la foto de perfil
3. **Múltiples formatos**: Soportar más formatos de imagen
4. **Barra de progreso**: Mostrar progreso de subida para archivos grandes
5. **Drag & Drop**: Permitir arrastrar y soltar archivos
6. **Galería de fotos**: Ver historial de versiones anteriores
