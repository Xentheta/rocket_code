var socket = io("http://localhost:3000");

let currentMCUstatus = null;
let currentMissStatus = null;

let MCUstatdisplay = document.getElementById("MCUstatus");
let missStatDisplay = document.getElementById("missStatus");

let missionTimer = document.getElementById("mission-timer");
let startTime = null;
let intervalId = null;

function formatTime(ms) {
    const minutes = String(Math.floor(ms / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    const milliseconds = String(ms % 1000).padStart(3, '0');
    return `${minutes}:${seconds}:${milliseconds}`;
}
function timeStart() {
    startTime = Date.now();
    intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        missionTimer.textContent = formatTime(elapsed);
    }, 50);
}
function timerStop() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        savedElapsed += Date.now() - startTime;
    }
}

socket.on("MCUstatus", function (MCUstatus){
    currentMCUstatus = MCUstatus;
    if (currentMCUstatus == "connected") {
        MCUstatdisplay.classList.replace("disconnected", "connected");
        MCUstatdisplay.textContent = "Connected";

        if (!intervalId) {
            timerStart();
        }
    } else {
        MCUstatdisplay.classList.replace("connected", "disconnected");
        MCUstatdisplay.textContent = "Disconnected";
        timerStop();
    }
});

socket.on("missionStatus", function (missStatus){
    currentMissStatus = missStatus;
    if (currentMissStatus == "issue") {
        missStatDisplay.classList.replace("stat-unknown", "stat-issue");
        missStatDisplay.textContent = "Issue";
    }
    else if (currentMissStatus == "nominal") {
        missStatDisplay.classList.replace("stat-issue", "stat-nominal");
        missStatDisplay.textContent = "Nominal";
    }
});