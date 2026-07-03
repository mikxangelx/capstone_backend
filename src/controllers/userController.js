const User = require('../models/User');

// GET /api/users  (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/students
const getAllStudents = async (req, res) => {
  try {
    const { section } = req.query;
    const filter = { role: 'student' };
    if (section) filter.section = section;

    const students = await User.find(filter).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users  (admin creates a user)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, section } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists.' });

    const user = await User.create({ name, email, password, role, section });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id  (admin updates a user)
const updateUser = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, rest, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'User not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id  (admin only)
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, getAllStudents, getUserById, createUser, updateUser, deleteUser };
