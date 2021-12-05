const Meets = require('../../models/meets');

const routeController = require('../../services/route-controller');

module.exports = routeController('getMeet', async (req, res) => {

    const meet = await Meets.findOne({ _id: req.params.meetId }).populate('challenge').lean();

    if(!meet)
        return res.notFound();

    //map non sensitive fields
    meet.attendees = meet.attendees.map(attendee => ({ name: attendee.name, video: attendee.video }));

    res.resolve(meet);

});