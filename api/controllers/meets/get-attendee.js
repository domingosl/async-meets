const Meets = require('../../models/meets');

const routeController = require('../../services/route-controller');

module.exports = routeController('getMeetAttendee', async (req, res) => {

    const meet = await Meets.findOne({ _id: req.params.meetId }).populate('challenge');

    if(!meet)
        return res.notFound();

    const attendee = meet.attendees.find(attendee => attendee._id.equals(req.params.attendeeId));

    if(!attendee)
        return res.notFound();

    if(attendee.video.shareUrl || attendee.video.embedUrl)
        return res.forbidden("You already participated in this meeting");

    res.resolve({...meet.getPublicFields(), attendee});

});