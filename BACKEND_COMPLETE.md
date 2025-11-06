# 🎉 Backend Firebase - Completado

## ✅ Lo que se ha creado

### 1. Configuración de Firebase
- ✅ **firebase.json** - Configuración del proyecto
- ✅ **firestore.rules** - Reglas de seguridad de Firestore
- ✅ **storage.rules** - Reglas de seguridad de Storage  
- ✅ **.firebaserc** - Proyecto vinculado: `augusta-edge-project`
- ✅ **.env.local** - Variables de entorno configuradas

### 2. SDK de Firebase
- ✅ **src/lib/firebase.ts** - Cliente Firebase (frontend)
- ✅ **src/lib/firebase-admin.ts** - Admin SDK (backend)
- ✅ **src/lib/api.ts** - Cliente de API para Cloud Functions

### 3. Capa de Datos Adaptable
- ✅ **src/lib/data.ts** - Adaptador que soporta CSV o Firebase
- ✅ **src/lib/data-csv.ts** - Implementación CSV (legacy)
- 🔧 Variable `NEXT_PUBLIC_USE_FIREBASE_API` controla el modo

### 4. Cloud Functions (API)
- ✅ **functions/src/index.ts** - 10 endpoints implementados:
  - `getEntities` - Listar entidades
  - `getEntity` - Obtener entidad específica
  - `getUseCases` - Casos de uso de una entidad
  - `updateEntity` - Crear/actualizar entidad
  - `updateUseCase` - Crear/actualizar caso de uso
  - `saveMetrics` - Guardar métricas por período
  - `getMetricsPeriods` - Historial de métricas
  - `deleteEntity` - Eliminar entidad
  - `deleteUseCase` - Eliminar caso de uso

### 5. Script de Migración
- ✅ **scripts/migrate-to-firestore.ts** - Migra CSV → Firestore
  - Lee casos.csv y entidades.csv
  - Crea estructura jerárquica
  - Establece período inicial: 2024-Q4

### 6. Componentes de Formularios
- ✅ **entity-form.tsx** - Formulario editable de entidad
- ✅ **use-case-form.tsx** - Formulario editable de caso de uso
- ✅ **metrics-form.tsx** - Formulario de métricas con tabs
- ✅ **metrics-period-selector.tsx** - Selector de períodos

### 7. Componentes Actualizados
- ✅ **entity-card.tsx** - Botón de edición agregado
- ✅ **use-case-card.tsx** - Botones de edición y métricas

---

## 🚀 Próximos Pasos

### Paso 1: Descargar Service Account Key

1. Ve a [Firebase Console](https://console.firebase.google.com/project/augusta-edge-project/settings/serviceaccounts/adminsdk)
2. Click en **"Generate new private key"**
3. Guarda el archivo como `firebase-service-account.json` en la raíz del proyecto

### Paso 2: Actualizar .env.local

Abre `.env.local` y actualiza estas líneas con los datos del service account:

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@augusta-edge-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Paso 3: Ejecutar Migración

```bash
# Migrar datos de CSV a Firestore
npx tsx scripts/migrate-to-firestore.ts
```

Esto migrará:
- ~23 entidades
- ~167 casos de uso
- Métricas iniciales (período 2024-Q4)

### Paso 4: Login en Firebase

```bash
firebase login
```

### Paso 5: Desplegar Cloud Functions

```bash
# Compilar y desplegar
cd functions
npm run build
firebase deploy --only functions
```

Después del deploy, obtendrás URLs como:
```
https://us-central1-augusta-edge-project.cloudfunctions.net/getEntities
https://us-central1-augusta-edge-project.cloudfunctions.net/updateEntity
...
```

### Paso 6: Habilitar Modo Firebase

Actualiza `.env.local`:

```env
NEXT_PUBLIC_USE_FIREBASE_API=true
```

### Paso 7: Verificar

```bash
# Reiniciar el servidor de desarrollo
npm run dev
```

Ahora la app usará Firebase en lugar de CSV!

---

## 🎯 Estructura en Firestore

```
/entities/{entityId}
  ├── id: "adl"
  ├── name: "Aval Digital Labs"
  ├── description: "..."
  ├── logo: "/logos/adl.png"
  │
  └── /useCases/{useCaseId}
      ├── id: "proyecto-123"
      ├── name: "Modelo de Fraude"
      ├── status: "En Producción"
      ├── highLevelStatus: "Activo"
      ├── tipoProyecto: "Predictivo"
      ├── tipoDesarrollo: "Modelo"
      │
      └── /metrics/{period}  (ej: "2024-Q4", "2024-Q3")
          ├── period: "2024-Q4"
          ├── general: [{ label: "...", value: "..." }]
          ├── financial: [...]
          ├── business: [...]
          └── technical: [...]
```

---

## 🔐 Reglas de Seguridad

### Firestore
- **Lectura**: Pública (cualquiera puede leer)
- **Escritura**: Solo usuarios autenticados

### Storage
- **/logos**: Autenticados pueden subir (max 5MB)
- **/attachments**: Autenticados pueden subir (max 50MB)

---

## 🎨 Nuevas Funcionalidades

### Editar Entidad
1. Hover sobre una card de entidad
2. Click en el botón del lápiz (Pencil)
3. Editar nombre, descripción, logo
4. Guardar

### Editar Caso de Uso
1. En la página de una entidad
2. Click en botón "Editar" en una card
3. Modificar todos los campos
4. Guardar

### Editar Métricas por Período
1. Click en "Editar Métricas" en una card
2. Seleccionar período (o crear uno nuevo)
3. Editar métricas en 4 categorías:
   - General
   - Financiero
   - Negocio
   - Técnico
4. Guardar

### Historial de Métricas
- Cada período se guarda como un documento separado
- Puedes ver la evolución trimestral (Q1, Q2, Q3, Q4)
- Comparar períodos históricos

---

## 💰 Costos Estimados

Con tu volumen actual (23 entidades, 167 proyectos):

- **Firestore**: GRATIS (dentro de free tier)
  - 50K lecturas/día incluidas
  - 20K escrituras/día incluidas
  
- **Cloud Functions**: GRATIS (dentro de free tier)
  - 2M invocaciones/mes incluidas
  - 400K GB-segundos/mes incluidos

- **Storage**: GRATIS (dentro de free tier)
  - 5GB almacenamiento incluido
  - 1GB transferencia/día incluida

**Total: $0/mes** 🎉

---

## 🆘 Troubleshooting

### Error: "Service account not found"
Descarga el service account JSON y configura las variables en `.env.local`

### Error: "Permission denied"
Las Cloud Functions deben estar desplegadas primero con `firebase deploy --only functions`

### Datos no aparecen
Verifica que `NEXT_PUBLIC_USE_FIREBASE_API=true` en `.env.local`

### Functions no responden
Verifica la URL en `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL`

---

## 📚 Documentación

- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Guía detallada completa
- [Firebase Console](https://console.firebase.google.com/project/augusta-edge-project)
- [Firestore Database](https://console.firebase.google.com/project/augusta-edge-project/firestore)

---

**¡Todo listo para migrar de CSV a Firebase!** 🚀
