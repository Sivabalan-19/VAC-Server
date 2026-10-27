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
	if (status && status !== 'all') {
		const s = String(status).toLowerCase();
		if (s === 'pending') {
			conditions.push(`c.status_text ILIKE '%Pending%'`);
		} else if (s === 'active') {
			conditions.push(`(c.status_text ILIKE '%Approved%' OR c.status_text ILIKE '%Registration%' OR c.status_text ILIKE '%Opened%' OR c.status_text ILIKE '%Attendance%') AND c.status_text NOT ILIKE '%Pending%' AND c.status_text NOT ILIKE '%Reject%'`);
		} else if (s === 'completed') {
			conditions.push(`c.status_text ILIKE '%Completed%'`);
		} else if (s === 'rejected' || s === 'reject') {
			conditions.push(`c.status_text ILIKE '%Reject%'`);
		} else {
			values.push(status);
			conditions.push(`c.status_text ILIKE '%' || $${values.length} || '%'`);
		}
	}
	if (search) {
		values.push(search);
		conditions.push(`(c.name ILIKE '%' || $${values.length} || '%' OR c.code ILIKE '%' || $${values.length} || '%' OR c.instructor ILIKE '%' || $${values.length} || '%' OR c.department ILIKE '%' || $${values.length} || '%' OR c.category ILIKE '%' || $${values.length} || '%')`);
	}
	if (mode && mode !== 'all') {
		values.push(mode);
		conditions.push(`c.mode = $${values.length}`);
	}
	if (category && category !== 'all') {
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
			a.marked_at AS "markedTime",
			e.status AS "enrollmentStatus",
			TO_CHAR(e.completed_at, 'YYYY-MM-DD') AS "completedDate",
			(e.status = 'Completed') AS "creditsAwarded"
		 FROM course_enrollments e
		 JOIN users u ON u.id = e.student_id
		 LEFT JOIN attendance_records a ON a.course_id = e.course_id AND a.student_id = e.student_id
		 WHERE e.course_id = $1 AND e.status IN ('Registered', 'Completed')
		 ORDER BY e.created_at, u.full_name`,
		[courseId]
	);
}

async function createCourse(course) {
	let currentStep = 1;
	const lower = String(course.statusText || '').toLowerCase();
	if (lower.includes('registration') || lower.includes('approved')) {
		currentStep = 2;
	} else if (lower.includes('attendance')) {
		currentStep = 3;
	} else if (lower.includes('completed')) {
		currentStep = 4;
	}

	const rows = await query(
		`INSERT INTO courses (
			course_date, name, code, course_type, category, mode, status_text, current_step, organizer,
			image_url, details, instructor, department, capacity, reg_start_date, reg_end_date,
			start_date, end_date, location, credit
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
		 RETURNING id`,
		[
			course.courseDate,
			course.name,
			course.code,
			course.type,
			course.category,
			course.mode,
			course.statusText,
			currentStep,
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
	let currentStep = 2;
	const lower = String(statusText || "").toLowerCase();
	if (lower.includes("pending") || lower.includes("reject")) {
		currentStep = 1;
	} else if (lower.includes("attendance")) {
		currentStep = 3;
	} else if (lower.includes("completed")) {
		currentStep = 4;
	} else if (lower.includes("registration") || lower.includes("approved")) {
		currentStep = 2;
	}

	const rows = await query(
		`UPDATE courses SET
			status_text = $2,
			current_step = $3,
			rejection_reason = $4
		 WHERE id = $1 RETURNING id`,
		[courseId, statusText, currentStep, rejectionReason || null]
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
			COUNT(*) FILTER (WHERE (status_text ILIKE '%Opened%' OR status_text ILIKE '%Attendance%' OR status_text ILIKE '%Approved%' OR status_text ILIKE '%Registration%') AND status_text NOT ILIKE '%Pending%' AND status_text NOT ILIKE '%Reject%')::int AS "activeCourses",
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

async function awardCredits(courseId) {
	const courseRows = await query(`SELECT id, name, credit FROM courses WHERE id = $1`, [courseId]);
	if (!courseRows.length) {
		const error = new Error('Course not found');
		error.status = 404;
		throw error;
	}
	const course = courseRows[0];
	const credits = course.credit || 1;

	// Total enrolled students
	const enrolledRows = await query(
		`SELECT COUNT(*)::int AS count,
		        COUNT(*) FILTER (WHERE status = 'Completed')::int AS completed_count
		 FROM course_enrollments
		 WHERE course_id = $1 AND status IN ('Registered', 'Completed')`,
		[courseId]
	);
	const totalEnrolled = enrolledRows[0]?.count || 0;
	const alreadyCompleted = enrolledRows[0]?.completed_count || 0;

	if (totalEnrolled === 0) {
		return {
			message: 'No enrolled students found for this course.',
			awardedCount: 0,
			totalEnrolled: 0,
			alreadyAwarded: 0,
			creditsPerStudent: credits,
		};
	}

	// Update only students with status = 'Registered'. This strictly avoids duplicating credits!
	const updated = await query(
		`UPDATE course_enrollments
		 SET status = 'Completed', completed_at = COALESCE(completed_at, CURRENT_DATE)
		 WHERE course_id = $1 AND status = 'Registered'
		 RETURNING student_id`,
		[courseId]
	);

	const newlyAwarded = updated.length;
	if (newlyAwarded === 0) {
		return {
			message: `Credits (${credits} credits) have already been awarded to all ${totalEnrolled} enrolled student(s). No duplicate credits were added.`,
			awardedCount: 0,
			totalEnrolled,
			alreadyAwarded: alreadyCompleted,
			creditsPerStudent: credits,
		};
	}

	return {
		message: `Successfully awarded ${credits} credit(s) to ${newlyAwarded} student(s)! (${alreadyCompleted + newlyAwarded}/${totalEnrolled} total students completed)`,
		awardedCount: newlyAwarded,
		totalEnrolled,
		alreadyAwarded: alreadyCompleted + newlyAwarded,
		creditsPerStudent: credits,
	};
}

async function awardStudentCredit(courseId, studentId) {
	const courseRows = await query(`SELECT id, name, credit FROM courses WHERE id = $1`, [courseId]);
	if (!courseRows.length) {
		const error = new Error('Course not found');
		error.status = 404;
		throw error;
	}
	const credits = courseRows[0].credit || 1;

	const checkRows = await query(
		`SELECT status FROM course_enrollments WHERE course_id = $1 AND student_id = $2`,
		[courseId, studentId]
	);
	if (!checkRows.length || checkRows[0].status === 'Cancelled') {
		const error = new Error('Active student enrollment not found');
		error.status = 404;
		throw error;
	}

	if (checkRows[0].status === 'Completed') {
		return {
			message: `Credits (${credits} credits) have already been awarded to this student. No duplicate credits added.`,
			awarded: false,
			credits,
		};
	}

	await query(
		`UPDATE course_enrollments
		 SET status = 'Completed', completed_at = CURRENT_DATE
		 WHERE course_id = $1 AND student_id = $2 AND status = 'Registered'`,
		[courseId, studentId]
	);

	return {
		message: `Successfully awarded ${credits} credit(s) to the student!`,
		awarded: true,
		credits,
	};
}

module.exports = {
	awardCredits,
	awardStudentCredit,
	createCourse,
	findCourse,
	findRoster,
	getDashboard,
	listCourses,
	markAllPresent,
	updateAttendance,
	updateCourseStatus,
};
