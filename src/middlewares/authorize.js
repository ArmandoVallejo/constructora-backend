const authorize = (req, res, next, ...roles) => {
	const userRole = req.user.role;
	if (!roles.includes(userRole)) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	next();
}

module.exports = authorize;
