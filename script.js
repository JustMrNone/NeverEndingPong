const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');
const video = document.getElementById('videoBackground');
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;
const ballSpeed = 350; // pixels per second
const paddleSpeed = 160; // pixels per second
const humanErrorMargin = 20;

let lastTime = 0;
let aiDifficulty = 0.5; // 0 to 1, where 1 is perfect play

// Start the game only when the video is ready to play through
video.addEventListener('canplaythrough', function() {
    document.getElementById('content').style.display = 'block';
    resetBall();
    requestAnimationFrame(gameLoop);
});

const paddleLeft = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight
};

const paddleRight = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: ballSpeed,
    dy: 0
};

function drawPaddle(paddle) {
    context.fillStyle = '#fff';
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    context.fill();
}

function predictBallY(paddleX) {
    let steps = Math.abs((paddleX - ball.x) / ball.dx);
    let futureY = ball.y + ball.dy * steps;
    
    while (futureY < 0 || futureY > canvas.height) {
        if (futureY < 0) {
            futureY = -futureY;
        } else if (futureY > canvas.height) {
            futureY = 2 * canvas.height - futureY;
        }
    }
    
    return futureY;
}

function simulateHumanPlayer(paddle, deltaTime) {
    const predictedY = predictBallY(paddle.x + (paddle.x === 0 ? paddle.width : -paddle.width));
    const perfectTarget = predictedY - paddle.height / 2;

    // Introduce AI error margin
    const maxError = (1 - aiDifficulty) * canvas.height / 2;
    const error = (Math.random() - 0.5) * 2 * maxError;
    const target = perfectTarget + error;

    const distanceToTarget = target - paddle.y;

    // Move at a consistent speed, within the limit of paddleSpeed
    let speed = Math.min(Math.abs(distanceToTarget), paddleSpeed * deltaTime) * Math.sign(distanceToTarget);

    paddle.y += speed;

    // Keep the paddle within the screen bounds and use Math.floor() for pixel precision
    paddle.y = Math.max(0, Math.min(canvas.height - paddle.height, paddle.y));

}

function updatePlayers(deltaTime) {
    simulateHumanPlayer(paddleLeft, deltaTime);
    simulateHumanPlayer(paddleRight, deltaTime);
}

function update(deltaTime) {
    // Update ball position
    ball.x += ball.dx * deltaTime;
    ball.y += ball.dy * deltaTime;

    // Wall collision detection and response
    if (ball.y - ball.size < 0) {
        ball.y = ball.size; // Reposition the ball to touch the wall
        ball.dy = Math.abs(ball.dy); // Ensure the ball moves downward
    } else if (ball.y + ball.size > canvas.height) {
        ball.y = canvas.height - ball.size; // Reposition the ball to touch the wall
        ball.dy = -Math.abs(ball.dy); // Ensure the ball moves upward
    }

    // Paddle collision detection and response
    if (ball.x - ball.size < paddleLeft.x + paddleLeft.width &&
        ball.y > paddleLeft.y && ball.y < paddleLeft.y + paddleLeft.height) {
        ball.x = paddleLeft.x + paddleLeft.width + ball.size; // Reposition the ball outside the paddle
        const hitPosition = (ball.y - (paddleLeft.y + paddleLeft.height / 2)) / (paddleLeft.height / 2);
        setBallSpeed(1, hitPosition);
    }

    if (ball.x + ball.size > paddleRight.x &&
        ball.y > paddleRight.y && ball.y < paddleRight.y + paddleRight.height) {
        ball.x = paddleRight.x - ball.size; // Reposition the ball outside the paddle
        const hitPosition = (ball.y - (paddleRight.y + paddleRight.height / 2)) / (paddleRight.height / 2);
        setBallSpeed(-1, hitPosition);
    }

    // Reset ball if it goes out of bounds
    if (ball.x + ball.size < 0 || ball.x - ball.size > canvas.width) {
        resetBall();
    }

    updatePlayers(deltaTime);
}

function setBallSpeed(horizontalDirection, verticalInfluence) {
    const angle = verticalInfluence * Math.PI / 4; // Max angle of 45 degrees
    ball.dx = horizontalDirection * Math.cos(angle) * ballSpeed;
    ball.dy = Math.sin(angle) * ballSpeed;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(paddleLeft);
    drawPaddle(paddleRight);
    drawBall();
}

function gameLoop(currentTime) {
    if (lastTime === 0) {
        lastTime = currentTime;
    }
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const angle = (Math.random() - 0.5) * Math.PI / 2; // Random angle between -45 and 45 degrees
    ball.dx = Math.cos(angle) * ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = Math.sin(angle) * ballSpeed;
}

// Function to set AI difficulty (can be called from outside)
function setAIDifficulty(difficulty) {
    aiDifficulty = Math.max(0, Math.min(1, difficulty));
}