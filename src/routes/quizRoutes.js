const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/quizController');
const { auth } = require('../middleware/auth');

router.get('/questions', auth, ctrl.getQuizQuestions);
router.post('/submit', auth, ctrl.submitQuiz);
router.get('/stats', auth, ctrl.getMyStats);

module.exports = router;
