const Question = require('../models/Question');

exports.createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
};

exports.getQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Question.countDocuments(filter);
    res.json({ total, count: questions.length, questions });
  } catch (err) {
    next(err);
  }
};

exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json({ question });
  } catch (err) {
    next(err);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json({ question });
  } catch (err) {
    next(err);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json({ message: 'Question deleted.', id: question._id });
  } catch (err) {
    next(err);
  }
};
