const { query } = require('../config/db');

async function createUser({ fullName, email, passwordHash, role, facultyType = null }) {
	const result = await query(
		`
			INSERT INTO users (full_name, email, password_hash, role, faculty_type)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, full_name AS "fullName", email, role, faculty_type AS "facultyType", created_at AS "createdAt"
		`,
		[fullName, email, passwordHash, role, facultyType]
	);

	return result[0];
}

async function findUserByEmail(email) {
	const rows = await query(
		`SELECT id, full_name AS "fullName", email, roll_no AS "rollNo", department, password_hash AS "passwordHash", role, faculty_type AS "facultyType", created_at AS "createdAt"
		 FROM users
		 WHERE LOWER(email) = LOWER($1)
		    OR LOWER(roll_no) = LOWER($1)
		    OR LOWER(email) = LOWER($1 || '@example.com')
		    OR LOWER(email) LIKE LOWER($1 || '@%')
		 ORDER BY id ASC
		 LIMIT 1`,
		[email]
	);

	return rows[0] || null;
}

async function findUserById(id) {
	const rows = await query(
		'SELECT id, full_name AS "fullName", email, role, faculty_type AS "facultyType", created_at AS "createdAt" FROM users WHERE id = $1 LIMIT 1',
		[id]
	);

	return rows[0] || null;
}

module.exports = {
	createUser,
	findUserByEmail,
	findUserById,
};
