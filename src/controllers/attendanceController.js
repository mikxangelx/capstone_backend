const Attendance = require('../models/Attendance');

// GET /api/attendance?studentName=Andrea Santos
// Parents use this to get their child's records
const getAttendance = async (req, res) => {
  try {
    const { studentName, date, month } = req.query;

    let dateFilter = {};
    if (date) {
      const start = new Date(date);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      dateFilter = { date: { $gte: start, $lt: end } };
    } else if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      dateFilter = { date: { $gte: start, $lt: end } };
    }

    if (req.user.role === 'parent') {
      if (!req.user.childName) {
        return res.status(403).json({ message: 'No linked student found.' });
      }
      const records = await Attendance.find({ studentName: req.user.childName, ...dateFilter })
        .sort({ date: -1 })
        .limit(30);
      return res.json(records);
    }

    const filter = { ...dateFilter };
    if (studentName) filter.studentName = studentName;
    const limit = month ? 500 : 100;
    const records = await Attendance.find(filter).sort({ date: -1 }).limit(limit);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/attendance  (teacher only)
const markAttendance = async (req, res) => {
  try {
    const { studentName, section, date, status, timeIn } = req.body;

    const record = await Attendance.create({
      studentName,
      section,
      date: new Date(date),
      status,
      timeIn: timeIn || '—',
      markedBy: req.user._id,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/attendance/:id  (teacher only — correct a wrong record)
const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAttendance, markAttendance, updateAttendance };
