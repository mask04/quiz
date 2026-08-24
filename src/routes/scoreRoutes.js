const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/scoreController');
const { auth } = require('../middleware/auth');

router.get('/leaderboard', ctrl.getLeaderboard);
router.get('/export', ctrl.exportScores);
router.get('/me', auth, ctrl.getMyScores);

module.exports = router;
