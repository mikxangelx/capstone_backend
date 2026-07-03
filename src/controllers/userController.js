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
// For students: auto-generates a system email, also creates a parent account.
const createUser = async (req, res) => {
  try {
    const {
      name, email, password, role, section,
      parentName, parentEmail, parentPassword,
    } = req.body;

    let userEmail = email;

    // Students don't log in — auto-generate a system email from their name
    if (role === 'student') {
      userEmail = `${name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@student.hhca.edu.ph`;
    }

    const existing = await User.findOne({ email: userEmail?.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already exists.' });

    const user = await User.create({
      name,
      email:          userEmail,
      password:       password || 'student1234',
      role,
      section:        section || null,
      isPasswordTemp: false,
    });

    // If adding a student, also create the linked parent account
    let parent = null;
    if (role === 'student' && parentName && parentEmail) {
      const parentExists = await User.findOne({ email: parentEmail.toLowerCase() });
      if (parentExists) {
        return res.status(400).json({ message: 'Parent email already exists.' });
      }

      parent = await User.create({
        name:           parentName,
        email:          parentEmail,
        password:       parentPassword || 'hhca1234',
        role:           'parent',
        childName:      name,
        isPasswordTemp: true,
      });
    }

    res.status(201).json({ user, parent });
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
