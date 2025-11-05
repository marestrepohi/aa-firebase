# Scripts de Utilidad

## create-project-structure.js

Script para crear automáticamente la estructura de carpetas en `public/data/` basándose en los proyectos definidos en `public/casos.csv`.

### ¿Qué hace?

1. Lee el archivo `public/casos.csv`
2. Extrae todas las entidades y proyectos
3. Crea una estructura de carpetas organizada:
   ```
   public/data/
   ├── {entidad-slug}/
   │   ├── {proyecto-slug}/
   │   │   ├── README.md
   │   │   └── .gitkeep
   │   └── ...
   └── ...
   ```

### Uso

```bash
# Ejecutar directamente
node scripts/create-project-structure.js

# O usar el comando npm
npm run create-structure
```

### Ejemplo de salida

```
📖 Leyendo casos.csv...
✅ Encontradas 167 filas de proyectos

📁 Creada carpeta: public/data/
📂 Creando estructura de carpetas...

📁 banco-de-bogota/ (Banco de Bogotá)
   └── fraude-suplantacion-tc-bdb/
   └── modelo-de-cobranzas-bdb/
   └── ...

✅ Estructura creada exitosamente!

📊 Resumen:
   - Entidades: 23
   - Proyectos totales: 167

📂 Ruta: public/data/
```

### Archivos generados

Para cada proyecto se generan automáticamente:

1. **Carpeta del proyecto**: `public/data/{entidad}/{proyecto}/`
2. **README.md**: Con el nombre del proyecto y la entidad
3. **.gitkeep**: Para que Git trackee las carpetas vacías

### Nota

- El script usa la misma función `slugify()` que el resto de la aplicación para mantener consistencia en los nombres
- Si ejecutas el script múltiples veces, sobrescribirá los archivos README.md pero no borrará otros archivos que hayas agregado manualmente
- Los slugs se generan automáticamente removiendo acentos, espacios y caracteres especiales
