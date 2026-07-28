const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Session = require('../models/Session');

// GET /api/leaderboard
router.get('/', protect, async (req, res) => {
  try {
    const { role, period } = req.query;

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    if (period === 'week') {
      dateFilter = { completedAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
    } else if (period === 'month') {
      dateFilter = { completedAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
    }

    const matchFilter = { status: 'completed', ...dateFilter };
    if (role && role !== 'all') matchFilter.role = role;

    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: { $multiply: [{ $ifNull: ['$evaluation.overallScore', 0] }, 10] } },
          sessions: { $sum: 1 },
          avgScore: { $avg: { $ifNull: ['$evaluation.overallScore', 0] } },
          bestScore: { $max: { $ifNull: ['$evaluation.overallScore', 0] } },
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: '$userInfo.name',
          targetRole: '$userInfo.targetRole',
          streak: '$userInfo.streak',
          totalPoints: 1,
          sessions: 1,
          avgScore: { $round: ['$avgScore', 0] },
          bestScore: { $round: ['$bestScore', 0] },
        }
      }
    ];

    const mongoose = require('mongoose');
    let leaderboard = [];
    let userRank = 0;

    if (mongoose.connection.readyState === 1) {
      leaderboard = await Session.aggregate(pipeline);
      userRank = leaderboard.findIndex(u => u._id.toString() === req.user._id.toString()) + 1;
    } else {
      leaderboard = [
        { _id: req.user._id, name: req.user.name, targetRole: req.user.targetRole || 'SDE', streak: req.user.streak || 1, totalPoints: req.user.totalPoints || 720, sessions: req.user.totalSessions || 1, avgScore: 72, bestScore: 85 },
        { _id: 'demo1', name: 'Alex Chen', targetRole: 'SDE', streak: 5, totalPoints: 950, sessions: 12, avgScore: 88, bestScore: 94 },
        { _id: 'demo2', name: 'Priya Sharma', targetRole: 'Data Scientist', streak: 3, totalPoints: 840, sessions: 9, avgScore: 82, bestScore: 90 },
        { _id: 'demo3', name: 'Jordan Miller', targetRole: 'DevOps', streak: 7, totalPoints: 790, sessions: 8, avgScore: 79, bestScore: 86 }
      ];
      userRank = 1;
    }

    res.json({ success: true, leaderboard, userRank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

module.exports = router;
