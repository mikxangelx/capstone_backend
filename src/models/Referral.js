const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // teacher who made the referral
      required: true,
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      default: null,
    },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Scheduled', 'Declined'],
      default: 'Pending',
    },
    // Set when guidance counselor schedules a conference
    scheduledDate: { type: String },  // "YYYY-MM-DD"
    scheduledTime: { type: String },  // "HH:MM"
    guardian: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Referral', referralSchema);
