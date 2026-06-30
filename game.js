// Snack Catcher
// A small beginner-friendly browser game using only HTML, CSS, and JavaScript.

// ----- Page elements -----
const gameArea = document.getElementById("gameArea");
const basket = document.getElementById("basket");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

// ----- Game settings -----
const snacks = ["🍓", "🍪", "🍩", "🍎"];
const basketSpeed = 8;
const itemSize = 48;

// ----- Game state -----
let basketX = 0;
let score = 0;
let isPlaying = false;
let leftPressed = false;
let rightPressed = false;
let fallingItems = [];
let animationId;
let spawnTimer;
let lastFrameTime = 0;
let activePointerId = null;

// Put the basket in the center when the page loads.
resetBasket();

// ----- Controls -----
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    leftPressed = true;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    rightPressed = true;
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") {
    leftPressed = false;
  }

  if (event.key === "ArrowRight") {
    rightPressed = false;
  }
});

gameArea.addEventListener("pointerdown", handlePointerDown);
gameArea.addEventListener("pointermove", handlePointerMove);
gameArea.addEventListener("pointerup", stopTouchControl);
gameArea.addEventListener("pointercancel", stopTouchControl);

gameArea.addEventListener("touchmove", function (event) {
  if (isPlaying) {
    event.preventDefault();
  }
}, { passive: false });

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// ----- Main game flow -----
function startGame() {
  score = 0;
  isPlaying = true;
  fallingItems.forEach(function (item) {
    item.element.remove();
  });
  fallingItems = [];
  lastFrameTime = 0;

  resetBasket();
  updateScore();
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  document.body.classList.add("playing");

  clearInterval(spawnTimer);
  spawnTimer = setInterval(createFallingItem, 850);

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  isPlaying = false;
  clearInterval(spawnTimer);
  cancelAnimationFrame(animationId);
  finalScoreDisplay.textContent = score;
  document.body.classList.remove("playing");
  activePointerId = null;
  gameOverScreen.classList.remove("hidden");
}

function gameLoop(currentTime) {
  if (!isPlaying) {
    return;
  }

  // Delta time keeps movement smooth even if a computer draws frames faster or slower.
  if (lastFrameTime === 0) {
    lastFrameTime = currentTime;
  }

  const deltaTime = (currentTime - lastFrameTime) / 16.67;
  lastFrameTime = currentTime;

  moveBasket(deltaTime);
  moveFallingItems(deltaTime);
  checkCollisions();
  removeMissedItems();

  animationId = requestAnimationFrame(gameLoop);
}

// ----- Basket movement -----
function resetBasket() {
  const gameWidth = gameArea.clientWidth;
  basketX = (gameWidth - basket.offsetWidth) / 2;
  drawBasket();
}

function moveBasket(deltaTime) {
  if (leftPressed) {
    basketX -= basketSpeed * deltaTime;
  }

  if (rightPressed) {
    basketX += basketSpeed * deltaTime;
  }

  const maxX = gameArea.clientWidth - basket.offsetWidth;
  basketX = Math.max(0, Math.min(basketX, maxX));
  drawBasket();
}

function drawBasket() {
  basket.style.left = basketX + "px";
  basket.style.transform = "none";
}

function handlePointerDown(event) {
  if (!isPlaying) {
    return;
  }

  event.preventDefault();
  activePointerId = event.pointerId;
  gameArea.setPointerCapture(event.pointerId);
  moveBasketToPointer(event.clientX);
}

function handlePointerMove(event) {
  if (!isPlaying || event.pointerId !== activePointerId) {
    return;
  }

  event.preventDefault();
  moveBasketToPointer(event.clientX);
}

function stopTouchControl(event) {
  if (event.pointerId === activePointerId) {
    activePointerId = null;
  }
}

function moveBasketToPointer(pointerX) {
  const gameRect = gameArea.getBoundingClientRect();
  const centeredX = pointerX - gameRect.left - basket.offsetWidth / 2;
  const maxX = gameArea.clientWidth - basket.offsetWidth;

  basketX = Math.max(0, Math.min(centeredX, maxX));
  drawBasket();
}

// ----- Falling snacks and bombs -----
function createFallingItem() {
  if (!isPlaying) {
    return;
  }

  const element = document.createElement("div");
  const isBomb = Math.random() < 0.22;
  const maxX = gameArea.clientWidth - itemSize;
  const x = Math.random() * maxX;

  element.className = "falling-item";
  element.style.left = x + "px";
  element.style.top = "-52px";

  if (isBomb) {
    addBombImage(element);
  } else {
    element.textContent = pickRandomSnack();
  }

  gameArea.appendChild(element);

  fallingItems.push({
    element: element,
    x: x,
    y: -52,
    speed: isBomb ? 3.6 : 2.8 + Math.random() * 1.6,
    type: isBomb ? "bomb" : "snack"
  });
}

function pickRandomSnack() {
  const randomIndex = Math.floor(Math.random() * snacks.length);
  return snacks[randomIndex];
}

function addBombImage(element) {
  const image = document.createElement("img");
  image.src = "bomb.png";
  image.alt = "bomb";

  image.addEventListener("error", function () {
    element.textContent = "💣";
  });

  element.appendChild(image);
}

function moveFallingItems(deltaTime) {
  fallingItems.forEach(function (item) {
    item.y += item.speed * deltaTime;
    item.element.style.top = item.y + "px";
  });
}

// ----- Collisions and scoring -----
function checkCollisions() {
  const basketRect = basket.getBoundingClientRect();

  for (let index = 0; index < fallingItems.length; index += 1) {
    const item = fallingItems[index];
    const itemRect = item.element.getBoundingClientRect();

    if (rectanglesTouch(basketRect, itemRect)) {
      if (item.type === "bomb") {
        endGame();
        return;
      }

      score += 1;
      updateScore();
      removeItem(item);
      index -= 1;
    }
  }
}

function rectanglesTouch(rectA, rectB) {
  return (
    rectA.left < rectB.right &&
    rectA.right > rectB.left &&
    rectA.top < rectB.bottom &&
    rectA.bottom > rectB.top
  );
}

function updateScore() {
  scoreDisplay.textContent = score;
}

// ----- Cleanup -----
function removeMissedItems() {
  const bottomOfGame = gameArea.clientHeight + itemSize;

  fallingItems.slice().forEach(function (item) {
    if (item.y > bottomOfGame) {
      removeItem(item);
    }
  });
}

function removeItem(itemToRemove) {
  itemToRemove.element.remove();

  fallingItems = fallingItems.filter(function (item) {
    return item !== itemToRemove;
  });
}

window.addEventListener("resize", function () {
  if (!isPlaying) {
    resetBasket();
    return;
  }

  const maxX = gameArea.clientWidth - basket.offsetWidth;
  basketX = Math.max(0, Math.min(basketX, maxX));
  drawBasket();
});
