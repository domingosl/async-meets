const Joi = require('joi');
const loader = require('./modules/blocking-loader');

const organizerSchema = Joi.object({
    name: Joi.string().min(2).max(120).required().label('Organizer\'s name'),
    email: Joi.string().email({ tlds: {allow: false} }).required().label('Organizer\'s email')
});

const meetingSchema = Joi.object({
    discussionPoint: Joi.string().min(2).max(160).required().label('Discussion point')
});

const attendeesSchema = Joi.array().items(Joi.object().keys({
    name: Joi.string().min(2).max(120).required().label('Attendee\'s name'),
    email: Joi.string().email({ tlds: {allow: false} }).required().label('Attendee\'s email')
})).unique('email');

angular.module('app', ['ngAnimate']).controller('main', ['$scope', '$timeout', '$interval', 'modal', async function ($scope, $timeout, $interval, modal) {


    const fakeData = {
        challenges: [
            {
                _id: "0",
                name: 'pushups',
                description: "Do the most pushups you can do right after finishing your point"
            },
            {
                _id: "1",
                name: 'pets',
                description: "Present while holding your pet"
            },
            {
                _id: "2",
                name: 'plank',
                description: "Present while planking"
            },
            {
                _id: "3",
                name: 'talents',
                description: "By the end of your presentation you must show your secret talent"
            },
            {
                _id: "4",
                name: 'foodie',
                description: "Present while eating a delicious meal"
            },
            {
                _id: "5",
                name: 'standing',
                description: "Present while standing up"
            },
            {
                _id: "6",
                name: 'wow',
                description: "Share an interesting fact after your presentation"
            }
        ]

    };

    //$interval(()=>console.log($scope.forms.main.organizerName.$valid, $scope.forms.main.organizerEmail.$valid), 2000);
    //modal.confirm("Ciao mondo!");

    $scope.challenges = fakeData.challenges;

    $scope.appState = 'welcome';
    $scope.meeting = {
        organizer: {
            name: '',
            email: ''
        },
        presenterTime: 120,
        discussionPoint: '',
        challengeId: '',
        attendees: [
            {name: '', email: ''}
        ]
    };

    $scope.challengeDescription = 'No challenge selected';

    $scope.addNewAttendee = () => $scope.meeting.attendees.push({name: '', email: ''});

    $scope.removeAttendee = index => $scope.meeting.attendees.splice(index, 1);

    $scope.setAppState = async state => {

        let validation;

        switch ($scope.appState) {
            case "organizer":
                validation = organizerSchema.validate($scope.meeting.organizer);
                break;
            case "meeting":
                validation = meetingSchema.validate({ discussionPoint: $scope.meeting.discussionPoint });
                break;
            case "attendees":
                validation = attendeesSchema.validate($scope.meeting.attendees.map(el => ({ name: el.name, email: el.email })));
                break;
        }

        if(validation && validation.error) return modal.error(validation.error.details[0].message);
        $scope.appState = state;

    }

    $scope.selectChallenge = challengeId => {

        if (challengeId === $scope.meeting.challengeId) {
            $scope.challengeDescription = 'No challenge selected';
            return $scope.meeting.challengeId = null;
        }

        $scope.meeting.challengeId = challengeId;
        $scope.challengeDescription = $scope.challenges.find(el => el._id === challengeId).description;
    }

    $scope.confirm = () => {

        loader.show();

        console.log({...$scope.meeting, attendees: $scope.meeting.attendees.map(el => ({ name: el.name, email: el.email }))});
    }

}])
    .filter('time', function () {

        return function (input) {

            if (input < 60)
                return input + " seconds";
            if (input % 60 === 0)
                return input / 60 + (input / 60 === 1 ? " minute" : " minutes");

        }

    });