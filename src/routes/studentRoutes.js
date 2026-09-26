const express = require('express');

const controllers = require('../controllers/controllers');
const { authenticateToken, authorizeRoles } = require('../middlewares/middleware');

const router = express.Router();
const studentOnly = [authenticateToken, authorizeRoles('student')];

router.get('/courses', studentOnly, controllers.listCourses);
router.post('/courses/:courseId/register', studentOnly, controllers.registerCourse);
router.get('/my-courses', studentOnly, controllers.listMyCourses);
router.delete('/my-courses/:courseId', studentOnly, controllers.cancelCourse);
router.get('/completed-courses', studentOnly, controllers.listCompletedCourses);
router.get('/dashboard', studentOnly, controllers.dashboard);

module.exports = router;