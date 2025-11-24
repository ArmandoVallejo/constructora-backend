const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const auth = require("../middlewares/authMiddleware");

/**
 * GET /api/vehiculos
 * Obtiene lista de vehículos con filtrado y paginación
 * Ruta protegida - requiere autenticación
 * 
 * Query Parameters:
 * - page: número de página (default: 1)
 * - limit: registros por página (default: 10, max: 100)
 * - tipo: filtrar por tipo de vehículo
 * - estado: filtrar por estado (available, in_use, maintenance)
 * - proyecto: filtrar por ID de proyecto asignado
 * - sortBy: campo para ordenar (licensePlate, type, status)
 * - sortOrder: orden (asc, desc) - default: asc
 */
router.get("/", auth, async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			tipo,
			estado,
			proyecto,
			sortBy = 'licensePlate',
			sortOrder = 'asc'
		} = req.query;

		// Validar y parsear parámetros de paginación
		const pageNum = parseInt(page);
		const limitNum = parseInt(limit);

		// Validar límites
		if (pageNum < 1) {
			return res.status(400).json({
				error: "El número de página debe ser mayor a 0"
			});
		}

		if (limitNum < 1 || limitNum > 100) {
			return res.status(400).json({
				error: "El límite debe estar entre 1 y 100"
			});
		}

		// Construir filtro
		let filter = {};

		// Filtro por tipo
		if (tipo) {
			filter.type = tipo;
		}

		// Filtro por estado
		if (estado) {
			const estadosValidos = ['available', 'in_use', 'maintenance'];
			if (!estadosValidos.includes(estado)) {
				return res.status(400).json({
					error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`
				});
			}
			filter.status = estado;
		}

		// Filtro por proyecto asignado
		if (proyecto) {
			if (proyecto === 'null' || proyecto === 'none') {
				// Buscar vehículos sin proyecto asignado
				filter.assignedToProject = null;
			} else {
				// Buscar vehículos asignados a un proyecto específico
				filter.assignedToProject = proyecto;
			}
		}

		// Construir objeto de ordenamiento
		const sortOptions = {};
		const camposOrdenValidos = ['licensePlate', 'type', 'status'];

		if (!camposOrdenValidos.includes(sortBy)) {
			return res.status(400).json({
				error: `Campo de ordenamiento inválido. Valores permitidos: ${camposOrdenValidos.join(', ')}`
			});
		}

		sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

		// Obtener total de registros que coinciden con el filtro
		const total = await Vehicle.countDocuments(filter);

		// Obtener registros paginados
		const vehiculos = await Vehicle.find(filter)
			.sort(sortOptions)
			.skip((pageNum - 1) * limitNum)
			.limit(limitNum)
			.populate("assignedToProject", "name location.address status")
			.lean();

		// Calcular metadatos de paginación
		const totalPages = Math.ceil(total / limitNum);

		// Responder con datos y metadatos
		res.json({
			success: true,
			data: vehiculos,
			pagination: {
				total,
				page: pageNum,
				limit: limitNum,
				totalPages,
				hasNextPage: pageNum < totalPages,
				hasPrevPage: pageNum > 1
			},
			filters: {
				tipo,
				estado,
				proyecto
			}
		});

	} catch (error) {
		console.error("Error al obtener vehículos:", error);
		res.status(500).json({
			error: "Error al obtener vehículos",
			message: error.message
		});
	}
});

module.exports = router;
