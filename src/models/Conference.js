const mongoose = require('mongoose');

const conferenceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      default: null,
    },
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
      default: null,
    },
    parent: { type: String, trim: true },
    date: { type: String, required: true },  // "YYYY-MM-DD"
    time: { type: String },                   // "HH:MM"
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    outcomeType: {
      type: String,
      enum: ['held', 'noshow', 'rescheduled', null],
      default: null,
    },
    outcomeNote: { type: String, trim: true },
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // guidance counselor
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conference', conferenceSchema);
