const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 15;

const PADDLE_MARGIN = 25;

let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;

let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);

let playerScore = 0;
let aiScore = 0;

// Mouse controls
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, playerY));
});

// Collision helpers
function rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
}

// AI Logic: simple tracking
function updateAI() {
  // AI follows the ball, but with some inertia
  const centerAI = aiY + PADDLE_HEIGHT / 2;
  const centerBall = ballY + BALL_SIZE / 2;
  const speed = 5;

  if (centerAI < centerBall - 10) {
    aiY += speed;
  } else if (centerAI > centerBall + 10) {
    aiY -= speed;
  }
  aiY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, aiY));
}

function resetBall(direction) {
  ballX = WIDTH / 2 - BALL_SIZE / 2;
  ballY = HEIGHT / 2 - BALL_SIZE / 2;
  ballSpeedX = 6 * direction;
  ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

// Main game loop
function gameLoop() {
  // Move Ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Top/Bottom collision
  if (ballY <= 0 || ballY + BALL_SIZE >= HEIGHT) {
    ballSpeedY *= -1;
    ballY = Math.max(0, Math.min(HEIGHT - BALL_SIZE, ballY));
  }

  // Left paddle collision
  if (rectCollision(
    ballX, ballY, BALL_SIZE, BALL_SIZE,
    PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT
  )) {
    ballSpeedX *= -1;
    // Add some spin based on where it hits the paddle
    let hitPos = (ballY + BALL_SIZE/2) - (playerY + PADDLE_HEIGHT/2);
    ballSpeedY += hitPos * 0.13;
    ballX = PADDLE_MARGIN + PADDLE_WIDTH;
  }

  // Right paddle collision (AI)
  if (rectCollision(
    ballX, ballY, BALL_SIZE, BALL_SIZE,
    WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT
  )) {
    ballSpeedX *= -1;
    let hitPos = (ballY + BALL_SIZE/2) - (aiY + PADDLE_HEIGHT/2);
    ballSpeedY += hitPos * 0.13;
    ballX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
  }

  // Score detection
  if (ballX < 0) {
    aiScore++;
    document.getElementById('aiScore').textContent = aiScore;
    resetBall(1);
  }
  if (ballX + BALL_SIZE > WIDTH) {
    playerScore++;
    document.getElementById('playerScore').textContent = playerScore;
    resetBall(-1);
  }

  // AI update
  updateAI();

  // Draw everything
  draw();

  requestAnimationFrame(gameLoop);
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Middle line
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  // Left paddle (Player)
  ctx.fillStyle = "#2ecc40";
  ctx.fillRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Right paddle (AI)
  ctx.fillStyle = "#ff4136";
  ctx.fillRect(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Ball
  ctx.fillStyle = "#fff";
  ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
}

// Start game
gameLoop();
