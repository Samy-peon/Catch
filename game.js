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
const ambientPropsLayer = document.getElementById("ambientProps");
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
const dayNightPhaseDuration = 12000;
const weatherPhaseDuration = 8000;
const dayNightPhases = [
  { name: "morning" },
  { name: "noon" },
  { name: "sunset" },
  { name: "evening" },
  { name: "midnight" },
  { name: "dawn" }
];
const weatherPhases = [
  { name: "clear" },
  { name: "cloud" },
  { name: "more-cloud" },
  { name: "dark-cloud" },
  { name: "light-cloud" },
  { name: "windy" }
];
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
let animationId;
let spawnTimer;
let lastFrameTime = 0;
let activePointerId = null;
let playerFlashUntil = 0;
let fireFormEndsAt = 0;
let repeatedSoundToken = 0;
let dayNightCycleStartedAt = performance.now();
let weatherCycleStartedAt = performance.now();
let activeDayNightPhaseKey = "";
let activeWeatherPhaseKey = "";
let nextFrogAt = 0;
let nextBirdFlockAt = 0;

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
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  winScreen.classList.add("hidden");
  document.body.classList.add("playing");

  clearInterval(spawnTimer);
  spawnTimer = setInterval(createFallingItem, 850);

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  isPlaying = false;
  updateExitButtonState();
  stopBackgroundMusic();
  stopRepeatedSounds();
  clearInterval(spawnTimer);
  cancelAnimationFrame(animationId);
  finalScoreDisplay.textContent = score;
  document.body.classList.remove("playing");
  activePointerId = null;
  fireHint.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
}

function endGameWithWin() {
  isPlaying = false;
  updateExitButtonState();
  stopBackgroundMusic();
  stopRepeatedSounds();
  clearInterval(spawnTimer);
  cancelAnimationFrame(animationId);
  document.body.classList.remove("playing");
  activePointerId = null;
  fireHint.classList.add("hidden");
  resetSnackBarsOnly();
  winScreen.classList.remove("hidden");
  playSoundTimes(cheerSound, 3);
}

function exitGame() {
  stopBackgroundMusic();
  stopRepeatedSounds();
  clearInterval(spawnTimer);
  cancelAnimationFrame(animationId);
  isPlaying = false;
  updateExitButtonState();
  document.body.classList.remove("playing");
  activePointerId = null;
  resetGameState();
  startScreen.classList.remove("hidden");
  gameOverScreen.classList.add("hidden");
  winScreen.classList.add("hidden");
}

function continueFromWin() {
  stopBackgroundMusic();
  stopRepeatedSounds();
  resetGameState();
  updateExitButtonState();
  startScreen.classList.remove("hidden");
  gameOverScreen.classList.add("hidden");
  winScreen.classList.add("hidden");
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
    speed: isBomb ? baseBombSpeed * bombDifficulty.speedMultiplier : 2.8 + Math.random() * 1.6,
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

      score += 1;
      snacksCaught += 1;
      playSound(eatSound);
      createScoreEffect("+1", "score-pickup", {
        x: item.x + item.size / 2,
        y: item.y
      });
      if (currentPlayerImage === "leaf.png") {
        addFlowerMarker(item);
      }

      addSnackScore(item.snack, item);
      updateScore();
      updateDetailScoreboards();
      removeItem(item);
      index -= 1;

      if (score >= winScore) {
        endGameWithWin();
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
      sizeMultiplier: 2.5,
      speedMultiplier: 2
    };
  }

  if (score >= 70) {
    return {
      sizeMultiplier: 2,
      speedMultiplier: 1.5
    };
  }

  if (score >= 50) {
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
  if (score >= 95) {
    return 1 / 2;
  }

  if (score >= 85) {
    return 1 / 3;
  }

  if (score >= 75) {
    return 1 / 4;
  }

  return baseBombChance;
}

function applyBombDifficulty(item) {
  const bombDifficulty = getBombDifficulty();
  item.size = itemSize * bombDifficulty.sizeMultiplier;
  item.speed = baseBombSpeed * bombDifficulty.speedMultiplier;
  item.element.style.width = item.size + "px";
  item.element.style.height = item.size + "px";
  item.element.classList.toggle("spinning-bomb", score >= 80);
  item.element.style.setProperty("--bomb-spin-duration", score >= 95 ? "1s" : "2s");

  const maxX = gameArea.clientWidth - item.size;
  item.x = Math.max(0, Math.min(item.x, maxX));
  item.element.style.left = item.x + "px";
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

function addFlowerMarker(item) {
  if (!item) {
    return;
  }

  const flowerMarker = document.createElement("div");
  flowerMarker.className = "flower-marker";
  flowerMarker.textContent = "🌼";
  flowerMarker.style.left = item.x + "px";
  flowerMarker.style.top = item.y + "px";
  gameArea.appendChild(flowerMarker);
}

function clearFlowerMarkers() {
  gameArea.querySelectorAll(".flower-marker").forEach(function (flowerMarker) {
    flowerMarker.remove();
  });
}

function createLifeEffect(text, effectType, position) {
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

function createScoreEffect(text, effectType, position) {
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
    clearFlowerMarkers();
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

  score += 3;
  burnedCount += 1;
  updateScore();
  updateDetailScoreboards();
  createScoreEffect("+3", "score-bonus", {
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
  activeDayNightPhaseKey = "";
  activeWeatherPhaseKey = "";
  applyDayNightPhase(dayNightPhases[0]);
  applyWeatherPhase(weatherPhases[0]);
  updateCelestialPositions(dayNightPhases[0].name, 0);
  resetAmbientProps(now);
}

function updateWorldEnvironment(currentTime) {
  updateDayNightCycle(currentTime);
  updateWeatherCycle(currentTime);
}

function updateDayNightCycle(currentTime) {
  const cycleDuration = dayNightPhases.length * dayNightPhaseDuration;
  const elapsedInCycle = (currentTime - dayNightCycleStartedAt) % cycleDuration;
  const phaseIndex = Math.floor(elapsedInCycle / dayNightPhaseDuration);
  const elapsedInPhase = elapsedInCycle % dayNightPhaseDuration;
  const phase = dayNightPhases[phaseIndex];

  applyDayNightPhase(phase);
  updateCelestialPositions(phase.name, elapsedInPhase);
}

function updateWeatherCycle(currentTime) {
  const cycleDuration = weatherPhases.length * weatherPhaseDuration;
  const elapsedInCycle = (currentTime - weatherCycleStartedAt) % cycleDuration;
  const phaseIndex = Math.floor(elapsedInCycle / weatherPhaseDuration);

  applyWeatherPhase(weatherPhases[phaseIndex]);
}

function applyDayNightPhase(phase) {
  const phaseKey = phase.name;

  if (phaseKey === activeDayNightPhaseKey) {
    return;
  }

  gameArea.classList.remove(
    "day-morning",
    "day-noon",
    "day-sunset",
    "day-evening",
    "day-midnight",
    "day-dawn"
  );
  gameArea.classList.add("day-" + phase.name);

  activeDayNightPhaseKey = phaseKey;
}

function applyWeatherPhase(phase) {
  const phaseKey = phase.name;

  if (phaseKey === activeWeatherPhaseKey) {
    return;
  }

  gameArea.classList.remove(
    "weather-clear",
    "weather-cloud",
    "weather-more-cloud",
    "weather-dark-cloud",
    "weather-light-cloud",
    "weather-windy"
  );
  gameArea.classList.add("weather-" + phase.name);

  activeWeatherPhaseKey = phaseKey;
}

function updateCelestialPositions(phaseName, elapsedInPhase) {
  let sunX = -12;
  let sunY = 10;
  let moonX = -12;
  let moonY = 10;
  let sunOpacity = 0;
  let moonOpacity = 0;

  if (phaseName === "noon") {
    const progress = elapsedInPhase / dayNightPhaseDuration;
    sunX = -12 + progress * 124;
    sunY = 10;
    sunOpacity = 0.98;
  }

  if (phaseName === "midnight") {
    const progress = elapsedInPhase / dayNightPhaseDuration;
    moonX = -12 + progress * 124;
    moonY = 10;
    moonOpacity = 0.96;
  }

  gameArea.style.setProperty("--sun-x", sunX + "%");
  gameArea.style.setProperty("--sun-y", sunY + "%");
  gameArea.style.setProperty("--moon-x", moonX + "%");
  gameArea.style.setProperty("--moon-y", moonY + "%");
  gameArea.style.setProperty("--sun-opacity", String(sunOpacity));
  gameArea.style.setProperty("--moon-opacity", String(moonOpacity));
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
  frog.className = "ambient-prop ambient-frog";
  frog.textContent = "🐸";
  frog.style.bottom = randomBetween(4, 10) + "%";
  frog.style.setProperty("--ambient-duration", randomBetween(6.4, 9.2) + "s");
  frog.style.setProperty("--prop-travel", "-" + (gameArea.clientWidth + 180) + "px");
  frog.addEventListener("animationend", function () {
    frog.remove();
  });
  ambientPropsLayer.appendChild(frog);
}

function spawnBirdFlock() {
  if (!ambientPropsLayer) {
    return;
  }

  const birds = document.createElement("div");
  birds.className = "ambient-prop ambient-birds";
  birds.textContent = "🐦  🐦  🐦";
  birds.style.top = randomBetween(9, 24) + "%";
  birds.style.setProperty("--ambient-duration", randomBetween(8.5, 12.5) + "s");
  birds.style.setProperty("--prop-travel", gameArea.clientWidth + 260 + "px");
  birds.addEventListener("animationend", function () {
    birds.remove();
  });
  ambientPropsLayer.appendChild(birds);
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

window.addEventListener("resize", function () {
  if (!isPlaying) {
    resetBasket();
    return;
  }

  const maxX = gameArea.clientWidth - basket.offsetWidth;
  basketX = Math.max(0, Math.min(basketX, maxX));
  drawBasket();
});
