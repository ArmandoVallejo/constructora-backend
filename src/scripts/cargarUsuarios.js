const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * Script para insertar usuarios de ejemplo con contraseñas hasheadas
 * Roles disponibles: admin, analista, visitante
 */
const insertUsers = async () => {
	try {
		// Verificar si ya existen usuarios
		const existingUsers = await User.countDocuments();
		if (existingUsers > 0) {
			console.log(`Ya existen ${existingUsers} usuarios en la base de datos.`);
			console.log("Eliminando usuarios existentes...");
			await User.deleteMany({});
		}

		// Hashear contraseñas
		const salt = await bcrypt.genSalt(10);

		const usuarios = [
			{
				email: "admin@mail.com",
				password: await bcrypt.hash("123456", salt),
				name: "Administrador Principal",
				role: "admin"
			},
			{
				email: "analista@mail.com",
				password: await bcrypt.hash("123456", salt),
				name: "Analista de Datos",
				role: "analista"
			},
			{
				email: "visit@mail.com",
				password: await bcrypt.hash("123456", salt),
				name: "Usuario Visitante",
				role: "visitante"
			},
			{
				email: "armando@mail.com",
				password: await bcrypt.hash("3339209382", salt),
				name: "Armando Vallejo",
				role: "analista"
			},
			{
				email: "maria.garcia@mail.com",
				password: await bcrypt.hash("123456", salt),
				name: "María García",
				role: "admin"
			},
			{
				email: "carlos.lopez@mail.com",
				password: await bcrypt.hash("123456", salt),
				name: "Carlos López",
				role: "analista"
			},
			{
				email: "laura.martinez@mail.com",
				password: await bcrypt.hash("123456", salt),
				name: "Laura Martínez",
				role: "visitante"
			}
		];

		// Insertar usuarios
		const usuariosInsertados = await User.insertMany(usuarios);

		console.log("✅ Usuarios insertados exitosamente:");
		usuariosInsertados.forEach(user => {
			console.log(`   - ${user.email} (${user.role})`);
		});

		return usuariosInsertados;

	} catch (error) {
		console.error("❌ Error al insertar usuarios:", error.message);
		throw error;
	}
};

module.exports = insertUsers;