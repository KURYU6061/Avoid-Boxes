// Avoid Boxes Game - Final Version with All Features

// ============================================
// LANGUAGES
// ============================================
const languages = {
  ko: {
    time: "시간",
    bombUI: "폭탄",
    gameOverTitle: "게임 오버!",
    survivalTime: "생존 시간",
    boxesAvoided: "피한 박스",
    timeUnit: "초",
    bombUnit: "개",
    boxUnit: "개",
    startSubtitle: "떨어지는 박스를 피해서 살아남으세요!",
    themeLabel: "테마:",
    themeLight: "기본",
    themeDark: "다크모드",
    languageLabel: "언어 선택:",
    startBtn: "게임 시작",
    instructionsTitle: "조작법",
    instructionsText: "← → 키로 이동 | Space로 폭탄 사용 | 노란색 공은 무적!",
    restartBtn: "다시 시작",
    homeBtn: "처음 화면으로"
  },
  en: {
    time: "Time",
    bombUI: "Bombs",
    gameOverTitle: "Game Over!",
    survivalTime: "Survival Time",
    boxesAvoided: "Boxes Avoided",
    timeUnit: "sec",
    bombUnit: "",
    boxUnit: "",
    startSubtitle: "Avoid the falling boxes and survive!",
    themeLabel: "Theme:",
    themeLight: "Light",
    themeDark: "Dark Mode",
    languageLabel: "Language:",
    startBtn: "Start Game",
    instructionsTitle: "Controls",
    instructionsText: "← → to move | Space to use bomb | Yellow ball is invincible!",
    restartBtn: "Restart",
    homeBtn: "Go Home"
  }
};

let currentLanguage = "ko";
let currentTheme = "light";

// ============================================
// CANVAS SETUP
// ============================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ============================================
// BOX COLORS (Random)
// ============================================
const BOX_COLORS = [
  "#FF8C00",  // 오렌지
  "#FF4444",  // 빨강
  "#1F4788",  // 진한 파랑
  "#9B59B6",  // 보라
  "#888888",  // 회색
  "#20B2AA"   // 청록
];

// ============================================
// LANE SETUP (5 vertical lines)
// ============================================
const LANE_COUNT = 5;
const LANE_WIDTH = canvas.width / LANE_COUNT;

// ============================================
// PLAYER
// ============================================
let player = {
  lane: 2,
  width: LANE_WIDTH * 0.8,
  height: 20,
  invincible: false,
  invincibleTime: 0
};

function getPlayerX() {
  return player.lane * LANE_WIDTH + (LANE_WIDTH - player.width) / 2;
}

function getPlayerY() {
  return canvas.height - 50;
}

// ============================================
// GAME STATE
// ============================================
let gameState = {
  isRunning: false,
  gameOver: false,
  startTime: 0,
  elapsedTime: 0,
  frameCount: 0,
  boxesAvoided: 0,
  bombs: 3,
  isBombExploding: false,
  bombExplosionMaxRadius: 250,
  bombExplosionDuration: 0.5,
  bombExplosionStartTime: 0
};

// ============================================
// ARRAYS & CONSTANTS
// ============================================
let obstacles = [];
let items = [];
let lastStarItemTime = 0;

const ITEM_TYPE = {
  STAR: "star",
  BOMB: "bomb"
};

// ============================================
// KEYBOARD INPUT
// ============================================
document.addEventListener("keydown", function(e) {
  if (!gameState.isRunning || gameState.gameOver) return;

  if (e.key === "ArrowLeft") {
    player.lane = Math.max(0, player.lane - 1);
  }
  if (e.key === "ArrowRight") {
    player.lane = Math.min(LANE_COUNT - 1, player.lane + 1);
  }

  if (e.key === " ") {
    e.preventDefault();
    useBomb();
  }
});

// ============================================
// BOMB USAGE
// ============================================
function useBomb() {
  if (gameState.bombs <= 0 || gameState.isBombExploding) return;

  gameState.bombs--;
  gameState.isBombExploding = true;
  gameState.bombExplosionStartTime = Date.now();

  // 모든 박스 제거 (범위 상관없이 전체 삭제)
  setTimeout(() => {
    obstacles = [];
  }, gameState.bombExplosionDuration * 1000);

  updateBombUI();
}

// ============================================
// UI UPDATE
// ============================================
function updateTimeUI() {
  const timeDisplay = document.getElementById("timeDisplay");
  if (timeDisplay) {
    timeDisplay.textContent = `${languages[currentLanguage].time}: ${gameState.elapsedTime.toFixed(1)}${languages[currentLanguage].timeUnit}`;
  }
}

function updateBombUI() {
  const bombCount = document.getElementById("bombCount");
  if (bombCount) {
    bombCount.textContent = `${languages[currentLanguage].bombUI}: ${gameState.bombs}${languages[currentLanguage].bombUnit}`;
  }
}

function updateStartScreenUI() {
  document.getElementById("startSubtitle").textContent = languages[currentLanguage].startSubtitle;
  document.getElementById("themeLabel").textContent = languages[currentLanguage].themeLabel;
  document.getElementById("themeLight").textContent = languages[currentLanguage].themeLight;
  document.getElementById("themeDark").textContent = languages[currentLanguage].themeDark;
  document.getElementById("languageLabel").textContent = languages[currentLanguage].languageLabel;
  document.getElementById("startBtn").textContent = languages[currentLanguage].startBtn;
  document.getElementById("instructionsTitle").textContent = languages[currentLanguage].instructionsTitle;
  document.getElementById("instructionsText").textContent = languages[currentLanguage].instructionsText;
}

function disableStartScreen() {
  const startScreen = document.getElementById("startScreen");
  startScreen.style.pointerEvents = "none";
  startScreen.style.opacity = "0.5";
}

function enableStartScreen() {
  const startScreen = document.getElementById("startScreen");
  startScreen.style.pointerEvents = "auto";
  startScreen.style.opacity = "1";
}

// ============================================
// DRAWING FUNCTIONS
// ============================================
function drawPlayer() {
  const x = getPlayerX();
  const y = getPlayerY();

  if (player.invincible) {
    if (Math.floor(gameState.elapsedTime * 10) % 2 === 0) {
      ctx.fillStyle = "#FFD700";
      ctx.globalAlpha = 0.7;
    } else {
      ctx.fillStyle = "#FF0000";
      ctx.globalAlpha = 0.7;
    }
  } else {
    // 다크모드 대응
    ctx.fillStyle = currentTheme === "dark" ? "#FFFFFF" : "black";
    ctx.globalAlpha = 1;
  }

  ctx.fillRect(x, y, player.width, player.height);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= LANE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * LANE_WIDTH, 0);
    ctx.lineTo(i * LANE_WIDTH, canvas.height);
    ctx.stroke();
  }
}

function drawObstacles() {
  obstacles.forEach(ob => {
    ctx.fillStyle = ob.color || "red";  // 랜덤 색상 사용
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
    ob.y += ob.speed;
  });

  obstacles = obstacles.filter(ob => {
    if (ob.y > canvas.height) {
      gameState.boxesAvoided++;
      return false;
    }
    return true;
  });
}

function drawItems() {
  items.forEach(item => {
    if (item.type === ITEM_TYPE.STAR) {
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFA500";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (item.type === ITEM_TYPE.BOMB) {
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    item.y += item.speed;
  });

  items = items.filter(item => item.y < canvas.height);
}

function drawBombExplosion() {
  if (!gameState.isBombExploding) return;

  const elapsedExplosion = (Date.now() - gameState.bombExplosionStartTime) / 1000;

  if (elapsedExplosion < gameState.bombExplosionDuration) {
    const explosionRadius = (elapsedExplosion / gameState.bombExplosionDuration) * gameState.bombExplosionMaxRadius;

    ctx.strokeStyle = `rgba(255, 0, 0, ${1 - (elapsedExplosion / gameState.bombExplosionDuration)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, explosionRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 100, 100, ${0.5 * (1 - (elapsedExplosion / gameState.bombExplosionDuration))})`;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, Math.PI * 2);
    ctx.fill();
  } else {
    gameState.isBombExploding = false;
  }
}

// ============================================
// GENERATION FUNCTIONS
// ============================================
function generateObstacle() {
  const lane = Math.floor(Math.random() * LANE_COUNT);
  const x = lane * LANE_WIDTH + (LANE_WIDTH - 40) / 2;

  const baseSpeed = 2;
  const speedMultiplier = 1 + (gameState.elapsedTime * 0.05);
  const speed = baseSpeed * speedMultiplier;

  // 랜덤 색상 선택
  const randomColor = BOX_COLORS[Math.floor(Math.random() * BOX_COLORS.length)];

  obstacles.push({
    x: x,
    y: 0,
    width: 40,
    height: 20,
    speed: speed,
    color: randomColor
  });
}

function generateItem(type) {
  const lane = Math.floor(Math.random() * LANE_COUNT);
  const x = lane * LANE_WIDTH + (LANE_WIDTH - 30) / 2;

  items.push({
    x: x,
    y: 0,
    width: 30,
    height: 30,
    speed: 2,
    type: type
  });
}

function checkAndGenerateStar() {
  if (gameState.elapsedTime - lastStarItemTime >= 60) {
    generateItem(ITEM_TYPE.STAR);
    lastStarItemTime = gameState.elapsedTime;
  }
}

// ============================================
// COLLISION & ITEM COLLECTION
// ============================================
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

function checkItemCollection() {
  const playerRect = {
    x: getPlayerX(),
    y: getPlayerY(),
    width: player.width,
    height: player.height
  };

  items = items.filter(item => {
    if (checkCollision(playerRect, item)) {
      if (item.type === ITEM_TYPE.STAR) {
        player.invincible = true;
        player.invincibleTime = 6;
      } else if (item.type === ITEM_TYPE.BOMB) {
        gameState.bombs = Math.min(gameState.bombs + 1, 5);
        updateBombUI();
      }
      return false;
    }
    return true;
  });
}

function updateInvincibility() {
  if (player.invincible) {
    player.invincibleTime -= 1 / 60;

    if (player.invincibleTime <= 0) {
      player.invincible = false;
      player.invincibleTime = 0;
    }
  }
}

// ============================================
// GAME OVER
// ============================================
function endGame() {
  gameState.gameOver = true;
  gameState.isRunning = false;

  const modal = document.getElementById("gameOverModal");
  const survivalTime = document.getElementById("survivalTime");
  const boxesAvoided = document.getElementById("boxesAvoided");
  const gameOverTitle = document.getElementById("gameOverTitle");

  gameOverTitle.textContent = languages[currentLanguage].gameOverTitle;
  survivalTime.textContent = `${languages[currentLanguage].survivalTime}: ${gameState.elapsedTime.toFixed(1)}초`;
  boxesAvoided.textContent = `${languages[currentLanguage].boxesAvoided}: ${gameState.boxesAvoided}개`;

  modal.classList.add("active");
}

// ============================================
// MAIN LOOP
// ============================================
function update() {
  if (!gameState.isRunning || gameState.gameOver) return;

  gameState.elapsedTime = (Date.now() - gameState.startTime) / 1000;
  gameState.frameCount++;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();
  drawObstacles();
  drawItems();
  drawBombExplosion();

  updateInvincibility();
  checkItemCollection();
  checkAndGenerateStar();
  updateTimeUI();

  if (!player.invincible) {
    const playerRect = {
      x: getPlayerX(),
      y: getPlayerY(),
      width: player.width,
      height: player.height
    };

    for (let ob of obstacles) {
      if (checkCollision(playerRect, ob)) {
        endGame();
        return;
      }
    }
  }

  // 박스 생성 주기: 속도 증가와 동일하게 부드럽게 진행
  // 공식: baseInterval * (1 - elapsedTime * 0.02) = 30 - (30 * elapsedTime * 0.02) = 30 - elapsedTime * 0.6
  // 0초: 30프레임, 10초: 24프레임, 30초: 12프레임, 60초: -6 → 최소 5프레임
  const generationInterval = Math.max(5, 30 - (gameState.elapsedTime * 0.6));
  
  if (gameState.frameCount > 30 && gameState.frameCount % Math.round(generationInterval) === 0) {
    generateObstacle();
  }

  if (gameState.frameCount > 60 && gameState.frameCount % Math.floor(Math.random() * 60 + 900) === 0) {
    if (Math.random() > 0.5) {
      generateItem(ITEM_TYPE.BOMB);
    }
  }

  requestAnimationFrame(update);
}

// ============================================
// START GAME
// ============================================
function startGame() {
  gameState.isRunning = true;
  gameState.gameOver = false;
  gameState.startTime = Date.now();
  gameState.elapsedTime = 0;
  gameState.frameCount = 0;
  gameState.boxesAvoided = 0;
  gameState.bombs = 3;
  gameState.isBombExploding = false;

  player.lane = 2;
  player.invincible = false;
  player.invincibleTime = 0;

  obstacles = [];
  items = [];
  lastStarItemTime = 0;

  document.getElementById("startScreen").classList.remove("active");
  document.getElementById("gameScreen").classList.add("active");
  document.getElementById("gameOverModal").classList.remove("active");

  disableStartScreen();
  updateBombUI();
  update();
}

// ============================================
// INITIALIZE
// ============================================
function initGame() {
  document.getElementById("startBtn").addEventListener("click", () => {
    currentLanguage = document.getElementById("languageSelect").value;
    currentTheme = document.getElementById("themeSelect").value;
    applyTheme(currentTheme);
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", () => {
    currentLanguage = document.getElementById("languageSelect").value;
    currentTheme = document.getElementById("themeSelect").value;
    applyTheme(currentTheme);
    startGame();
  });

  document.getElementById("homeBtn").addEventListener("click", () => {
    goHome();
  });

  document.getElementById("languageSelect").addEventListener("change", (e) => {
    currentLanguage = e.target.value;
    updateStartScreenUI();
    updateTimeUI();
    updateBombUI();
    updateGameOverUI();
  });

  document.getElementById("themeSelect").addEventListener("change", (e) => {
    currentTheme = e.target.value;
    applyTheme(currentTheme);
  });

  updateStartScreenUI();
  updateBombUI();
}

// ============================================
// THEME MANAGEMENT
// ============================================
function applyTheme(theme) {
  const body = document.body;
  if (theme === "dark") {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }
}

function goHome() {
  gameState.isRunning = false;
  gameState.gameOver = false;
  
  document.getElementById("startScreen").classList.add("active");
  document.getElementById("gameScreen").classList.remove("active");
  document.getElementById("gameOverModal").classList.remove("active");
  
  enableStartScreen();
}

// ============================================
// UPDATE GAME OVER UI
// ============================================
function updateGameOverUI() {
  const modal = document.getElementById("gameOverModal");
  const gameOverTitle = document.getElementById("gameOverTitle");
  const survivalTime = document.getElementById("survivalTime");
  const boxesAvoided = document.getElementById("boxesAvoided");
  const restartBtn = document.getElementById("restartBtn");
  const homeBtn = document.getElementById("homeBtn");

  gameOverTitle.textContent = languages[currentLanguage].gameOverTitle;
  survivalTime.textContent = `${languages[currentLanguage].survivalTime}: ${gameState.elapsedTime.toFixed(1)}${languages[currentLanguage].timeUnit}`;
  boxesAvoided.textContent = `${languages[currentLanguage].boxesAvoided}: ${gameState.boxesAvoided}${languages[currentLanguage].boxUnit}`;
  restartBtn.textContent = languages[currentLanguage].restartBtn;
  homeBtn.textContent = languages[currentLanguage].homeBtn;
}

// Start the game
initGame();
