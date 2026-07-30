const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Session = require('../models/Session');
const { memoryStore } = require('../utils/memoryStore');

// Helper to get session from Mongo or MemoryStore safely
async function getSession(sessionId, userId) {
  if (mongoose.connection.readyState === 1) {
    try {
      const session = await Session.findOne({ _id: sessionId, user: userId });
      if (session) return session;
    } catch (e) {}
  }
  // Fallback to memoryStore
  const sess = memoryStore.findSessionById(sessionId);
  if (sess && sess.user.toString() === userId.toString()) return sess;
  return null;
}

async function getLatestCompletedSession(userId) {
  if (mongoose.connection.readyState === 1) {
    try {
      const session = await Session.findOne({ user: userId, status: 'completed' }).sort({ completedAt: -1 });
      if (session) return session;
    } catch (e) {}
  }
  // Fallback to memoryStore
  const userSessions = memoryStore.getUserSessions(userId);
  return userSessions.find(s => s.status === 'completed') || null;
}

// GET /api/evaluation/latest
router.get('/latest', protect, async (req, res) => {
  try {
    const session = await getLatestCompletedSession(req.user._id);
    if (!session) return res.json({ success: true, evaluation: null });
    res.json({
      success: true,
      evaluation: session.evaluation,
      session: {
        role: session.role,
        difficulty: session.difficulty,
        duration: session.duration,
        completedAt: session.completedAt,
        id: session._id,
      }
    });
  } catch (err) {
    console.error('Fetch latest evaluation error:', err);
    res.status(500).json({ error: 'Failed to fetch evaluation.' });
  }
});

// GET /api/evaluation/:sessionId
router.get('/:sessionId', protect, async (req, res) => {
  try {
    const session = await getSession(req.params.sessionId, req.user._id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({
      success: true,
      evaluation: session.evaluation,
      session: {
        role: session.role,
        difficulty: session.difficulty,
        duration: session.duration,
        completedAt: session.completedAt,
        id: session._id,
      }
    });
  } catch (err) {
    console.error('Fetch session evaluation error:', err);
    res.status(500).json({ error: 'Failed to fetch evaluation.' });
  }
});

module.exports = router;
