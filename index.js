import * as modal from "./modal.js"
import * as games from "./games.js"

const modalBackground = document.getElementById("modal")
modalBackground.addEventListener("click", modal.closeModal)

const addGameBtn = document.getElementById("add-game-btn")
addGameBtn.addEventListener("click", () => modal.openCreateEditModal())

// const modalContainer = document.getElementById("modal-container")
// modalContainer.onclick = event.stopPropagation()

const gameFormCancel = document.getElementById("game-form-cancel")
gameFormCancel.addEventListener("click", modal.closeModal)

games.getGameList();