const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/questionController');
const { auth, requireAdmin } = require('../middleware/auth');

// All question-management routes are protected; only admins may modify.
router.get('/', auth, ctrl.getQuestions);
router.get('/:id', auth, ctrl.getQuestion);
router.post('/', auth, requireAdmin, ctrl.createQuestion);
router.put('/:id', auth, requireAdmin, ctrl.updateQuestion);
router.delete('/:id', auth, requireAdmin, ctrl.deleteQuestion);

module.exports = router;
