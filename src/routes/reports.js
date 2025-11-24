const express = require("express");
const router = express.Router();
const Access = require("../models/Access");
const auth = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");

/**
 * GET /api/reports/access
 * Obtiene reportes de acceso con filtrado y paginación
 * 
 * Query Parameters:
 * - page: número de página (default: 1)
 * - limit: registros por página (default: 10, max: 100)
 * - desde: fecha inicial (ISO 8601)
 * - hasta: fecha final (ISO 8601)
 * - recurso: tipo de recurso (project, vehicle, collection)
 * - accion: tipo de acción (create, read, update, delete)
 * - usuario: ID del usuario
 * - sortBy: campo para ordenar (timestamp, resource, action)
 * - sortOrder: orden (asc, desc) - default: desc
 */
router.get("/access", auth, authorize("admin", "analista"), async (req, res) => {
	try {
		const {
			desde,
			hasta,
			recurso,
			accion,
			usuario,
			page = 1,
			limit = 10,
			sortBy = 'timestamp',
			sortOrder = 'desc'
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

		// Filtro por rango de fechas
		if (desde && hasta) {
			const fechaDesde = new Date(desde);
			const fechaHasta = new Date(hasta);

			// Validar fechas
			if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
				return res.status(400).json({
					error: "Formato de fecha inválido. Use formato ISO 8601"
				});
			}

			if (fechaDesde > fechaHasta) {
				return res.status(400).json({
					error: "La fecha inicial debe ser anterior a la fecha final"
				});
			}

			filter.timestamp = {
				$gte: fechaDesde,
				$lte: fechaHasta
			};
		} else if (desde) {
			const fechaDesde = new Date(desde);
			if (isNaN(fechaDesde.getTime())) {
				return res.status(400).json({
					error: "Formato de fecha inicial inválido"
				});
			}
			filter.timestamp = { $gte: fechaDesde };
		} else if (hasta) {
			const fechaHasta = new Date(hasta);
			if (isNaN(fechaHasta.getTime())) {
				return res.status(400).json({
					error: "Formato de fecha final inválido"
				});
			}
			filter.timestamp = { $lte: fechaHasta };
		}

		// Filtro por recurso
		if (recurso) {
			const recursosValidos = ['project', 'vehicle', 'collection'];
			if (!recursosValidos.includes(recurso)) {
				return res.status(400).json({
					error: `Recurso inválido. Valores permitidos: ${recursosValidos.join(', ')}`
				});
			}
			filter.resource = recurso;
		}

		// Filtro por acción
		if (accion) {
			const accionesValidas = ['create', 'read', 'update', 'delete'];
			if (!accionesValidas.includes(accion)) {
				return res.status(400).json({
					error: `Acción inválida. Valores permitidos: ${accionesValidas.join(', ')}`
				});
			}
			filter.action = accion;
		}

		// Filtro por usuario
		if (usuario) {
			filter.user = usuario;
		}

		// Construir objeto de ordenamiento
		const sortOptions = {};
		const camposOrdenValidos = ['timestamp', 'resource', 'action'];

		if (!camposOrdenValidos.includes(sortBy)) {
			return res.status(400).json({
				error: `Campo de ordenamiento inválido. Valores permitidos: ${camposOrdenValidos.join(', ')}`
			});
		}

		sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

		// Obtener total de registros que coinciden con el filtro
		const total = await Access.countDocuments(filter);

		// Obtener registros paginados
		const accesos = await Access.find(filter)
			.sort(sortOptions)
			.skip((pageNum - 1) * limitNum)
			.limit(limitNum)
			.populate("user", "email name role")
			.lean();

		// Calcular metadatos de paginación
		const totalPages = Math.ceil(total / limitNum);

		// Responder con datos y metadatos
		res.json({
			success: true,
			data: accesos,
			pagination: {
				total,
				page: pageNum,
				limit: limitNum,
				totalPages,
				hasNextPage: pageNum < totalPages,
				hasPrevPage: pageNum > 1
			},
			filters: {
				desde,
				hasta,
				recurso,
				accion,
				usuario
			}
		});

	} catch (error) {
		console.error("Error al obtener reportes de acceso:", error);
		res.status(500).json({
			error: "Error al obtener reportes de acceso",
			message: error.message
		});
	}
});

/**
 * POST /api/reports/coleccion
 * Genera un reporte específico sobre una colección
 * Solo accesible para usuarios con rol 'admin' o 'analista'
 * 
 * Body Parameters:
 * - tipo: tipo de colección (project, vehicle, collection) - requerido
 * - coleccionId: ID de la colección específica - opcional
 * - desde: fecha inicial para el reporte (ISO 8601) - opcional
 * - hasta: fecha final para el reporte (ISO 8601) - opcional
 * - incluirDetalles: incluir detalles de cada acceso (default: false)
 */
router.post("/coleccion", auth, authorize("admin", "analista"), async (req, res) => {
	try {
		const { tipo, coleccionId, desde, hasta, incluirDetalles = false } = req.body;

		// Validar que se proporcione el tipo de colección
		if (!tipo) {
			return res.status(400).json({
				error: "El tipo de colección es requerido"
			});
		}

		// Validar tipo de colección
		const tiposValidos = ['project', 'vehicle', 'collection'];
		if (!tiposValidos.includes(tipo)) {
			return res.status(400).json({
				error: `Tipo de colección inválido. Valores permitidos: ${tiposValidos.join(', ')}`
			});
		}

		// Construir filtro base
		let filter = {
			resource: tipo
		};

		// Filtrar por ID de colección específica si se proporciona
		if (coleccionId) {
			filter.resourceId = coleccionId;
		}

		// Filtro por rango de fechas
		if (desde || hasta) {
			filter.timestamp = {};

			if (desde) {
				const fechaDesde = new Date(desde);
				if (isNaN(fechaDesde.getTime())) {
					return res.status(400).json({
						error: "Formato de fecha inicial inválido. Use formato ISO 8601"
					});
				}
				filter.timestamp.$gte = fechaDesde;
			}

			if (hasta) {
				const fechaHasta = new Date(hasta);
				if (isNaN(fechaHasta.getTime())) {
					return res.status(400).json({
						error: "Formato de fecha final inválido. Use formato ISO 8601"
					});
				}
				filter.timestamp.$lte = fechaHasta;
			}

			// Validar que la fecha inicial sea anterior a la final
			if (desde && hasta) {
				const fechaDesde = new Date(desde);
				const fechaHasta = new Date(hasta);
				if (fechaDesde > fechaHasta) {
					return res.status(400).json({
						error: "La fecha inicial debe ser anterior a la fecha final"
					});
				}
			}
		}

		// Obtener total de accesos
		const totalAccesos = await Access.countDocuments(filter);

		// Estadísticas por acción
		const accionesPorTipo = await Access.aggregate([
			{ $match: filter },
			{
				$group: {
					_id: "$action",
					count: { $sum: 1 }
				}
			},
			{
				$project: {
					_id: 0,
					accion: "$_id",
					cantidad: "$count"
				}
			}
		]);

		// Estadísticas por usuario
		const accesosPorUsuario = await Access.aggregate([
			{ $match: filter },
			{
				$group: {
					_id: "$user",
					count: { $sum: 1 }
				}
			},
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "usuario"
				}
			},
			{ $unwind: "$usuario" },
			{
				$project: {
					_id: 0,
					usuario: {
						id: "$usuario._id",
						email: "$usuario.email",
						nombre: "$usuario.name",
						rol: "$usuario.role"
					},
					cantidad: "$count"
				}
			},
			{ $sort: { cantidad: -1 } },
			{ $limit: 10 } // Top 10 usuarios más activos
		]);

		// Estadísticas por recurso específico (si no se filtró por coleccionId)
		let accesosPorRecurso = [];
		if (!coleccionId) {
			accesosPorRecurso = await Access.aggregate([
				{ $match: filter },
				{
					$group: {
						_id: "$resourceId",
						count: { $sum: 1 }
					}
				},
				{
					$project: {
						_id: 0,
						recursoId: "$_id",
						cantidad: "$count"
					}
				},
				{ $sort: { cantidad: -1 } },
				{ $limit: 10 } // Top 10 recursos más accedidos
			]);
		}

		// Línea de tiempo de accesos (agrupados por día)
		const lineaTiempo = await Access.aggregate([
			{ $match: filter },
			{
				$group: {
					_id: {
						$dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
					},
					count: { $sum: 1 }
				}
			},
			{
				$project: {
					_id: 0,
					fecha: "$_id",
					cantidad: "$count"
				}
			},
			{ $sort: { fecha: 1 } }
		]);

		// Construir respuesta base
		const reporte = {
			success: true,
			tipo,
			coleccionId: coleccionId || null,
			periodo: {
				desde: desde || null,
				hasta: hasta || null
			},
			resumen: {
				totalAccesos,
				accionesPorTipo,
				topUsuarios: accesosPorUsuario
			},
			lineaTiempo,
			generadoPor: {
				usuario: req.user.email,
				rol: req.user.role,
				fecha: new Date()
			}
		};

		// Agregar recursos más accedidos si aplica
		if (!coleccionId && accesosPorRecurso.length > 0) {
			reporte.resumen.topRecursos = accesosPorRecurso;
		}

		// Incluir detalles de accesos si se solicita
		if (incluirDetalles) {
			const detalles = await Access.find(filter)
				.sort({ timestamp: -1 })
				.limit(100) // Limitar a 100 registros más recientes
				.populate("user", "email name role")
				.lean();

			reporte.detalles = detalles;
		}

		res.json(reporte);

	} catch (error) {
		console.error("Error al generar reporte de colección:", error);
		res.status(500).json({
			error: "Error al generar reporte de colección",
			message: error.message
		});
	}
});

module.exports = router;
