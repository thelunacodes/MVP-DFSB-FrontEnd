class Game {
    constructor(image=undefined,
                name,
                developer=undefined,
                publisher=undefined,
                platform,
                link=undefined,
                startedAtDate=undefined,
                startedAtTime,
                finishedAtDate=undefined,
                finishedAtTime,
                score=undefined,) {
        this.image = image
        this.name = name;
        this.developer = developer;
        this.publisher = publisher;
        this.platform = platform;
        this.link = link;
        this.startedAtDate = startedAtDate;
        this.startedAtTime = startedAtTime;
        this.finishedAtDate = finishedAtDate;
        this.finishedAtTime = finishedAtTime;
        this.score = score; 
    }
}

function parseJsonToGameInstance(data) {
    const gameInstance = new Game(data.img,
                                data.name,
                                data.developer,
                                data.publisher,
                                data.platform,
                                data.link,
                                data.started_at_date ? new Date(data.started_at_date) : null,
                                data.started_at_time ? data.started_at_time : null,
                                data.finished_at_date ? new Date(data.finished_at_date) : null,
                                data.finished_at_time ? data.finished_at_time : null,
                                data.score 
    );

    return gameInstance;
}

async function loadGames() {
    const response = await fetch("tempStorage.json");
    const data = await response.json();

    const gameList = data.games ?? [];

    gameList.map(parseJsonToGameInstance)
            .forEach(addGameToTable);
}

function addGameToTable(game) {
    let newGameRow = document.createElement("tr")
    newGameRow.className = "game-row";

    const gameTable = document.getElementById("game-table");
    gameTable.appendChild(newGameRow);

    // Image
    const image_src = `${!game.image ? 'assets/game_image_placeholder.png' : game.image}`
    let image_cell = newGameRow.insertCell(0);
    image_cell.innerHTML = `<img class='game-img' 
                                src=${image_src}
                                alt="${game.name}'s image">`
                                        
    //Name
    let name_cell = newGameRow.insertCell(1)
    name_cell.className = "game-name";
    name_cell.innerHTML = `<p>${game.name}</p>`

    //Developer
    const dev_name = `${!game.developer ? '-' : `${game.developer}`}`

    let dev_cell = newGameRow.insertCell(2)
    dev_cell.className = "game-dev";
    dev_cell.innerHTML = `<p>${dev_name}</p>`

    //Publisher
    const pub_name = `${!game.publisher ? '-' : `${game.publisher}`}`

    let pub_cell = newGameRow.insertCell(3);
    pub_cell.className = "game-publisher";
    pub_cell.innerHTML = `<p>${pub_name}</p>`

    //Platform
    let plat_cell = newGameRow.insertCell(4);
    plat_cell.className = "game-platform";
    plat_cell.innerHTML = `<p>${game.platform}</p>`

    //URL
    const game_link = `${!game.link ? '-' : `<a target="_blank" href=${game.link}>${game.link}</a>`}`

    let link_cell = newGameRow.insertCell(5);
    link_cell.className = "game-link";
    link_cell.innerHTML = `${game_link}`

    //Started at (date/time)
    let startedAt = "";

    if (!game.startedAtDate && !game.startedAtTime) {
        startedAt = "-"
    } else {
        let fullStartDate = "??/??/??";

        if (game.startedAtDate) {
            const startDay = String(game.startedAtDate.getDate()).padStart(2, '0');
            const startMonth = String(game.startedAtDate.getMonth() + 1).padStart(2, '0');
            fullStartDate = `${startDay}/${startMonth}/${game.startedAtDate.getFullYear()}`
        } 

        startedAt = `${fullStartDate} - ${!game.startedAtTime ? "??:??" : game.startedAtTime }`
    }

    let started_at_cell = newGameRow.insertCell(6)
    started_at_cell.className = "game-started-at"
    started_at_cell.innerHTML = `<p>${startedAt}</p>`

    //Finished at (date/time)
    let finishedAt = "" 

    if (!game.finishedAtDate && !game.finishedAtTime) {
        finishedAt = "-"
    } else {
        let fullFinishDate = "??/??/??";

        if (game.finishedAtDate) {
            const finishDay = String(game.finishedAtDate.getDate()).padStart(2, '0');
            const finishMonth = String(game.finishedAtDate.getMonth() + 1).padStart(2, '0');
            fullFinishDate = `${finishDay}/${finishMonth}/${game.finishedAtDate.getFullYear()}`
        } 

        const finishTime = !game.finishedAtTime ? "??:??" : game.finishedAtTime;

        finishedAt = `${fullFinishDate} - ${finishTime}`
    }

    let finished_at_cell = newGameRow.insertCell(7)
    finished_at_cell.className = "game-finished-at"
    finished_at_cell.innerHTML = `<p>${finishedAt}</p>`

    //Score
    let classScore = ""

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

    let class_cell = newGameRow.insertCell(8);
    class_cell.className = "game-score"

    const gameScore = game.score == null ? "-" : `${game.score.toFixed(1)}/5.0`;

    class_cell.innerHTML = `<p class=${classScore}>${gameScore}</p>`
}

loadGames();