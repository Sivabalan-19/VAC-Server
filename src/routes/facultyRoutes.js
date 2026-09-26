const express = require('express');

const controllers = require('../controllers/controllers');
const { authenticateToken, authorizeRoles } = require('../middlewares/middleware');

const router = express.Router();
const facultyOnly = [authenticateToken, authorizeRoles('faculty')];

router.get('/dashboard', facultyOnly, controllers.facultyDashboard);
router.get('/courses', facultyOnly, controllers.facultyListCourses);
router.get('/events', facultyOnly, controllers.facultyListCourses);
router.post('/courses', facultyOnly, controllers.facultyCreateCourse);
router.get('/courses/:courseId', facultyOnly, controllers.facultyGetCourse);
router.get('/courses/:courseId/students', facultyOnly, controllers.facultyListRoster);
router.patch('/courses/:courseId/students/:studentId/attendance', facultyOnly, controllers.facultyUpdateAttendance);
router.post('/courses/:courseId/attendance/mark-all-present', facultyOnly, controllers.facultyMarkAllPresent);

module.exports = router;