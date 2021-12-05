const moment = require('moment');
const Meets = require('../../models/meets');

const routeController = require('../../services/route-controller');

module.exports = routeController('saveMeet', async (req, res) => {

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

   //Send organizer email
   //Send attendees emails

});