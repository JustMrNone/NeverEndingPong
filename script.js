const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');
const message = document.getElementById('message');
const video = document.getElementById('videoBackground')
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;
const paddleSpeed = 4;
const ballSpeed = 4; 
const aiReactionDelay = 5;
const aiErrorMargin = 30;

let scoreLeft = 0;
let scoreRight = 0;
let frameCount = 0;
let leftPaddleTarget = 0;
let rightPaddleTarget = 0;


// Start the game only when the video is ready to play through
video.addEventListener('canplaythrough', function() {
    document.getElementById('content').style.display = 'block';
    gameLoop();  // Start the game loop when the video is fully loaded
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
    dy: ballSpeed
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

function drawScores() {
    context.fillStyle = '#fff';
    context.font = '30px Press Start 2P';
    context.textAlign = 'center';
    //context.fillText(`Player 1: ${scoreLeft}`, canvas.width / 4, 30);
    //context.fillText(`Player 2: ${scoreRight}`, 3 * canvas.width / 4, 30);
}

function displayMessage(text) {
    message.innerText = text;
    message.style.display = 'block';
    setTimeout(() => {
        message.style.display = 'none';
    }, 2000);
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

function updateAI() {
    frameCount++;
    
    // Left paddle strategy: Defensive
    if (ball.dx < 0) {
        leftPaddleTarget = predictBallY(paddleLeft.x);
    } else {
        leftPaddleTarget = canvas.height / 2 - paddleHeight / 2;
    }
    
    // Right paddle strategy: Aggressive
    if (ball.dx > 0 || ball.x > canvas.width / 2) {
        rightPaddleTarget = predictBallY(paddleRight.x);
    } else {
        rightPaddleTarget = ball.y - paddleHeight / 2;
    }
    
    // Add some randomness
    leftPaddleTarget += (Math.random() - 0.5) * aiErrorMargin;
    rightPaddleTarget += (Math.random() - 0.5) * aiErrorMargin;
    
    // Move paddles towards their targets
    paddleLeft.y += (leftPaddleTarget - paddleLeft.y) * 0.1;
    paddleRight.y += (rightPaddleTarget - paddleRight.y) * 0.1;
}
function normalizeBallSpeed() {
    const speed = ballSpeed;  // Always use the constant ball speed
    const angle = Math.atan2(ball.dy, ball.dx);  // Get the angle of motion
    
    ball.dx = Math.cos(angle) * speed;  // Reapply ball speed while maintaining angle
    ball.dy = Math.sin(angle) * speed;
}


function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Check for wall collisions
    if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
        ball.dy *= -1;  // Reverse Y direction
        normalizeBallSpeed();  // Ensure constant speed after wall bounce
    }

    // Left paddle collision with influence on ball direction
    if (ball.x - ball.size < paddleLeft.x + paddleLeft.width &&
        ball.y > paddleLeft.y && ball.y < paddleLeft.y + paddleLeft.height) {
        ball.dx *= -1;

        // Calculate where the ball hit the paddle
        const hitPosition = (ball.y - (paddleLeft.y + paddleLeft.height / 2)) / (paddleLeft.height / 2);
        ball.dy = ballSpeed * hitPosition;  // Modify Y direction based on hit position

        normalizeBallSpeed();  // Normalize ball speed after collision
    }

    // Right paddle collision with influence on ball direction
    if (ball.x + ball.size > paddleRight.x &&
        ball.y > paddleRight.y && ball.y < paddleRight.y + paddleRight.height) {
        ball.dx *= -1;

        // Calculate where the ball hit the paddle
        const hitPosition = (ball.y - (paddleRight.y + paddleRight.height / 2)) / (paddleRight.height / 2);
        ball.dy = ballSpeed * hitPosition;  // Modify Y direction based on hit position

        normalizeBallSpeed();  // Normalize ball speed after collision
    }

    // Check for scoring conditions
    if (ball.x + ball.size < 0) {
        scoreRight++;
        if (scoreRight === 5) {
            displayMessage('Player 2 Wins!');
            resetGame();
        } else {
            resetBall();
        }
    }

    if (ball.x - ball.size > canvas.width) {
        scoreLeft++;
        if (scoreLeft === 5) {
            displayMessage('Player 1 Wins!');
            resetGame();
        } else {
            resetBall();
        }
    }

    updateAI();

    // Ensure paddles stay within canvas
    paddleLeft.y = Math.max(0, Math.min(canvas.height - paddleHeight, paddleLeft.y));
    paddleRight.y = Math.max(0, Math.min(canvas.height - paddleHeight, paddleRight.y));
}


function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(paddleLeft);
    drawPaddle(paddleRight);
    drawBall();
    drawScores();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
}

function resetGame() {
    scoreLeft = 0;
    scoreRight = 0;
    resetBall();
}

gameLoop();