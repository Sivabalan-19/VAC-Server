const { query } = require('../config/db');

const courseSelect = `
	c.id,
	c.name,
	c.code,
	c.course_type AS type,
	c.category,
	c.mode,
	c.status_text AS "statusText",
	c.current_step AS "currentStep",
	c.image_url AS "imageUrl",
	c.details,
	c.instructor,
	c.department,
	c.capacity AS "maxIntake",
	COUNT(e.id) FILTER (WHERE e.status IN ('Registered', 'Completed'))::int AS "registeredCount",
	c.attended_count AS "attendedCount",
	TO_CHAR(c.reg_start_date, 'YYYY-MM-DD') AS "regStartDate",
	TO_CHAR(c.reg_end_date, 'YYYY-MM-DD') AS "regEndDate",
	TO_CHAR(c.start_date, 'YYYY-MM-DD HH12:MI AM') AS "startDate",
	TO_CHAR(c.end_date, 'YYYY-MM-DD HH12:MI AM') AS "endDate",
	c.location,
	c.credit AS credits,
	c.rejection_reason AS "rejectionReason"
`;

async function listCourses({ status, search, mode, category }) {
	const values = [];
	const conditions = [];
	if (status) {
		values.push(status);
		conditions.push(`c.status_text ILIKE '%' || $${values.length} || '%'`);
	}
	if (search) {
		values.push(search);
		conditions.push(`(c.name ILIKE '%' || $${values.length} || '%' OR c.code ILIKE '%' || $${values.length} || '%' OR c.instructor ILIKE '%' || $${values.length} || '%' OR c.department ILIKE '%' || $${values.length} || '%' OR c.category ILIKE '%' || $${values.length} || '%')`);
	}
	if (mode) {
		values.push(mode);
		conditions.push(`c.mode = $${values.length}`);
	}
	if (category) {
		values.push(category);
		conditions.push(`c.category = $${values.length}`);
	}

	return query(
		`SELECT ${courseSelect}
		 FROM courses c
		 LEFT JOIN course_enrollments e ON e.course_id = c.id
		 ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
		 GROUP BY c.id
		 ORDER BY c.created_at DESC, c.id DESC`,
		values
	);
}

async function findCourse(courseId) {
	const rows = await query(
		`SELECT ${courseSelect}
		 FROM courses c
		 LEFT JOIN course_enrollments e ON e.course_id = c.id
		 WHERE c.id = $1
		 GROUP BY c.id`,
		[courseId]
	);
	return rows[0] || null;
}

async function findRoster(courseId) {
	return query(
		`SELECT u.id, u.full_name AS "studentName", u.roll_no AS "rollNo",
			u.department, u.academic_year AS year, u.email,
			TO_CHAR(e.created_at, 'YYYY-MM-DD') AS "registeredDate",
			COALESCE(a.status, 'Absent') AS "attendanceStatus",
			a.marked_at AS "markedTime"
		 FROM course_enrollments e
		 JOIN users u ON u.id = e.student_id
		 LEFT JOIN attendance_records a ON a.course_id = e.course_id AND a.student_id = e.student_id
		 WHERE e.course_id = $1 AND e.status IN ('Registered', 'Completed')
		 ORDER BY e.created_at, u.full_name`,
		[courseId]
	);
}

async function createCourse(course) {
	const rows = await query(
		`INSERT INTO courses (
			course_date, name, code, course_type, category, mode, status_text, current_step, organizer,
			image_url, details, instructor, department, capacity, reg_start_date, reg_end_date,
			start_date, end_date, location, credit
		) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
		 RETURNING id`,
		[
			course.courseDate,
			course.name,
			course.code,
			course.type,
			course.category,
			course.mode,
			course.statusText,
			course.organizer,
			course.imageUrl,
			course.details,
			course.instructor,
			course.department,
			course.maxIntake,
			course.regStartDate,
			course.regEndDate,
			course.startDate,
			course.endDate,
			course.location,
			course.credits,
		]
	);
	return findCourse(rows[0].id);
}

async function updateCourseStatus(courseId, statusText, rejectionReason) {
	const rows = await query(
		`UPDATE courses SET status_text = $2, current_step = CASE
			WHEN $2 ILIKE '%Pending%' THEN 1
			WHEN $2 ILIKE '%Reject%' THEN 1
			WHEN $2 ILIKE '%Completed%' THEN 4
			ELSE 3 END,
			rejection_reason = $3
		 WHERE id = $1 RETURNING id`,
		[courseId, statusText, rejectionReason || null]
	);
	return rows[0] || null;
}

async function updateAttendance(courseId, studentId, status) {
	const rows = await query(
		`INSERT INTO attendance_records (course_id, student_id, status)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (course_id, student_id) DO UPDATE SET status = $3, marked_at = NOW()
		 RETURNING status, marked_at AS "markedTime"`,
		[courseId, studentId, status]
	);
	return rows[0] || null;
}

async function markAllPresent(courseId) {
	return query(
		`INSERT INTO attendance_records (course_id, student_id, status)
		 SELECT $1, student_id, 'Present' FROM course_enrollments
		 WHERE course_id = $1 AND status IN ('Registered', 'Completed')
		 ON CONFLICT (course_id, student_id) DO UPDATE SET status = 'Present', marked_at = NOW()
		 RETURNING student_id`,
		[courseId]
	);
}

async function getDashboard() {
	const rows = await query(`
		SELECT COUNT(*)::int AS "totalCourses",
			COUNT(*) FILTER (WHERE status_text ILIKE '%Pending%')::int AS "pendingCourses",
			COUNT(*) FILTER (WHERE status_text ILIKE '%Opened%' OR status_text ILIKE '%Attendance%' OR status_text ILIKE '%Approved%')::int AS "activeCourses",
			COALESCE(SUM(enrolled.registered_count), 0)::int AS "totalStudents",
			COUNT(DISTINCT instructor)::int AS "uniqueInstructors"
		FROM (
			SELECT c.id, c.status_text, c.instructor,
				COUNT(e.id) FILTER (WHERE e.status IN ('Registered', 'Completed')) AS registered_count
			FROM courses c LEFT JOIN course_enrollments e ON e.course_id = c.id
			GROUP BY c.id
		) enrolled
	`);
	return rows[0];
}

module.exports = {
	createCourse,
	findCourse,
	findRoster,
	getDashboard,
	listCourses,
	markAllPresent,
	updateAttendance,
	updateCourseStatus,
};
