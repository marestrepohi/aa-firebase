#!/usr/bin/env node

/**
 * Script para crear estructura de carpetas en public/data/
 * basado en los proyectos de casos.csv
 * 
 * Estructura: public/data/{entidad-slug}/{proyecto-slug}/
 */

const fs = require('fs');
const path = require('path');

// Función para crear slug (mismo que en data.ts)
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// Parser CSV robusto (mismo que en data.ts)
function parseCSV(content, sep = ';') {
  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && ch === sep) {
      row.push(cur);
      cur = '';
      continue;
    }
    if (!inQuotes && (ch === '\n' || (ch === '\r' && content[i + 1] === '\n'))) {
      if (ch === '\r' && content[i + 1] === '\n') i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
      continue;
    }
    cur += ch;
  }
  
  if (cur !== '' || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  
  return rows.map(r => r.map(cell => cell.replace(/^\uFEFF/, '').trim()));
}

async function createProjectStructure() {
  const casosPath = path.join(process.cwd(), 'public', 'casos.csv');
  const dataBasePath = path.join(process.cwd(), 'public', 'data');
  
  // Leer CSV
  console.log('📖 Leyendo casos.csv...');
  const fileContent = fs.readFileSync(casosPath, 'utf8');
  const parsed = parseCSV(fileContent, ';').filter(r => r.length > 0);
  
  if (parsed.length <= 1) {
    console.error('❌ El archivo casos.csv está vacío o no tiene datos');
    return;
  }
  
  const header = parsed.shift();
  
  // Encontrar índices de columnas
  const entidadIdx = header.findIndex(h => h === 'Entidad');
  const proyectoIdx = header.findIndex(h => h === 'Proyecto');
  
  if (entidadIdx === -1 || proyectoIdx === -1) {
    console.error('❌ No se encontraron las columnas Entidad o Proyecto');
    return;
  }
  
  console.log(`✅ Encontradas ${parsed.length} filas de proyectos\n`);
  
  // Crear carpeta base data/
  if (!fs.existsSync(dataBasePath)) {
    fs.mkdirSync(dataBasePath, { recursive: true });
    console.log('📁 Creada carpeta: public/data/');
  }
  
  // Agrupar proyectos por entidad
  const estructura = {};
  let totalProyectos = 0;
  
  parsed.forEach((row, index) => {
    const entidad = row[entidadIdx]?.toString().trim().replace(/"/g, '');
    const proyecto = row[proyectoIdx]?.toString().trim().replace(/"/g, '');
    
    if (!entidad || !proyecto) {
      return; // Skip si no tiene entidad o proyecto
    }
    
    const entidadSlug = slugify(entidad);
    const proyectoSlug = slugify(proyecto);
    
    if (!estructura[entidadSlug]) {
      estructura[entidadSlug] = {
        nombre: entidad,
        proyectos: []
      };
    }
    
    estructura[entidadSlug].proyectos.push({
      nombre: proyecto,
      slug: proyectoSlug
    });
    
    totalProyectos++;
  });
  
  // Crear estructura de carpetas
  console.log('📂 Creando estructura de carpetas...\n');
  
  Object.keys(estructura).forEach(entidadSlug => {
    const entidadData = estructura[entidadSlug];
    const entidadPath = path.join(dataBasePath, entidadSlug);
    
    // Crear carpeta de entidad
    if (!fs.existsSync(entidadPath)) {
      fs.mkdirSync(entidadPath, { recursive: true });
    }
    
    console.log(`📁 ${entidadSlug}/ (${entidadData.nombre})`);
    
    // Crear carpetas de proyectos
    entidadData.proyectos.forEach(proyecto => {
      const proyectoPath = path.join(entidadPath, proyecto.slug);
      
      if (!fs.existsSync(proyectoPath)) {
        fs.mkdirSync(proyectoPath, { recursive: true });
      }
      
      // Crear archivo README.md en cada proyecto
      const readmePath = path.join(proyectoPath, 'README.md');
      const readmeContent = `# ${proyecto.nombre}\n\nProyecto de: **${entidadData.nombre}**\n\nCarpeta para archivos y documentación del proyecto.\n`;
      
      fs.writeFileSync(readmePath, readmeContent, 'utf8');
      
      // Crear .gitkeep para que Git trackee las carpetas vacías
      const gitkeepPath = path.join(proyectoPath, '.gitkeep');
      fs.writeFileSync(gitkeepPath, '', 'utf8');
      
      console.log(`   └── ${proyecto.slug}/`);
    });
    
    console.log('');
  });
  
  // Resumen
  console.log('✅ Estructura creada exitosamente!\n');
  console.log(`📊 Resumen:`);
  console.log(`   - Entidades: ${Object.keys(estructura).length}`);
  console.log(`   - Proyectos totales: ${totalProyectos}`);
  console.log(`\n📂 Ruta: public/data/`);
}

// Ejecutar
createProjectStructure().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
