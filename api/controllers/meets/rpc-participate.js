const validator = require('validator');

const Meets = require('../../models/meets');

const routeController = require('../../services/route-controller');
const Mailer = require("../../services/mailer");

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

   //TODO: Move this to worker
   const recentMeet = await Meets.findOne( { _id: meet._id }).lean();
   const attendeesWithVideos = recentMeet.attendees.reduce((acum, attendee) => acum + (attendee.video && attendee.video.embedUrl ? 1 : 0), 0);

   if(attendeesWithVideos === recentMeet.attendees.length) {

      recentMeet.attendees.concat({ name: meet.organizer.name, email: meet.organizer.email }).map(async attendee => {

         const mailer = new Mailer();
         await mailer
             .setTemplate(3)
             .to(attendee.name, attendee.email)
             .setParams({
                discussionPoint: meet.discussionPoint,
                meetLink: process.env.WEBAPP_URL + '/meet/' + meet._id })
             .send();

      });

   }

});