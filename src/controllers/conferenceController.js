const Conference = require('../models/Conference');
const Referral   = require('../models/Referral');

// GET /api/conferences?studentId=...&date=...
const getAllConferences = async (req, res) => {
  try {
    const { studentId, date } = req.query;
    const filter = {};
    if (studentId) filter.student = studentId;
    if (date)      filter.date    = date;

    const conferences = await Conference.find(filter)
      .populate('student', 'name section')
      .populate('case', 'type status')
      .sort({ date: -1 });

    res.json(conferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/conferences/:id
const getConferenceById = async (req, res) => {
  try {
    const conf = await Conference.findById(req.params.id)
      .populate('student', 'name section email')
      .populate('case', 'type status priority');

    if (!conf) return res.status(404).json({ message: 'Conference not found.' });
    res.json(conf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/conferences  (guidance counselor schedules)
const createConference = async (req, res) => {
  try {
    const { student, caseId, referralId, parent, date, time } = req.body;

    const conf = await Conference.create({
      student,
      case: caseId || null,
      referral: referralId || null,
      parent,
      date,
      time,
      scheduledBy: req.user._id,
    });

    // If created from a referral, mark it as Scheduled
    if (referralId) {
      await Referral.findByIdAndUpdate(referralId, {
        status: 'Scheduled',
        scheduledDate: date,
        scheduledTime: time,
      });
    }

    res.status(201).json(conf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/conferences/:id/complete
const completeConference = async (req, res) => {
  try {
    const { outcomeType, outcomeNote } = req.body;

    const updated = await Conference.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed', outcomeType, outcomeNote },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Conference not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/conferences/:id
const updateConference = async (req, res) => {
  try {
    const updated = await Conference.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Conference not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllConferences, getConferenceById, createConference, completeConference, updateConference };
