const authService = require('../services/services');
const studentService = require('../services/studentServices');
const adminService = require('../services/adminServices');

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

async function listCourses(req, res, next) {
	try {
		res.json({ courses: await studentService.listCourses(req.user.sub) });
	} catch (error) {
		next(error);
	}
}

async function registerCourse(req, res, next) {
	try {
		const enrollment = await studentService.register(req.user.sub, req.params.courseId);
		res.status(201).json({ message: 'Course registered successfully', enrollment });
	} catch (error) {
		next(error);
	}
}

async function listMyCourses(req, res, next) {
	try {
		res.json({ courses: await studentService.listMyCourses(req.user.sub) });
	} catch (error) {
		next(error);
	}
}

async function cancelCourse(req, res, next) {
	try {
		await studentService.cancel(req.user.sub, req.params.courseId);
		res.json({ message: 'Course registration cancelled' });
	} catch (error) {
		next(error);
	}
}

async function listCompletedCourses(req, res, next) {
	try {
		res.json({ courses: await studentService.listCompletedCourses(req.user.sub) });
	} catch (error) {
		next(error);
	}
}

async function dashboard(req, res, next) {
	try {
		res.json({ dashboard: await studentService.getDashboard(req.user.sub) });
	} catch (error) {
		next(error);
	}
}

async function adminDashboard(req, res, next) {
	try {
		res.json({ dashboard: await adminService.getDashboard() });
	} catch (error) {
		next(error);
	}
}

async function adminListCourses(req, res, next) {
	try {
		res.json({ courses: await adminService.listCourses(req.query) });
	} catch (error) {
		next(error);
	}
}

async function adminGetCourse(req, res, next) {
	try {
		res.json({ course: await adminService.getCourse(req.params.courseId) });
	} catch (error) {
		next(error);
	}
}

async function adminCreateCourse(req, res, next) {
	try {
		res.status(201).json({ message: 'Course created successfully', course: await adminService.createCourse(req.body) });
	} catch (error) {
		next(error);
	}
}

async function adminUpdateStatus(req, res, next) {
	try {
		res.json({ message: 'Course status updated successfully', course: await adminService.updateStatus(req.params.courseId, req.body) });
	} catch (error) {
		next(error);
	}
}

async function adminListRoster(req, res, next) {
	try {
		res.json({ students: await adminService.listRoster(req.params.courseId, 'd1s1') });
	} catch (error) {
		next(error);
	}
}

async function adminUpdateAttendance(req, res, next) {
	try {
		const attendance = await adminService.updateAttendance(
			req.params.courseId,
			req.params.studentId,
			req.body?.status,
			req.body?.sessionId || 'd1s1'
		);
		res.json({ message: 'Attendance updated successfully', attendance });
	} catch (error) {
		next(error);
	}
}

async function adminMarkAllPresent(req, res, next) {
	try {
		const records = await adminService.markAllPresent(req.params.courseId, req.body?.sessionId || 'd1s1');
		res.json({ message: 'All enrolled students marked present', updated: records.length });
	} catch (error) {
		next(error);
	}
}

async function adminAwardStudentCredits(req, res, next) {
	try {
		const result = await adminService.awardStudentCredit(req.params.courseId, req.params.studentId);
		res.json(result);
	} catch (error) {
		next(error);
	}
}

async function facultyDashboard(req, res, next) {
	try {
		res.json({ dashboard: await adminService.getDashboard() });
	} catch (error) {
		next(error);
	}
}

async function facultyListCourses(req, res, next) {
	try {
		res.json({ courses: await adminService.listCourses(req.query) });
	} catch (error) {
		next(error);
	}
}

async function facultyGetCourse(req, res, next) {
	try {
		res.json({ course: await adminService.getCourse(req.params.courseId) });
	} catch (error) {
		next(error);
	}
}

async function facultyCreateCourse(req, res, next) {
	try {
		const courseData = {
			...req.body,
			statusText: 'Approval Pending...',
		};
		res.status(201).json({
			message: 'Course proposal created successfully and submitted to admin for approval',
			course: await adminService.createCourse(courseData),
		});
	} catch (error) {
		next(error);
	}
}

async function facultyListRoster(req, res, next) {
	try {
		res.json({ students: await adminService.listRoster(req.params.courseId, req.query.sessionId) });
	} catch (error) {
		next(error);
	}
}

async function facultyUpdateAttendance(req, res, next) {
	try {
		const attendance = await adminService.updateAttendance(
			req.params.courseId,
			req.params.studentId,
			req.body?.status,
			req.body?.sessionId
		);
		res.json({ message: 'Attendance updated successfully', attendance });
	} catch (error) {
		next(error);
	}
}

async function facultyMarkAllPresent(req, res, next) {
	try {
		const records = await adminService.markAllPresent(req.params.courseId, req.body?.sessionId);
		res.json({ message: 'All enrolled students marked present', updated: records.length });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	login,
	me,
	register,
	listCourses,
	registerCourse,
	listMyCourses,
	cancelCourse,
	listCompletedCourses,
	dashboard,
	adminDashboard,
	adminListCourses,
	adminGetCourse,
	adminCreateCourse,
	adminUpdateStatus,
	adminListRoster,
	adminUpdateAttendance,
	adminMarkAllPresent,
	adminAwardStudentCredits,
	facultyDashboard,
	facultyListCourses,
	facultyGetCourse,
	facultyCreateCourse,
	facultyListRoster,
	facultyUpdateAttendance,
	facultyMarkAllPresent,
};
