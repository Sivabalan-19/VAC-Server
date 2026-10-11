require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, initializeDatabase } = require('./config/db');

async function seedDatabase() {
  console.log('--- Initializing database schema ---');
  await initializeDatabase();

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  console.log('--- Seeding Users ---');
  const sampleUsers = [
    {
      fullName: 'Aarav Sharma',
      email: 'student@example.com',
      passwordHash: defaultPasswordHash,
      role: 'student',
      facultyType: null,
      rollNo: '21CSE01',
      department: 'Computer Science & Engineering',
      academicYear: '3rd Year',
    },
    {
      fullName: 'Bhavna Patel',
      email: 'bhavna.p@univ.edu',
      passwordHash: defaultPasswordHash,
      role: 'student',
      facultyType: null,
      rollNo: '21CSE04',
      department: 'Computer Science & Engineering',
      academicYear: '3rd Year',
    },
    {
      fullName: 'Chirag Verma',
      email: 'chirag.v@univ.edu',
      passwordHash: defaultPasswordHash,
      role: 'student',
      facultyType: null,
      rollNo: '21ECE12',
      department: 'Electronics & Communication',
      academicYear: '3rd Year',
    },
    {
      fullName: 'Divya Nair',
      email: 'divya.n@univ.edu',
      passwordHash: defaultPasswordHash,
      role: 'student',
      facultyType: null,
      rollNo: '22IT05',
      department: 'Information Technology',
      academicYear: '2nd Year',
    },
    {
      fullName: 'Eshan Gupta',
      email: 'eshan.g@univ.edu',
      passwordHash: defaultPasswordHash,
      role: 'student',
      facultyType: null,
      rollNo: '21CSE22',
      department: 'Computer Science & Engineering',
      academicYear: '3rd Year',
    },
    {
      fullName: 'Dr. Sarah Connor',
      email: 'faculty@example.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      facultyType: 'internal',
      rollNo: null,
      department: 'Computer Science & Engineering',
      academicYear: null,
    },
    {
      fullName: 'Dr. Satoshi Nakamoto',
      email: 'satoshi@example.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      facultyType: 'external',
      rollNo: null,
      department: 'Information Technology',
      academicYear: null,
    },
    {
      fullName: 'Dr. Robert Vance',
      email: 'admin@example.com',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      facultyType: null,
      rollNo: null,
      department: 'Dean of Academics',
      academicYear: null,
    },
  ];

  for (const u of sampleUsers) {
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, faculty_type, roll_no, department, academic_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         faculty_type = EXCLUDED.faculty_type,
         roll_no = EXCLUDED.roll_no,
         department = EXCLUDED.department,
         academic_year = EXCLUDED.academic_year`,
      [u.fullName, u.email, u.passwordHash, u.role, u.facultyType, u.rollNo, u.department, u.academicYear]
    );
  }
  console.log(`Seeded ${sampleUsers.length} users (Password: password123)`);

  console.log('--- Seeding Courses ---');
  const sampleCourses = [
    {
      name: 'AI TECHNOLOGY - FUTURE OF INDUSTRIAL REVOLUTION',
      code: 'VAC-AI-101',
      courseType: 'Webinar',
      category: 'Artificial Intelligence',
      mode: 'Online',
      credit: 2,
      capacity: 60,
      details: 'Webinar explaining key industrial integrations with generative AI models and automation paradigms. Guest Speaker: Dr. Sarah Connor.',
      instructor: 'Dr. Sarah Connor & Prof. Alan Turing',
      department: 'Computer Science & Engineering',
      statusText: 'Attendance Opened',
      currentStep: 3,
      imageUrl: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=600&auto=format&fit=crop',
      regStartDate: '2026-08-15',
      regEndDate: '2026-08-25',
      startDate: '2026-08-28 10:00:00+00',
      endDate: '2026-08-29 17:00:00+00',
      location: 'Textile Seminar Hall',
      organizer: 'CSE/VAC-01',
      courseDate: '2026-08-28',
      attendedCount: 46,
    },
    {
      name: 'BLOCKCHAIN DECENTRALIZED PLATFORMS',
      code: 'VAC-BC-202',
      courseType: 'Guest Lecturer',
      category: 'Cyber Security & Web3',
      mode: 'Hybrid',
      credit: 2,
      capacity: 50,
      details: 'Guest lecture covering decentralized ledger technology, smart contract security standards, and audits.',
      instructor: 'Dr. Satoshi Nakamoto (Guest)',
      department: 'Information Technology',
      statusText: 'Approval Pending...',
      currentStep: 1,
      imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop',
      regStartDate: '2026-08-20',
      regEndDate: '2026-08-30',
      startDate: '2026-09-02 14:00:00+00',
      endDate: '2026-09-02 17:00:00+00',
      location: 'ECE Seminar Hall',
      organizer: 'IT/VAC-02',
      courseDate: '2026-09-02',
      attendedCount: 0,
    },
    {
      name: 'IOT & EMBEDDED SYSTEM PROTOCOLS',
      code: 'VAC-IOT-301',
      courseType: 'Workshop',
      category: 'Embedded Systems',
      mode: 'Offline',
      credit: 3,
      capacity: 45,
      details: 'Hands-on hardware programming workshop on ESP32, MQTT protocols, and real-time sensor cloud streaming.',
      instructor: 'Prof. Nikola Tesla',
      department: 'Electronics & Communication',
      statusText: 'Attendance Opened',
      currentStep: 3,
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
      regStartDate: '2026-08-25',
      regEndDate: '2026-09-05',
      startDate: '2026-09-10 09:30:00+00',
      endDate: '2026-09-10 16:30:00+00',
      location: 'SF1',
      organizer: 'ECE/VAC-03',
      courseDate: '2026-09-10',
      attendedCount: 38,
    },
    {
      name: 'PRODUCT UI/UX DESIGN SYSTEM',
      code: 'VAC-UI-405',
      courseType: 'Seminar',
      category: 'Design & Media',
      mode: 'Online',
      credit: 1,
      capacity: 80,
      details: 'Interactive design workshop on crafting design tokens, component architecture, and accessibility standards.',
      instructor: 'Ms. Jony Ive',
      department: 'Design & Media',
      statusText: 'Course Completed',
      currentStep: 4,
      imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=600&auto=format&fit=crop',
      regStartDate: '2026-08-01',
      regEndDate: '2026-08-10',
      startDate: '2026-08-12 11:00:00+00',
      endDate: '2026-08-12 14:00:00+00',
      location: 'SF2',
      organizer: 'DES/VAC-04',
      courseDate: '2026-08-12',
      attendedCount: 72,
    },
    {
      name: 'CLOUD INFRASTRUCTURE & DEVOPS',
      code: 'VAC-CLD-502',
      courseType: 'Clubs & Societies',
      category: 'Cloud Computing',
      mode: 'Offline',
      credit: 2,
      capacity: 40,
      details: 'Learn Docker, Kubernetes, CI/CD pipelines and Terraform automation in modern cloud providers.',
      instructor: 'Dr. Linus Torvalds',
      department: 'Computer Science & Engineering',
      statusText: 'Ready For Registration',
      currentStep: 2,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
      regStartDate: '2026-09-01',
      regEndDate: '2026-09-15',
      startDate: '2026-09-20 10:00:00+00',
      endDate: '2026-09-21 16:00:00+00',
      location: 'Textile Seminar Hall',
      organizer: 'CSE/VAC-05',
      courseDate: '2026-09-20',
      attendedCount: 0,
    },
    {
      name: 'CYBER DEFENSIVE & ETHICAL HACKING',
      code: 'VAC-SEC-601',
      courseType: 'Workshop',
      category: 'Cyber Security',
      mode: 'Offline',
      credit: 3,
      capacity: 35,
      details: 'Defensive security techniques, network vulnerability scanning, SOC operations, and incident response.',
      instructor: 'Prof. Kevin Mitnick',
      department: 'Cyber Security',
      statusText: 'Ready For Registration',
      currentStep: 2,
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
      regStartDate: '2026-09-05',
      regEndDate: '2026-09-18',
      startDate: '2026-09-25 09:00:00+00',
      endDate: '2026-09-26 17:00:00+00',
      location: 'ECE Seminar Hall',
      organizer: 'CYBER/VAC-06',
      courseDate: '2026-09-25',
      attendedCount: 0,
    },
  ];

  for (const c of sampleCourses) {
    await pool.query(
      `INSERT INTO courses (
         name, code, course_type, category, mode, credit, organizer,
         capacity, details, instructor, department, status_text,
         current_step, image_url, reg_start_date, reg_end_date,
         start_date, end_date, location, course_date, attended_count
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12,
         $13, $14, $15, $16,
         $17, $18, $19, $20, $21
       )
       ON CONFLICT (name) DO UPDATE SET
         code = EXCLUDED.code,
         course_type = EXCLUDED.course_type,
         category = EXCLUDED.category,
         mode = EXCLUDED.mode,
         credit = EXCLUDED.credit,
         organizer = EXCLUDED.organizer,
         capacity = EXCLUDED.capacity,
         details = EXCLUDED.details,
         instructor = EXCLUDED.instructor,
         department = EXCLUDED.department,
         status_text = EXCLUDED.status_text,
         current_step = EXCLUDED.current_step,
         image_url = EXCLUDED.image_url,
         reg_start_date = EXCLUDED.reg_start_date,
         reg_end_date = EXCLUDED.reg_end_date,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         location = EXCLUDED.location,
         course_date = EXCLUDED.course_date,
         attended_count = EXCLUDED.attended_count`,
      [
        c.name,
        c.code,
        c.courseType,
        c.category,
        c.mode,
        c.credit,
        c.organizer,
        c.capacity,
        c.details,
        c.instructor,
        c.department,
        c.statusText,
        c.currentStep,
        c.imageUrl,
        c.regStartDate,
        c.regEndDate,
        c.startDate,
        c.endDate,
        c.location,
        c.courseDate,
        c.attendedCount,
      ]
    );
  }
  console.log(`Seeded ${sampleCourses.length} courses`);

  console.log('--- Seeding Enrollments and Attendance ---');
  // Get student IDs
  const userRows = await pool.query(`SELECT id, email FROM users`);
  const usersByEmail = {};
  userRows.rows.forEach((u) => {
    usersByEmail[u.email] = u.id;
  });

  const courseRows = await pool.query(`SELECT id, name FROM courses`);
  const coursesByName = {};
  courseRows.rows.forEach((c) => {
    coursesByName[c.name] = c.id;
  });

  const studentId = usersByEmail['student@example.com'];
  const bhavnaId = usersByEmail['bhavna.p@univ.edu'];
  const chiragId = usersByEmail['chirag.v@univ.edu'];
  const divyaId = usersByEmail['divya.n@univ.edu'];
  const eshanId = usersByEmail['eshan.g@univ.edu'];

  const aiCourseId = coursesByName['AI TECHNOLOGY - FUTURE OF INDUSTRIAL REVOLUTION'];
  const iotCourseId = coursesByName['IOT & EMBEDDED SYSTEM PROTOCOLS'];
  const uiCourseId = coursesByName['PRODUCT UI/UX DESIGN SYSTEM'];
  const bcCourseId = coursesByName['BLOCKCHAIN DECENTRALIZED PLATFORMS'];

  const enrollments = [
    { studentId, courseId: aiCourseId, status: 'Registered' },
    { studentId, courseId: iotCourseId, status: 'Registered' },
    { studentId, courseId: uiCourseId, status: 'Completed', completedAt: '2026-08-13' },
    { studentId: bhavnaId, courseId: aiCourseId, status: 'Registered' },
    { studentId: chiragId, courseId: aiCourseId, status: 'Registered' },
    { studentId: divyaId, courseId: aiCourseId, status: 'Registered' },
    { studentId: eshanId, courseId: aiCourseId, status: 'Registered' },
    { studentId: bhavnaId, courseId: bcCourseId, status: 'Registered' },
  ];

  for (const e of enrollments) {
    if (e.studentId && e.courseId) {
      await pool.query(
        `INSERT INTO course_enrollments (student_id, course_id, status, completed_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (student_id, course_id) DO UPDATE SET
           status = EXCLUDED.status,
           completed_at = EXCLUDED.completed_at`,
        [e.studentId, e.courseId, e.status, e.completedAt || null]
      );
    }
  }

  const attendanceRecords = [
    { courseId: aiCourseId, studentId, status: 'Present' },
    { courseId: aiCourseId, studentId: bhavnaId, status: 'Present' },
    { courseId: aiCourseId, studentId: chiragId, status: 'Absent' },
    { courseId: aiCourseId, studentId: divyaId, status: 'Present' },
    { courseId: aiCourseId, studentId: eshanId, status: 'Present' },
    { courseId: iotCourseId, studentId, status: 'Present' },
  ];

  for (const a of attendanceRecords) {
    if (a.courseId && a.studentId) {
      await pool.query(
        `INSERT INTO attendance_records (course_id, student_id, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (course_id, student_id) DO UPDATE SET
           status = EXCLUDED.status`,
        [a.courseId, a.studentId, a.status]
      );
    }
  }

  console.log('--- Sample data successfully inserted! ---');
}

seedDatabase()
  .then(() => {
    console.log('Done!');
    pool.end();
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    pool.end();
    process.exit(1);
  });
