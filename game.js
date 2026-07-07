// Snack Catcher
// A small beginner-friendly browser game using only HTML, CSS, and JavaScript.

// ----- Page elements -----
const gameArea = document.getElementById("gameArea");
const basket = document.getElementById("basket");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const snackRatioDisplay = document.getElementById("snackRatio");
const burnedCountDisplay = document.getElementById("burnedCount");
const strawberryScoreDisplay = document.getElementById("score-strawberry");
const candyScoreDisplay = document.getElementById("score-candy");
const donutScoreDisplay = document.getElementById("score-donut");
const appleScoreDisplay = document.getElementById("score-apple");
const finalScoreDisplay = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const winScreen = document.getElementById("winScreen");
const fireHint = document.getElementById("fireHint");
const fireTimerDisplay = document.getElementById("fireTimer");
const cloudLayer = document.getElementById("cloudLayer");
const plantLayer = document.getElementById("plantLayer");
const ambientPropsLayer = document.getElementById("ambientProps");
const debugOverlay = document.getElementById("debugOverlay");
const sunElement = gameArea.querySelector(".sun");
const moonElement = gameArea.querySelector(".moon");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const continueButton = document.getElementById("continueButton");
const exitButton = document.getElementById("exitButton");
const eatSound = createSound("Eat.m4a");
const explodeSound = createSound("Explode.m4a");
const changeSound = createSound("Change.m4a");
const cheerSound = createSound("cheer.m4a");
const bombDropSound = createSound(["Dropbomb.m4a", "Dropbomb拷貝.m4a"]);
const backgroundMusic = createSound("background_music.mp3");

// ----- Game settings -----
const snacks = ["🍓", "🍪", "🍩", "🍎"];
const baseBasketSpeed = 8;
const itemSize = 48;
const baseBombSpeed = 3.6;
const baseBombChance = 0.22;
const snackGoal = 5;
const startingLives = 2;
const lifeEffectLifetime = 3000;
const formFlashDuration = 3000;
const formFlashFrequency = 250;
const floatingEffectSpeed = 3.6;
const fireFormDuration = 15000;
const winScore = 100;
const starterPlayerImage = "eevee.png";
const fallingItemSpawnIntervals = {
  base: 850,
  medium: 600,
  fast: 400
};
const weatherPhaseDuration = 8000;
const cloudFrequencyDuration = 6000;
const cloudOpacityCycle = [0.25, 0.75, 1, 0.5, 0, 0.25];
const dayNightPhases = [
  {
    name: "day",
    duration: 36000,
    skyStart: ["#7f86d9", "#9fc0ff", "#b78cc8", "#bfe6ff", "#d7f4ff"],
    skyMid: ["#4dbfff", "#84dbff", "#c9f0ff", "#eefcff", "#ffffff"],
    skyEnd: ["#ff7b4a", "#ff9f5a", "#ffbb68", "#ff8f6b", "#ff6e5f"],
    starsStart: 0,
    starsMid: 0,
    starsEnd: 0,
    twinkleStart: 0,
    twinkleMid: 0,
    twinkleEnd: 0
  },
  {
    name: "night",
    duration: 36000,
    skyStart: ["#ff7b4a", "#ff9f5a", "#ffbb68", "#ff8f6b", "#ff6e5f"],
    skyMid: ["#01040d", "#040b1d", "#0d1d40", "#142957", "#18335a"],
    skyEnd: ["#5f66c4", "#87a8f2", "#8d7fd0", "#7f99d1", "#6c8dc6"],
    starsStart: 0.18,
    starsMid: 0.98,
    starsEnd: 0.22,
    twinkleStart: 0.08,
    twinkleMid: 1,
    twinkleEnd: 0.12
  }
];
const dayNightCycleDuration = dayNightPhases.reduce(function (totalDuration, phase) {
  return totalDuration + phase.duration;
}, 0);
const cloudFrequencyCycle = ["low", "medium", "high", "intense", "high", "medium"];
const cloudDepthSettings = {
  far: { duration: 30000, topMin: 6, topMax: 20 },
  mid: { duration: 22000, topMin: 10, topMax: 28 },
  near: { duration: 14000, topMin: 14, topMax: 34 }
};
const cloudSpawnIntervals = {
  low: { far: 14000, mid: 18000, near: 22000 },
  medium: { far: 9000, mid: 12000, near: 15000 },
  high: { far: 5500, mid: 7500, near: 9500 },
  intense: { far: 2400, mid: 3200, near: 4200 }
};
const snackRewardImages = {
  "🍓": "char.png",
  "🍪": "leaf.png",
  "🍩": "light.png",
  "🍎": "fire.png"
};
const formSnackByImage = {
  "char.png": "🍓",
  "leaf.png": "🍪",
  "light.png": "🍩",
  "fire.png": "🍎"
};
const snackNames = {
  "🍓": "草莓",
  "🍪": "糖果",
  "🍩": "甜甜圈",
  "🍎": "蘋果"
};
const snackCountDisplays = {
  "🍓": strawberryScoreDisplay,
  "🍪": candyScoreDisplay,
  "🍩": donutScoreDisplay,
  "🍎": appleScoreDisplay
};

// ----- Game state -----
let basketX = 0;
let score = 0;
let lives = startingLives;
let snacksCaught = 0;
let totalSnackFalls = 0;
let burnedCount = 0;
let snackScores = createEmptySnackScores();
let lockedSnack = null;
let currentPlayerImage = starterPlayerImage;
let basketSpeedMultiplier = 1;
let isBombImmune = false;
let isPlaying = false;
let leftPressed = false;
let rightPressed = false;
let fallingItems = [];
let floatingEffects = [];
let carnivorousPlants = [];
let animationId;
let spawnTimer;
let currentSpawnInterval = fallingItemSpawnIntervals.base;
let lastFrameTime = 0;
let activePointerId = null;
let playerFlashUntil = 0;
let fireFormEndsAt = 0;
let repeatedSoundToken = 0;
let dayNightCycleStartedAt = performance.now();
let weatherCycleStartedAt = performance.now();
let nextFrogAt = 0;
let nextBirdFlockAt = 0;
let currentDayPhaseDebug = "";
let currentDayRemainingMs = 0;
let currentCloudOpacityDebug = "";
let currentCloudOpacityRemainingMs = 0;
let currentCloudFrequencyDebug = "";
let currentCloudFrequencyRemainingMs = 0;
let nextCloudSpawnAt = createCloudSpawnState();

// Put the basket in the center when the page loads.
resetBasket();
updateLives();
updateDetailScoreboards();
updatePlayerImage();
updateSnackScoreboard();
setupBackgroundMusic();
resetWorldEnvironment();
updateExitButtonState();

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
continueButton.addEventListener("click", continueFromWin);
exitButton.addEventListener("click", exitGame);

// ----- Main game flow -----
function startGame() {
  stopRepeatedSounds();
  resetGameState();
  isPlaying = true;
  updateExitButtonState();
  playBackgroundMusic();
  setVisibleScreen();
  document.body.classList.add("playing");

  refreshSpawnTimer();

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  isPlaying = false;
  updateExitButtonState();
  stopActiveGameplay();
  finalScoreDisplay.textContent = score;
  activePointerId = null;
  fireHint.classList.add("hidden");
  setVisibleScreen("gameOver");
}

function endGameWithWin() {
  isPlaying = false;
  updateExitButtonState();
  stopActiveGameplay();
  activePointerId = null;
  fireHint.classList.add("hidden");
  resetSnackBarsOnly();
  setVisibleScreen("win");
  playSoundTimes(cheerSound, 2);
}

function exitGame() {
  stopActiveGameplay();
  isPlaying = false;
  updateExitButtonState();
  activePointerId = null;
  resetGameState();
  setVisibleScreen("start");
}

function continueFromWin() {
  stopActiveGameplay();
  resetGameState();
  updateExitButtonState();
  setVisibleScreen("start");
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

  updateWorldEnvironment(currentTime);
  updateAmbientProps(currentTime);
  updateFireTimer(currentTime);
  moveBasket(deltaTime);
  moveFallingItems(deltaTime);
  updateCarnivorousPlants(currentTime);
  checkPlantGrabs(currentTime);
  moveFloatingEffects(deltaTime);
  checkCollisions();
  removeMissedItems();
  updatePlayerFlash(currentTime);

  animationId = requestAnimationFrame(gameLoop);
}

// ----- Basket movement -----
function resetBasket() {
  const gameWidth = gameArea.clientWidth;
  basketX = (gameWidth - basket.offsetWidth) / 2;
  drawBasket();
}

function moveBasket(deltaTime) {
  const currentBasketSpeed = baseBasketSpeed * basketSpeedMultiplier;

  if (leftPressed) {
    basketX -= currentBasketSpeed * deltaTime;
  }

  if (rightPressed) {
    basketX += currentBasketSpeed * deltaTime;
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
  const isBomb = Math.random() < getBombSpawnChance();
  const bombDifficulty = getBombDifficulty();
  const currentItemSize = isBomb ? itemSize * bombDifficulty.sizeMultiplier : itemSize;
  const maxX = gameArea.clientWidth - currentItemSize;
  const x = Math.random() * maxX;
  const startY = -(currentItemSize + 4);
  const snack = isBomb ? null : pickRandomSnack();

  if (snack) {
    totalSnackFalls += 1;
    updateDetailScoreboards();
  }

  element.className = "falling-item";
  element.style.left = x + "px";
  element.style.top = startY + "px";
  element.style.width = currentItemSize + "px";
  element.style.height = currentItemSize + "px";

  if (isBomb) {
    addBombImage(element);
    playSound(bombDropSound);
  } else {
    element.textContent = snack;
  }

  gameArea.appendChild(element);

  fallingItems.push({
    element: element,
    x: x,
    y: startY,
    size: currentItemSize,
    speed: isBomb
      ? baseBombSpeed * bombDifficulty.speedMultiplier * getBombFormSpeedMultiplier()
      : 2.8 + Math.random() * 1.6,
    type: isBomb ? "bomb" : "snack",
    snack: snack
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
    if (item.type === "bomb") {
      applyBombDifficulty(item);
    }

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
        handleBombCollision(item);
        return;
      }

      const gameWon = collectSnack(item, {
        effectPosition: {
          x: item.x + item.size / 2,
          y: item.y
        },
        shouldSpawnLeafPlant: true
      });
      index -= 1;

      if (gameWon) {
        return;
      }
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
  refreshSpawnTimer();
}

function getFallingItemSpawnInterval() {
  if (score >= 80) {
    return fallingItemSpawnIntervals.fast;
  }

  if (score >= 60) {
    return fallingItemSpawnIntervals.medium;
  }

  return fallingItemSpawnIntervals.base;
}

function refreshSpawnTimer() {
  const nextInterval = getFallingItemSpawnInterval();

  if (!isPlaying && spawnTimer) {
    clearInterval(spawnTimer);
    spawnTimer = null;
    currentSpawnInterval = nextInterval;
    return;
  }

  if (!isPlaying) {
    currentSpawnInterval = nextInterval;
    return;
  }

  if (spawnTimer && currentSpawnInterval === nextInterval) {
    return;
  }

  clearInterval(spawnTimer);
  spawnTimer = setInterval(createFallingItem, nextInterval);
  currentSpawnInterval = nextInterval;
}

function updateLives() {
  livesDisplay.textContent = lives;
}

function updateExitButtonState() {
  exitButton.disabled = !isPlaying;
  exitButton.setAttribute("aria-disabled", String(!isPlaying));
}

function updateDetailScoreboards() {
  snackRatioDisplay.textContent = snacksCaught + " / " + totalSnackFalls;
  burnedCountDisplay.textContent = burnedCount;
}

function createEmptySnackScores() {
  return {
    "🍓": 0,
    "🍪": 0,
    "🍩": 0,
    "🍎": 0
  };
}

function getBombDifficulty() {
  if (score >= 90) {
    return {
      sizeMultiplier: 4,
      speedMultiplier: 3
    };
  }

  if (score >= 80) {
    return {
      sizeMultiplier: 3,
      speedMultiplier: 2
    };
  }

  if (score >= 65) {
    return {
      sizeMultiplier: 2.5,
      speedMultiplier: 1.75
    };
  }

  if (score >= 50) {
    return {
      sizeMultiplier: 2,
      speedMultiplier: 1.5
    };
  }

  if (score >= 35) {
    return {
      sizeMultiplier: 1.5,
      speedMultiplier: 1.25
    };
  }

  return {
    sizeMultiplier: 1,
    speedMultiplier: 1
  };
}

function getBombSpawnChance() {
  if (score >= 90) {
    return 0.45;
  }

  if (score >= 75) {
    return 0.35;
  }

  if (score >= 50) {
    return 0.28;
  }

  return baseBombChance;
}

function getBombFormSpeedMultiplier() {
  if (currentPlayerImage === "char.png") {
    return 0.5;
  }

  return 1;
}

function getCurrentBombSpeed() {
  const bombDifficulty = getBombDifficulty();
  return baseBombSpeed * bombDifficulty.speedMultiplier * getBombFormSpeedMultiplier();
}

function applyBombDifficulty(item) {
  const bombDifficulty = getBombDifficulty();
  item.size = itemSize * bombDifficulty.sizeMultiplier;
  item.speed = getCurrentBombSpeed();
  item.element.style.width = item.size + "px";
  item.element.style.height = item.size + "px";
  item.element.classList.toggle("spinning-bomb", score >= 65);
  item.element.style.setProperty("--bomb-spin-duration", getBombSpinDuration());

  const maxX = gameArea.clientWidth - item.size;
  item.x = Math.max(0, Math.min(item.x, maxX));
  item.element.style.left = item.x + "px";
}

function getBombSpinDuration() {
  if (score >= 90) {
    return "0.333s";
  }

  if (score >= 80) {
    return "1s";
  }

  if (score >= 65) {
    return "2s";
  }

  return "2s";
}

function addSnackScore(snack, item) {
  if (!Object.prototype.hasOwnProperty.call(snackScores, snack)) {
    return;
  }

  if (lockedSnack === snack) {
    updateSnackScoreboard();
    return;
  }

  snackScores[snack] += 1;
  if (snackScores[snack] >= snackGoal) {
    snackScores[snack] = snackGoal;
    lockedSnack = snack;
    activateSnackPower(snack);
  }

  updateSnackScoreboard();
}

function collectSnack(item, options) {
  if (!item) {
    return false;
  }

  const collectionOptions = options || {};
  const effectPosition = collectionOptions.effectPosition || {
    x: item.x + item.size / 2,
    y: item.y
  };

  score += 1;
  snacksCaught += 1;
  playSound(eatSound);
  createScoreEffect("+1", "score-pickup", effectPosition);

  if (collectionOptions.shouldSpawnLeafPlant && currentPlayerImage === "leaf.png") {
    addCarnivorousPlant(item);
  }

  addSnackScore(item.snack, item);
  updateScore();
  updateDetailScoreboards();
  removeItem(item);

  if (score >= winScore) {
    endGameWithWin();
    return true;
  }

  return false;
}

function activateSnackPower(snack) {
  if (currentPlayerImage !== snackRewardImages[snack]) {
    playSound(changeSound);
  }

  setPlayerForm(snackRewardImages[snack], currentPlayerImage !== snackRewardImages[snack]);

  if (snack === "🍓") {
    lives += 1;
    updateLives();
    createLifeEffect("+1", "life-gain", getBasketCenterPoint());
    return;
  }
}

function updateSnackScoreboard() {
  snacks.forEach(function (snack) {
    const display = snackCountDisplays[snack];

    if (display) {
      const segments = display.querySelectorAll(".progress-segment");
      display.classList.toggle("charged", lockedSnack === snack);

      segments.forEach(function (segment, index) {
        segment.classList.toggle("filled", index < snackScores[snack]);
      });

      display.setAttribute("aria-label", snackNames[snack] + " " + snackScores[snack] + " / " + snackGoal);
    }
  });
}

function addCarnivorousPlant(item) {
  if (!item || !plantLayer) {
    return;
  }

  const plantElement = document.createElement("div");
  plantElement.className = "carnivorous-plant";

  const stemElement = document.createElement("div");
  stemElement.className = "plant-stem";

  const headElement = document.createElement("div");
  headElement.className = "plant-head";

  const mouthElement = document.createElement("div");
  mouthElement.className = "plant-mouth";

  headElement.appendChild(mouthElement);
  plantElement.appendChild(stemElement);
  plantElement.appendChild(headElement);

  const gameRect = gameArea.getBoundingClientRect();
  const basketRect = basket.getBoundingClientRect();
  const centerX = basketRect.left - gameRect.left + basketRect.width / 2;
  const bottomOffset = gameRect.bottom - basketRect.bottom;
  const plant = {
    element: plantElement,
    headElement: headElement,
    anchorX: centerX,
    bottomOffset: bottomOffset,
    swaySeed: Math.random() * Math.PI * 2,
    targetRotation: 0,
    currentRotation: 0,
    chompUntil: 0
  };

  plantElement.style.left = centerX + "px";
  plantElement.style.bottom = bottomOffset + "px";
  plantLayer.appendChild(plantElement);
  carnivorousPlants.push(plant);
}

function clearCarnivorousPlants() {
  carnivorousPlants.forEach(function (plant) {
    plant.element.remove();
  });
  carnivorousPlants = [];
}

function updateCarnivorousPlants(currentTime) {
  carnivorousPlants.forEach(function (plant) {
    const idleWiggle = Math.sin((currentTime / 350) + plant.swaySeed) * 6;
    const chompActive = currentTime < plant.chompUntil;
    const chompProgress = chompActive ? 1 - ((plant.chompUntil - currentTime) / 260) : 0;
    const lift = chompActive ? Math.sin(Math.max(0, Math.min(1, chompProgress)) * Math.PI) * 10 : 0;

    if (!chompActive) {
      plant.targetRotation = 0;
    }

    plant.currentRotation += (plant.targetRotation - plant.currentRotation) * 0.2;

    plant.element.style.left = plant.anchorX + "px";
    plant.element.style.bottom = (plant.bottomOffset + lift) + "px";
    plant.element.style.transform = "translateX(-50%) rotate(" + plant.currentRotation + "deg) translateY(" + idleWiggle + "px)";
    plant.element.classList.toggle("chomp", chompActive);
    plant.headElement.style.transform = "scaleX(" + (chompActive ? 1.08 : 1) + ") scaleY(" + (chompActive ? 1.04 : 1) + ")";
  });
}

function checkPlantGrabs(currentTime) {
  if (currentPlayerImage !== "leaf.png") {
    return;
  }

  for (let itemIndex = 0; itemIndex < fallingItems.length; itemIndex += 1) {
    const item = fallingItems[itemIndex];

    if (!item || item.type !== "snack" || item.claimedByPlant) {
      continue;
    }

    const snackRect = item.element.getBoundingClientRect();
    let chosenPlant = null;
    let bestDistance = Infinity;

    for (let plantIndex = 0; plantIndex < carnivorousPlants.length; plantIndex += 1) {
      const plant = carnivorousPlants[plantIndex];
      const plantRect = plant.element.getBoundingClientRect();

      if (!rectanglesTouch(snackRect, plantRect)) {
        continue;
      }

      const plantCenterX = plantRect.left + plantRect.width / 2;
      const plantCenterY = plantRect.top + plantRect.height / 2;
      const snackCenterX = snackRect.left + snackRect.width / 2;
      const snackCenterY = snackRect.top + snackRect.height / 2;
      const distance = Math.hypot(snackCenterX - plantCenterX, snackCenterY - plantCenterY);

      if (distance < bestDistance) {
        bestDistance = distance;
        chosenPlant = {
          plant: plant,
          snackCenterX: snackCenterX,
          snackCenterY: snackCenterY
        };
      }
    }

    if (!chosenPlant) {
      continue;
    }

    item.claimedByPlant = true;
    chosenPlant.plant.chompUntil = currentTime + 260;
    chosenPlant.plant.targetRotation = Math.max(-14, Math.min(14, (chosenPlant.snackCenterX - chosenPlant.plant.anchorX) / 6));
    const gameWon = collectSnack(item, {
      effectPosition: {
      x: chosenPlant.snackCenterX,
      y: chosenPlant.snackCenterY
      }
    });
    itemIndex -= 1;

    if (gameWon) {
      return;
    }
  }
}

function createLifeEffect(text, effectType, position) {
  createFloatingEffect(text, effectType, position);
}

function createScoreEffect(text, effectType, position) {
  createFloatingEffect(text, effectType, position);
}

function createFloatingEffect(text, effectType, position) {
  if (!position) {
    return;
  }

  const effectElement = document.createElement("div");
  effectElement.className = "floating-life-effect " + effectType;
  effectElement.textContent = text;
  effectElement.style.left = position.x + "px";
  effectElement.style.top = position.y + "px";
  gameArea.appendChild(effectElement);

  floatingEffects.push({
    element: effectElement,
    x: position.x,
    y: position.y,
    speed: floatingEffectSpeed,
    expiresAt: performance.now() + lifeEffectLifetime
  });
}

function moveFloatingEffects(deltaTime) {
  const now = performance.now();

  floatingEffects.slice().forEach(function (effect) {
    effect.y -= effect.speed * deltaTime;
    effect.element.style.top = effect.y + "px";

    if (effect.y < -40 || now >= effect.expiresAt) {
      removeFloatingEffect(effect);
    }
  });
}

function removeFloatingEffect(effectToRemove) {
  effectToRemove.element.remove();
  floatingEffects = floatingEffects.filter(function (effect) {
    return effect !== effectToRemove;
  });
}

function clearFloatingEffects() {
  floatingEffects.forEach(function (effect) {
    effect.element.remove();
  });
  floatingEffects = [];
}

function resetSnackBarsOnly() {
  snackScores = createEmptySnackScores();
  lockedSnack = null;
  updateSnackScoreboard();
}

function resetGameState() {
  score = 0;
  lives = startingLives;
  snacksCaught = 0;
  totalSnackFalls = 0;
  burnedCount = 0;
  snackScores = createEmptySnackScores();
  lockedSnack = null;
  fireFormEndsAt = 0;
  setPlayerForm(starterPlayerImage, false);
  clearCarnivorousPlants();
  clearFallingItems();
  clearFloatingEffects();
  lastFrameTime = 0;
  playerFlashUntil = 0;
  resetBasket();
  resetWorldEnvironment();
  basket.style.opacity = "1";
  updateScore();
  updateLives();
  updateDetailScoreboards();
  updateSnackScoreboard();
}

function clearFallingItems() {
  fallingItems.forEach(function (item) {
    item.element.remove();
  });
  fallingItems = [];
}

function setPlayerForm(playerImage, shouldFlash) {
  const previousFormSnack = formSnackByImage[currentPlayerImage] || null;

  if (currentPlayerImage === "leaf.png" && playerImage !== "leaf.png") {
    clearCarnivorousPlants();
  }

  if (previousFormSnack && playerImage !== currentPlayerImage) {
    snackScores[previousFormSnack] = 0;
    if (lockedSnack === previousFormSnack) {
      lockedSnack = null;
    }
  }

  currentPlayerImage = playerImage;
  basketSpeedMultiplier = playerImage === "light.png" ? 2 : 1;
  isBombImmune = playerImage === "fire.png";
  fireHint.classList.toggle("hidden", playerImage !== "fire.png");
  fireTimerDisplay.textContent = playerImage === "fire.png" ? "15s" : "";
  fireFormEndsAt = playerImage === "fire.png" ? performance.now() + fireFormDuration : 0;
  fallingItems.forEach(function (item) {
    if (item.type === "bomb") {
      item.speed = getCurrentBombSpeed();
    }
  });
  updatePlayerImage();
  updateSnackScoreboard();

  if (shouldFlash) {
    playerFlashUntil = performance.now() + formFlashDuration;
  } else {
    playerFlashUntil = 0;
    basket.style.opacity = "1";
  }
}

function handleBombCollision(item) {
  if (isBombImmune) {
    playSound(explodeSound);
    destroyBomb(item);
    return;
  }

  playSound(explodeSound);
  lives -= 1;
  updateLives();
  createLifeEffect("-1", "life-loss", getBasketCenterPoint());
  setPlayerForm(starterPlayerImage, currentPlayerImage !== starterPlayerImage);
  removeItem(item);

  if (lives <= 0) {
    endGame();
  }
}

function destroyBomb(item) {
  if (!item) {
    return;
  }

  score += 1;
  burnedCount += 1;
  updateScore();
  updateDetailScoreboards();
  createScoreEffect("+1", "score-bonus", {
    x: item.x + item.size / 2,
    y: item.y
  });

  const explosion = document.createElement("div");
  explosion.className = "bomb-explosion";
  explosion.textContent = "💥";
  explosion.style.left = item.x + "px";
  explosion.style.top = item.y + "px";
  gameArea.appendChild(explosion);

  item.element.classList.add("bomb-destroyed");
  detachItem(item);

  window.setTimeout(function () {
    item.element.remove();
    explosion.remove();
  }, 320);

  if (score >= winScore) {
    endGameWithWin();
  }
}

function updatePlayerFlash(currentTime) {
  if (playerFlashUntil <= currentTime) {
    basket.style.opacity = "1";
    return;
  }

  const flashPhase = Math.floor((playerFlashUntil - currentTime) / formFlashFrequency);
  basket.style.opacity = flashPhase % 2 === 0 ? "1" : "0.35";
}

function updateFireTimer(currentTime) {
  if (currentPlayerImage !== "fire.png") {
    fireTimerDisplay.textContent = "";
    return;
  }

  const remainingMs = fireFormEndsAt - currentTime;

  if (remainingMs <= 0) {
    setPlayerForm(starterPlayerImage, false);
    return;
  }

  fireTimerDisplay.textContent = Math.ceil(remainingMs / 1000) + "s";
}

function updatePlayerImage() {
  let playerImageElement = basket.querySelector("img");

  if (!playerImageElement) {
    playerImageElement = document.createElement("img");
    playerImageElement.alt = "player";
    playerImageElement.addEventListener("error", function () {
      playerImageElement.remove();
      basket.textContent = "🧺";
    });
    basket.textContent = "";
    basket.appendChild(playerImageElement);
  }

  basket.textContent = "";
  basket.appendChild(playerImageElement);
  playerImageElement.src = currentPlayerImage;
}

function resetWorldEnvironment() {
  const now = performance.now();
  dayNightCycleStartedAt = now;
  weatherCycleStartedAt = now;
  applyInterpolatedDayNight(dayNightPhases[0], 0);
  resetCloudSystem(now);
  updateCelestialPositions(dayNightPhases[0].name, 0, dayNightPhases[0].duration);
  resetAmbientProps(now);
}

function updateWorldEnvironment(currentTime) {
  updateDayNightCycle(currentTime);
  updateWeatherCycle(currentTime);
  updateDebugOverlay();
}

function updateDayNightCycle(currentTime) {
  const elapsedInCycle = (currentTime - dayNightCycleStartedAt) % dayNightCycleDuration;
  const phaseState = getDayNightPhaseState(elapsedInCycle);
  const phaseProgress = phaseState.elapsedInPhase / phaseState.phase.duration;

  applyInterpolatedDayNight(phaseState.phase, phaseProgress);
  updateCelestialPositions(phaseState.phase.name, phaseState.elapsedInPhase, phaseState.phase.duration);
  currentDayPhaseDebug = phaseState.phase.name;
  currentDayRemainingMs = phaseState.phase.duration - phaseState.elapsedInPhase;
}

function updateWeatherCycle(currentTime) {
  const opacityCycleDuration = cloudOpacityCycle.length * weatherPhaseDuration;
  const opacityElapsedInCycle = (currentTime - weatherCycleStartedAt) % opacityCycleDuration;
  const opacityIndex = Math.floor(opacityElapsedInCycle / weatherPhaseDuration);
  const opacityElapsedInPhase = opacityElapsedInCycle % weatherPhaseDuration;
  const cloudOpacity = cloudOpacityCycle[opacityIndex];

  gameArea.style.setProperty("--cloud-opacity", String(cloudOpacity));
  currentCloudOpacityDebug = String(cloudOpacity);
  currentCloudOpacityRemainingMs = weatherPhaseDuration - opacityElapsedInPhase;

  const frequencyCycleDuration = cloudFrequencyCycle.length * cloudFrequencyDuration;
  const frequencyElapsedInCycle = (currentTime - weatherCycleStartedAt) % frequencyCycleDuration;
  const frequencyIndex = Math.floor(frequencyElapsedInCycle / cloudFrequencyDuration);
  const frequencyElapsedInPhase = frequencyElapsedInCycle % cloudFrequencyDuration;
  const frequencyKey = cloudFrequencyCycle[frequencyIndex];

  spawnCloudsForFrequency(currentTime, frequencyKey);
  currentCloudFrequencyDebug = frequencyKey;
  currentCloudFrequencyRemainingMs = cloudFrequencyDuration - frequencyElapsedInPhase;
}

function applyInterpolatedDayNight(phase, progress) {
  const phaseCurve = getThreePointPhaseCurve(progress);

  phase.skyStart.forEach(function (color, index) {
    let interpolatedColor;

    if (phaseCurve.segment === "start-mid") {
      interpolatedColor = interpolateColor(color, phase.skyMid[index], phaseCurve.progress);
    } else {
      interpolatedColor = interpolateColor(phase.skyMid[index], phase.skyEnd[index], phaseCurve.progress);
    }

    gameArea.style.setProperty("--sky-" + (index + 1), interpolatedColor);
  });

  const starOpacity = phaseCurve.segment === "start-mid"
    ? interpolateNumber(phase.starsStart, phase.starsMid, phaseCurve.progress)
    : interpolateNumber(phase.starsMid, phase.starsEnd, phaseCurve.progress);
  const twinkleOpacity = phaseCurve.segment === "start-mid"
    ? interpolateNumber(phase.twinkleStart, phase.twinkleMid, phaseCurve.progress)
    : interpolateNumber(phase.twinkleMid, phase.twinkleEnd, phaseCurve.progress);

  gameArea.style.setProperty("--star-opacity", starOpacity.toFixed(3));
  gameArea.style.setProperty("--star-twinkle-opacity", twinkleOpacity.toFixed(3));
}

function getThreePointPhaseCurve(progress) {
  if (progress <= 0.5) {
    return {
      segment: "start-mid",
      progress: clamp(progress / 0.5, 0, 1)
    };
  }

  return {
    segment: "mid-end",
    progress: clamp((progress - 0.5) / 0.5, 0, 1)
  };
}

function updateCelestialPositions(phaseName, elapsedInPhase, phaseDuration) {
  const gameWidth = gameArea.clientWidth;
  const sunSize = getCelestialSize(sunElement, 118);
  const moonSize = getCelestialSize(moonElement, 118);
  let sunX = -sunSize;
  let sunY = sunSize / 2;
  let moonX = -moonSize;
  let moonY = moonSize / 2;
  let sunOpacity = 0;
  let moonOpacity = 0;
  const celestialStartDelay = 12000;
  const celestialTravelDuration = 12000;

  if (phaseName === "day") {
    const progress = clamp((elapsedInPhase - celestialStartDelay) / celestialTravelDuration, 0, 1);
    sunX = -sunSize + progress * (gameWidth + sunSize * 2);
    sunY = sunSize / 2;
    sunOpacity = getCelestialOpacity(
      elapsedInPhase,
      celestialStartDelay,
      celestialTravelDuration,
      1500,
      0.98
    );
  }

  if (phaseName === "night") {
    const progress = clamp((elapsedInPhase - celestialStartDelay) / celestialTravelDuration, 0, 1);
    moonX = -moonSize + progress * (gameWidth + moonSize * 2);
    moonY = moonSize / 2;
    moonOpacity = getCelestialOpacity(
      elapsedInPhase,
      celestialStartDelay,
      celestialTravelDuration,
      1500,
      0.96
    );
  }

  gameArea.style.setProperty("--sun-x", sunX + "px");
  gameArea.style.setProperty("--sun-y", sunY + "px");
  gameArea.style.setProperty("--moon-x", moonX + "px");
  gameArea.style.setProperty("--moon-y", moonY + "px");
  gameArea.style.setProperty("--sun-opacity", String(sunOpacity));
  gameArea.style.setProperty("--moon-opacity", String(moonOpacity));
}

function getCelestialOpacity(elapsedInPhase, startDelay, travelDuration, fadeWindowMs, peakOpacity) {
  if (elapsedInPhase < startDelay || elapsedInPhase > startDelay + travelDuration) {
    return 0;
  }

  const elapsedInTravel = elapsedInPhase - startDelay;
  const timeToEnd = travelDuration - elapsedInTravel;
  const fadeIn = fadeWindowMs > 0 ? clamp(elapsedInTravel / fadeWindowMs, 0, 1) : 1;
  const fadeOut = fadeWindowMs > 0 ? clamp(timeToEnd / fadeWindowMs, 0, 1) : 1;

  return Math.min(fadeIn, fadeOut) * peakOpacity;
}

function getDayNightPhaseState(elapsedInCycle) {
  let accumulatedDuration = 0;

  for (let index = 0; index < dayNightPhases.length; index += 1) {
    const phase = dayNightPhases[index];
    const nextAccumulatedDuration = accumulatedDuration + phase.duration;

    if (elapsedInCycle < nextAccumulatedDuration) {
      return {
        phase: phase,
        phaseIndex: index,
        elapsedInPhase: elapsedInCycle - accumulatedDuration
      };
    }

    accumulatedDuration = nextAccumulatedDuration;
  }

  return {
    phase: dayNightPhases[dayNightPhases.length - 1],
    phaseIndex: dayNightPhases.length - 1,
    elapsedInPhase: dayNightPhases[dayNightPhases.length - 1].duration
  };
}

function updateDebugOverlay() {
  if (!debugOverlay) {
    return;
  }

  const daySeconds = formatDebugSeconds(currentDayRemainingMs);
  const cloudOpacitySeconds = formatDebugSeconds(currentCloudOpacityRemainingMs);
  const cloudFrequencySeconds = formatDebugSeconds(currentCloudFrequencyRemainingMs);
  debugOverlay.textContent =
    "Day: " + formatDebugLabel(currentDayPhaseDebug) + " " + daySeconds + "s"
    + "\nCloud opacity: " + currentCloudOpacityDebug + " " + cloudOpacitySeconds + "s"
    + "\nCloud freq: " + formatDebugLabel(currentCloudFrequencyDebug) + " " + cloudFrequencySeconds + "s";
}

function formatDebugSeconds(milliseconds) {
  return (Math.max(milliseconds, 0) / 1000).toFixed(1);
}

function formatDebugLabel(label) {
  return String(label || "").replace(/-/g, " ");
}

function getCelestialSize(element, fallbackSize) {
  if (!element) {
    return fallbackSize;
  }

  return element.offsetWidth || fallbackSize;
}

function interpolateNumber(startValue, endValue, progress) {
  return startValue + (endValue - startValue) * progress;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function interpolateColor(startHex, endHex, progress) {
  const startRgb = hexToRgb(startHex);
  const endRgb = hexToRgb(endHex);
  const red = Math.round(interpolateNumber(startRgb.r, endRgb.r, progress));
  const green = Math.round(interpolateNumber(startRgb.g, endRgb.g, progress));
  const blue = Math.round(interpolateNumber(startRgb.b, endRgb.b, progress));

  return "rgb(" + red + ", " + green + ", " + blue + ")";
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map(function (digit) {
        return digit + digit;
      }).join("")
    : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  };
}

function createCloudSpawnState() {
  return {
    far: 0,
    mid: 0,
    near: 0
  };
}

function resetCloudSystem(currentTime) {
  clearClouds();
  nextCloudSpawnAt = createCloudSpawnState();
  nextCloudSpawnAt.far = currentTime + randomBetween(1000, 2600);
  nextCloudSpawnAt.mid = currentTime + randomBetween(2200, 4200);
  nextCloudSpawnAt.near = currentTime + randomBetween(4200, 6400);
  gameArea.style.setProperty("--cloud-opacity", String(cloudOpacityCycle[0]));
  currentCloudOpacityDebug = String(cloudOpacityCycle[0]);
  currentCloudOpacityRemainingMs = weatherPhaseDuration;
  currentCloudFrequencyDebug = cloudFrequencyCycle[0];
  currentCloudFrequencyRemainingMs = cloudFrequencyDuration;
}

function spawnCloudsForFrequency(currentTime, frequencyKey) {
  const intervals = cloudSpawnIntervals[frequencyKey];

  Object.keys(intervals).forEach(function (depth) {
    while (currentTime >= nextCloudSpawnAt[depth]) {
      spawnCloud(depth);
      nextCloudSpawnAt[depth] += intervals[depth];
    }
  });
}

function spawnCloud(depth) {
  if (!cloudLayer || !cloudDepthSettings[depth]) {
    return;
  }

  const cloud = document.createElement("div");
  const depthSettings = cloudDepthSettings[depth];
  const travelDistance = gameArea.clientWidth + 460;

  cloud.className = "cloud depth-" + depth + " cloud-dynamic";
  cloud.style.top = randomBetween(depthSettings.topMin, depthSettings.topMax) + "%";
  cloud.style.left = "-220px";
  cloud.style.setProperty("--cloud-duration", depthSettings.duration / 1000 + "s");
  cloud.style.setProperty("--cloud-travel", travelDistance + "px");
  cloud.addEventListener("animationend", function () {
    cloud.remove();
  });
  cloudLayer.appendChild(cloud);
}

function clearClouds() {
  if (cloudLayer) {
    cloudLayer.textContent = "";
  }
}

function resetAmbientProps(currentTime) {
  clearAmbientProps();
  nextFrogAt = currentTime + randomBetween(2600, 6200);
  nextBirdFlockAt = currentTime + randomBetween(3600, 7600);
}

function updateAmbientProps(currentTime) {
  if (currentTime >= nextFrogAt) {
    spawnAmbientFrog();
    nextFrogAt = currentTime + randomBetween(9500, 17500);
  }

  if (currentTime >= nextBirdFlockAt) {
    spawnBirdFlock();
    nextBirdFlockAt = currentTime + randomBetween(11000, 21000);
  }
}

function spawnAmbientFrog() {
  if (!ambientPropsLayer) {
    return;
  }

  const frog = document.createElement("div");
  const startsFromLeft = Math.random() < 0.5;
  frog.className = "ambient-prop ambient-frog";
  frog.textContent = "🐸";
  frog.style.bottom = randomBetween(4, 10) + "%";
  frog.style.setProperty("--ambient-duration", randomBetween(7.8, 10.5) + "s");
  frog.style.setProperty(
    "--prop-travel",
    (startsFromLeft ? "" : "-") + (gameArea.clientWidth + 180) + "px"
  );
  frog.style.setProperty("--frog-scale-x", startsFromLeft ? "1" : "-1");
  frog.style.left = startsFromLeft ? "-70px" : "auto";
  frog.style.right = startsFromLeft ? "auto" : "-70px";
  frog.addEventListener("animationend", function () {
    frog.remove();
  });
  ambientPropsLayer.appendChild(frog);
}

function spawnBirdFlock() {
  if (!ambientPropsLayer) {
    return;
  }

  const flock = document.createElement("div");
  const birdCount = Math.max(1, Math.floor(randomBetween(1, 11)));
  const flockColor = pickRandomBirdColor();

  flock.className = "ambient-prop ambient-birds";
  flock.style.top = randomBetween(9, 24) + "%";
  flock.style.setProperty("--ambient-duration", randomBetween(9.5, 13.5) + "s");
  flock.style.setProperty("--prop-travel", "-" + (gameArea.clientWidth + 280) + "px");
  flock.style.color = flockColor;

  for (let index = 0; index < birdCount; index += 1) {
    const bird = document.createElement("span");
    bird.className = "ambient-bird";
    bird.textContent = "🐦";
    bird.style.setProperty("--bird-wave-duration", randomBetween(1.4, 2.6) + "s");
    bird.style.setProperty("--bird-wave-offset", randomBetween(-0.8, 0.8) + "s");
    bird.style.setProperty("--bird-wave-height", randomBetween(4, 12) + "px");
    bird.style.setProperty("--bird-scale", randomBetween(0.78, 1.18).toFixed(2));
    bird.style.marginTop = randomBetween(-8, 8) + "px";
    flock.appendChild(bird);
  }

  flock.addEventListener("animationend", function () {
    flock.remove();
  });
  ambientPropsLayer.appendChild(flock);
}

function pickRandomBirdColor() {
  const birdColors = ["#ffffff", "#ffe082", "#ffccbc", "#c5e1a5", "#b3e5fc", "#d1c4e9"];
  const randomIndex = Math.floor(Math.random() * birdColors.length);
  return birdColors[randomIndex];
}

function clearAmbientProps() {
  if (ambientPropsLayer) {
    ambientPropsLayer.textContent = "";
  }
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// ----- Cleanup -----
function removeMissedItems() {
  const bottomOfGame = gameArea.clientHeight;

  fallingItems.slice().forEach(function (item) {
    if (item.y > bottomOfGame + item.size) {
      removeItem(item);
    }
  });
}

function removeItem(itemToRemove) {
  itemToRemove.element.remove();
  detachItem(itemToRemove);
}

function detachItem(itemToRemove) {
  fallingItems = fallingItems.filter(function (item) {
    return item !== itemToRemove;
  });
}

function getBasketCenterPoint() {
  return {
    x: basketX + basket.offsetWidth / 2 - 18,
    y: gameArea.clientHeight - basket.offsetHeight - 8
  };
}

function createSound(source) {
  const sources = Array.isArray(source) ? source : [source];
  const sound = new Audio(sources[0]);
  sound.preload = "auto";
  if (sources.length > 1) {
    let sourceIndex = 0;
    sound.addEventListener("error", function tryNextSource() {
      sourceIndex += 1;
      const nextSource = sources[sourceIndex];

      if (!nextSource) {
        return;
      }

      sound.removeEventListener("error", tryNextSource);
      sound.src = nextSource;
      sound.load();
    });
  }
  return sound;
}

function setupBackgroundMusic() {
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.34;
}

function playSound(sound) {
  if (!sound) {
    return;
  }

  sound.currentTime = 0;
  sound.play().catch(function () {
    // Ignore autoplay or transient playback failures.
  });
}

function playBackgroundMusic() {
  if (!backgroundMusic.paused) {
    return;
  }

  backgroundMusic.play().catch(function () {
    // Ignore transient playback failures.
  });
}

function stopBackgroundMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}

function playSoundTimes(sound, times) {
  if (!sound || times <= 0) {
    return;
  }

  const token = ++repeatedSoundToken;
  let remainingPlays = times;

  function playNext() {
    if (token !== repeatedSoundToken) {
      return;
    }

    sound.currentTime = 0;
    sound.play().catch(function () {
      // Ignore autoplay or transient playback failures.
    });
    remainingPlays -= 1;

    if (remainingPlays > 0) {
      sound.addEventListener("ended", playNext, { once: true });
    }
  }

  playNext();
}

function stopRepeatedSounds() {
  repeatedSoundToken += 1;
  cheerSound.pause();
  cheerSound.currentTime = 0;
}

function stopActiveGameplay() {
  stopBackgroundMusic();
  stopRepeatedSounds();
  clearInterval(spawnTimer);
  cancelAnimationFrame(animationId);
  document.body.classList.remove("playing");
}

function setVisibleScreen(screenName) {
  startScreen.classList.toggle("hidden", screenName !== "start");
  gameOverScreen.classList.toggle("hidden", screenName !== "gameOver");
  winScreen.classList.toggle("hidden", screenName !== "win");
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
