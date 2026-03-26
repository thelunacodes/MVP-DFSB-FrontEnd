class Game {
    constructor(id,
                imageUrl=undefined,
                gameTitle,
                developer=undefined,
                platform,
                gameUrl=undefined,
                startDate=undefined,
                startTime,
                finishDate=undefined,
                finishTime,
                score=undefined,) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.gameTitle = gameTitle;
        this.developer = developer;
        this.platform = platform;
        this.gameUrl = gameUrl;
        this.startDate = startDate;
        this.startTime = startTime;
        this.finishDate = finishDate;
        this.finishTime = finishTime;
        this.score = score; 
    }
}

const $element = id => document.getElementById(id); 
const gameTable = $element("game-table-body")

function addToList(game) {
    addGameToTable(game)
}

function parseJsonToGameInstance(data) {
    const gameInstance = new Game(data.id,
                                data.imageUrl,
                                data.gameTitle,
                                data.developer,
                                data.platform,
                                data.gameUrl,
                                data.startDate ? new Date(data.startDate) : null,
                                data.startTime ? data.startTime : null,
                                data.finishDate ? new Date(data.finishDate) : null,
                                data.finishTime ? data.finishTime : null,
                                data.score 
    );

    return gameInstance;
}

async function getGameList() {
    let url = 'http://127.0.0.1:5000/games';
    fetch(url, {method: 'get',})
        .then(response => response.json())
        .then(data => {
            if (data.games.length == 0 ) {
                showEmptyTableMsg();
            }

            data.games.forEach(item => {
                const newGame = parseJsonToGameInstance(item);
                addToList(newGame);
            })
        })
        .catch((error) => {
            console.error(`Error: ${error}`)
        })
}

function formDataValidation(formData, key, value) {
    if (value !== undefined && value !== null && value !== "" ) {
        formData.append(key, value);
    }
}

// Add game to database
function addGameToDatabase(game) {
    const formData = new FormData();
    formDataValidation(formData, "imageUrl", game.imageUrl);
    formDataValidation(formData, "gameTitle", game.gameTitle);
    formDataValidation(formData, "developer", game.developer);
    formDataValidation(formData, "platform", game.platform);
    formDataValidation(formData, "gameUrl", game.gameUrl);
    formDataValidation(formData, "startDate", game.startDate);
    formDataValidation(formData, "startTime", game.startTime);
    formDataValidation(formData, "finishDate", game.finishDate);
    formDataValidation(formData, "finishTime", game.finishTime);
    formDataValidation(formData, "score", game.score);

    console.log(formData)

    let url = 'http://127.0.0.1:5000/game';

    fetch(url, {method: 'post',
               body: formData
    })
        .then(response => response.json())
        .then(_ => {
            clearGameTable();
            getGameList();  
            closeModal();
            
        })
        .catch((error) => console.error(error));
}

function removeRow(event, gameId, gameTitle) {
    if (confirm("Are you sure? This action cannot be undone.")) {
        const gameRow = event.target.closest("tr");
        gameRow.remove();
        deleteGame(gameId, gameTitle);
        alert(`"${gameTitle}" has been removed successfuly!`)
    }  
}

function deleteGame(gameId, gameTitle) {
    // console.log(`Game ${gameTitle}(#${gameId}) will (maybe) be deleted!`)

    let url = `http://127.0.0.1:5000/game?id=${gameId}&gameTitle=${encodeURIComponent(gameTitle)}`
    fetch(url, {
        method: "delete"
    })
        .then(response => response.json())
        .catch(error => console.error(error));
}

function showEmptyTableMsg() {
    let emptyTableRow = document.createElement("tr");

    const tdEmptyTable = document.createElement("td");
    tdEmptyTable.textContent = "No games! :(";
    tdEmptyTable.colSpan = 9;
    tdEmptyTable.style.padding = '20px 10px';
    tdEmptyTable.style.textAlign = 'center';
    
    emptyTableRow.appendChild(tdEmptyTable);

    gameTable.appendChild(emptyTableRow)
}

function formatScore(score) {
    if (score == null) {
        return "-";
    }

    return `${Number(score).toFixed(1)}/5.0`
}

function getDateTimeString(date, time) {
    let dateTimeString = "-";

    if (date || time) {
        let fullDate = "??/??/??";
  
        if (date) {
            fullDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'});
        } 

        dateTimeString = `${fullDate} - ${!time ? "??:??" : time }`
    }
    return dateTimeString;
}

function createCell(gameRow, className, content) {
    const cell = gameRow.insertCell();

    if (className) {
        cell.className = className;
    }

    if (content instanceof HTMLElement) {
        cell.appendChild(content)
    } else {
        cell.textContent = content;
    }

    return cell;
}

function clearGameTable() {
    gameTable.innerHTML = "";
}

function createActions(row, game) {
    const cell = row.insertCell();
    cell.className = "game-actions";

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.onclick = () => openCreateEditModal(game.id);

    const remove = document.createElement("button");
    remove.className = "gameRemoveBtn"
    remove.textContent = "Remove";
    remove.onclick = (event) => removeRow(event, game.id, game.gameTitle);

    cell.append(edit, remove);
}

function addGameToTable(game) {
    let newGameRow = document.createElement("tr");

    // Image
    const gameImg = document.createElement("img");
    gameImg.className = "game-img";
    gameImg.src = game.imageUrl || 'assets/game_image_placeholder.png';
    gameImg.alt = `${game.gameTitle}'s image`;

    createCell(newGameRow, null, gameImg);  // Image                 
    createCell(newGameRow, "game-title", game.gameTitle);  // Name
    createCell(newGameRow, "game-dev", game.developer);  // Developer
    createCell(newGameRow, "game-platform", game.platform);  // Platform

    //URL
    if (!game.gameUrl) {
        createCell(newGameRow, "game-url", "-");
    } else {
        const aGameUrl = document.createElement("a");
        aGameUrl.target = "_blank";
        aGameUrl.href = game.gameUrl;
        aGameUrl.textContent = game.gameUrl;
        createCell(newGameRow, "game-url", aGameUrl)
    }
    
    createCell(newGameRow, "game-started-at", getDateTimeString(game.startDate, game.startTime))  //Started at (date/time)
    createCell(newGameRow, "game-finished-at", getDateTimeString(game.finishDate, game.finishTime))  //Finished at (date/time)

    //Score
    let classScore = ""

    if (game.score != null) {
        if (game.score <= 1) { // Ruim
            classScore = "badScore";
        } else if (game.score <= 2.5 ) { // Meh
            classScore = "mehScore";
        } else if (game.score <= 3.5) { // Ok
            classScore = "okScore";
        } else if (game.score <= 4.5) { // Bom
            classScore = "goodScore";
        } else if (game.score == 5.0) { // Muito Bom
            classScore = "greatScore"
        }
    }

    const pScore = document.createElement("p");
    pScore.className = classScore;
    pScore.textContent = formatScore(game.score);
    createCell(newGameRow, "game-score", pScore); 

    createActions(newGameRow, game);  // Actions

    gameTable.appendChild(newGameRow); 
}

// MODAL

function openModal() {
    let modal = $element("modal")

    modal.classList.remove("hidden");
    modal.classList.add("visible");
}

function closeModal() {
    let modal = $element("modal")
    
    $element("game-form").reset();
    imageExample.src = 'assets/game_image_placeholder.png';

    toggleStartedFinishedAt("NOTPLAYED")

    modal.classList.remove("visible");
    modal.classList.add("hidden");
}

//Add/Edit Game Form
const gameForm = $element("game-form");
const currentScore = $element("current-score");

function openCreateEditModal(gameId=undefined) {
    openModal();
    loadPlatforms();  

    let modalContainer = $element("modal-container")
    modalContainer.scrollTop = 0;

    let modalHeader = $element("add-edit-header")

    if (gameId) {
        modalHeader.innerHTML = "Edit Game";
    } else {
        modalHeader.innerHTML = "Add Game";
    }
}

const formInputs = {
    gameImageUrl: $element("game-form-image_url"),
    gametitle: $element("game-form-title"),
    dev: $element("game-form-dev"),
    platform: $element("game-form-platform"),
    link: $element("game-form-link"),
    startDate: $element("game-form-start-date"),
    startTime: $element("game-form-start-time"),
    finishDate: $element("game-form-finish-date"),
    finishTime: $element("game-form-finish-time"),
    score: $element("game-form-score-input")
};

let currentGameStatus = "";

const imageExample = $element("game-form-image-example");
const gamePlatformList = ["PC", "Playstation 1", "Playstation 2", "Playstation 3", "Playstation 4", "Playstation 5", "Playstation 6", "Xbox", "Xbox360", "Xbox One", "Xbox Series X/S", "NES", "SNES", "Nintendo 64", "GameCube", "Wii", "Wii U", "Game&Watch", "Gameboy", "Gameboy Color", "Gameboy Advance", "Nintendo DS", "Nintendo DSi", "Nintendo 3DS", "New Nintendo 3DS", "Virtual Boy", "Nintendo Switch", "Nintendo Switch 2", "Zeebo", "Atari 2600", "Atari 5200", "Atari 7800", "Atari XEGS", "Atari Lynx", "Atari Lynx II", "Atari Jaguar", "Atari VCS", "CD-i"]
const gameScoreValues = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

const hasStarted = () => currentGameStatus == "PLAYING" || currentGameStatus == "FINISHED"; 
const hasFinished = () => currentGameStatus == "FINISHED"; 

gameForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let newGame = new Game(
        undefined,
        formInputs.gameImageUrl.value,
        formInputs.gametitle.value,
        formInputs.dev.value,
        formInputs.platform.value,
        formInputs.link.value,
        hasStarted() ? formInputs.startDate.value || null : null,
        hasStarted() ? formInputs.startTime.value || null : null,
        hasFinished() ? formInputs.finishDate.value || null : null,
        hasFinished() ? formInputs.finishTime.value || null : null,
        hasFinished() ? gameScoreValues[formInputs.score.value] : null
    );

    addGameToDatabase(newGame);
})

formInputs.score.addEventListener("input", () => {
    currentScore.textContent = `${gameScoreValues[formInputs.score.value]}`;
})

gameForm.addEventListener("change", function(event) {
    if (event.target.type === "radio") {
        currentGameStatus = event.target.value;
        toggleStartedFinishedAt(currentGameStatus);
    }
})

function loadPlatforms() {
    let platformSelect = $element("game-form-platform");

    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "loading...";
    platformSelect.appendChild(defaultOption);

    gamePlatformList.forEach(platform => {
        let platformOption = document.createElement("option");
        platformOption.value = platform;
        platformOption.textContent = platform;
        platformSelect.appendChild(platformOption);
    })
    
    defaultOption.textContent = "";
    platformSelect.disabled = false;
}

function toggleVisibleHidden(elements, show=true) {
    if (!elements) {
        return;
    }

    if (Array.isArray(elements)) {
       elements.forEach(e => {
            e.classList.remove(show ? "hidden" : "visible");
            e.classList.add(show ? "visible" : "hidden");
       }) 
    }
}

function toggleStartedFinishedAt(status) {
    let startedAtInfo = $element("started-at-info");
    let finishedAtInfo = $element("finished-at-info");
    let scoreInfo = $element("score-info");

    switch(status) {
        case "NOTPLAYED":
            toggleVisibleHidden([startedAtInfo, finishedAtInfo, scoreInfo], false)
            break;
        case "PLAYING":
            toggleVisibleHidden([startedAtInfo])
            toggleVisibleHidden([finishedAtInfo, scoreInfo], false)
            break;
        case "FINISHED":
            toggleVisibleHidden([startedAtInfo, finishedAtInfo, scoreInfo])
            break;
    }
}

function toggleImageTest() {
    imageExample.src = formInputs.gameImageUrl.value || 'assets/game_image_placeholder.png';
} 

getGameList();  // Retrieve games 