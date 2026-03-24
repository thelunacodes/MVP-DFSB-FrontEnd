import * as games from "./games.js"

function openModal() {
    let modal = document.getElementById("modal")

    modal.classList.remove("hidden");
    modal.classList.add("visible");
}

export function closeModal() {
    let modal = document.getElementById("modal")
    
    document.getElementById("game-form").reset();

    toggleStartedFinishedAt("NOTPLAYED")

    modal.classList.remove("visible");
    modal.classList.add("hidden");
}

export function openCreateEditModal(gameId=undefined) {
    openModal();

    let modalContainer = document.getElementById("modal-container")
    modalContainer.scrollTop = 0;

    let modalHeader = document.getElementById("add-edit-header")

    if (gameId) {
        modalHeader.innerHTML = "Edit Game";
    } else {
        modalHeader.innerHTML = "Add Game";
    }
}

//Add/Edit Game Form
const gameForm = document.getElementById("game-form");
const scoreInput = document.getElementById("game-form-score-input");
const currentScore = document.getElementById("current-score");
let currentGameStatus = "";

const gamePlatformList = ["PC", "Playstation 1", "Playstation 2", "Playstation 3", "Playstation 4", "Playstation 5", "Playstation 6", "Xbox", "Xbox360", "Xbox One", "Xbox Series X/S", "NES", "SNES", "Nintendo 64", "GameCube", "Wii", "Wii U", "Game&Watch", "Gameboy", "Gameboy Color", "Gameboy Advance", "Nintendo DS", "Nintendo DSi", "Nintendo 3DS", "New Nintendo 3DS", "Virtual Boy", "Nintendo Switch", "Nintendo Switch 2", "Zeebo", "Atari 2600", "Atari 5200", "Atari 7800", "Atari XEGS", "Atari Lynx", "Atari Lynx II", "Atari Jaguar", "Atari VCS", "CD-i"]

const gameScoreValues = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

gameForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let gameNameInput = document.getElementById("game-form-title");
    let gameDevInput = document.getElementById("game-form-dev");
    let gamePlatformInput = document.getElementById("game-form-platform");
    let gameLinkInput = document.getElementById("game-form-link");
    let gameStartDateInput = document.getElementById("game-form-start-date");
    let gameStartTimeHourInput = document.getElementById("game-form-start-hour");
    let gameStartTimeMinuteInput = document.getElementById("game-form-start-minute");
    let gameFinishDateInput = document.getElementById("game-form-finish-date");
    let gameFinishTimeHourInput = document.getElementById("game-form-finish-hour");
    let gameFinishTimeMinuteInput = document.getElementById("game-form-finish-minute");
    let scoreInput = document.getElementById("game-form-score-input");

    let newGame = new games.Game(
        undefined,
        undefined,
        gameNameInput.value,
        gameDevInput.value,
        gamePlatformInput.value,
        gameLinkInput.value
    );

    if (currentGameStatus == "PLAYING" || currentGameStatus == "FINISHED") {
        newGame.startDate = gameStartDateInput.value || null;
        newGame.startTime = `${gameStartTimeHourInput.value}:${gameStartTimeMinuteInput.value}`;
    }

    if (currentGameStatus == "FINISHED") {
        newGame.finishDate = gameFinishDateInput.value || null;
        newGame.finishTime = `${gameFinishTimeHourInput.value}:${gameFinishTimeMinuteInput.value}`;
        newGame.score = gameScoreValues[scoreInput.value];
    }

    games.addGameToDatabase(newGame);

})

gameForm.addEventListener("change", function(event) {
    if (event.target.type === "radio") {
        currentGameStatus = event.target.value;
        toggleStartedFinishedAt(currentGameStatus);
    }
})

scoreInput.addEventListener("input", function(event) {
    gameScoreInputHandler(event.target.value);
})

function loadPlatforms() {
    let platformSelect = document.getElementById("game-form-platform");
    let loadingPlaceholder = document.getElementById("loading-placeholder");

    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "";
    platformSelect.appendChild(defaultOption);

    gamePlatformList.forEach(platform => {
        let platformOption = document.createElement("option");
        platformOption.value = platform;
        platformOption.textContent = platform;
        platformSelect.appendChild(platformOption);
    })
    
    platformSelect.removeChild(loadingPlaceholder);
    platformSelect.disabled = false;
}

loadPlatforms(); 

function gameScoreInputHandler() {
    currentScore.textContent = `${gameScoreValues[scoreInput.value]}`;
}

function toggleStartedFinishedAt(status) {
    let startedAtInfo = document.getElementById("started-at-info");
    let finishedAtInfo = document.getElementById("finished-at-info");
    let scoreInfo = document.getElementById("score-info");

    switch(status) {
        case "NOTPLAYED":
            startedAtInfo.classList.remove("visible");
            startedAtInfo.classList.add("hidden");

            finishedAtInfo.classList.remove("visible");
            finishedAtInfo.classList.add("hidden");

            scoreInfo.classList.remove("visible");
            scoreInfo.classList.add("hidden");
            break;
        case "PLAYING":
            startedAtInfo.classList.remove("hidden");
            startedAtInfo.classList.add("visible");

            finishedAtInfo.classList.remove("visible");
            finishedAtInfo.classList.add("hidden");

            scoreInfo.classList.remove("visible");
            scoreInfo.classList.add("hidden");
            break;
        case "FINISHED":
            startedAtInfo.classList.remove("hidden");
            startedAtInfo.classList.add("visible");

            finishedAtInfo.classList.remove("hidden");
            finishedAtInfo.classList.add("visible");   
            
            scoreInfo.classList.remove("hidden");
            scoreInfo.classList.add("visible");   
    }
}

function onSubmitAddEditGame() {
    
}