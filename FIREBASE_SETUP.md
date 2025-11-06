# Firebase Backend Migration Guide

Este documento explica cómo migrar de CSV a Firebase/Firestore y cómo usar el nuevo backend.

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Migración de Datos](#migración-de-datos)
3. [Deploy de Cloud Functions](#deploy-de-cloud-functions)
4. [API Endpoints](#api-endpoints)
5. [Actualizar el Frontend](#actualizar-el-frontend)

---

## 🚀 Configuración Inicial

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Firestore Database** (modo producción)
4. Habilita **Cloud Functions**
5. Habilita **Cloud Storage**
6. Habilita **Authentication** (Email/Password y Google)

### 2. Obtener Credenciales

#### Credenciales del Cliente (Frontend)

1. En Firebase Console, ve a **Project Settings** (⚙️)
2. En la sección "Your apps", haz clic en el ícono web `</>`
3. Registra tu app y copia las credenciales

#### Credenciales Admin (Backend)

1. En Firebase Console, ve a **Project Settings** → **Service Accounts**
2. Haz clic en "Generate new private key"
3. Guarda el archivo JSON como `firebase-service-account.json` en la raíz del proyecto

### 3. Configurar Variables de Entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
```

### 4. Instalar Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Selecciona:
- ✅ Firestore
- ✅ Functions
- ✅ Storage

---

## 📦 Migración de Datos

### 1. Preparar el Script de Migración

El script está en `scripts/migrate-to-firestore.ts`. Asegúrate de tener:

1. ✅ `firebase-service-account.json` en la raíz
2. ✅ Variables de entorno configuradas en `.env.local`
3. ✅ Archivos CSV en `public/casos.csv` y `public/entidades.csv`

### 2. Compilar y Ejecutar la Migración

```bash
# Compilar TypeScript
npx tsx scripts/migrate-to-firestore.ts
```

La migración:
- Lee todos los datos de los CSV
- Crea las entidades en Firestore
- Crea los casos de uso como subcolecciones
- Crea las métricas con período inicial `2024-Q4`

**Estructura en Firestore:**

```
/entities/{entityId}
  ├── name: string
  ├── description: string
  ├── logo: string
  └── /useCases/{useCaseId}
      ├── name: string
      ├── status: string
      ├── highLevelStatus: string
      └── /metrics/{period} (ej: "2024-Q4")
          ├── general: Array<{label, value}>
          ├── financial: Array<{label, value}>
          ├── business: Array<{label, value}>
          └── technical: Array<{label, value}>
```

### 3. Verificar la Migración

En Firebase Console → Firestore Database, deberías ver:
- Colección `entities` con ~23 documentos
- Cada entidad con subcolección `useCases`
- Cada caso con subcolección `metrics` con documento `2024-Q4`

---

## ☁️ Deploy de Cloud Functions

### 1. Instalar Dependencias de Functions

```bash
cd functions
npm install
cd ..
```

### 2. Deploy Functions a Firebase

```bash
firebase deploy --only functions
```

Esto despliega 10 endpoints:
- `getEntities` - Obtener todas las entidades
- `getEntity` - Obtener una entidad específica
- `getUseCases` - Obtener casos de uso de una entidad
- `updateEntity` - Actualizar/crear entidad
- `updateUseCase` - Actualizar/crear caso de uso
- `saveMetrics` - Guardar métricas de un período
- `getMetricsPeriods` - Obtener todos los períodos de métricas
- `deleteEntity` - Eliminar entidad
- `deleteUseCase` - Eliminar caso de uso

### 3. Obtener URLs de las Functions

Después del deploy, Firebase te dará las URLs:

```
https://us-central1-tu-proyecto.cloudfunctions.net/getEntities
https://us-central1-tu-proyecto.cloudfunctions.net/getEntity
...
```

Guarda estas URLs para configurar el frontend.

---

## 🔌 API Endpoints

### GET /getEntities

Obtiene todas las entidades con sus estadísticas.

**Response:**
```json
{
  "success": true,
  "entities": [
    {
      "id": "adl",
      "name": "Aval Digital Labs",
      "description": "...",
      "logo": "/logos/adl.png",
      "stats": {
        "active": 15,
        "inactive": 5,
        "strategic": 3,
        "total": 23,
        "scientists": 45,
        "alerts": 2
      }
    }
  ]
}
```

### GET /getEntity?id={entityId}

Obtiene una entidad específica.

**Query Params:**
- `id` (required): ID de la entidad

### GET /getUseCases?entityId={entityId}

Obtiene todos los casos de uso de una entidad con las métricas más recientes.

**Query Params:**
- `entityId` (required): ID de la entidad

### POST /updateEntity

Actualiza o crea una entidad.

**Body:**
```json
{
  "id": "adl",
  "name": "Aval Digital Labs",
  "description": "Centro de innovación",
  "logo": "/logos/adl.png"
}
```

### POST /updateUseCase

Actualiza o crea un caso de uso.

**Body:**
```json
{
  "entityId": "adl",
  "id": "proyecto-123",
  "name": "Modelo de Fraude",
  "description": "Detección de fraude",
  "status": "En Producción",
  "highLevelStatus": "Activo",
  "tipoProyecto": "Predictivo",
  "tipoDesarrollo": "Modelo",
  "observaciones": "...",
  "sharepoint": "https://...",
  "jira": "https://..."
}
```

### POST /saveMetrics

Guarda métricas de un período específico.

**Body:**
```json
{
  "entityId": "adl",
  "useCaseId": "proyecto-123",
  "period": "2024-Q4",
  "metrics": {
    "general": [
      { "label": "Cantidad de DS", "value": "5" }
    ],
    "financial": [
      { "label": "Fee Total", "value": "100000" }
    ],
    "business": [...],
    "technical": [...]
  }
}
```

### GET /getMetricsPeriods?entityId={entityId}&useCaseId={useCaseId}

Obtiene todas las métricas históricas de un caso de uso.

**Response:**
```json
{
  "success": true,
  "periods": [
    {
      "period": "2024-Q4",
      "general": [...],
      "financial": [...],
      "business": [...],
      "technical": [...]
    },
    {
      "period": "2024-Q3",
      ...
    }
  ]
}
```

### DELETE /deleteEntity

Elimina una entidad y todos sus casos de uso.

**Body:**
```json
{
  "id": "entity-id"
}
```

### DELETE /deleteUseCase

Elimina un caso de uso y todas sus métricas.

**Body:**
```json
{
  "entityId": "adl",
  "id": "proyecto-123"
}
```

---

## 🎨 Actualizar el Frontend

### 1. Crear Capa de API

Crea `src/lib/api.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL;

export async function getEntities() {
  const res = await fetch(`${API_BASE}/getEntities`);
  return res.json();
}

export async function getUseCases(entityId: string) {
  const res = await fetch(`${API_BASE}/getUseCases?entityId=${entityId}`);
  return res.json();
}

export async function updateEntity(data: any) {
  const res = await fetch(`${API_BASE}/updateEntity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ... más funciones
```

### 2. Actualizar data.ts

Modifica `src/lib/data.ts` para usar la API en lugar de CSV:

```typescript
import { getEntities as apiGetEntities } from './api';

export async function getEntities() {
  const { entities } = await apiGetEntities();
  return entities;
}
```

### 3. Agregar Variable de Entorno

En `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://us-central1-tu-proyecto.cloudfunctions.net
```

---

## ✅ Testing

### Probar Endpoints

```bash
# GET Entities
curl https://us-central1-tu-proyecto.cloudfunctions.net/getEntities

# GET Use Cases
curl "https://us-central1-tu-proyecto.cloudfunctions.net/getUseCases?entityId=adl"

# POST Update Entity
curl -X POST https://us-central1-tu-proyecto.cloudfunctions.net/updateEntity \
  -H "Content-Type: application/json" \
  -d '{"id":"test","name":"Test Entity"}'
```

### Verificar en Firebase Console

1. **Firestore Database**: Ver datos migrados
2. **Functions**: Ver logs de ejecución
3. **Storage**: Ver logos subidos

---

## 🔐 Seguridad

### Firestore Rules

Las reglas están en `firestore.rules`:
- **Lectura**: Pública (todos pueden leer)
- **Escritura**: Solo usuarios autenticados

Para producción, considera:
- Requerir autenticación para lectura
- Validar permisos por rol (admin, viewer, etc.)
- Agregar validación de campos

### Storage Rules

Las reglas están en `storage.rules`:
- Solo usuarios autenticados pueden subir archivos
- Límite de tamaño de 5MB para logos
- Límite de 50MB para attachments

---

## 📊 Costos Estimados

**Firestore:**
- 167 proyectos × 23 entidades = ~4,000 documentos
- Lecturas: ~50K/mes → GRATIS (50K incluidos)
- Escrituras: ~5K/mes → GRATIS (20K incluidos)

**Cloud Functions:**
- ~10K invocaciones/mes → GRATIS (2M incluidos)

**Storage:**
- ~50MB de logos → GRATIS (5GB incluidos)

**Total estimado: $0/mes** (dentro de free tier)

---

## 🆘 Troubleshooting

### Error: "Permission denied"
- Verifica que las reglas de Firestore permitan la operación
- Verifica que el usuario esté autenticado (si es requerido)

### Error: "Function not found"
- Verifica que las functions estén desplegadas: `firebase deploy --only functions`
- Verifica la URL en `.env.local`

### Error: "Service account not found"
- Verifica que `firebase-service-account.json` exista
- Verifica que las variables FIREBASE_* estén en `.env.local`

### Datos no aparecen después de migración
- Verifica en Firebase Console → Firestore Database
- Revisa los logs del script de migración
- Re-ejecuta la migración si es necesario

---

## 🎯 Próximos Pasos

1. ✅ Configurar Firebase
2. ✅ Migrar datos de CSV a Firestore
3. ✅ Desplegar Cloud Functions
4. ⏳ Actualizar frontend para usar API
5. ⏳ Crear formularios editables
6. ⏳ Agregar selector de períodos
7. ⏳ Implementar autenticación

---

¿Necesitas ayuda? Revisa los logs:
```bash
# Logs de Functions
firebase functions:log

# Logs de una función específica
firebase functions:log --only getEntities
```
