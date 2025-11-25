const authorize = (...roles) => {
	return (req, res, next) => {
		const userRole = req.user.role;
		if (!roles.includes(userRole)) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		next();
	}
}

module.exports = authorize;
