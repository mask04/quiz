require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Question = require('../models/Question');

const seedQuestions = [
  {
    text: 'What is the capital of France?',
    category: 'geography',
    difficulty: 'easy',
    timeLimit: 15,
    options: [
      { text: 'Berlin', isCorrect: false },
      { text: 'Paris', isCorrect: true },
      { text: 'Madrid', isCorrect: false },
      { text: 'Rome', isCorrect: false }
    ]
  },
  {
    text: 'Which language runs in a web browser?',
    category: 'programming',
    difficulty: 'easy',
    timeLimit: 15,
    options: [
      { text: 'Python', isCorrect: false },
      { text: 'JavaScript', isCorrect: true },
      { text: 'C++', isCorrect: false },
      { text: 'Java', isCorrect: false }
    ]
  },
  {
    text: 'What does HTTP stand for?',
    category: 'programming',
    difficulty: 'medium',
    timeLimit: 20,
    options: [
      { text: 'HyperText Transfer Protocol', isCorrect: true },
      { text: 'HyperText Transmission Process', isCorrect: false },
      { text: 'High Transfer Text Protocol', isCorrect: false }
    ]
  },
  {
    text: 'How many continents are there on Earth?',
    category: 'geography',
    difficulty: 'easy',
    timeLimit: 10,
    options: [
      { text: '5', isCorrect: false },
      { text: '6', isCorrect: false },
      { text: '7', isCorrect: true }
    ]
  },
  {
    text: 'Which planet is known as the Red Planet?',
    category: 'science',
    difficulty: 'easy',
    timeLimit: 15,
    options: [
      { text: 'Venus', isCorrect: false },
      { text: 'Mars', isCorrect: true },
      { text: 'Jupiter', isCorrect: false }
    ]
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizdb');

    const adminExists = await User.findOne({ username: process.env.ADMIN_USERNAME });
    if (!adminExists) {
      await User.create({
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log('Admin user created.');
    } else {
      console.log('Admin user already exists.');
    }

    const count = await Question.estimatedDocumentCount();
    if (count === 0) {
      await Question.insertMany(seedQuestions);
      console.log(`${seedQuestions.length} questions seeded.`);
    } else {
      console.log('Questions already present, skipping seed.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
