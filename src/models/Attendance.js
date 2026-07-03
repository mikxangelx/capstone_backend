const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'excused'],
      required: true,
    },
    timeIn: {
      type: String,
      default: '—',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // the teacher who marked it
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
