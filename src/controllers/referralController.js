const Referral    = require('../models/Referral');
const Conference  = require('../models/Conference');

// GET /api/referrals?status=Pending&studentId=...&caseId=...
const getAllReferrals = async (req, res) => {
  try {
    const { status, studentId, caseId } = req.query;
    const filter = {};
    if (status)    filter.status  = status;
    if (studentId) filter.student = studentId;
    if (caseId)    filter.case    = caseId;

    const referrals = await Referral.find(filter)
      .populate('student', 'name section email')
      .populate('fromUser', 'name')
      .populate('case', 'type priority')
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/referrals  (teacher forwards a student)
const createReferral = async (req, res) => {
  try {
    const { student, reason, caseId, guardian } = req.body;

    const referral = await Referral.create({
      student,
      fromUser: req.user._id,
      reason,
      case: caseId || null,
      guardian,
    });

    res.status(201).json(
      await referral.populate('student', 'name section')
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/referrals/:id/schedule  (guidance counselor schedules a conference)
const scheduleReferral = async (req, res) => {
  try {
    const { scheduledDate, scheduledTime, guardian } = req.body;

    const referral = await Referral.findById(req.params.id).populate('student', 'name section');
    if (!referral) return res.status(404).json({ message: 'Referral not found.' });

    referral.status        = 'Scheduled';
    referral.scheduledDate = scheduledDate;
    referral.scheduledTime = scheduledTime;
    if (guardian) referral.guardian = guardian;
    await referral.save();

    // Create a Conference document so it shows up in GET /conferences
    const existingConf = await Conference.findOne({ referral: referral._id });
    if (!existingConf) {
      await Conference.create({
        student:      referral.student._id,
        case:         referral.case || null,
        referral:     referral._id,
        parent:       guardian || referral.guardian || '',
        date:         scheduledDate,
        time:         scheduledTime,
        scheduledBy:  req.user._id,
      });
    } else {
      // Referral rescheduled — update the existing conference
      existingConf.date   = scheduledDate;
      existingConf.time   = scheduledTime;
      existingConf.status = 'Scheduled';
      if (guardian) existingConf.parent = guardian;
      await existingConf.save();
    }

    res.json(referral);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/referrals/:id/decline
const declineReferral = async (req, res) => {
  try {
    const updated = await Referral.findByIdAndUpdate(
      req.params.id,
      { status: 'Declined' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Referral not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllReferrals, createReferral, scheduleReferral, declineReferral };
