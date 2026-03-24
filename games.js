import { openCreateEditModal } from "./modal.js";

export class Game {
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

let gameList = [];

function addToList(game) {
    addGameToTable(game)
}

function parseJsonToGameInstance(data) {
    const gameInstance = new Game(data.id,
                                data.img,
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

export async function getGameList() {
    let url = 'http://127.0.0.1:5000/games';
    fetch(url, {method: 'get',})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            
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

// Add game to database
export function addGameToDatabase(game) {
    const formData = new FormData();
    formData.append('imageUrl', game.imageUrl);
    formData.append('gameTitle', game.gameTitle);
    formData.append('developer', game.developer);
    formData.append('platform', game.platform);
    formData.append('gameUrl', game.gameUrl);
    formData.append('startDate', game.startDate || "");
    formData.append('startTime', game.startTime || "");
    formData.append('finishDate', game.finishDate || "");
    formData.append('finishTime', game.finishTime || "");
    formData.append('score', game.score);

    console.log(formData)

    let url = 'http://127.0.0.1:5000/game';

    fetch(url, {method: 'post',
                body: JSON.stringify({
                gameTitle: game.gameTitle,
                developer: game.developer,
                platform: game.platform,
                gameUrl: game.gameUrl,
                startDate: game.startDate || null,
                startTime: game.startTime || null,
                finishDate: game.finishDate || null,
                finishTime: game.finishTime || null,
                score: game.score ?? null
            })
    })
        .then(response => response.json())
        .then(data => {
            console.log("RESPONSE:", data);
        })
        .catch((error) => console.error(error));
}

function removeRow(gameId, gameTitle) {
    if (confirm("Are you sure? This action cannot be undone.")) {
                parentDiv.remove();
                deleteGame(gameId, gameTitle);
                alert(`"${gameTitle}" has been removed successfuly!`)
    }  
}

function deleteGame(gameId, gameTitle) {
    console.log(`Game ${gameTitle}(#${gameId}) will (maybe) be deleted!`)

    let url = `http://127.0.0.1:5000/game?id=${gameId}&gameTitle=${encodeURIComponent(gameTitle)}`
    fetch(url, {
        method: "delete"
    })
        .then(response => response.json())
        .catch(error => console.error(error));
}

function showEmptyTableMsg() {
    let newGameRow = document.getElementById("game-row");

    const pEmptyTable = document.createElement("td");
    pEmptyTable.textContent = "No games! :(";
    pEmptyTable.colSpan = 9;
    pEmptyTable.style.padding = '20px 10px';
    pEmptyTable.style.textAlign = 'center';
    newGameRow.appendChild(pEmptyTable);
}

function addGameToTable(game) {
    let newGameRow = document.getElementById("game-row");

    // Image
    const image_src = `${!game.imageUrl ? 'assets/game_image_placeholder.png' : game.imageUrl}`
    let image_cell = newGameRow.insertCell(0);
    const gameImg = document.createElement("img");
    gameImg.className = "game-img";
    gameImg.src = image_src;
    gameImg.alt = `${game.gameTitle}'s image`;
    image_cell.appendChild(gameImg);
                                        
    //Name
    let name_cell = newGameRow.insertCell(1)
    name_cell.className = "game-title";
    const pGameTitle = document.createElement("p");
    pGameTitle.textContent = game.gameTitle;
    name_cell.appendChild(pGameTitle);

    //Developer
    let dev_cell = newGameRow.insertCell(2)
    dev_cell.className = "game-dev";
    const pDev = document.createElement("p");
    pDev.textContent = game.dev_name;
    dev_cell.appendChild(pDev);

    //Platform
    let plat_cell = newGameRow.insertCell(3);
    plat_cell.className = "game-platform";
    const pPlatform = document.createElement("p");
    pPlatform.textContent(game.platform);

    //URL
    let link_cell = newGameRow.insertCell(4);
    link_cell.className = "game-url";
    
    if (!game.gameUrl) {
        const pGameUrl = document.createElement("p");
        pGameUrl.textContent("-");
        link_cell.appendChild(pGameUrl);
    } else {
        const aGameUrl = document.createElement("a");
        aGameUrl.target = "_blank";
        aGameUrl.href = game.gameUrl;
        aGameUrl.textContent = game.gameUrl;
        link_cell.appendChild(aGameUrl);
    }

    //Started at (date/time)
    let startedAt = "";

    if (!game.startDate && !game.startTime) {
        startedAt = "-"
    } else {
        let fullStartDate = "??/??/??";

        if (game.startDate) {
            const startDay = String(game.startDate.getDate()).padStart(2, '0');
            const startMonth = String(game.startDate.getMonth() + 1).padStart(2, '0');
            fullStartDate = `${startDay}/${startMonth}/${game.startDate.getFullYear()}`
        } 

        startedAt = `${fullStartDate} - ${!game.startTime ? "??:??" : game.startTime }`
    }

    let started_at_cell = newGameRow.insertCell(5)
    started_at_cell.className = "game-started-at"

    const pStartedAt = document.createElement("p")
    pStartedAt.textContent(startedAt);
    started_at_cell.appendChild(pStartedAt);

    //Finished at (date/time)
    let finishedAt = "" 

    if (!game.finishDate && !game.finishTime) {
        finishedAt = "-"
    } else {
        let fullFinishDate = "??/??/??";

        if (game.finishDate) {
            const finishDay = String(game.finishDate.getDate()).padStart(2, '0');
            const finishMonth = String(game.finishDate.getMonth() + 1).padStart(2, '0');
            fullFinishDate = `${finishDay}/${finishMonth}/${game.finishDate.getFullYear()}`
        } 

        const finishTime = !game.finishTime ? "??:??" : game.finishTime;

        finishedAt = `${fullFinishDate} - ${finishTime}`
    }

    let finished_at_cell = newGameRow.insertCell(6)
    finished_at_cell.className = "game-finished-at"

    const pFinishedAt = document.createElement("p");
    pFinishedAt.textContent(finishedAt);
    finished_at_cell.appendChild(pFinishedAt);

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

    let score_cell = newGameRow.insertCell(7);
    score_cell.className = "game-score"

    const scoreVal = Number(game.score);
    const gameScore = isNan(scoreVal) ? "-" : `${scoreVal.toFixed(1)}/5.0`;

    const pScore = document.createElement("p");
    pScore.className = classScore;
    pScore.textContent = gameScore;
    score_cell.appendChild(pScore);

    //Actions
    let actions_cell = newGameRow.insertCell(8);
    actions_cell.className = "game-actions"

    let edit_btn = document.createElement("button")
    edit_btn.className = "table-edit-btn"
    edit_btn.textContent = "Edit"
    edit_btn.addEventListener("click", () => openCreateEditModal(game.id))

    let remove_btn = document.createElement("button")
    remove_btn.className = "table-remove-btn"
    remove_btn.textContent = "Remove"
    remove_btn.onclick(() => removeRow(game.id, game.gameTitle));

    actions_cell.append(edit_btn, remove_btn)
}