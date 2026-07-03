require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Attendance = require('./src/models/Attendance');
const Announcement = require('./src/models/Announcement');

const STUDENTS = [
  { name: 'Andrea Santos',    section: 'Grade 10 - St. Peter' },
  { name: 'Miguel Reyes',     section: 'Grade 10 - St. Peter' },
  { name: 'Sofia Dela Cruz',  section: 'Grade 10 - St. Peter' },
  { name: 'Gabriel Mendoza',  section: 'Grade 10 - St. Peter' },
  { name: 'Isabella Garcia',  section: 'Grade 10 - St. Peter' },
  { name: 'Lucas Aquino',     section: 'Grade 10 - St. Peter' },
  { name: 'Chloe Ramos',      section: 'Grade 10 - St. Peter' },
  { name: 'Nathan Villanueva',section: 'Grade 10 - St. Peter' },
  { name: 'Ella Navarro',     section: 'Grade 10 - St. Peter' },
  { name: 'Daniel Cruz',      section: 'Grade 10 - St. Peter' },
];

const STAFF = [
  { name: 'Teacher User',         email: 'teacher@hhca.edu.ph',   password: 'teacher1234',  role: 'teacher' },
  { name: 'Guidance Counselor',   email: 'guidance@hhca.edu.ph',  password: 'guidance1234', role: 'guidance_counselor' },
  { name: 'Admin User',           email: 'admin@hhca.edu.ph',     password: 'admin1234',    role: 'admin' },
  { name: 'Maria Santos',         email: 'parent@hhca.edu.ph',    password: 'parent1234',   role: 'parent', childName: 'Andrea Santos' },
];

const STATUSES = ['present', 'late', 'absent', 'excused'];
const DATES = [
  '2026-07-01', '2026-06-30', '2026-06-27',
  '2026-06-26', '2026-06-25', '2026-06-24',
];

function randomStatus(name, date) {
  // Simple deterministic hash so same student = same pattern every seed
  let hash = 0;
  for (const c of name + date) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  const weights = [70, 15, 10, 5]; // present, late, absent, excused %
  const r = Math.abs(hash) % 100;
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (r < acc) return STATUSES[i];
  }
  return 'present';
}

function timeIn(status) {
  if (status === 'absent' || status === 'excused') return '—';
  if (status === 'late') return `08:${String(Math.floor(Math.random() * 30) + 5).padStart(2, '0')} AM`;
  return `07:${String(Math.floor(Math.random() * 25) + 35).padStart(2, '0')} AM`;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear old data
  await Promise.all([
    User.deleteMany({}),
    Attendance.deleteMany({}),
    Announcement.deleteMany({}),
  ]);
  console.log('Cleared old data');

  // Create staff (passwords will be hashed by pre-save hook)
  const staffDocs = [];
  for (const s of STAFF) {
    const exists = await User.findOne({ email: s.email });
    if (!exists) staffDocs.push(s);
  }
  const createdStaff = await User.create(STAFF);
  const teacher = createdStaff.find((u) => u.role === 'teacher');
  console.log(`Created ${createdStaff.length} staff accounts`);

  // Create student accounts
  const studentDocs = STUDENTS.map((s) => ({
    name: s.name,
    email: `${s.name.split(' ')[0].toLowerCase()}.${s.name.split(' ')[1].toLowerCase()}@hhca.edu.ph`,
    password: 'student1234',
    role: 'student',
    section: s.section,
  }));
  const createdStudents = await User.create(studentDocs);
  console.log(`Created ${createdStudents.length} student accounts`);

  // Create attendance records
  const attendanceRecords = [];
  for (const student of createdStudents) {
    for (const date of DATES) {
      const status = randomStatus(student.name, date);
      attendanceRecords.push({
        studentName: student.name,
        section: student.section,
        date: new Date(date),
        status,
        timeIn: timeIn(status),
        markedBy: teacher._id,
      });
    }
  }
  await Attendance.create(attendanceRecords);
  console.log(`Created ${attendanceRecords.length} attendance records`);

  // Create announcements
  await Announcement.create([
    {
      title: 'Semestral Break',
      body: 'Classes will be suspended from July 5-10 for semestral break.',
      tag: 'holiday',
      postedBy: teacher._id,
    },
    {
      title: 'Card Distribution',
      body: 'Report cards will be distributed on July 12. Parents are required to claim.',
      tag: 'event',
      postedBy: teacher._id,
    },
    {
      title: 'Attendance Reminder',
      body: 'Students with 5+ absences will receive a parent advisory letter.',
      tag: 'reminder',
      postedBy: teacher._id,
    },
  ]);
  console.log('Created announcements');

  console.log('\n✅ Seed complete! Accounts:');
  console.log('  teacher@hhca.edu.ph    / teacher1234');
  console.log('  guidance@hhca.edu.ph   / guidance1234');
  console.log('  admin@hhca.edu.ph      / admin1234');
  console.log('  parent@hhca.edu.ph     / parent1234');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
