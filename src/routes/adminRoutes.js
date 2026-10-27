const express = require('express');

const controllers = require('../controllers/controllers');
const { authenticateToken, authorizeRoles } = require('../middlewares/middleware');

const router = express.Router();
const adminOnly = [authenticateToken, authorizeRoles('admin')];

router.get('/dashboard', adminOnly, controllers.adminDashboard);
router.get('/courses', adminOnly, controllers.adminListCourses);
router.post('/courses', adminOnly, controllers.adminCreateCourse);
router.get('/courses/:courseId', adminOnly, controllers.adminGetCourse);
router.patch('/courses/:courseId/status', adminOnly, controllers.adminUpdateStatus);
router.get('/courses/:courseId/students', adminOnly, controllers.adminListRoster);
router.patch('/courses/:courseId/students/:studentId/attendance', adminOnly, controllers.adminUpdateAttendance);
router.post('/courses/:courseId/attendance/mark-all-present', adminOnly, controllers.adminMarkAllPresent);
router.post('/courses/:courseId/students/:studentId/award-credits', adminOnly, controllers.adminAwardStudentCredits);

module.exports = router;