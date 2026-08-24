const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    category: { type: String, default: 'general' },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, default: 0 },
    // Total time spent on the quiz in milliseconds
    durationMs: { type: Number, default: 0 },
    // Average time per answered question in milliseconds
    averageTimeMs: { type: Number, default: 0 },
    // Whether the quiz was played under a time limit
    timed: { type: Boolean, default: false },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

scoreSchema.index({ score: -1, completedAt: 1 });

module.exports = mongoose.model('Score', scoreSchema);
