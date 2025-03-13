document.addEventListener('DOMContentLoaded', function() {
    const deerCanvas = document.getElementById('frogger-canvas');
    const loadingIndicator = document.getElementById('loading-deer');
    
    if (!deerCanvas) {
        console.error('❌ Canvas element not found!');
        return;
    }

    loadingIndicator.style.display = 'block';
    
    const deerCtx = deerCanvas.getContext('2d');
    console.log("✅ DOM loaded, initializing Deer Crossing game...");

    // Game variables
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let imagesLoaded = 0;
    const totalImages = 5; // deer + 3 vehicles + pasty
    let gameLoopStarted = false;
    let showPasty = false;
    let pastyTimer = 0;

    // Pre-load all images before starting the game
    const imageUrls = {
        deer: 'images/deer.png',
        oldTruck: 'images/old_truck.png',
        schoolBus: 'images/school_bus.png',
        sportsCar: 'images/sports_car.png',
        pasty: 'images/pasty.png'
    };

    const loadedImages = {};

    const deer = {
        x: deerCanvas.width / 2 - 30,
        y: deerCanvas.height - 70,
        width: 60,
        height: 60,
        speed: 8
    };

    const vehicles = [
        { x: 0, y: 120, width: 70, height: 50, speed: 1.5 }, // Old truck (slowest)
        { x: 250, y: 200, width: 80, height: 50, speed: 3 }, // School bus (medium)
        { x: 500, y: 240, width: 70, height: 40, speed: 5 }  // Sports car (fastest)
    ];

    function loadImage(key, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                loadedImages[key] = img;
                imagesLoaded++;
                console.log(`🎨 Loaded image: ${key} (${imagesLoaded}/${totalImages})`);
                resolve(img);
            };
            img.onerror = () => {
                console.error(`❌ Failed to load image: ${key} (${url})`);
                reject(new Error(`Failed to load ${key}`));
            };
            img.src = url;
        });
    }

    // Load all images then start game
    Promise.all([
        loadImage('deer', imageUrls.deer),
        loadImage('oldTruck', imageUrls.oldTruck),
        loadImage('schoolBus', imageUrls.schoolBus),
        loadImage('sportsCar', imageUrls.sportsCar),
        loadImage('pasty', imageUrls.pasty)
    ]).then(() => {
        console.log('🎮 All images loaded successfully!');
        loadingIndicator.style.display = 'none';
        gameLoopStarted = true;
        requestAnimationFrame(gameLoop);
    }).catch(error => {
        console.error('❌ Error loading game assets:', error);
        loadingIndicator.textContent = 'Error loading game assets. Please refresh the page.';
    });

    // Prevent arrow keys from scrolling
    window.addEventListener('keydown', function(e) {
        if(['ArrowUp', 'ArrowDown', ' '].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    });

    // Mobile touch controls
    deerCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (gameOver) {
            resetGame();
            return;
        }
        const touch = e.touches[0];
        const rect = deerCanvas.getBoundingClientRect();
        touchStartX = touch.clientX - rect.left;
        touchStartY = touch.clientY - rect.top;
    });

    deerCanvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (gameOver) return;
        
        const touch = e.touches[0];
        const rect = deerCanvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        
        const deltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;
        
        // Move deer based on swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal movement
            if (deltaX > 0 && deer.x + deer.width < deerCanvas.width) {
                deer.x += deer.speed;
            } else if (deltaX < 0 && deer.x > 0) {
                deer.x -= deer.speed;
            }
        } else {
            // Vertical movement
            if (deltaY < 0 && deer.y > 0) {
                deer.y -= deer.speed;
                if (deer.y <= 60) {
                    score += 100;
                    showPasty = true;
                    pastyTimer = 120; // Show pasty for 120 frames
                    resetDeer();
                }
            } else if (deltaY > 0 && deer.y + deer.height < deerCanvas.height) {
                deer.y += deer.speed;
            }
        }
        
        touchStartX = currentX;
        touchStartY = currentY;
    });

    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        if (!deerCanvas || deerCanvas.offsetParent === null) return;
        
        if (gameOver) {
            if (e.key === 'Enter' || e.key === 'r' || e.key === 'R') {
                resetGame();
            }
            return;
        }

        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (deer.x > 0) deer.x -= deer.speed;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (deer.x + deer.width < deerCanvas.width) deer.x += deer.speed;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (deer.y > 0) {
                    deer.y -= deer.speed;
                }
                if (deer.y <= 60) {
                    score += 100;
                    showPasty = true;
                    pastyTimer = 120; // Show pasty for 120 frames
                    resetDeer();
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (deer.y + deer.height < deerCanvas.height) deer.y += deer.speed;
                break;
        }
    });

    function drawBackground() {
        deerCtx.fillStyle = '#2C3E50';
        deerCtx.fillRect(0, 0, deerCanvas.width, deerCanvas.height);
        deerCtx.fillStyle = '#4CAF50';
        deerCtx.fillRect(0, 0, deerCanvas.width, 60); // Safe zone
        deerCtx.fillRect(0, deerCanvas.height - 60, deerCanvas.width, 60); // Start zone
    }

    function drawPasty() {
        if (showPasty && loadedImages.pasty) {
            deerCtx.drawImage(loadedImages.pasty, deerCanvas.width / 2 - 40, 100, 80, 50);
            deerCtx.fillStyle = 'white';
            deerCtx.font = '24px Arial';
            deerCtx.textAlign = 'center';
            deerCtx.fillText("Made er!", deerCanvas.width / 2, 180);
            
            pastyTimer--;
            if (pastyTimer <= 0) {
                showPasty = false;
            }
        }
    }

    function drawDeer() {
        if (loadedImages.deer) {
            deerCtx.drawImage(loadedImages.deer, deer.x, deer.y, deer.width, deer.height);
        }
    }

    function updateVehicles() {
        vehicles.forEach((vehicle, index) => {
            const vehicleImage = index === 0 ? loadedImages.oldTruck :
                               index === 1 ? loadedImages.schoolBus :
                               loadedImages.sportsCar;
            
            if (vehicleImage) {
                deerCtx.drawImage(vehicleImage, vehicle.x, vehicle.y, vehicle.width, vehicle.height);
                vehicle.x += vehicle.speed;
                if (vehicle.x > deerCanvas.width) vehicle.x = -vehicle.width;
            }
        });
    }

    function drawScore() {
        deerCtx.fillStyle = 'white';
        deerCtx.font = '18px Arial';
        deerCtx.textAlign = 'left';
        deerCtx.fillText(`Score: ${score}`, 10, 20);
        deerCtx.fillText(`Lives: ${lives}`, deerCanvas.width - 100, 20);
    }

    function checkCollisions() {
        vehicles.forEach(vehicle => {
            if (deer.x < vehicle.x + vehicle.width &&
                deer.x + deer.width > vehicle.x &&
                deer.y < vehicle.y + vehicle.height &&
                deer.y + deer.height > vehicle.y) {
                lives--;
                resetDeer();
                if (lives <= 0) {
                    gameOver = true;
                }
            }
        });
    }

    function resetDeer() {
        deer.x = deerCanvas.width / 2 - deer.width / 2;
        deer.y = deerCanvas.height - 50;
    }

    function resetGame() {
        score = 0;
        lives = 3;
        gameOver = false;
        showPasty = false;
        resetDeer();
        vehicles.forEach(vehicle => {
            vehicle.x = Math.random() * deerCanvas.width;
        });
    }

    function drawGameOver() {
        deerCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        deerCtx.fillRect(0, 0, deerCanvas.width, deerCanvas.height);
        deerCtx.fillStyle = 'white';
        deerCtx.textAlign = 'center';
        deerCtx.font = '40px Arial';
        deerCtx.fillText('GAME OVER', deerCanvas.width / 2, deerCanvas.height / 2);
        deerCtx.font = '20px Arial';
        deerCtx.fillText(`Final Score: ${score}`, deerCanvas.width / 2, deerCanvas.height / 2 + 50);
        deerCtx.fillText('Tap screen or press R to restart', deerCanvas.width / 2, deerCanvas.height / 2 + 80);
    }

    function gameLoop() {
        if (!gameOver) {
            drawBackground();
            updateVehicles();
            drawDeer();
            drawScore();
            drawPasty();
            checkCollisions();
        } else {
            drawGameOver();
        }
        requestAnimationFrame(gameLoop);
    }
});