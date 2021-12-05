const moment = require('moment');
const Meets = require('../../models/meets');
const Mailer = require('../../services/mailer');

const routeController = require('../../services/route-controller');

module.exports = routeController('saveMeet', async (req, res) => {

   if(req.body.challenge === "")
      delete req.body.challenge;

   const meet = new Meets(req.body);

   await meet.validate();

   if(meet.attendees.length < 1)
      return res.forbidden("You need to specify at least one attendee");

   const oldMeetingsNumber = await Meets.countDocuments({
      "organizer.email": meet.organizer.email, createdAt: { $gte: moment().subtract(6, 'hours').toDate() }});

   if(oldMeetingsNumber > 6)
      return res.forbidden("You surpassed the max amount of meetings allowed for you profile, please wait before creating a new one");

   await meet.save();

   res.resolve(meet);

   //TODO: Move this to worker
   const mailer = new Mailer();

   await mailer
       .setTemplate(1)
       .to(meet.organizer.name, meet.organizer.email)
       .setParams({ meetLink: process.env.WEBAPP_URL + '/meet/' + meet._id })
       .send();

   meet.attendees.map(async attendee => {

      const mailer = new Mailer();
      await mailer
          .setTemplate(2)
          .to(attendee.name, attendee.email)
          .setParams({
             attendeeName: attendee.name,
             organizerName: meet.organizer.name,
             discussionPoint: meet.discussionPoint,
             invitationLink: process.env.WEBAPP_URL + '/meet/' + meet._id + '/attendee/' + attendee._id })
          .send();

   });

});