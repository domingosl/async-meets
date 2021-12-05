const express                  = require('express');
const challengesCtrl           = require('../controllers/challenges');

const router = express.Router();

router.get('/challenges', challengesCtrl.list);

module.exports = router;