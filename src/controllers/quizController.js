const Question = require('../models/Question');
const Score = require('../models/Score');

// Helper: determine if a submitted answer matches the correct option.
// `selected` may be an option _id (string) or a 0-based index (number).
const isAnswerCorrect = (question, selected) => {
  const correctOption = question.options.find((o) => o.isCorrect);
  if (correctOption == null) return false;
  if (typeof selected === 'number') {
    return question.options[selected] && question.options[selected].isCorrect;
  }
  return String(selected) === String(correctOption._id);
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers, timed = false } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Provide a non-empty "answers" array.' });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map((q) => [String(q._id), q]));

    let correct = 0;
    let totalTime = 0;
    const results = [];

    for (const ans of answers) {
      const q = questionMap.get(String(ans.questionId));
      if (!q) continue; // ignore unknown question ids
      const time = Number(ans.timeTakenMs) || 0;
      totalTime += time;
      const correctFlag = isAnswerCorrect(q, ans.selectedOption);
      if (correctFlag) correct += 1;
      results.push({
        questionId: q._id,
        correct: correctFlag,
        yourAnswer: ans.selectedOption,
        correctOption: q.options.find((o) => o.isCorrect)._id
      });
    }

    const total = results.length;
    const wrong = total - correct;
    const averageTime = total > 0 ? Math.round(totalTime / total) : 0;
    const scoreValue = total > 0 ? Math.round((correct / total) * 100) : 0;
    const category = questions[0] ? questions[0].category : 'general';

    const score = await Score.create({
      user: req.user.id,
      username: req.user.username,
      category,
      score: scoreValue,
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: wrong,
      durationMs: totalTime,
      averageTimeMs: averageTime,
      timed
    });

    res.status(201).json({
      score: {
        id: score._id,
        score: scoreValue,
        correctAnswers: correct,
        wrongAnswers: wrong,
        totalQuestions: total,
        averageTimeMs: averageTime,
        durationMs: totalTime,
        category
      },
      results
    });
  } catch (err) {
    next(err);
  }
};

// Fetch a random set of questions to play (without revealing correct answers).
exports.getQuizQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(limit, 10) } }
    ]);

    // Strip the isCorrect flag so clients cannot cheat.
    const safe = questions.map((q) => ({
      _id: q._id,
      text: q.text,
      category: q.category,
      difficulty: q.difficulty,
      timeLimit: q.timeLimit,
      options: q.options.map((o) => ({ _id: o._id, text: o.text }))
    }));

    res.json({ count: safe.length, questions: safe });
  } catch (err) {
    next(err);
  }
};

// Detailed statistics for the authenticated player.
exports.getMyStats = async (req, res, next) => {
  try {
    const scores = await Score.find({ user: req.user.id });
    const totalGames = scores.length;
    if (totalGames === 0) {
      return res.json({ totalGames: 0, message: 'No games played yet.' });
    }
    const totalCorrect = scores.reduce((s, x) => s + x.correctAnswers, 0);
    const totalQuestions = scores.reduce((s, x) => s + x.totalQuestions, 0);
    const best = scores.reduce((m, x) => Math.max(m, x.score), 0);
    const avgAccuracy = Math.round((totalCorrect / totalQuestions) * 100);
    const avgTime = Math.round(
      scores.reduce((s, x) => s + x.averageTimeMs, 0) / totalGames
    );
    res.json({
      totalGames,
      totalCorrect,
      totalQuestions,
      bestScore: best,
      averageAccuracy: avgAccuracy,
      averageTimePerQuestionMs: avgTime
    });
  } catch (err) {
    next(err);
  }
};
