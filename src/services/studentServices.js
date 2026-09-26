const studentModel = require('../models/studentModel');

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
	const enrollment = await studentModel.registerForCourse(studentId, requireId(courseId, 'courseId'));
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
