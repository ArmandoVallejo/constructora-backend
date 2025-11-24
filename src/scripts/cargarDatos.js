const mongoose = require("mongoose");
const Project = require("../models/Project");
const Vehicle = require("../models/Vehicle");
const Access = require("../models/Access");
const User = require("../models/User");
const insertUsers = require("./cargarUsuarios");
require("dotenv").config();

/**
 * Script para cargar datos de ejemplo:
 * - Proyectos
 * - Vehículos
 * - Registros de acceso (vinculados a usuarios y recursos)
 */
async function cargarDatos() {
	try {
		console.log("🔄 Conectando a MongoDB...");
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("✅ Conectado a MongoDB");

		// 1. Cargar usuarios primero
		console.log("\n📝 Cargando usuarios...");
		const usuarios = await insertUsers();

		// Obtener IDs de usuarios para los registros de acceso
		const adminUser = usuarios.find(u => u.role === "admin");
		const analistaUser = usuarios.find(u => u.role === "analista");
		const visitanteUser = usuarios.find(u => u.role === "visitante");

		// 2. Limpiar colecciones existentes
		console.log("\n🗑️  Limpiando datos existentes...");
		await Project.deleteMany({});
		await Vehicle.deleteMany({});
		await Access.deleteMany({});
		console.log("✅ Datos anteriores eliminados");

		// 3. Insertar Proyectos
		console.log("\n🏗️  Insertando proyectos...");
		const proyectos = await Project.insertMany([
			{
				name: "Construcción Plaza Central",
				location: {
					address: "Av. Juárez 123, Centro",
					lat: 20.6736,
					lng: -103.3444
				},
				status: "in-progress",
				startDate: new Date("2025-01-15"),
				client: "Gobierno Municipal"
			},
			{
				name: "Puente Vehicular Norte",
				location: {
					address: "Carretera Federal 45 Km 12",
					lat: 20.7500,
					lng: -103.4000
				},
				status: "in-progress",
				startDate: new Date("2025-02-01"),
				client: "SCT"
			},
			{
				name: "Edificio Corporativo Torres del Sol",
				location: {
					address: "Av. Américas 1500, Providencia",
					lat: 20.6800,
					lng: -103.3700
				},
				status: "planned",
				startDate: new Date("2025-06-01"),
				client: "Grupo Inmobiliario del Pacífico"
			},
			{
				name: "Remodelación Centro Comercial",
				location: {
					address: "Blvd. Puerta de Hierro 4965",
					lat: 20.6500,
					lng: -103.4200
				},
				status: "completed",
				startDate: new Date("2024-08-01"),
				client: "Inversiones Comerciales SA"
			},
			{
				name: "Ampliación Carretera Estatal",
				location: {
					address: "Carretera Guadalajara-Chapala Km 20",
					lat: 20.6000,
					lng: -103.2500
				},
				status: "in-progress",
				startDate: new Date("2025-03-10"),
				client: "Gobierno del Estado"
			}
		]);
		console.log(`✅ ${proyectos.length} proyectos insertados`);

		// 4. Insertar Vehículos
		console.log("\n🚗 Insertando vehículos...");
		const vehiculos = await Vehicle.insertMany([
			{
				licensePlate: "ABC-123",
				type: "Camión de volteo",
				status: "in_use",
				assignedToProject: proyectos[0]._id
			},
			{
				licensePlate: "XYZ-789",
				type: "Excavadora",
				status: "in_use",
				assignedToProject: proyectos[1]._id
			},
			{
				licensePlate: "DEF-456",
				type: "Grúa",
				status: "available",
				assignedToProject: null
			},
			{
				licensePlate: "GHI-321",
				type: "Retroexcavadora",
				status: "maintenance",
				assignedToProject: null
			},
			{
				licensePlate: "JKL-654",
				type: "Camión mezclador",
				status: "in_use",
				assignedToProject: proyectos[0]._id
			},
			{
				licensePlate: "MNO-987",
				type: "Bulldozer",
				status: "in_use",
				assignedToProject: proyectos[4]._id
			},
			{
				licensePlate: "PQR-147",
				type: "Camioneta pickup",
				status: "available",
				assignedToProject: null
			},
			{
				licensePlate: "STU-258",
				type: "Compactadora",
				status: "in_use",
				assignedToProject: proyectos[1]._id
			}
		]);
		console.log(`✅ ${vehiculos.length} vehículos insertados`);

		// 5. Insertar Registros de Acceso
		console.log("\n📊 Insertando registros de acceso...");

		const accesos = [];
		const acciones = ['create', 'read', 'update', 'delete'];
		const recursos = ['project', 'vehicle'];

		// Generar accesos de los últimos 30 días
		const hoy = new Date();
		const hace30Dias = new Date();
		hace30Dias.setDate(hace30Dias.getDate() - 30);

		// Función auxiliar para generar fecha aleatoria
		const fechaAleatoria = (inicio, fin) => {
			return new Date(inicio.getTime() + Math.random() * (fin.getTime() - inicio.getTime()));
		};

		// Accesos a proyectos
		for (let i = 0; i < 50; i++) {
			const usuarioAleatorio = [adminUser, analistaUser, visitanteUser][Math.floor(Math.random() * 3)];
			const proyectoAleatorio = proyectos[Math.floor(Math.random() * proyectos.length)];
			const accionAleatoria = acciones[Math.floor(Math.random() * acciones.length)];

			accesos.push({
				user: usuarioAleatorio._id,
				resource: 'project',
				resourceId: proyectoAleatorio._id,
				action: accionAleatoria,
				timestamp: fechaAleatoria(hace30Dias, hoy)
			});
		}

		// Accesos a vehículos
		for (let i = 0; i < 40; i++) {
			const usuarioAleatorio = [adminUser, analistaUser, visitanteUser][Math.floor(Math.random() * 3)];
			const vehiculoAleatorio = vehiculos[Math.floor(Math.random() * vehiculos.length)];
			const accionAleatoria = acciones[Math.floor(Math.random() * acciones.length)];

			accesos.push({
				user: usuarioAleatorio._id,
				resource: 'vehicle',
				resourceId: vehiculoAleatorio._id,
				action: accionAleatoria,
				timestamp: fechaAleatoria(hace30Dias, hoy)
			});
		}

		// Accesos a colecciones (genéricos)
		for (let i = 0; i < 30; i++) {
			const usuarioAleatorio = [adminUser, analistaUser][Math.floor(Math.random() * 2)];
			const proyectoAleatorio = proyectos[Math.floor(Math.random() * proyectos.length)];
			const accionAleatoria = acciones[Math.floor(Math.random() * acciones.length)];

			accesos.push({
				user: usuarioAleatorio._id,
				resource: 'collection',
				resourceId: proyectoAleatorio._id,
				action: accionAleatoria,
				timestamp: fechaAleatoria(hace30Dias, hoy)
			});
		}

		// Insertar todos los accesos
		const accesosInsertados = await Access.insertMany(accesos);
		console.log(`✅ ${accesosInsertados.length} registros de acceso insertados`);

		// Resumen final
		console.log("\n" + "=".repeat(50));
		console.log("✅ DATOS CARGADOS EXITOSAMENTE");
		console.log("=".repeat(50));
		console.log(`👥 Usuarios: ${usuarios.length}`);
		console.log(`🏗️  Proyectos: ${proyectos.length}`);
		console.log(`🚗 Vehículos: ${vehiculos.length}`);
		console.log(`📊 Accesos: ${accesosInsertados.length}`);
		console.log("=".repeat(50));

		console.log("\n📋 Credenciales de acceso:");
		console.log("   Admin: admin@mail.com / 123456");
		console.log("   Analista: analista@mail.com / 123456");
		console.log("   Visitante: visit@mail.com / 123456");
		console.log("   Armando: armando@mail.com / 3339209382");

	} catch (error) {
		console.error("\n❌ Error al cargar datos:", error.message);
		console.error(error);
	} finally {
		await mongoose.connection.close();
		console.log("\n🔌 Conexión a MongoDB cerrada");
		process.exit();
	}
}

// Ejecutar el script
cargarDatos();
