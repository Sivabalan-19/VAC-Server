const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userModel = require('../models/model');

const allowedRoles = new Set(['student', 'faculty', 'admin']);
const allowedFacultyTypes = new Set(['internal', 'external']);

function normalizeEmail(email) {
	return String(email || '').trim().toLowerCase();
}

function normalizeRole(role) {
	return String(role || '').trim().toLowerCase();
}

function normalizeFacultyType(facultyType) {
	const value = String(facultyType || '').trim().toLowerCase();
	return value === '' ? null : value;
}

function signToken(user) {
	const secret = process.env.JWT_SECRET || 'vac-dev-secret';

	return jwt.sign(
		{
			sub: user.id,
			role: user.role,
			email: user.email,
		},
		secret,
		{
			expiresIn: process.env.JWT_EXPIRES_IN || '7d',
		}
	);
}

function sanitizeUser(user) {
	return {
		id: user.id,
		fullName: user.fullName,
		email: user.email,
		role: user.role,
		facultyType: user.facultyType || null,
		createdAt: user.createdAt || null,
	};
}

async function registerUser({ fullName, email, password, role, facultyType }) {
	if (!fullName || !email || !password || !role) {
		const error = new Error('fullName, email, password, and role are required');
		error.status = 400;
		throw error;
	}

	const normalizedEmail = normalizeEmail(email);
	const normalizedRole = normalizeRole(role);
	const normalizedFacultyType = normalizeFacultyType(facultyType);

	if (!allowedRoles.has(normalizedRole)) {
		const error = new Error('role must be student, faculty, or admin');
		error.status = 400;
		throw error;
	}

	if (normalizedRole === 'faculty' && !allowedFacultyTypes.has(normalizedFacultyType)) {
		const error = new Error('facultyType must be internal or external for faculty accounts');
		error.status = 400;
		throw error;
	}

	const existingUser = await userModel.findUserByEmail(normalizedEmail);
	if (existingUser) {
		const error = new Error('An account with this email already exists');
		error.status = 409;
		throw error;
	}

	const passwordHash = await bcrypt.hash(password, 10);
	const createdUser = await userModel.createUser({
		fullName: String(fullName).trim(),
		email: normalizedEmail,
		passwordHash,
		role: normalizedRole,
		facultyType: normalizedRole === 'faculty' ? normalizedFacultyType : null,
	});

	const token = signToken(createdUser);

	return {
		user: sanitizeUser(createdUser),
		token,
	};
}

async function loginUser({ email, password }) {
	if (!email || !password) {
		const error = new Error('email and password are required');
		error.status = 400;
		throw error;
	}

	const normalizedEmail = normalizeEmail(email);
	const user = await userModel.findUserByEmail(normalizedEmail);

	if (!user) {
		const error = new Error('Invalid email or password');
		error.status = 401;
		throw error;
	}

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
	if (!isPasswordValid) {
		const error = new Error('Invalid email or password');
		error.status = 401;
		throw error;
	}

	const token = signToken(user);

	return {
		user: sanitizeUser(user),
		token,
	};
}

async function getCurrentUser(userId) {
	const user = await userModel.findUserById(userId);

	if (!user) {
		const error = new Error('User not found');
		error.status = 404;
		throw error;
	}

	return sanitizeUser(user);
}

module.exports = {
	getCurrentUser,
	loginUser,
	registerUser,
};
