const loader = require('./modules/blocking-loader');

import {isSupported, setup} from "@loomhq/loom-sdk";

angular.module('app', ['ngAnimate']).controller('main', ['$scope', '$timeout', '$interval', '$http', '$compile', 'modal', async function ($scope, $timeout, $interval, $http, $compile, modal) {

    $scope.appState = 'loading';
    loader.show();

    const loadApp = async () => {
        loader.hide();
        $timeout(() => $scope.appState = 'welcome', 0);


        let timer;

        const resetTimer = () => {
            timer && $interval.cancel(timer);
            $scope.remainingTime = $scope.data.presenterTime;
        }

        resetTimer();

        const refreshTimer = () => {
            if ($scope.remainingTime > 0)
                return $scope.remainingTime--;
            else {
                resetTimer();
                sdkButton.endRecording();
            }
        }

        $scope.setAppState = async state => {
            $scope.appState = state;

            if (state === 'challenge')
                $timeout(() => {
                    confetti({origin: {x: 0.1}})
                }, 600);

        }

        const API_KEY = process.env.LOOM_API_KEY;
        const BUTTON_ID = "record-btn";

        function insertEmbedPlayer(html) {
            const target = document.getElementById("target");

            if (target) {
                target.innerHTML = html;
            }
        }


        const {supported, error} = await isSupported();

        if (!supported) {
            console.warn(`Error setting up Loom: ${error}`);
            return;
        }

        const getSizes = () => {
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

            return {
                vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
                vh,
                cameraSize: vh * 0.8
            }
        }

        const centerCamera = () => {
            const sizes = getSizes();
            sdkButton.moveBubble({x: Math.round(sizes.vw/2 - sizes.cameraSize/2), y: Math.round(sizes.vh/2 - sizes.cameraSize/1.5) });
        };

        const setLoomUI = () => {

            const mainEl = document.getElementById('loom-sdk-record-overlay-shadow-root-id')
                .shadowRoot.getElementById('recorder-overlay-id');
            const camera = mainEl
                .children[0].children[0].children[0].children[0];

            const controls = mainEl.children[0].children[1].children[0];
            const sizes = getSizes();
            camera.style.width = sizes.cameraSize + "px";
            camera.style.height = sizes.cameraSize + "px";
            camera.style['border'] = "10px solid #736BF7"
            centerCamera();
            controls.style['margin-left'] = - sizes.cameraSize/2 - 100 + "px";
        }

        const button = document.getElementById(BUTTON_ID);

        const {configureButton} = await setup({
            apiKey: API_KEY,
            config: {
                bubbleResizable: false,
                insertButtonText: "Send video to " + $scope.data.organizer.name
            }
        });

        const sdkButton = configureButton({element: button});

        sdkButton.on("insert-click", async video => {

            loader.show();

            await $http.post(
                process.env.API_URL + "/meets/" +
                window.ASYNCMEETS.meetId + "/attendee/" +
                window.ASYNCMEETS.attendeeId + '/rpc-participate', {
                    embedUrl: video.embedUrl,
                    sharedUrl: video.sharedUrl
                });

            loader.hide();
            $timeout(() => $scope.setAppState('done'), 0);
        });

        sdkButton.on('bubble-drag-end', centerCamera );

        let soLoaded = false;
        $scope.isRecording = false;
        sdkButton.on("recording-start", async () => {
            console.log("recording-start!");
            //await document.body.requestFullscreen();
            timer = $interval(refreshTimer, 1000);

            try {

                setLoomUI();
                $scope.isRecording = true;

                if(!soLoaded) {
                    const tpl = "<div class='super-overlay' ng-if='isRecording'>" +
                        "<h1>{{data.attendee.name}}</h1>" +
                        "<h2>{{data.discussionPoint}}</h2>" +
                        "<h2>Time remaining {{remainingTime}} seconds</h2>" +
                        "</div>";
                    const el = $compile(tpl)($scope);

                    angular.element(document.lastElementChild).append(el);

                    window.addEventListener('resize', setLoomUI);

                    soLoaded = true;

                }


            } catch (error) {
                console.log("hack failed", error);
            }

        });

        sdkButton.on("start", async () => {
            $timeout(() => $scope.setAppState('recording'), 0);
            $scope.isRecording = false;
        });

        sdkButton.on("complete", async video => {
            resetTimer();
            $timeout(() => $scope.setAppState('prerecord'), 0);
            $scope.isRecording = false;
        });

        sdkButton.on("cancel", async () => {
            resetTimer();
            $timeout(() => $scope.setAppState('prerecord'), 0);
            $scope.isRecording = false;
        });
    };

    $scope.help = () => {
        modal.html('<iframe width="400" height="315" src="https://www.youtube.com/embed/Fowz6hW3vPU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
    }

    try {
        const response = await $http.get(process.env.API_URL + "/meets/" + window.ASYNCMEETS.meetId + "/attendee/" + window.ASYNCMEETS.attendeeId);
        $scope.data = response.data.data;
        loadApp();

    } catch (error) {
        if(error.status === 403) {
            modal.critical(error.data.message);
            loader.hide();
        }
    }

}]);







