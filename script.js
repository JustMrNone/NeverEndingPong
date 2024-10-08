const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');
const video = document.getElementById('videoBackground');
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;
const ballSpeed = 5; 
const paddleSpeed = 4;
const humanErrorMargin = 20;

// Start the game only when the video is ready to play through
video.addEventListener('canplaythrough', function() {
    document.getElementById('content').style.display = 'block';
    resetBall();
    gameLoop();  // Start the game loop when the video is fully loaded
});

const paddleLeft = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const paddleRight = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
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
    
    return futureY - paddleHeight / 2;
}

function simulateHumanPlayer(paddle, target) {
    // Calculate distance to target
    const distanceToTarget = target - (paddle.y + paddle.height / 2);
    
    // Adjust speed based on distance, with some randomness
    let speed = Math.min(Math.abs(distanceToTarget) * 0.2, paddleSpeed) * Math.sign(distanceToTarget);
    speed += (Math.random() - 0.5) * 0.5; // Add some jitter
    
    // Move paddle
    paddle.y += speed;
    
    // Ensure paddle stays within canvas
    paddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle.y));
}

function updatePlayers() {
    // Left player
    let leftPaddleTarget = predictBallY(paddleLeft.x);
    simulateHumanPlayer(paddleLeft, leftPaddleTarget);
    
    // Right player
    let rightPaddleTarget = predictBallY(paddleRight.x);
    simulateHumanPlayer(paddleRight, rightPaddleTarget);
}

function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Check for wall collisions
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy *= -1;
    }

    // Left paddle collision
    if (ball.x - ball.size < paddleLeft.x + paddleLeft.width &&
        ball.y > paddleLeft.y && ball.y < paddleLeft.y + paddleLeft.height) {
        const hitPosition = (ball.y - (paddleLeft.y + paddleLeft.height / 2)) / (paddleLeft.height / 2);
        setballspeed(1, hitPosition);
    }

    // Right paddle collision
    if (ball.x + ball.size > paddleRight.x &&
        ball.y > paddleRight.y && ball.y < paddleRight.y + paddleRight.height) {
        const hitPosition = (ball.y - (paddleRight.y + paddleRight.height / 2)) / (paddleRight.height / 2);
        setballspeed(-1, hitPosition);
    }

    // Reset ball if it goes out of bounds
    if (ball.x + ball.size < 0 || ball.x - ball.size > canvas.width) {
        resetBall();
    }

    updatePlayers();
}

function setballspeed(horizontalDirection, verticalInfluence) {
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

function gameLoop() {
    update();
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

gameLoop();