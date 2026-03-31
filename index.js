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

const API_URL = "http://127.0.0.1:5000";
const PLACEHOLDER_IMG_PATH = "assets/game_image_placeholder.png";

// Converts the JSON response into a "Game" instance
function parseJsonToGameInstance(data) {
    const gameInstance = new Game(data.id,
                                data.imageUrl,
                                data.gameTitle,
                                data.developer,
                                data.platform,
                                data.gameUrl,
                                data.startDate || null,
                                data.startTime || null,
                                data.finishDate || null,
                                data.finishTime || null,
                                data.score 
    );

    return gameInstance;
}

// Retrieves a game from the database using its ID
function getGameById(gameId) {
    let url = `${API_URL}/game?id=${gameId}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            loadEditGameForm(data);
        })
        .catch(err => {
            console.error(err);
        });
}

// Retrieves all registered games from the database
async function getGameList() {
    let url = `${API_URL}/games`;
    fetch(url, {method: "get",})
        .then(response => response.json())
        .then(data => {
            if (data.games.length == 0 ) {
                showEmptyTableMsg();
            }

            data.games.forEach(item => {
                const newGame = parseJsonToGameInstance(item);
                addGameToTable(newGame);
            })
        })
        .catch((error) => {
            console.error(`Error: ${error}`)
        })
}

// Validates data from the add/edit form, before putting it into a FormData
function formDataValidation(formData, key, value) {
    if (value !== undefined && value !== null && value !== "" ) {
        formData.append(key, value);
    }
}

// Builds the FormData for adding/updating a game
function buildFormData(game, update=false) {
    const formVar = new FormData();
    
    if (update) { formDataValidation(formVar, "id", game.id)};
    formDataValidation(formVar, "imageUrl", game.imageUrl);
    formDataValidation(formVar, "gameTitle", game.gameTitle);
    formDataValidation(formVar, "developer", game.developer);
    formDataValidation(formVar, "platform", game.platform);
    formDataValidation(formVar, "gameUrl", game.gameUrl);
    formDataValidation(formVar, "startDate", game.startDate);
    formDataValidation(formVar, "startTime", game.startTime);
    formDataValidation(formVar, "finishDate", game.finishDate);
    formDataValidation(formVar, "finishTime", game.finishTime);
    formDataValidation(formVar, "score", game.score);

    return formVar;
}

// Adds/updates a game 
function addUpdateGame(game, isUpdate) {
    const formData = buildFormData(game, isUpdate);
    let url = `${API_URL}/game`;

    fetch(url, {method: isUpdate ? "put" : "post",
                body: formData
    })
        .then(response => response.json())
        .then(_ => {
            gameTable.innerHTML = "";
            getGameList();  
            closeModal();
        })
        .catch((error) => console.error(error));
}

// Deletes a game from the database
function deleteGame(gameId, gameTitle) {
    let url = `${API_URL}/game?id=${gameId}&gameTitle=${encodeURIComponent(gameTitle)}`
    fetch(url, {
        method: "delete"
    })
        .then(response => response.json())
        .catch(error => console.error(error));
}

// Displays "No games! :(" as a row in the games table
function showEmptyTableMsg() {
    let emptyTableRow = document.createElement("tr");

    const tdEmptyTable = document.createElement("td");
    tdEmptyTable.textContent = "No games! :(";
    tdEmptyTable.colSpan = 9;
    tdEmptyTable.style.padding = "20px 10px";
    tdEmptyTable.style.textAlign = "center";
    
    emptyTableRow.appendChild(tdEmptyTable);

    gameTable.appendChild(emptyTableRow)
}

// Formats a date (DD/MM/YYYY format)
function formatDate(dateStr) {
    if (!dateStr) {
        return "-";
    }

    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

// Formats a score (X.X/5.0 format)
function formatScore(score) {
    if (score == null) {
        return "-";
    }

    return `${Number(score).toFixed(1)}/5.0`
}

// Returns a string containing a date and a time (if available)
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

// Creates a cell and inserts it into the row
function createCell(row, className, content) {
    const cell = row.insertCell();

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

/* 
    Creates a "actions" cell, containing an "edit", "remove" and, 
    if needed, a "view game" button. 
*/
function createActions(row, game) {
    const cell = row.insertCell();
    cell.className = "game-actions";

    const buttonDiv = document.createElement("div");
    buttonDiv.className = "actionsBtnDiv"

    const edit = document.createElement("button");
    edit.className = "tableBtn";
    edit.textContent = "Edit";
    edit.onclick = () => showAddEditModal(game.id);

    const remove = document.createElement("button");
    remove.className = "tableBtn";
    remove.textContent = "Remove";
    remove.onclick = (event) => showConfirmRemoveModal(event, game.id, game.gameTitle);

    buttonDiv.append(edit, remove);

    if (game.gameUrl) {
        const viewGameBtn = document.createElement("input");
        viewGameBtn.className = "tableBtn";
        viewGameBtn.type = "button";
        viewGameBtn.value = "View Game"
        viewGameBtn.onclick = () => window.open(game.gameUrl, "_blank").focus();    
        
        buttonDiv.appendChild(viewGameBtn);
    }

    cell.append(buttonDiv);
}

// Validates an URL
function validateURL(urlStr) {
    let url;

    try {
        if (urlStr.startsWith("https://") || urlStr.startsWith("http://")) {
            url = new URL(urlStr);
        } else { 
            url = new URL("https://" + urlStr);
        }
            return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
    } catch (_) {
        return false;
    }   
}

// Adds game to table
function addGameToTable(game) {
    let newGameRow = document.createElement("tr");

    // Image
    const gameImg = document.createElement("img");
    gameImg.className = "game-img";
    gameImg.src = game.imageUrl || PLACEHOLDER_IMG_PATH;
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

// CORE MODAL ELEMENTS
const modalBase = $element("modal")
const modalContainer = $element("modal-container")


const modalList = {
    ADD_EDIT: $element("add-edit-modal"),
    CONFIRM_REMOVE: $element("remove-confirm-modal")
}

// Displays the modal :p
function openModal() {
    modalBase.classList.remove("hidden");
    modalBase.classList.add("flex");
}

// Hides the modal :p
function closeModal() {
    hideAllModals();

    // Reset modal content
    if (!modalList.ADD_EDIT.classList.contains("hidden")) {
        resetAddEditModal();
    }

    modalBase.classList.remove("flex");
    modalBase.classList.add("hidden");
}

// Hides all modal content
function hideAllModals() {
    Object.values(modalList).forEach(modal => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    });
}

// ADD/EDIT MODAL
const gameForm = $element("game-form");
const modalHeader = $element("add-edit-header")
const imageExample = $element("game-form-image-example");

const platformSelect = $element("game-form-platform");
const gamePlatformList = ["PC", "Playstation 1", "Playstation 2", "Playstation 3", "Playstation 4", "Playstation 5", "Playstation 6", "Xbox", "Xbox360", "Xbox One", "Xbox Series X/S", "NES", "SNES", "Nintendo 64", "GameCube", "Wii", "Wii U", "Game&Watch", "Gameboy", "Gameboy Color", "Gameboy Advance", "Nintendo DS", "Nintendo DSi", "Nintendo 3DS", "New Nintendo 3DS", "Virtual Boy", "Nintendo Switch", "Nintendo Switch 2", "Zeebo", "Atari 2600", "Atari 5200", "Atari 7800", "Atari XEGS", "Atari Lynx", "Atari Lynx II", "Atari Jaguar", "Atari VCS", "CD-i"]

const currentScore = $element("current-score");
const scoreToggleCheck = $element("score-check");

let hasScore = scoreToggleCheck.checked;
const gameScoreValues = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

let updating = false;
let updateId = 0;

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

// Resets the Add/Edit modal
function resetAddEditModal() {
    hasScore = false;
    updating = false;
    updateId = 0;
    gameForm.reset();
    imageExample.src = PLACEHOLDER_IMG_PATH;
    formInputs.score.disabled = true;
    currentScore.textContent = `${gameScoreValues[0]}`; 
}

// Displays the Add/Edit modal
function showAddEditModal(gameId=undefined) {
    openModal();
    
    modalContainer.scrollTop = 0;

    modalContainer.className = "scrollable";
    modalList.ADD_EDIT.classList.remove("hidden");
    modalList.ADD_EDIT.classList.add("flex");

    updating = gameId != null;

    // console.log(updating ? "UPDATE" : "CREATE")

    loadPlatforms();  

    if (updating) {
        modalHeader.innerHTML = "Edit Game";
        updateId = gameId;
        // getGameById(gameId)
    } else {    
        modalHeader.innerHTML = "Add Game";
    }

    formInputs.gameImageUrl.focus();
}

// Displays the "remove game confirmation" modal
function showConfirmRemoveModal(event, gameId, gameTitle) {
    openModal();

    // Remove Scroll
    if (modalContainer.classList.contains("scrollable")) {
        modalContainer.classList.remove("scrollable")
    }

    modalList.CONFIRM_REMOVE.classList.remove("hidden");
    modalList.CONFIRM_REMOVE.classList.add("flex");
    
    const removeGameLabel = $element("remove-confirm-label")
    removeGameLabel.textContent = `'${gameTitle}' will be lost forever! (A long time!)`;

    const confirmBtn = $element("remove-confirm-btn")
    confirmBtn.onclick = () => { 
        // deleteGame(gameId, gameTitle)
        // const gameRow = event.target.closest("tr");
        // gameRow.remove();
        console.log("DELETOU UAU");
        // gameTable.innerHTML = "";  
        // getGameList();  
        closeModal();
    }
}

// Loads game data to the "edit game" form
function loadEditGameForm(game) {
    formInputs.gameImageUrl.value = game.imageUrl || "";
    toggleImageTest(); // Update example image (if needed)
    formInputs.gameTitle.value = game.gameTitle || "";
    formInputs.dev.value = game.developer || "";
    formInputs.platform.value = game.platform || "";
    formInputs.link.value = game.gameUrl || "";
    formInputs.startDate.value = game.startDate || "";
    formInputs.startTime.value = game.startTime || "";
    formInputs.finishDate.value = game.finishDate || "";
    formInputs.finishTime.value = game.finishTime || "";
    formInputs.score.value = gameScoreValues.indexOf(game.score) || 0;
    currentScore.textContent = game.score || 0;
    formInputs.score.disabled = game.score == null;
    scoreToggleCheck.checked = game.score != null;
}

// Loads the names from "gamePlatformList" to the "platform" selection input
function loadPlatforms() {
    platformSelect.innerHTML = ""; 

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
    
    defaultOption.textContent = "Select...";
    defaultOption.selected = true;
    platformSelect.disabled = false;
}

/* 
    Validates and displays the image from the URL entered by the user (also
    displays a warning, if needed)
*/
function toggleImageTest() {
    const imageUrlValue = formInputs.gameImageUrl.value.trim();
    formInputs.gameImageUrl.setCustomValidity("");

    imageExample.src = imageUrlValue || PLACEHOLDER_IMG_PATH;

    imageExample.onerror = () => {
        // console.log("IMAGEM INVÁLIDA!")
        imageExample.src = PLACEHOLDER_IMG_PATH;
        formInputs.gameImageUrl.setCustomValidity("Please enter a valid URL or leave it empty.");
    }
} 

function updateTimeLimit(startDate, endDate, startTime, endTime) {
    if ((startDate.value && endDate.value) && 
        (startDate.value == endDate.value)) {
            endTime.min = startTime.value || "";
            startTime.max = endTime.value || "";
    } else {
        endTime.removeAttribute("min");
        startTime.removeAttribute("max");
    }
}

//Force all the other (invalid form input) warnigns to be in english
formInputs.link.addEventListener("invalid", () => {
    const gameUrlValue = formInputs.link.value.trim();
    formInputs.link.setCustomValidity("");

    if (gameUrlValue !== "" && formInputs.link.validity.typeMismatch) {
        formInputs.link.setCustomValidity("Please enter a valid URL or leave it empty.")
    }
})

formInputs.gameTitle.addEventListener("invalid", () => {
    formInputs.gameTitle.setCustomValidity("");

    if (formInputs.gameTitle.validity.valueMissing) {
        formInputs.gameTitle.setCustomValidity("Please enter a game title!");
    }
})

formInputs.dev.addEventListener("invalid", () => {
    formInputs.dev.setCustomValidity("");

    if (formInputs.dev.validity.valueMissing) {
        formInputs.dev.setCustomValidity("Please enter a developer!");
    }
})

formInputs.platform.addEventListener("invalid", () => {
    formInputs.platform.setCustomValidity("");

    if (formInputs.platform.validity.valueMissing) {
        formInputs.platform.setCustomValidity("Please enter a platform!");
    }
})

formInputs.startDate.addEventListener("invalid", () => {
    formInputs.startDate.setCustomValidity("");

    if (formInputs.startDate.validity.rangeOverflow) {
        formInputs.startDate.setCustomValidity(`The 'start date' must be before ${formatDate(formInputs.finishDate.value)}`);
    } 
})

formInputs.finishDate.addEventListener("invalid", () => {
    formInputs.finishDate.setCustomValidity("");

    if (formInputs.finishDate.validity.rangeUnderflow) {
        formInputs.finishDate.setCustomValidity(`The 'finish date' must be after ${formatDate(formInputs.startDate.value)}`);
    } 
})

formInputs.startTime.addEventListener("invalid", () => {
    formInputs.startTime.setCustomValidity("");

    if (formInputs.startTime.validity.rangeOverflow) {
        formInputs.startTime.setCustomValidity(`The 'start time' must be before ${formInputs.finishTime.value}`);
    } 
})

formInputs.finishTime.addEventListener("invalid", () => {
    formInputs.finishTime.setCustomValidity("");

    if (formInputs.finishTime.validity.rangeUnderflow) {
        formInputs.finishTime.setCustomValidity(`The 'finish time' must be after ${formInputs.startTime.value}`);
    } 
})



//Sets min/max date for start/finish inputs
formInputs.startDate.addEventListener("change", () => {
    if (formInputs.startDate.value) {
        formInputs.finishDate.min = formInputs.startDate.value;        
    } else {
        formInputs.finishDate.removeAttribute("min");
    }

    updateTimeLimit(formInputs.startDate, formInputs.finishDate, formInputs.startTime, formInputs.finishTime)
})

formInputs.finishDate.addEventListener("change", () => {
    if (formInputs.finishDate.value) {
        formInputs.startDate.max = formInputs.finishDate.value;
    } else {
        formInputs.startDate.removeAttribute("max");
    }

    updateTimeLimit(formInputs.startDate, formInputs.finishDate, formInputs.startTime, formInputs.finishTime)
})

formInputs.startTime.addEventListener("change", () => { updateTimeLimit(formInputs.startDate, formInputs.finishDate, formInputs.startTime, formInputs.finishTime)});

formInputs.finishTime.addEventListener("change", () => { updateTimeLimit(formInputs.startDate, formInputs.finishDate, formInputs.startTime, formInputs.finishTime)});

// Submits the form data
gameForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let game = new Game(
        updating ? updateId : undefined,
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

    console.log("JOGO SALVO")
    console.log(game)
    // addUpdateGame(game, updating);
})

// Updates label underneath the score scroll with the current score value
formInputs.score.addEventListener("input", () => {
    currentScore.textContent = `${gameScoreValues[formInputs.score.value]}`;
})

// Enables/Disables score input 
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