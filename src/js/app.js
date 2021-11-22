import {isSupported, setup} from "@loomhq/loom-sdk";
import {oembed} from "@loomhq/loom-embed";

const fakeData = {
    invitation: {
        to: {
            name: "Alice",
            email: "alice@email.com"
        },
        from: {
            name: "Bob",
            email: "bob@email.com"
        },
        presentation: {
            topic: "Tell us about your next week tasks",
            time: 120
        }
    },
    meeting: {
        name: "Test meeting 101",
        challenge: {
            name: "Plank while presenting",
            icon: null
        }
    }
};

angular.module('app', ['ngAnimate']).controller('main', ['$scope', '$timeout', '$interval', async function ($scope, $timeout, $interval) {

    $scope.data = fakeData;
    $scope.appState = 'welcome';
    let timer;

    const resetTimer = () => {
        timer && $interval.cancel(timer);
        $scope.remainingTime = fakeData.invitation.presentation.time;
    }

    resetTimer();

    const refreshTimer = () => {
        if($scope.remainingTime > 0)
            return $scope.remainingTime--;
    }

    $scope.setAppState = async state => {
        $scope.appState = state;

        //if(state === 'prerecord')
        //    await document.body.requestFullscreen();

        if(state === 'challenge')
            $timeout(()=>{ confetti({ origin: { x: 0.1}}) }, 600);

    }

    const API_KEY = "edfc80a1-b935-4de2-864a-fda87b4c60c4";
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

    const button = document.getElementById(BUTTON_ID);

    const {configureButton} = await setup({
        apiKey: API_KEY,
        config: {
            bubbleResizable: false,
            insertButtonText: "Send video to " + $scope.data.invitation.from.name
        }
    });

    const sdkButton = configureButton({element: button});

    sdkButton.on("insert-click", async video => {
        //const {html} = await oembed(video.sharedUrl, {width: 400});
        //insertEmbedPlayer(html);
        console.log("insert-click", video);
        $timeout(()=>$scope.setAppState('done'), 0);
    });

    sdkButton.on("recording-start", async () => {
        console.log("recording-start!");
        //await document.body.requestFullscreen();
        timer = $interval(refreshTimer, 1000);

    });

    sdkButton.on("start", async () => {
        console.log("start!");
        $timeout(()=>$scope.setAppState('recording'), 0);
    });

    sdkButton.on("complete", async video => {
        console.log("complete!");
        resetTimer();
        //await document.exitFullscreen();
    });

    sdkButton.on("cancel", async () => {
        console.log("cancel!");
        resetTimer();
        $timeout(()=>$scope.setAppState('prerecord'), 0);
        //await document.exitFullscreen();
    });

    window.foo = sdkButton;

}]);







