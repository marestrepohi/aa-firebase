# 🚀 Quick Start - Backend Firebase

## ⚡ Pasos Rápidos

### 1️⃣ Descargar Service Account
```bash
# Ve a Firebase Console:
# https://console.firebase.google.com/project/augusta-edge-project/settings/serviceaccounts/adminsdk
# Click "Generate new private key"
# Guarda como: firebase-service-account.json (en la raíz)
```

### 2️⃣ Actualizar .env.local
Abre `.env.local` y agrega las variables del service account que descargaste.

```env
FIREBASE_CLIENT_EMAIL=xxxx@augusta-edge-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3️⃣ Instalar dependencias y migrar datos
```bash
npm install
npm run migrate
```
Este comando limpia Firestore y migra los datos desde `entidades.csv` y `casos.csv`.

### 4️⃣ Desplegar Cloud Functions
```bash
# Primero, login a Firebase si no lo has hecho
firebase login

# Desplegar las funciones
npm run functions:deploy
```

### 5️⃣ Habilitar la App para usar Firebase
El modo Firebase ya no es opcional, la app depende 100% del backend. Asegúrate de tener las credenciales y las funciones desplegadas.

### 6️⃣ Iniciar la aplicación
```bash
npm run dev
```

## ✨ ¡Listo!

Ahora tu app usa Firebase como única fuente de datos:
- ✅ Datos 100% sincronizados con lo que ves en la UI.
- ✅ Formularios editables para entidades, casos de uso y métricas.
- ✅ Historial de métricas por período.
- ✅ Backend escalable en la nube.

---

## 📖 Documentación Completa
- [BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md) - Resumen de todo lo creado.
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Guía detallada paso a paso.

## ⚠️ Importante
La aplicación ya no usa los archivos CSV para leer datos. Si haces cambios en los CSV, **debes volver a ejecutar `npm run migrate`** para que se reflejen en Firebase.
