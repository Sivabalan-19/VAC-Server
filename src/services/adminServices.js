const adminModel = require('../models/adminModel');
const SESSION_IDS = new Set(['d1s1', 'd1s2', 'd2s1', 'd2s2']);

function requireId(value, label) {
	const id = Number(value);
	if (!Number.isSafeInteger(id) || id < 1) {
		const error = new Error(`${label} must be a positive integer`);
		error.status = 400;
		throw error;
	}
	return id;
}

function required(value, label) {
	if (value === undefined || value === null || String(value).trim() === '') {
		const error = new Error(`${label} is required`);
		error.status = 400;
		throw error;
	}
	return value;
}

function requireSessionId(value) {
	if (typeof value !== 'string' || value.trim() === '') {
		const error = new Error('sessionId is required');
		error.status = 400;
		throw error;
	}
	const sessionId = value.trim();
	if (!SESSION_IDS.has(sessionId)) {
		const error = new Error('sessionId must be one of d1s1, d1s2, d2s1, or d2s2');
		error.status = 400;
		throw error;
	}
	return sessionId;
}

async function getCourse(courseId) {
	const course = await adminModel.findCourse(requireId(courseId, 'courseId'));
	if (!course) {
		const error = new Error('Course not found');
		error.status = 404;
		throw error;
	}
	return course;
}

async function createCourse(body) {
	const course = {
		courseDate: body.courseDate || new Date().toISOString().slice(0, 10),
		name: required(body.name, 'name'),
		code: required(body.code, 'code'),
		organizer: body.organizer || body.instructor,
		type: body.type || 'Webinar',
		category: body.category || 'Artificial Intelligence',
		mode: body.mode || 'Online',
		statusText: body.statusText || 'Approval Pending...',
		imageUrl: body.imageUrl || null,
		details: body.details || '',
		instructor: required(body.instructor, 'instructor'),
		department: required(body.department, 'department'),
		maxIntake: Number(body.maxIntake || 60),
		regStartDate: body.regStartDate || null,
		regEndDate: body.regEndDate || null,
		startDate: body.startDate || null,
		endDate: body.endDate || null,
		location: body.location || null,
		credits: Number(body.credits || 1),
	};
	if (!['Online', 'Offline', 'Hybrid'].includes(course.mode)) {
		const error = new Error('mode must be Online, Offline, or Hybrid');
		error.status = 400;
		throw error;
	}
	if (!Number.isInteger(course.maxIntake) || course.maxIntake < 1 || !Number.isInteger(course.credits) || course.credits < 1) {
		const error = new Error('maxIntake and credits must be positive integers');
		error.status = 400;
		throw error;
	}
	return adminModel.createCourse(course);
}

async function updateStatus(courseId, body) {
	const id = requireId(courseId, 'courseId');
	const statusText = required(body.statusText, 'statusText');
	const updated = await adminModel.updateCourseStatus(id, statusText, body.rejectionReason);
	if (!updated) {
		const error = new Error('Course not found');
		error.status = 404;
		throw error;
	}
	return adminModel.findCourse(id);
}

async function updateAttendance(courseId, studentId, status, sessionId) {
	const id = requireId(courseId, 'courseId');
	const student = requireId(studentId, 'studentId');
	if (!['Present', 'Absent'].includes(status)) {
		const error = new Error('status must be Present or Absent');
		error.status = 400;
		throw error;
	}
	const result = await adminModel.updateAttendance(id, student, status, requireSessionId(sessionId));
	if (!result) {
		const error = new Error('Enrollment not found');
		error.status = 404;
		throw error;
	}
	return result;
}

module.exports = {
	awardStudentCredit: async (courseId, studentId) => adminModel.awardStudentCredit(requireId(courseId, 'courseId'), requireId(studentId, 'studentId')),
	createCourse,
	getCourse,
	getDashboard: adminModel.getDashboard,
	listCourses: adminModel.listCourses,
	listRoster: async (courseId, sessionId) =>
		adminModel.findRoster(requireId(courseId, 'courseId'), requireSessionId(sessionId)),
	markAllPresent: async (courseId, sessionId) =>
		adminModel.markAllPresent(requireId(courseId, 'courseId'), requireSessionId(sessionId)),
	updateAttendance,
	updateStatus,
};
