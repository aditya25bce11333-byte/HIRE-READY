const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Session = require('../models/Session');

// GET /api/evaluation/latest
router.get('/latest', protect, async (req, res) => {
  try {
    const session = await Session.findOne({
      user: req.user._id, status: 'completed'
    }).sort({ completedAt: -1 });

    if (!session) return res.json({ success: true, evaluation: null });
    res.json({ success: true, evaluation: session.evaluation, session: {
      role: session.role, difficulty: session.difficulty, duration: session.duration,
      completedAt: session.completedAt, id: session._id,
    }});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch evaluation.' });
  }
});

// GET /api/evaluation/:sessionId
router.get('/:sessionId', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ success: true, evaluation: session.evaluation, session: {
      role: session.role, difficulty: session.difficulty, duration: session.duration,
      completedAt: session.completedAt,
    }});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch evaluation.' });
  }
});

module.exports = router;
