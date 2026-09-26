const { query } = require('../config/db');

async function findAvailableCourses(studentId) {
	return query(
		`SELECT c.id, TO_CHAR(c.course_date, 'DD/MM/YYYY') AS date, c.name,
			c.course_type AS type, c.mode, c.credit, c.organizer,
			c.capacity - COUNT(e.id) FILTER (WHERE e.status IN ('Registered', 'Completed')) AS available,
			c.details
		 FROM courses c
		 LEFT JOIN course_enrollments e ON e.course_id = c.id
		 WHERE NOT EXISTS (
			 SELECT 1 FROM course_enrollments own
			 WHERE own.course_id = c.id AND own.student_id = $1 AND own.status <> 'Cancelled'
		 )
		 GROUP BY c.id
		 ORDER BY c.course_date DESC, c.id`,
		[studentId]
	);
}

async function findMyCourses(studentId) {
	return query(
		`SELECT c.id, TO_CHAR(c.course_date, 'DD/MM/YYYY') AS date, c.name,
			c.course_type AS type, c.mode, c.credit, c.organizer, e.status, c.details
		 FROM courses c
		 JOIN course_enrollments e ON e.course_id = c.id
		 WHERE e.student_id = $1 AND e.status <> 'Cancelled'
		 ORDER BY e.created_at DESC`,
		[studentId]
	);
}

async function findCompletedCourses(studentId) {
	return query(
		`SELECT c.id, c.name, c.course_type AS type, c.mode, c.credit, c.organizer,
			TO_CHAR(e.completed_at, 'DD Mon YYYY') AS "completedOn"
		 FROM courses c
		 JOIN course_enrollments e ON e.course_id = c.id
		 WHERE e.student_id = $1 AND e.status = 'Completed'
		 ORDER BY e.completed_at DESC NULLS LAST, e.id DESC`,
		[studentId]
	);
}

async function registerForCourse(studentId, courseId) {
	const rows = await query(
		`INSERT INTO course_enrollments (student_id, course_id)
		 SELECT $1, c.id FROM courses c
		 WHERE c.id = $2
		 AND c.capacity > (
			 SELECT COUNT(*) FROM course_enrollments e
			 WHERE e.course_id = c.id AND e.status IN ('Registered', 'Completed')
		 )
		 ON CONFLICT (student_id, course_id) DO UPDATE
		 SET status = CASE WHEN course_enrollments.status = 'Cancelled' THEN 'Registered' ELSE course_enrollments.status END
		 RETURNING id, status`,
		[studentId, courseId]
	);
	return rows[0] || null;
}

async function cancelRegistration(studentId, courseId) {
	const rows = await query(
		`UPDATE course_enrollments SET status = 'Cancelled'
		 WHERE student_id = $1 AND course_id = $2 AND status = 'Registered'
		 RETURNING id`,
		[studentId, courseId]
	);
	return rows[0] || null;
}

async function getDashboard(studentId) {
	const rows = await query(
		`SELECT
			COUNT(*) FILTER (WHERE status = 'Completed')::int AS "completedCourses",
			COALESCE(SUM(c.credit) FILTER (WHERE e.status = 'Completed'), 0)::int AS "totalCredits",
			COUNT(*) FILTER (WHERE status IN ('Registered', 'Completed'))::int AS "enrolledCourses",
			COUNT(*) FILTER (WHERE status = 'Completed' AND c.mode = 'Online')::int AS "onlineCourses",
			COUNT(*) FILTER (WHERE status = 'Completed' AND c.mode = 'Offline')::int AS "offlineCourses",
			MAX(e.completed_at) FILTER (WHERE e.status = 'Completed') AS "latestCompletedOn"
		 FROM course_enrollments e
		 JOIN courses c ON c.id = e.course_id
		 WHERE e.student_id = $1`,
		[studentId]
	);
	const summary = rows[0];
	return {
		...summary,
		completionRate: summary.enrolledCourses ? Math.round((summary.completedCourses / summary.enrolledCourses) * 100) : 0,
	};
}

module.exports = {
	cancelRegistration,
	findAvailableCourses,
	findCompletedCourses,
	findMyCourses,
	getDashboard,
	registerForCourse,
};
