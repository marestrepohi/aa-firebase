# Guía de Configuración y Migración a Firebase

Este documento explica cómo configurar el proyecto para usar Firebase y cómo migrar los datos desde los archivos CSV.

## 📋 Índice

1. [Configuración Inicial](#-configuración-inicial)
2. [Migración de Datos](#-migración-de-datos)
3. [Despliegue de Cloud Functions](#-despliegue-de-cloud-functions)
4. [Arquitectura de Datos](#-arquitectura-de-datos)
5. [Flujo de trabajo y Testing](#-flujo-de-trabajo-y-testing)

---

## 🚀 Configuración Inicial

### 1. Requisitos
- Tener una cuenta de Firebase y un proyecto creado (ej: `augusta-edge-project`).
- Tener Node.js y npm instalados.
- Tener Firebase CLI instalado (`npm install -g firebase-tools`).

### 2. Obtener Credenciales de Administrador

Para que el script de migración y la lógica del servidor puedan acceder a tu base de datos, necesitan credenciales de administrador.

1.  Ve a la **Consola de Firebase** → **Configuración del proyecto** (⚙️) → **Cuentas de servicio**.
2.  Haz clic en **"Generar nueva clave privada"**.
3.  Se descargará un archivo JSON. **Renómbralo a `firebase-service-account.json`** y guárdalo en la raíz de tu proyecto.

### 3. Configurar Variables de Entorno

Crea un archivo llamado `.env.local` si aún no existe. Luego, ábrelo y añade las credenciales del archivo JSON que acabas de descargar.

**Archivo: `.env.local`**
```env
# Firebase Admin Configuration
FIREBASE_CLIENT_EMAIL=xxxx@augusta-edge-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# El bucket de storage se puede encontrar en la consola de Firebase -> Storage
FIREBASE_STORAGE_BUCKET=augusta-edge-project.appspot.com
```

**Importante**: `FIREBASE_PRIVATE_KEY` debe tener el formato exacto, incluyendo `\n` para los saltos de línea.

---

## 📦 Migración de Datos

Este es el paso más importante para poblar tu base de datos de Firestore con la información de los CSV.

### 1. Preparar los archivos CSV

Asegúrate de que tus archivos `public/entidades.csv` y `public/casos.csv` están actualizados y con el formato correcto.
-   `entidades.csv`: Delimitado por comas.
-   `casos.csv`: Delimitado por punto y coma.

### 2. Ejecutar el Script de Migración

Abre tu terminal en la raíz del proyecto y ejecuta:

```bash
# Instala todas las dependencias del proyecto
npm install

# Ejecuta el script de migración
npm run migrate
```

**¿Qué hace este script?**
1.  **Limpia Firestore**: Borra todas las entidades y casos de uso existentes para evitar datos duplicados o desactualizados.
2.  **Lee `entidades.csv`**: Crea un documento por cada entidad en la colección `entities`.
3.  **Lee `casos.csv`**: Por cada caso de uso, lo anida dentro de su entidad correspondiente como una subcolección `useCases`.
4.  **Crea Métricas Iniciales**: Para cada caso de uso, crea una subcolección `metrics` con un documento inicial para el período `2024-Q4`.

---

## ☁️ Despliegue de Cloud Functions

Las Cloud Functions actúan como tu API para operaciones de escritura (crear, editar, borrar).

### 1. Instalar dependencias de las funciones

```bash
# Navega a la carpeta de functions e instala sus dependencias
cd functions
npm install
cd ..
```

### 2. Autenticarse y Desplegar

```bash
# Autentícate con tu cuenta de Google (si no lo has hecho)
firebase login

# Despliega únicamente las funciones
npm run functions:deploy
```

Al finalizar, las operaciones desde los formularios de la aplicación funcionarán correctamente.

---

## 🔌 Arquitectura de Datos

La aplicación ahora se comunica con Firestore de dos maneras:
1.  **Lecturas (Server-Side)**: Las páginas de Next.js (Server Components) usan el **Admin SDK** (`src/lib/data.server.ts`) para leer datos de Firestore de forma ultra-rápida y segura en el servidor.
2.  **Escrituras (Client-Side)**: Los formularios de la aplicación (crear/editar) usan el **Client SDK** (`src/lib/data.ts`) para realizar cambios, que son validados por las reglas de seguridad de Firestore.

**Estructura en Firestore:**
```
/entities/{entityId}
  ├── (datos de la entidad)
  └── /useCases/{useCaseId}
      ├── (datos del caso de uso)
      └── /metrics/{period}
          └── (datos de métricas para ese período)
```

---

## ✅ Flujo de trabajo y Testing

### Flujo de trabajo recomendado
1.  Realiza cambios en tus archivos CSV.
2.  Ejecuta `npm run migrate` para sincronizar los cambios con Firestore.
3.  Inicia la aplicación con `npm run dev` para ver los resultados.
4.  Si cambias la lógica de la API de escritura, recuerda volver a desplegar con `npm run functions:deploy`.

### Troubleshooting
-   **Error de Permisos al Migrar**: Asegúrate de que las credenciales en `.env.local` son correctas y el service account tiene rol de "Editor" o "Propietario" en el proyecto de GCP/Firebase.
-   **Datos no aparecen**: Verifica que `npm run migrate` se ejecutó sin errores.
-   **Formularios no guardan**: Revisa que las Cloud Functions se desplegaron correctamente y revisa sus logs en la Consola de Firebase (`Functions` → `Registros`).
