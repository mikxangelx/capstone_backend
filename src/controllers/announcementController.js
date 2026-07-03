const Announcement = require('../models/Announcement');

// GET /api/announcements  (any logged-in user)
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/announcements  (teacher/admin only)
const createAnnouncement = async (req, res) => {
  try {
    const { title, body, tag, imageUrl } = req.body;
    const announcement = await Announcement.create({
      title,
      body,
      tag,
      imageUrl: imageUrl || null,
      postedBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/announcements/:id  (admin only)
const deleteAnnouncement = async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Announcement not found.' });
    res.json({ message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
