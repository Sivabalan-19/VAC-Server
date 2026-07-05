const authService = require('../services/services');

async function register(req, res, next) {
	try {
		const result = await authService.registerUser(req.body);
		res.status(201).json({
			message: 'Account created successfully',
			...result,
		});
	} catch (error) {
		next(error);
	}
}

async function login(req, res, next) {
	try {
		const result = await authService.loginUser(req.body);
		res.json({
			message: 'Login successful',
			...result,
		});
	} catch (error) {
		next(error);
	}
}

async function me(req, res, next) {
	try {
		const user = await authService.getCurrentUser(req.user.sub);
		res.json({ user });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	login,
	me,
	register,
};
