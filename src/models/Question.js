const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    category: { type: String, default: 'general', trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    options: {
      type: [optionSchema],
      validate: {
        validator: (opts) => opts.length >= 2 && opts.some((o) => o.isCorrect),
        message: 'A question needs at least 2 options and at least one correct answer.'
      }
    },
    // Optional per-question time limit in seconds (used for timed quizzes)
    timeLimit: { type: Number, min: 0, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
