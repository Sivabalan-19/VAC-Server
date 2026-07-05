const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
	const header = req.headers.authorization || '';
	const [scheme, token] = header.split(' ');

	if (scheme !== 'Bearer' || !token) {
		return res.status(401).json({ message: 'Missing or invalid authorization token' });
	}

	try {
		const secret = process.env.JWT_SECRET || 'vac-dev-secret';
		req.user = jwt.verify(token, secret);
		return next();
	} catch {
		return res.status(401).json({ message: 'Token is invalid or expired' });
	}
}

function authorizeRoles(...roles) {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'You do not have permission to access this resource' });
		}

		return next();
	};
}

function notFound(req, res) {
	res.status(404).json({ message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
	const status = err.status || 500;
	res.status(status).json({
		message: err.message || 'Internal server error',
	});
}

module.exports = {
	authenticateToken,
	authorizeRoles,
	errorHandler,
	notFound,
};
