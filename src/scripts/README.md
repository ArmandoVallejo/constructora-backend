# Scripts de Carga de Datos

Este directorio contiene scripts para cargar datos de ejemplo en la base de datos.

## Scripts Disponibles

### 📝 cargarUsuarios.js
Inserta usuarios de ejemplo con diferentes roles y contraseñas hasheadas.

**Usuarios creados:**
- `admin@mail.com` / `123456` (Admin)
- `analista@mail.com` / `123456` (Analista)
- `visit@mail.com` / `123456` (Visitante)
- `armando@mail.com` / `3339209382` (Analista)
- `maria.garcia@mail.com` / `123456` (Admin)
- `carlos.lopez@mail.com` / `123456` (Analista)
- `laura.martinez@mail.com` / `123456` (Visitante)

**Características:**
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Múltiples roles (admin, analista, visitante)
- ✅ Limpia usuarios existentes antes de insertar

### 🏗️ cargarDatos.js
Script principal que carga todos los datos de ejemplo:
- Usuarios (con contraseñas hasheadas)
- Proyectos de construcción
- Vehículos
- Registros de acceso (vinculados a usuarios y recursos)

**Datos insertados:**
- 7 usuarios con diferentes roles
- 5 proyectos de construcción
- 8 vehículos (algunos asignados a proyectos)
- 120 registros de acceso de los últimos 30 días

**Características:**
- ✅ Datos realistas y variados
- ✅ Relaciones entre usuarios, proyectos y vehículos
- ✅ Registros de acceso con fechas aleatorias
- ✅ Limpia datos existentes antes de insertar

## Cómo Usar

### Opción 1: Usando npm script (Recomendado)
```bash
npm run seed
```

### Opción 2: Ejecución directa
```bash
node src/scripts/cargarDatos.js
```

### Opción 3: Solo cargar usuarios
```javascript
const insertUsers = require('./src/scripts/cargarUsuarios');
// Usar dentro de otro script
await insertUsers();
```

## Requisitos

1. Tener MongoDB corriendo
2. Archivo `.env` configurado con `MONGODB_URI`
3. Dependencias instaladas (`npm install`)

## Notas Importantes

⚠️ **ADVERTENCIA**: Estos scripts eliminan todos los datos existentes en las colecciones antes de insertar los nuevos datos.

- El script `cargarDatos.js` llama automáticamente a `cargarUsuarios.js`
- Las contraseñas se hashean con bcrypt antes de guardarlas
- Los registros de acceso se generan con fechas aleatorias de los últimos 30 días
- Los vehículos se asignan aleatoriamente a proyectos

## Ejemplo de Salida

```
🔄 Conectando a MongoDB...
✅ Conectado a MongoDB

📝 Cargando usuarios...
✅ Usuarios insertados exitosamente:
   - admin@mail.com (admin)
   - analista@mail.com (analista)
   - visit@mail.com (visitante)
   ...

🗑️  Limpiando datos existentes...
✅ Datos anteriores eliminados

🏗️  Insertando proyectos...
✅ 5 proyectos insertados

🚗 Insertando vehículos...
✅ 8 vehículos insertados

📊 Insertando registros de acceso...
✅ 120 registros de acceso insertados

==================================================
✅ DATOS CARGADOS EXITOSAMENTE
==================================================
👥 Usuarios: 7
🏗️  Proyectos: 5
🚗 Vehículos: 8
📊 Accesos: 120
==================================================

📋 Credenciales de acceso:
   Admin: admin@mail.com / 123456
   Analista: analista@mail.com / 123456
   Visitante: visit@mail.com / 123456
   Armando: armando@mail.com / 3339209382

🔌 Conexión a MongoDB cerrada
```

## Solución de Problemas

### Error de conexión a MongoDB
- Verifica que MongoDB esté corriendo
- Revisa la variable `MONGODB_URI` en tu archivo `.env`

### Error "bcryptjs not found"
```bash
npm install bcryptjs
```

### Error "dotenv not found"
```bash
npm install dotenv
```
