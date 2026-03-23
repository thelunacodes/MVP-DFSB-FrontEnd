// console.log("modal.js carregado")

function openModal() {
    let modal = document.getElementById("modal")

    modal.classList.remove("hidden");
    modal.classList.add("visible");

    // console.log("ABRIU")
}

export function closeModal() {
    let modal = document.getElementById("modal")
    
    document.getElementById("game-form").reset();

    toggleStartedFinishedAt("NOTPLAYED")

    modal.classList.remove("visible");
    modal.classList.add("hidden");

    // console.log("FECHOU")
}

export function openCreateEditModal(gameId=undefined) {
    // console.log(gameId);
    openModal();

    // Reset scroll
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

gameForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let gameNameInput = document.getElementById("game-name");
    let gameDevInput = document.getElementById("game-dev");
    // let gamePlatformInput = document.getElementById("game-platform");
    let gameLinkInput = document.getElementById("game-link");
    // let gameStatusInput = document.getElementById("game-name");
    let gameStartDateInput = document.getElementById("game-start-date");
    let gameStartTimeHourInput = document.getElementById("game-start-hour");
    let gameStartTimeMinuteInput = document.getElementById("game-start-minute");
    let gameFinishDateInput = document.getElementById("game-finish-date");
    let gameFinishTimeHourInput = document.getElementById("game-finish-hour");
    let gameFinishTimeMinuteInput = document.getElementById("game-finish-minute");
    // let gameScoreInput = document.getElementById("game-name");

    console.log(`Name: ${gameNameInput.value}`)
    console.log(`Developer: ${gameDevInput.value}`)
    console.log(`Platform: `)
    console.log(`Link: ${gameLinkInput.value}`)
    console.log(`Start Date: ${gameStartDateInput.value}`)
    console.log(`Start Hour: ${gameStartTimeHourInput.value}:${gameStartTimeMinuteInput.value}`)
    console.log(`Finish Date: ${gameFinishDateInput.value}`)
    console.log(`Finish Hour: ${gameFinishTimeHourInput.value}:${gameFinishTimeMinuteInput.value}`)
    console.log(`Score: `)

})

gameForm.addEventListener("change", function(event) {
    if (event.target.type === "radio") {
        toggleStartedFinishedAt(event.target.value);
    }
})

function toggleStartedFinishedAt(status) {
    let startedAtInfo = document.getElementById("started-at-info")
    let finishedAtInfo = document.getElementById("finished-at-info")

    switch(status) {
        case "NOTPLAYED":
            startedAtInfo.classList.remove("visible");
            startedAtInfo.classList.add("hidden");

            finishedAtInfo.classList.remove("visible");
            finishedAtInfo.classList.add("hidden");
            break;
        case "PLAYING":
            startedAtInfo.classList.remove("hidden");
            startedAtInfo.classList.add("visible");

            finishedAtInfo.classList.remove("visible");
            finishedAtInfo.classList.add("hidden");
            break;
        case "FINISHED":
            startedAtInfo.classList.remove("hidden");
            startedAtInfo.classList.add("visible");

            finishedAtInfo.classList.remove("hidden");
            finishedAtInfo.classList.add("visible");       
    }
}

function onSubmitAddEditGame() {
    
}