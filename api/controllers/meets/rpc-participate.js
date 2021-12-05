const validator = require('validator');

const Meets = require('../../models/meets');

const routeController = require('../../services/route-controller');

module.exports = routeController('rpcParticipate', async (req, res) => {

   const meet = await Meets.findOne({ _id: req.params.meetId });

   if(!meet)
      return res.notFound();

   const attendee = meet.attendees.find(attendee => attendee._id.equals(req.params.attendeeId));

   if(!attendee)
      return res.notFound();

   if(attendee.video.shareUrl || attendee.video.embedUrl)
      return res.forbidden("You already participated in this meeting");

   if(!validator.isURL(req.body.sharedUrl + "") || !validator.isURL(req.body.embedUrl + ""))
      return res.forbidden();

   await Meets.findOneAndUpdate(
       { _id: meet._id, 'attendees._id': attendee._id },
       { 'attendees.$.video.sharedUrl': req.body.sharedUrl, 'attendees.$.video.embedUrl': req.body.embedUrl, createdAt: new Date() });

   res.resolve();


});