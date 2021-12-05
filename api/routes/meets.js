const express                  = require('express');
const meetsCtrl               = require('../controllers/meets');

const router = express.Router();

router.get('/meets/:meetId/attendee/:attendeeId', meetsCtrl.get);

router.post('/meets/:meetId/attendee/:attendeeId/rpc-participate', meetsCtrl.rpcParticipate);

router.post('/meets', meetsCtrl.save);

module.exports = router;