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
    const totalImages = 6; // deer + 3 vehicles + pasty + apple
    let gameLoopStarted = false;
    let showPasty = false;
    let pastyTimer = 0;
    let touchSpeedMultiplier = 1; // Touch speed multiplier for deer

    // Pre-load all images before starting the game
    const imageUrls = {
        deer: 'images/deer.png',
        oldTruck: 'images/old_truck.png',
        schoolBus: 'images/school_bus.png',
        sportsCar: 'images/sports_car.png',
        pasty: 'images/pasty.png',
        apple: 'images/apple.png'
    };

    const loadedImages = {};

    const deer = {
        x: deerCanvas.width / 2 - 30,
        y: deerCanvas.height - 70,
        width: 60,
        height: 60,
        speed: 8 * touchSpeedMultiplier // Adjusted speed for deer
    };

    const vehicles = [
        { x: 0, y: 120, width: 70, height: 50, speed: 1.5 }, // Old truck (slowest)
        { x: 250, y: 200, width: 80, height: 50, speed: 3 }, // School bus (medium)
        { x: 500, y: 240, width: 70, height: 40, speed: 5 }  // Sports car (fastest)
    ];

    let keys = {}; // Object to track the state of keys

    let apples = []; // Array to hold apples

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
        loadImage('pasty', imageUrls.pasty),
        loadImage('apple', imageUrls.apple)
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

    // Keyboard Controls
    document.addEventListener("keydown", (e) => {
        keys[e.key] = true;

        if (gameOver) {
            // Restart game with 'R' key
            if (e.key === "r" || e.key === "R") {
                resetGame();
                return;
            }
        }
    });

    document.addEventListener("keyup", (e) => {
        keys[e.key] = false;
    });

    function updateMovement() {
        if (keys["ArrowLeft"] && deer.x > 0) deer.x -= deer.speed * touchSpeedMultiplier;
        if (keys["ArrowRight"] && deer.x < deerCanvas.width - deer.width) deer.x += deer.speed * touchSpeedMultiplier;
        if (keys["ArrowUp"] && deer.y > 0) {
            deer.y -= deer.speed * touchSpeedMultiplier;
            if (deer.y <= 60) {
                score += 100; // Increase score for crossing the road
                showPasty = true; // Show reward message
                pastyTimer = 120; // Show reward message for 120 frames
                resetDeer(); // Reset deer position after crossing
            }
        }
        if (keys["ArrowDown"] && deer.y < deerCanvas.height - deer.height) deer.y += deer.speed * touchSpeedMultiplier;
    }

    setInterval(updateMovement, 1000 / 60); // Update movement at 60 FPS

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
        apples = []; // Reset apples
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

    function spawnApple() {
        const apple = {
            x: deerCanvas.width + 30, // Spawn off-screen to the right
            y: Math.random() * (deerCanvas.height - 100) + 50, // Random y position, avoiding the top
            width: 30,
            height: 30,
            collected: false // Track if the apple has been collected
        };
        apples.push(apple);
    }

    setInterval(() => {
        if (!gameOver) {
            spawnApple(); // Spawn a new apple every few seconds
        }
    }, 5000); // Adjust the interval as needed

    function drawApples() {
        apples.forEach(apple => {
            if (!apple.collected && loadedImages.apple) {
                deerCtx.drawImage(loadedImages.apple, apple.x, apple.y, apple.width, apple.height);
            }
        });
    }

    function updateApples() {
        apples.forEach(apple => {
            apple.x -= 2; // Adjust this value based on desired speed
            // Remove apple if it goes off-screen
            if (apple.x + apple.width < 0) {
                apple.collected = true; // Mark as collected to remove
            }
        });
    }

    function checkAppleCollision() {
        apples.forEach(apple => {
            if (!apple.collected && deer.x < apple.x + apple.width &&
                deer.x + deer.width > apple.x &&
                deer.y < apple.y + apple.height &&
                deer.y + deer.height > apple.y) {
                apple.collected = true; // Mark apple as collected
                score += 100; // Increase score
            }
        });
    }

    function gameLoop() {
        if (!gameOver) {
            drawBackground();
            updateVehicles();
            drawDeer();
            drawScore();
            drawPasty();
            drawApples();
            updateApples();
            checkCollisions();
            checkAppleCollision();
        } else {
            drawGameOver();
        }
        requestAnimationFrame(gameLoop);
    }
});