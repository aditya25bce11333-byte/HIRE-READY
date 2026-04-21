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

    const leaderboard = await Session.aggregate(pipeline);

    // Find current user rank
    const userRank = leaderboard.findIndex(u => u._id.toString() === req.user._id.toString()) + 1;

    res.json({ success: true, leaderboard, userRank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

module.exports = router;
