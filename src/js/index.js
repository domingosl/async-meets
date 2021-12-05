const Joi = require('joi');
const loader = require('./modules/blocking-loader');
const {model} = require("mongoose");

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

angular.module('app', ['ngAnimate']).controller('main', ['$scope', '$timeout', '$interval', 'modal', '$http', async function ($scope, $timeout, $interval, modal, $http) {


    $scope.appState = 'welcome';

    const initFormData = () => {
        $scope.meeting = {
            organizer: {
                name: '',
                email: ''
            },
            presenterTime: 120,
            discussionPoint: '',
            challenge: '',
            attendees: [
                {name: '', email: ''}
            ]
        };
    };

    initFormData();

    $scope.challengeDescription = 'No challenge selected';

    $scope.addNewAttendee = () => $scope.meeting.attendees.push({name: '', email: ''});

    $scope.removeAttendee = index => $scope.meeting.attendees.splice(index, 1);

    $scope.setAppState = async (state, doNotValidate = false) => {

        let validation;

        switch ($scope.appState) {
            case "welcome":
                if(!$scope.challenges) {
                    loader.show();
                    const response = await $http.get(process.env.API_URL + '/challenges');
                    $timeout(()=>{ $scope.challenges = response.data.data; }, 0);
                    loader.hide();
                }
                break;
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

        if(!doNotValidate && validation && validation.error) return modal.error(validation.error.details[0].message);

        $timeout(()=>$scope.appState = state, 0);

    }

    $scope.selectChallenge = challenge => {

        if (challenge === $scope.meeting.challenge) {
            $scope.challengeDescription = 'No challenge selected';
            return $scope.meeting.challenge = null;
        }

        $scope.meeting.challenge = challenge;
        $scope.challengeDescription = $scope.challenges.find(el => el._id === challenge).description;
    }


    $scope.confirm = async () => {

        loader.show();

        try {
            await $http.post(process.env.API_URL + '/meets',
                {...$scope.meeting, attendees: $scope.meeting.attendees.map(el => ({name: el.name, email: el.email}))});

            $timeout(()=>{
                initFormData();

                loader.hide();

                modal.confirm("AsyncMeet created! check you email for your meet link.");
            },0);

            await $scope.setAppState('welcome');


        }
        catch (e) {
            loader.hide();

            if(e.status === 403) modal.error(e.data.message);
            else modal.error("Something went wrong, please try again later");
        }

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