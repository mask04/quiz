const Score = require('../models/Score');
const { Parser } = require('json2csv');

// Top scores leaderboard.
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { category, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const board = await Score.aggregate([
      { $match: filter },
      { $sort: { score: -1, durationMs: 1, completedAt: 1 } },
      { $limit: parseInt(limit, 10) },
      {
        $project: {
          _id: 0,
          username: 1,
          category: 1,
          score: 1,
          correctAnswers: 1,
          totalQuestions: 1,
          averageTimeMs: 1,
          completedAt: 1
        }
      }
    ]);

    res.json({ count: board.length, leaderboard: board });
  } catch (err) {
    next(err);
  }
};

// Export all scores (global) as JSON or CSV.
exports.exportScores = async (req, res, next) => {
  try {
    const { format = 'json', category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const scores = await Score.find(filter).sort({ score: -1 }).lean();

    if (format === 'csv') {
      const fields = [
        'username',
        'category',
        'score',
        'correctAnswers',
        'totalQuestions',
        'wrongAnswers',
        'averageTimeMs',
        'durationMs',
        'timed',
        'completedAt'
      ];
      const parser = new Parser({ fields });
      const csv = parser.parse(scores);
      res.header('Content-Type', 'text/csv');
      res.attachment('quiz-results.csv');
      return res.send(csv);
    }

    res.header('Content-Type', 'application/json');
    res.attachment('quiz-results.json');
    return res.send(JSON.stringify(scores, null, 2));
  } catch (err) {
    next(err);
  }
};

// History of the authenticated player's scores.
exports.getMyScores = async (req, res, next) => {
  try {
    const scores = await Score.find({ user: req.user.id })
      .sort({ completedAt: -1 })
      .select('-user');
    res.json({ count: scores.length, scores });
  } catch (err) {
    next(err);
  }
};
