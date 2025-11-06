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
Abre `.env.local` y agrega:
```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@augusta-edge-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3️⃣ Migrar Datos
```bash
npm run migrate
```

### 4️⃣ Login y Deploy Functions
```bash
firebase login
npm run functions:deploy
```

### 5️⃣ Habilitar Firebase API
Edita `.env.local`:
```env
NEXT_PUBLIC_USE_FIREBASE_API=true
```

### 6️⃣ Reiniciar
```bash
npm run dev
```

## ✨ ¡Listo!

Ahora tu app usa Firebase en lugar de CSV:
- ✅ Formularios editables (entidades, casos, métricas)
- ✅ Métricas por período (Q1, Q2, Q3, Q4...)
- ✅ Historial de cambios
- ✅ Escalable y en la nube

---

## 📖 Documentación Completa
- [BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md) - Resumen de todo lo creado
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Guía detallada paso a paso

## 🎯 Modo CSV (actual)
Para seguir usando CSV (sin Firebase):
```env
NEXT_PUBLIC_USE_FIREBASE_API=false
```
