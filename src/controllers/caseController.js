const Case = require('../models/Case');

// GET /api/cases
const getAllCases = async (req, res) => {
  try {
    const { status, priority, studentId } = req.query;
    const filter = {};
    if (status)    filter.status   = status;
    if (priority)  filter.priority = priority;
    if (studentId) filter.student  = studentId;

    const cases = await Case.find(filter)
      .populate('student', 'name section email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/cases/:id
const getCaseById = async (req, res) => {
  try {
    const c = await Case.findById(req.params.id)
      .populate('student', 'name section email')
      .populate('assignedTo', 'name');

    if (!c) return res.status(404).json({ message: 'Case not found.' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cases
const createCase = async (req, res) => {
  try {
    const { student, type, priority, reason, riskFactors, guardian, guardianContact } = req.body;

    const newCase = await Case.create({
      student,
      type,
      priority,
      reason,
      riskFactors,
      guardian,
      guardianContact,
      assignedTo: req.user._id,
    });

    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cases/:id
const updateCase = async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Case not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/cases/:id/resolve
const resolveCase = async (req, res) => {
  try {
    const { resolutionNote } = req.body;
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { status: 'Resolved', resolutionNote, resolvedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Case not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllCases, getCaseById, createCase, updateCase, resolveCase };
