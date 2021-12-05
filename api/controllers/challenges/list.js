const Challenges = require('../../models/challenges');

const routeController = require('../../services/route-controller');

module.exports = routeController('listChallenges', async (req, res) => {

    const challenges = await Challenges.find().sort({showName: -1});

    res.resolve(challenges);

});