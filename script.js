// 게임 변수들
let player = document.getElementById('player');
let gameContainer = document.getElementById('gameContainer');
let score = 0;
let lives = 3;
let gameRunning = true;
let isJumping = false;
let playerSpeed = 5;
let gravity = 0.8;
let jumpPower = 15;
let velocityY = 0;

// 플레이어 위치
let playerX = 50;
let playerY = 120; // 바닥에서부터의 높이

// 키 입력 상태 (WASD)
let keys = {
    a: false,    // 왼쪽 이동
    d: false,    // 오른쪽 이동
    w: false     // 점프
};

// 플랫폼 정보
const platforms = [
    {x: 0, y: 0, width: 800, height: 120}, // 바닥
    {x: 200, y: 200, width: 150, height: 20},
    {x: 400, y: 300, width: 100, height: 20},
    {x: 600, y: 180, width: 120, height: 20},
    {x: 300, y: 400, width: 80, height: 20}
];

// 키 이벤트 리스너 (WASD 전용)
document.addEventListener('keydown', function(e) {
    if (!gameRunning) return;
    
    const key = e.key.toLowerCase();
    
    switch(key) {
        case 'a':
            keys.a = true;
            e.preventDefault();
            break;
        case 'd':
            keys.d = true;
            e.preventDefault();
            break;
        case 'w':
            if (!keys.w) { // 키 반복 방지
                keys.w = true;
            }
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', function(e) {
    const key = e.key.toLowerCase();
    
    switch(key) {
        case 'a':
            keys.a = false;
            break;
        case 'd':
            keys.d = false;
            break;
        case 'w':
            keys.w = false;
            break;
    }
});

// 충돌 감지 함수
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 플랫폼과의 충돌 체크
function checkPlatformCollision() {
    let playerRect = {
        x: playerX,
        y: 600 - playerY - 40, // CSS bottom을 top으로 변환
        width: 30,
        height: 40
    };

    let onGround = false;

    platforms.forEach(platform => {
        let platformRect = {
            x: platform.x,
            y: 600 - platform.y - platform.height,
            width: platform.width,
            height: platform.height
        };

        if (checkCollision(playerRect, platformRect)) {
            // 위에서 떨어지는 경우 (플랫폼 위에 착지)
            if (velocityY <= 0 && playerRect.y + playerRect.height - velocityY <= platformRect.y) {
                playerY = platform.y + platform.height;
                velocityY = 0;
                isJumping = false;
                onGround = true;
            }
        }
    });

    return onGround;
}

// 코인 수집 체크
function checkCoinCollection() {
    let coins = document.querySelectorAll('.coin');
    let playerRect = {
        x: playerX,
        y: 600 - playerY - 40,
        width: 30,
        height: 40
    };

    coins.forEach(coin => {
        if (coin.style.display !== 'none') {
            let coinRect = coin.getBoundingClientRect();
            let containerRect = gameContainer.getBoundingClientRect();
            
            let coinX = coinRect.left - containerRect.left;
            let coinY = coinRect.top - containerRect.top;

            if (Math.abs(playerX - coinX) < 25 && Math.abs((600 - playerY - 40) - coinY) < 25) {
                coin.style.display = 'none';
                score += 10;
                updateScore();
                
                // 코인 수집 효과음 시뮬레이션 (콘솔 로그)
                console.log('코인 획득! +10점');
            }
        }
    });
}

// 적과의 충돌 체크
function checkEnemyCollision() {
    let enemies = document.querySelectorAll('.enemy');
    let playerRect = {
        x: playerX,
        y: 600 - playerY - 40,
        width: 30,
        height: 40
    };

    enemies.forEach(enemy => {
        if (enemy.style.display !== 'none') {
            let enemyRect = enemy.getBoundingClientRect();
            let containerRect = gameContainer.getBoundingClientRect();
            
            let enemyX = enemyRect.left - containerRect.left;
            let enemyY = enemyRect.top - containerRect.top;

            if (Math.abs(playerX - enemyX) < 30 && Math.abs((600 - playerY - 40) - enemyY) < 30) {
                lives--;
                updateLives();
                
                console.log('적과 충돌! 생명 -1');
                
                if (lives <= 0) {
                    gameOver();
                } else {
                    // 플레이어를 시작 위치로 되돌림
                    resetPlayerPosition();
                }
            }
        }
    });
}

// 플레이어 위치 리셋
function resetPlayerPosition() {
    playerX = 50;
    playerY = 120;
    velocityY = 0;
    isJumping = false;
    
    // 약간의 무적 시간 시뮬레이션
    player.style.opacity = '0.5';
    setTimeout(() => {
        player.style.opacity = '1';
    }, 1000);
}

// 점수 업데이트
function updateScore() {
    document.getElementById('score').textContent = '점수: ' + score;
}

// 생명 업데이트
function updateLives() {
    document.getElementById('lives').textContent = '생명: ' + lives;
}

// 게임 오버
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    console.log('게임 오버! 최종 점수:', score);
}

// 게임 재시작
function restartGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    playerX = 50;
    playerY = 120;
    velocityY = 0;
    isJumping = false;

    updateScore();
    updateLives();
    
    // 플레이어 스타일 리셋
    player.style.opacity = '1';
    
    // 모든 코인 다시 표시
    document.querySelectorAll('.coin').forEach(coin => {
        coin.style.display = 'block';
    });
    
    // 모든 적 다시 표시
    document.querySelectorAll('.enemy').forEach(enemy => {
        enemy.style.display = 'block';
    });
    
    document.getElementById('gameOver').style.display = 'none';
    console.log('게임 재시작!');
}

// 플레이어 이동 처리 (WASD)
function handlePlayerMovement() {
    // 좌우 이동
    if (keys.a && playerX > 0) {
        playerX -= playerSpeed;
        // 플레이어 방향 표시
        player.style.transform = 'scaleX(-1)';
    }
    if (keys.d && playerX < 770) {
        playerX += playerSpeed;
        // 플레이어 방향 표시
        player.style.transform = 'scaleX(1)';
    }
    
    // 점프 - W키
    if (keys.w && !isJumping) {
        velocityY = jumpPower;
        isJumping = true;
        keys.w = false; // 점프 후 키 상태 리셋
        console.log('점프!');
    }
}

// 물리 처리
function handlePhysics() {
    // 중력 적용
    if (isJumping || playerY > 120) {
        velocityY -= gravity;
        playerY += velocityY;
    }

    // 바닥 체크
    if (playerY <= 120) {
        playerY = 120;
        velocityY = 0;
        isJumping = false;
    }

    // 화면 경계 체크
    if (playerX < 0) playerX = 0;
    if (playerX > 770) playerX = 770;
    
    // 플레이어가 화면 아래로 떨어진 경우
    if (playerY < -50) {
        lives--;
        updateLives();
        if (lives <= 0) {
            gameOver();
        } else {
            resetPlayerPosition();
        }
    }
}

// 게임 상태 업데이트
function updateGameState() {
    // 플랫폼 충돌 체크
    checkPlatformCollision();
    
    // 플레이어 위치 업데이트
    player.style.left = playerX + 'px';
    player.style.bottom = playerY + 'px';

    // 충돌 체크
    checkCoinCollection();
    checkEnemyCollision();
}

// 모든 코인이 수집되었는지 체크
function checkWinCondition() {
    let visibleCoins = Array.from(document.querySelectorAll('.coin')).filter(coin => 
        coin.style.display !== 'none'
    );
    
    if (visibleCoins.length === 0) {
        score += 100; // 보너스 점수
        updateScore();
        console.log('모든 코인 수집 완료! 보너스 +100점');
        
        // 새로운 레벨 또는 승리 메시지
        alert('축하합니다! 모든 코인을 수집했습니다!');
        restartGame();
    }
}

// 메인 게임 루프
function gameLoop() {
    if (!gameRunning) return;

    // 플레이어 이동 처리
    handlePlayerMovement();
    
    // 물리 처리
    handlePhysics();
    
    // 게임 상태 업데이트
    updateGameState();
    
    // 승리 조건 체크
    checkWinCondition();

    // 다음 프레임 요청
    requestAnimationFrame(gameLoop);
}

// 게임 초기화 및 시작
function initGame() {
    console.log('=== 마리오 스타일 게임 시작! ===');
    console.log('조작법:');
    console.log('  A: 왼쪽 이동');
    console.log('  D: 오른쪽 이동');
    console.log('  W: 점프');
    console.log('  ESC: 일시정지/재개');
    console.log('  R: 재시작');
    console.log('목표: 모든 코인을 수집하고 적을 피하세요!');
    console.log('=====================================');
    
    updateScore();
    updateLives();
    
    // 게임 시작 전 잠깐 대기
    setTimeout(() => {
        gameLoop();
    }, 100);
}

// 페이지 로드 완료 후 게임 시작
document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소들이 로드된 후 변수 재할당
    player = document.getElementById('player');
    gameContainer = document.getElementById('gameContainer');
    
    // 게임 초기화
    initGame();
});

// 게임 일시정지/재개 및 추가 키 처리
document.addEventListener('keydown', function(e) {
    const key = e.key.toLowerCase();
    
    // ESC 키로 일시정지/재개
    if (e.code === 'Escape') {
        e.preventDefault();
        if (gameRunning) {
            gameRunning = false;
            console.log('게임 일시정지 (ESC를 다시 누르면 재개)');
        } else {
            gameRunning = true;
            console.log('게임 재개');
            gameLoop();
        }
    }
    
    // R 키로 게임 재시작
    if (key === 'r') {
        e.preventDefault();
        restartGame();
        console.log('게임 재시작 (R키)');
    }
});