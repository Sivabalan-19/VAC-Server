const studentModel = require('../models/studentModel');
const adminModel = require('../models/adminModel');

function requireId(value, label) {
	const id = Number(value);
	if (!Number.isSafeInteger(id) || id < 1) {
		const error = new Error(`${label} must be a positive integer`);
		error.status = 400;
		throw error;
	}
	return id;
}

async function register(studentId, courseId) {
	const id = requireId(courseId, 'courseId');
	const course = await adminModel.findCourse(id);
	if (!course) {
		const error = new Error('Course not found');
		error.status = 404;
		throw error;
	}

	const statusLower = String(course.statusText || '').toLowerCase();
	if (statusLower.includes('pending')) {
		const error = new Error('This course is pending admin approval and is not open for registration yet');
		error.status = 400;
		throw error;
	}
	if (statusLower.includes('reject')) {
		const error = new Error('This course proposal was rejected and is not open for registration');
		error.status = 400;
		throw error;
	}
	if (statusLower.includes('completed')) {
		const error = new Error('This course is already completed and registration has closed');
		error.status = 400;
		throw error;
	}
	if (
		!statusLower.includes('approved') &&
		!statusLower.includes('registration') &&
		!statusLower.includes('opened') &&
		!statusLower.includes('attendance')
	) {
		const error = new Error('This course is not currently open for student registration');
		error.status = 400;
		throw error;
	}

	const enrollment = await studentModel.registerForCourse(studentId, id);
	if (!enrollment) {
		const error = new Error('Course was not found or has no available seats');
		error.status = 409;
		throw error;
	}
	return enrollment;
}

async function cancel(studentId, courseId) {
	const enrollment = await studentModel.cancelRegistration(studentId, requireId(courseId, 'courseId'));
	if (!enrollment) {
		const error = new Error('Active course registration was not found');
		error.status = 404;
		throw error;
	}
}

module.exports = {
	cancel,
	getDashboard: studentModel.getDashboard,
	listCompletedCourses: studentModel.findCompletedCourses,
	listCourses: studentModel.findAvailableCourses,
	listMyCourses: studentModel.findMyCourses,
	register,
};
