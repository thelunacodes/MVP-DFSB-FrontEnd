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
                                data.startDate = data.startDate || null,
                                data.startTime ? data.startTime : null,
                                data.finishDate = data.finishDate || null,
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

// Update game in database
function updateGame(game) {

}

function removeRow(event, gameId, gameTitle) {
    if (confirm(`Are you sure you want to delete this game?\n\n'${gameTitle}' will be lost forever! (A long time!)`)) {
        const gameRow = event.target.closest("tr");
        gameRow.remove();
        deleteGame(gameId, gameTitle);
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

function formatDate(dateStr) {
    if (!dateStr) {
        return "-";
    }

    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
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
            fullDate = formatDate(date)
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
    edit.onclick = () => openModal(game.id);

    const remove = document.createElement("button");
    remove.className = "gameRemoveBtn"
    remove.textContent = "Remove";
    remove.onclick = (event) => removeRow(event, game.id, game.gameTitle);

    if (game.gameUrl) {
        const goToPage = document.createElement("input");
        goToPage.className = "goToPageBtn";
        goToPage.type = "button";
        goToPage.textContent = "Game Page"
        
    }

    cell.append(edit, remove);
}

function validateURL(str) {
    let url;

    try {
        url = new URL(str);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
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
const modal = $element("modal")
const gameForm = $element("game-form");
const currentScore = $element("current-score");
const imageExample = $element("game-form-image-example");
const scoreToggleCheck = $element("score-check");
const platformSelect = $element("game-form-platform");
const modalContainer = $element("modal-container")
const modalHeader = $element("add-edit-header")

const gamePlatformList = ["PC", "Playstation 1", "Playstation 2", "Playstation 3", "Playstation 4", "Playstation 5", "Playstation 6", "Xbox", "Xbox360", "Xbox One", "Xbox Series X/S", "NES", "SNES", "Nintendo 64", "GameCube", "Wii", "Wii U", "Game&Watch", "Gameboy", "Gameboy Color", "Gameboy Advance", "Nintendo DS", "Nintendo DSi", "Nintendo 3DS", "New Nintendo 3DS", "Virtual Boy", "Nintendo Switch", "Nintendo Switch 2", "Zeebo", "Atari 2600", "Atari 5200", "Atari 7800", "Atari XEGS", "Atari Lynx", "Atari Lynx II", "Atari Jaguar", "Atari VCS", "CD-i"]
const gameScoreValues = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
let hasScore = scoreToggleCheck.checked;
let update = false;

const formInputs = {
    gameImageUrl: $element("game-form-image_url"),
    gameTitle: $element("game-form-title"),
    dev: $element("game-form-dev"),
    platform: $element("game-form-platform"),
    link: $element("game-form-link"),
    startDate: $element("game-form-start-date"),
    startTime: $element("game-form-start-time"),
    finishDate: $element("game-form-finish-date"),
    finishTime: $element("game-form-finish-time"),
    score: $element("game-form-score-input")
};

function closeModal() {
    // Reset content
    gameForm.reset();
    imageExample.src = 'assets/game_image_placeholder.png';
    formInputs.score.disabled = true;
    currentScore.textContent = `${gameScoreValues[0]}`; 

    modal.classList.remove("flex");
    modal.classList.add("hidden");
}

function openModal(gameId=undefined) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    update = gameId != null;

    console.log(update ? "UPDATE" : "CREATE")

    loadPlatforms();  

    if (update) {
        modalHeader.innerHTML = "Edit Game";
        // Get game from db with id ........
        loadGameIntoForm(testGame);
    } else {    
        modalHeader.innerHTML = "Add Game";
    }

    modalContainer.scrollTop = 0;
}

function scoreCheck(game) {
    if (game.score < 0 || game.score > 5) {
        game.score = undefined;
    }
}

function dateCheck(date) {
    return date ? date.toISOString().split('T')[0] : undefined;
}

function timeCheck(time) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
    return regex.test(time) ? time : undefined;
}

function loadGameIntoForm(game) {
    formInputs.gameImageUrl.value = game.imageUrl || "";
    toggleImageTest(); // Update example image (if needed)
    formInputs.gameTitle.value = game.gameTitle || "";
    formInputs.dev.value = game.developer || "";
    formInputs.platform.value = game.platform || "";
    formInputs.link.value = game.gameUrl || "";
    formInputs.startDate.value = dateCheck(game.startDate);
    formInputs.startTime.value = timeCheck(game.startTime);
    formInputs.finishDate.value = dateCheck(game.finishDate);
    formInputs.finishTime.value = timeCheck(game.finishTime);
    scoreCheck(game); // Score value validation
    formInputs.score.value = gameScoreValues.indexOf(game.score) || 0;
    currentScore.textContent = game.score || 0;
    formInputs.score.disabled = game.score == null;
    scoreToggleCheck.checked = game.score != null;
}

function loadPlatforms() {

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

function toggleImageTest() {
    imageExample.src = validateURL(formInputs.gameImageUrl.value) ? formInputs.gameImageUrl.value : 'assets/game_image_placeholder.png';
} 

gameForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const invalidURLMsg = (fieldName) => `"Oops! The URL you've entered at '${fieldName}' is invalid! Please enter a valid URL or leave it empty."`

    // URL Validation
    if (formInputs.gameImageUrl.value.trim() != "" && !validateURL(formInputs.gameImageUrl.value)) {
        alert(invalidURLMsg("Game Image (URL)"))
        return;
    }

    if (formInputs.link.value.trim() != "" && !validateURL(formInputs.link.value)) {
        alert(invalidURLMsg("Link (URL)"))
        return;
    }

    // Date/Time Validation
    const startDateValue = new Date(formInputs.startDate.value);
    const startTimeValue = new Date(formInputs.startTime.value);
    const finishDateValue = new Date(formInputs.finishDate.value);
    const finishTimeValue = new Date(formInputs.finishTime.value);

    if (finishDateValue < startDateValue) {
        alert("The 'Finished At' date must be after the 'Started At' date.")
    } else if (startDateValue.getTime() == finishDateValue.getTime()) {
        console.log("equal")
        console.log(startTimeValue)
        console.log(finishTimeValue)
    }

    let newGame = new Game(
        undefined,
        formInputs.gameImageUrl.value,
        formInputs.gameTitle.value,
        formInputs.dev.value,
        formInputs.platform.value,
        formInputs.link.value,
        formInputs.startDate.value || null,
        formInputs.startTime.value || null,
        formInputs.finishDate.value || null,
        formInputs.finishTime.value || null,
        hasScore ? gameScoreValues[formInputs.score.value] : null
    );

    console.log("GAME ADDED YAY!")
    // addGameToDatabase(newGame);
})

formInputs.score.addEventListener("input", () => {
    currentScore.textContent = `${gameScoreValues[formInputs.score.value]}`;
})

scoreToggleCheck.addEventListener("change", (event) => {
    hasScore = scoreToggleCheck.checked;
    formInputs.score.disabled = !scoreToggleCheck.checked;

});

// getGameList();  // Retrieve games 

const testGame = new Game(
    1, 
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZbB_doR9LVg_xVbDXOOZc3TNbgNCEIzLLKw&s",
    "Orange: The game",
    "Adam Sandler",
    "Zeebo",
    "https://www.google.com",
    undefined,
    "22:30",
    undefined,
    undefined,
    2.0
)

addGameToTable(testGame);