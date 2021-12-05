const loader = require('./modules/blocking-loader');

import {oembed} from "@loomhq/loom-embed";

angular.module('app', ['ngAnimate']).controller('main', ['$scope', '$timeout', '$http', 'modal', '$sce', async function ($scope, $timeout, $http, modal, $sce) {

    loader.show();


    const loadApp = async () => {

        loader.hide();

        $scope.vidHTML = [];


        $scope.cols = Math.ceil($scope.meet.attendees.length/2);
        $scope.rows = Math.ceil($scope.meet.attendees.length/$scope.cols);

        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        const playerWidth = Math.round(vh / $scope.rows - 100);
        $scope.meet.attendees.map(async attendee => {

            if(attendee.video && attendee.video.sharedUrl) {
                const videoPlayer = await oembed(attendee.video.sharedUrl, {width: playerWidth});
                $timeout(() => $scope.vidHTML.push($sce.trustAsHtml("<h1 class='presenter-name'>" + attendee.name + "</h1>" + videoPlayer.html)), 0);
            }
            else {
                $timeout(() =>
                    $scope
                        .vidHTML
                        .push(
                            $sce
                                .trustAsHtml("<div class='waiting-video' style='width: " +
                                    playerWidth + "px; height: " + playerWidth +
                                    "px'><p>Waiting for <strong>" + attendee.name + "</strong></p></div>")), 0);
            }

        });

    };


    try {
        const response = await $http.get(process.env.API_URL + "/meets/" + window.ASYNCMEETS.meetId);
        $scope.meet = response.data.data;
        loadApp();

    } catch (error) {
        if(error.status === 403) {
            modal.critical(error.data.message);
            loader.hide();
        }
    }



}]);
