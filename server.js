require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes         = require('./src/routes/auth');
const userRoutes         = require('./src/routes/users');
const attendanceRoutes   = require('./src/routes/attendance');
const announcementRoutes = require('./src/routes/announcements');
const caseRoutes         = require('./src/routes/cases');
const conferenceRoutes   = require('./src/routes/conferences');
const referralRoutes     = require('./src/routes/referrals');

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));

// ── DB connection (cached for Vercel serverless) ─────────────────────────────
// Vercel may reuse the same Node process across requests, so we skip
// reconnecting if mongoose is already connected/connecting.
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed.' });
  }
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/attendance',    attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/cases',         caseRoutes);
app.use('/api/conferences',   conferenceRoutes);
app.use('/api/referrals',     referralRoutes);

app.get('/', (req, res) => res.json({ message: 'HHCA Backend is running.' }));

// ── Local dev ─────────────────────────────────────────────────────────────────
// `require.main === module` is true only when run directly (node server.js),
// not when imported by Vercel's serverless runtime.
if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => { console.error(err.message); process.exit(1); });
}

module.exports = app;
