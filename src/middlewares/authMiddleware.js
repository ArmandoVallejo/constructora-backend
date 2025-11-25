const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
	const header = req.headers.authorization;
	if (!header) {
		return res.status(401).json({
			error: true,
			message: 'No token provided'
		});
	}

	const token = header.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(401).json({
				error: true,
				message: 'User not found. Please login again.'
			});
		}

		req.user = user;
		next();
	}
	catch (error) {
		return res.status(401).json({
			error: true,
			message: 'Invalid token'
		});
	}

}

module.exports = authMiddleware;