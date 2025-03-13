document.addEventListener("DOMContentLoaded", function() {
    console.log(" DOM fully loaded, initializing StarCat...");

    const starcatCanvas = document.getElementById("starcat-canvas");
    console.log("starcatCanvas:", starcatCanvas); // Debugging

    if (!starcatCanvas) {
        console.error(" ERROR: StarCat canvas not found in the DOM!");
        return;
    }

    const starcatCtx = starcatCanvas.getContext("2d");
    const images = {
        spaceship: "images/spaceship.png",
        heart: "images/heart.png",
        sadCat: "images/sad_cat.png",
        happyCat: "images/happy_cat.png",
        background: "images/background_optimized.png",
        yarnBall: "images/yarn_ball.png",
        grumpyCatOpen: "images/grumpy_cat_open.png",
        grumpyCatClosed: "images/grumpy_cat_closed.png",
        hairball: "images/hairball.png"
    };

    const loadedImages = {};
    let loadedCount = 0;
    const totalImages = Object.keys(images).length;

    function loadImages(callback) {
        console.log("Starting to load images...");
        for (let key in images) {
            loadedImages[key] = new Image();
            loadedImages[key].src = images[key];
            console.log(`Loading image: ${key} from ${images[key]}`);
            
            loadedImages[key].onload = () => {
                loadedCount++;
                console.log(`Successfully loaded ${key}, ${loadedCount}/${totalImages} complete`);
                if (loadedCount === totalImages) {
                    console.log("All images loaded successfully!");
                    document.getElementById('loading-deer').style.display = 'none';  // Hide loading indicator for Deer Crossing
                    document.getElementById('loading-starcat').style.display = 'none';  // Hide loading indicator for StarCat
                    console.log("Loaded background dimensions:", loadedImages.background.width, loadedImages.background.height);
                    callback();
                }
            };
            
            loadedImages[key].onerror = () => {
                console.error(`Failed to load image: ${key} from ${images[key]}`);
                loadedCount++;
                if (loadedCount === totalImages) callback();
            };
        }
    }

    let player = { x: 375, y: 450, width: 70, height: 70, speed: 6, touchSpeedMultiplier: 1};
    let hearts = [];
    let cats = [];
    let yarnBalls = [];
    let score = 0;
    let gameOver = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTapTime = 0;
    const TAP_THRESHOLD = 200; // ms between taps to consider it a new tap
    let bossActive = false;
    let bossHealth = 100;
    
    const boss = {
        x: starcatCanvas.width / 2 - 100,
        y: 50,
        width: 200,
        height: 200,
        speed: 2,
        direction: 1,
        shootInterval: null,
        hairballs: [],
        hits: 0,
        requiredHits: 10,
        mouthOpen: false,
        mouthTimer: 0,
        mouthOpenDuration: 30  // frames to keep mouth open when shooting
    };

    // Mobile touch controls
    starcatCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = starcatCanvas.getBoundingClientRect();
        touchStartX = touch.clientX - rect.left;
        touchStartY = touch.clientY - rect.top;

        // Check if enough time has passed since last tap to fire a new heart
        const currentTime = Date.now();
        if (currentTime - lastTapTime > TAP_THRESHOLD) {
            shootHeart();
            lastTapTime = currentTime;
        }
    });

    starcatCanvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = starcatCanvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        
        // Calculate movement with enhanced responsiveness
        const deltaX = currentX - touchStartX;
        const moveSpeed = player.speed * player.touchSpeedMultiplier;
        const moveAmount = Math.sign(deltaX) * moveSpeed;
        
        // Apply movement with bounds checking
        const newX = player.x + moveAmount;
        if (newX >= 0 && newX + player.width <= starcatCanvas.width) {
            player.x = newX;
        }
        
        touchStartX = currentX;
    });

    starcatCanvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        
        // Handle game restart on mobile
        if (gameOver) {
            score = 0;
            cats = [];
            hearts = [];
            yarnBalls = [];
            player = { x: 375, y: 450, width: 70, height: 70, speed: 12, touchSpeedMultiplier: 1.5 };
            gameOver = false;
        }
    });

    function shootHeart() {
        if (!gameOver) {
            hearts.push({
                x: player.x + player.width / 2 - 5,
                y: player.y,
                width: 20,
                height: 30,
                speed: 5
            });
        }
    }

    // Spawn cats
    setInterval(() => {
        if (!gameOver) {
            cats.push({
                x: Math.random() * (starcatCanvas.width - 50),
                y: 0,
                width: 50,
                height: 50,
                speed: 0.5,
                happy: false
            });
        }
    }, 2000);
    // Spawn cats
    setInterval(() => {
        if (!gameOver) {
            cats.push({
                x: Math.random() * (starcatCanvas.width - 50),
                y: 0,
                width: 50,
                height: 50,
                speed: 0.5,
                happy: false
            });
        }
    }, 2000);

    // Spawn yarn balls
    setInterval(() => {
        if (!gameOver) {
            yarnBalls.push({
                x: Math.random() * (starcatCanvas.width - 30),
                y: 0,
                width: 30,
                height: 30,
                speed: 1.5,
                rotation: 0,
                rotationSpeed: (Math.random() * 0.1) - 0.05 // Random rotation for visual interest
            });
        }
    }, 4000);
    // Spawn yarn balls
    setInterval(() => {
        if (!gameOver) {
            yarnBalls.push({
                x: Math.random() * (starcatCanvas.width - 30),
                y: 0,
                width: 30,
                height: 30,
                speed: 1.5,
                rotation: 0,
                rotationSpeed: (Math.random() * 0.1) - 0.05 // Random rotation for visual interest
            });
        }
    }, 4000);

    // Keyboard Controls
    document.addEventListener("keydown", (e) => {
        if (gameOver) {
            // Restart game with 'R' key
            if (e.key === "r" || e.key === "R") {
                score = 0;
                cats = [];
                hearts = [];
                yarnBalls = [];
                player = { x: 375, y: 450, width: 70, height: 70, speed: 12, touchSpeedMultiplier: 1.5 };
                gameOver = false;
            }
            return;
        }

        if (e.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
        if (e.key === "ArrowRight" && player.x < starcatCanvas.width - player.width) player.x += player.speed;
        if (e.key === "ArrowUp" && player.y > 0) player.y -= player.speed;
        if (e.key === "ArrowDown" && player.y < starcatCanvas.height - player.height) player.y += player.speed;

        if (e.key === " ") {
            e.preventDefault(); // prevent scrolling
            hearts.push({
                x: player.x + player.width / 2 - 5,
                y: player.y,
                width: 20,
                height: 30,
                speed: 5
            });
        }
    });

    function update() {
        // Update hearts
        for (let i = hearts.length - 1; i >= 0; i--) {
            hearts[i].y -= hearts[i].speed;
            if (hearts[i].y < 0) {
                hearts.splice(i, 1);
            }
        }

        // Update cats
        for (let i = cats.length - 1; i >= 0; i--) {
            cats[i].y += cats[i].speed;

            // Check if cat reached bottom
            if (cats[i].y > starcatCanvas.height) {
                if (!cats[i].happy) {
                    score -= 10; // Deduct points for sad cats that escape
                }
                cats.splice(i, 1);
                continue;
            }

            // Check for heart collisions
            for (let j = hearts.length - 1; j >= 0; j--) {
                if (hearts[j] && cats[i] && checkCollision(hearts[j], cats[i])) {
                    cats[i].happy = true;
                    hearts.splice(j, 1);
                    score += 20;
                }
            }
        }

        // Update yarn balls
        for (let i = yarnBalls.length - 1; i >= 0; i--) {
            yarnBalls[i].y += yarnBalls[i].speed;
            yarnBalls[i].rotation += yarnBalls[i].rotationSpeed;

            // Check for collision with player
            if (checkCollision(player, yarnBalls[i])) {
                yarnBalls.splice(i, 1);
                score += 50;
                continue;
            }

            // Remove if off screen
            if (yarnBalls[i].y > starcatCanvas.height) {
                yarnBalls.splice(i, 1);
            }
        }

        updateBoss();

        // Game over if score drops below -50
        if (score < -50) {
            gameOver = true;
        }
    }

    function updateBoss() {
        if (!bossActive) {
            if (score > 0 && score % 1000 === 0) {
                // Spawn boss every 1000 points
                bossActive = true;
                bossHealth = 100;
                boss.hits = 0;
                boss.x = starcatCanvas.width / 2 - 100;
                boss.y = 50;
                boss.mouthOpen = false;
                boss.mouthTimer = 0;
                
                // Start boss shooting hairballs
                boss.shootInterval = setInterval(() => {
                    if (bossActive) {
                        // Open mouth when shooting
                        boss.mouthOpen = true;
                        boss.mouthTimer = boss.mouthOpenDuration;
                        
                        // Shoot hairball
                        boss.hairballs.push({
                            x: boss.x + boss.width / 2 - 15,  // Center the hairball
                            y: boss.y + boss.height - 30,     // Start from mouth position
                            width: 30,
                            height: 30,
                            speed: 5,
                            rotation: 0
                        });
                    }
                }, 2000);
            }
            return;
        }

        // Update mouth animation
        if (boss.mouthTimer > 0) {
            boss.mouthTimer--;
            if (boss.mouthTimer <= 0) {
                boss.mouthOpen = false;
            }
        }

        // Move boss side to side
        boss.x += boss.speed * boss.direction;
        if (boss.x <= 0 || boss.x + boss.width >= starcatCanvas.width) {
            boss.direction *= -1;
        }

        // Update hairballs
        for (let i = boss.hairballs.length - 1; i >= 0; i--) {
            const hairball = boss.hairballs[i];
            hairball.y += hairball.speed;
            hairball.rotation += 0.1;

            // Check collision with player
            if (checkCollision(player, hairball)) {
                score -= 50;
                boss.hairballs.splice(i, 1);
                if (score < -50) gameOver = true;
                continue;
            }

            // Remove if off screen
            if (hairball.y > starcatCanvas.height) {
                boss.hairballs.splice(i, 1);
            }
        }

        // Check heart collisions with boss
        for (let i = hearts.length - 1; i >= 0; i--) {
            if (checkCollision(hearts[i], boss)) {
                hearts.splice(i, 1);
                boss.hits++;
                score += 50;

                if (boss.hits >= boss.requiredHits) {
                    // Boss defeated!
                    bossActive = false;
                    clearInterval(boss.shootInterval);
                    score += 500; // Bonus points!
                    boss.hairballs = [];
                }
            }
        }
    }

    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    function draw() {
        starcatCtx.clearRect(0, 0, starcatCanvas.width, starcatCanvas.height);
        
        // Draw background first
        if (loadedImages.background && loadedImages.background.complete) {
            console.log("Drawing background image");
            starcatCtx.drawImage(loadedImages.background, 0, 0, starcatCanvas.width, starcatCanvas.height);
        } else {
            console.warn("Background image not ready!");
            // Fallback to solid color
            starcatCtx.fillStyle = '#000033';
            starcatCtx.fillRect(0, 0, starcatCanvas.width, starcatCanvas.height);
        }

        if (gameOver) {
            // Draw game over screen with semi-transparent overlay
            starcatCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            starcatCtx.fillRect(0, 0, starcatCanvas.width, starcatCanvas.height);
            starcatCtx.fillStyle = 'white';
            starcatCtx.font = '48px Arial';
            starcatCtx.textAlign = 'center';
            starcatCtx.fillText('Game Over!', starcatCanvas.width / 2, starcatCanvas.height / 2);
            starcatCtx.font = '24px Arial';
            starcatCtx.fillText(`Final Score: ${score}`, starcatCanvas.width / 2, starcatCanvas.height / 2 + 50);
            starcatCtx.fillText('Press R to Restart', starcatCanvas.width / 2, starcatCanvas.height / 2 + 90);
            return;
        }

        // Draw spaceship
        starcatCtx.drawImage(loadedImages.spaceship, player.x, player.y, player.width, player.height);

        // Draw hearts
        hearts.forEach(h => starcatCtx.drawImage(loadedImages.heart, h.x, h.y, h.width, h.height));

        // Draw cats
        cats.forEach(c => starcatCtx.drawImage(c.happy ? loadedImages.happyCat : loadedImages.sadCat, c.x, c.y, c.width, c.height));

        // Draw yarn balls
        yarnBalls.forEach(ball => {
            starcatCtx.save();
            starcatCtx.translate(ball.x + ball.width/2, ball.y + ball.height/2);
            starcatCtx.rotate(ball.rotation);
            starcatCtx.drawImage(loadedImages.yarnBall, -ball.width/2, -ball.height/2, ball.width, ball.height);
            starcatCtx.restore();
        });

        drawBoss();

        // Display score
        starcatCtx.fillStyle = "white";
        starcatCtx.font = "20px Arial";
        starcatCtx.textAlign = 'left';
        starcatCtx.fillText(`Score: ${score}`, 10, 30);
    }

    function drawBoss() {
        if (!bossActive) return;

        // Draw boss with correct mouth state
        starcatCtx.save();
        if (boss.hits > 0) {
            // Flash red when hit
            starcatCtx.globalAlpha = 0.8 + Math.sin(Date.now() / 100) * 0.2;
        }
        const bossImage = boss.mouthOpen ? loadedImages.grumpyCatOpen : loadedImages.grumpyCatClosed;
        starcatCtx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);
        starcatCtx.restore();

        // Draw hairballs
        boss.hairballs.forEach(hairball => {
            starcatCtx.save();
            starcatCtx.translate(hairball.x + hairball.width/2, hairball.y + hairball.height/2);
            starcatCtx.rotate(hairball.rotation);
            starcatCtx.drawImage(loadedImages.hairball, -hairball.width/2, -hairball.height/2, hairball.width, hairball.height);
            starcatCtx.restore();
        });

        // Draw boss health bar
        const healthWidth = 200;
        const healthHeight = 20;
        const healthX = (starcatCanvas.width - healthWidth) / 2;
        const healthY = 20;

        // Health bar background
        starcatCtx.fillStyle = '#ff0000';
        starcatCtx.fillRect(healthX, healthY, healthWidth, healthHeight);
        
        // Health bar progress
        starcatCtx.fillStyle = '#00ff00';
        starcatCtx.fillRect(healthX, healthY, healthWidth * (boss.hits / boss.requiredHits), healthHeight);
        
        // Health bar border
        starcatCtx.strokeStyle = '#ffffff';
        starcatCtx.lineWidth = 2;
        starcatCtx.strokeRect(healthX, healthY, healthWidth, healthHeight);
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Load images then start the game
    loadImages(gameLoop);
});
