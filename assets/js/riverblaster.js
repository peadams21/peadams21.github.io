// Ensure the canvas element is found
const canvas = document.getElementById("RiverblasterCanvas");
if (!canvas) {
    console.error("Canvas element with id 'RiverblasterCanvas' not found.");
    alert("Canvas element not found. Please check your HTML file.");
}
const ctx = canvas?.getContext("2d");

if (!ctx) {
    console.error("Failed to get 2D context for the canvas.");
}

// Ensure the init function is called
window.addEventListener('load', () => {
    console.log("Window loaded. Initializing game...");
    init();
});

// Add error handling for image loading
const playerImg = new Image();
playerImg.src = 'images/player.png';
playerImg.onload = () => console.log("Player image loaded successfully.");
playerImg.onerror = () => console.error("Failed to load player image. Check the path: 'images/player.png'");

// Add similar error handling for other images
const fighterImg = new Image();
fighterImg.src = 'images/fighter.png';
fighterImg.onload = () => console.log("Fighter image loaded successfully.");
fighterImg.onerror = () => console.error("Failed to load fighter image. Check the path: 'images/fighter.png'");

const bomberImg = new Image();
bomberImg.src = 'images/bomber.png';
bomberImg.onload = () => console.log("Bomber image loaded successfully.");
bomberImg.onerror = () => console.error("Failed to load bomber image. Check the path: 'images/bomber.png'");

const speedboatImg = new Image();
speedboatImg.src = 'images/speedboat.png';
speedboatImg.onload = () => console.log("Speedboat image loaded successfully.");
speedboatImg.onerror = () => console.error("Failed to load speedboat image. Check the path: 'images/speedboat.png'");

const bulletImg = new Image();
bulletImg.src = 'images/bullet.png';
bulletImg.onload = () => console.log("Bullet image loaded successfully.");
bulletImg.onerror = () => console.error("Failed to load bullet image. Check the path: 'images/bullet.png'");

const powerUpBulletImg = new Image();
powerUpBulletImg.src = 'images/powerup_bullet.png';
powerUpBulletImg.onload = () => console.log("PowerUp Bullet image loaded successfully.");
powerUpBulletImg.onerror = () => console.error("Failed to load PowerUp Bullet image. Check the path: 'images/powerup_bullet.png'");

const powerUpSpeedImg = new Image();
powerUpSpeedImg.src = 'images/powerup_speed.png';
powerUpSpeedImg.onload = () => console.log("PowerUp Speed image loaded successfully.");
powerUpSpeedImg.onerror = () => console.error("Failed to load PowerUp Speed image. Check the path: 'images/powerup_speed.png'");

const fixImg = new Image();
fixImg.src = 'images/fix.png';
fixImg.onload = () => console.log("Fix image loaded successfully.");
fixImg.onerror = () => console.error("Failed to load Fix image. Check the path: 'images/fix.png'");

const explosionImg = new Image();
explosionImg.src = 'images/explosion.png';
explosionImg.onload = () => console.log("Explosion image loaded successfully.");
explosionImg.onerror = () => console.error("Failed to load Explosion image. Check the path: 'images/explosion.png'");

const fuelImg = new Image();
fuelImg.src = 'images/fuel.png';
fuelImg.onload = () => console.log("Fuel image loaded successfully.");
fuelImg.onerror = () => console.error("Failed to load Fuel image. Check the path: 'images/fuel.png'");

const bossImg = new Image();
bossImg.src = 'images/boss.png';
bossImg.onload = () => console.log("Boss image loaded successfully.");
bossImg.onerror = () => console.error("Failed to load Boss image. Check the path: 'images/boss.png'");

const bossBulletImg = new Image();
bossBulletImg.src = 'images/boss_bullet.png';
bossBulletImg.onload = () => console.log("Boss Bullet image loaded successfully.");
bossBulletImg.onerror = () => console.error("Failed to load Boss Bullet image. Check the path: 'images/boss_bullet.png'");

// Add bomber bullet image
const bomberBulletImg = new Image();
bomberBulletImg.src = 'images/bomber_bullet.png';
bomberBulletImg.onload = () => console.log("Bomber Bullet image loaded successfully.");
bomberBulletImg.onerror = () => console.error("Failed to load Bomber Bullet image. Check the path: 'images/bomber_bullet.png'");

// Player object
let player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 80,
    width: 30,
    height: 40,
    speed: 3,
    alive: true
};

// Game state variables
let keys = {};
let obstacles = [];
let bullets = [];
let powerUps = [];
let fuels = [];
let score = 0;
let powerUpActive = false;
let powerUpDuration = 0;
let gameOver = false;
let playerHealth = 100;
let fuelLevel = 100;
let fuelConsumptionRate = 0.02;
let bulletMultiplierActive = false;
let bulletMultiplierDuration = 5000;
let bridgeVisible = false;
let bridgePosition = -500; // Initially off-screen above the player
let animationFrameId = null;
let obstacleInterval;
let powerUpInterval;
let fuelSpawnInterval;
// Game constants
let OBSTACLE_SPAWN_RATE = 1500; // milliseconds
const POWER_UP_SPAWN_RATE = 7000; // milliseconds
const SCORE_PER_OBSTACLE = 10;

// Explosion animation tracking
let explosions = [];

// Water background variables
let waterBackground = {
    offset: 0,
    speed: 1,
    pattern: null,
    riverBanks: true
};

// Level system
let currentLevel = 1;
let enemiesDefeatedThisLevel = 0;
let enemiesRequiredForNextLevel = 10;

function checkLevelProgress() {
    if (enemiesDefeatedThisLevel >= enemiesRequiredForNextLevel) {
        levelUp();
    }
    // Ensure the block is properly closed and no extra braces are left
}

function levelUp() {
    currentLevel++;
    enemiesDefeatedThisLevel = 0;
    enemiesRequiredForNextLevel += 5;
    
    // Show level up message
    displayLevelUpMessage();
    
    // Increase difficulty
    OBSTACLE_SPAWN_RATE = Math.max(800, OBSTACLE_SPAWN_RATE - 100);
    clearInterval(obstacleInterval);
    obstacleInterval = setInterval(spawnObstacle, OBSTACLE_SPAWN_RATE);
    
    // Give player rewards
    playerHealth = Math.min(100, playerHealth + 25);
    fuelLevel = 100;
}

function displayLevelUpMessage() {
    const levelMessage = document.createElement('div');
    levelMessage.textContent = `LEVEL ${currentLevel}!`;
    levelMessage.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: yellow; font-size: 36px; font-family: Arial; text-shadow: 2px 2px 4px #000;';
    document.body.appendChild(levelMessage);
    
    setTimeout(() => {
        document.body.removeChild(levelMessage);
    }, 2000);
}

// Mission system
const missions = [
    { level: 1, description: "Reach the bridge", objectiveType: "distance", target: 1000 },
    { level: 2, description: "Destroy 5 bomber ships", objectiveType: "destroyType", target: 5, enemyType: "bomber" },
    { level: 3, description: "Survive for 60 seconds", objectiveType: "time", target: 60 }
];

let currentMission = 0;
let missionProgress = 0;
let distanceTraveled = 0;
let missionTimer = 0;
let bomberShipsDestroyed = 0;

function updateMission() {
    const mission = missions[currentMission];
    
    switch(mission.objectiveType) {
        case "distance":
            // Update distance progress calculation
            missionProgress = Math.min(1, distanceTraveled / mission.target);
            
            // Show bridge when approaching target
            if (distanceTraveled > mission.target * 0.7 && !bridgeVisible) {
                bridgeVisible = true;
                bridgePosition = -100; // Position bridge above screen
            }
            
            // Move bridge into view
            if (bridgeVisible) {
                bridgePosition += 1;
                
                // IMPORTANT FIX: When bridge is fully visible, set progress to match
                // This ensures progress bar doesn't jump when crossing the bridge
                if (bridgePosition > 0) {
                    // Smoothly increase progress to at least 95% when bridge is visible
                    missionProgress = Math.max(missionProgress, 0.95);
                }
            }
            break;
            
        case "destroyType":
            missionProgress = Math.min(1, bomberShipsDestroyed / mission.target);
            break;
        case "time":
            missionTimer += 1/60; // Assuming 60 FPS
            missionProgress = Math.min(1, missionTimer / mission.target);
            break;
    }
    
    if (missionProgress >= 1) {
        completeMission();
    }
    // Add any missing logic or remove the extra closing brace if unnecessary
}

// Enhanced mission completion visualization
function completeMission() {
    // Prevent duplicate completion of the same mission
    const currentMissionBefore = currentMission;
    
    // Extra points for completing mission
    score += 100 * (currentMission + 1);
    
    // Get the completed mission for reference
    const completedMission = missions[currentMission];
    let color = "#00ff00";
    let message = "MISSION COMPLETE!";
    
    // Mission-specific messages
    switch(completedMission.objectiveType) {
        case "distance":
            color = "#8B4513"; // Brown for bridge
            message = "BRIDGE REACHED!";
            break;
        case "destroyType":
            color = "#cc0000"; // Red for bombers
            message = "ALL BOMBERS DESTROYED!";
            break;
        case "time":
            color = "#ffcc00"; // Yellow for time
            message = "SURVIVAL MISSION COMPLETE!";
            break;
    }
    
    // Display message
    displayMissionComplete(message, color);
    
    // Increment current mission AFTER we've referenced the completed one
    currentMission++;
    missionProgress = 0;
    missionTimer = 0;
    
    // Only spawn boss after the bomber mission (mission index 1)
    if (completedMission.objectiveType === "destroyType") {
        // Spawn boss after bomber mission with a clear delay
        displayMissionComplete("PREPARE FOR BOSS FIGHT!", "#ff0000");
        
        setTimeout(() => {
            console.log("Spawning boss from completeMission");
            spawnBoss();
            // Ensure the boss is visible by forcing a redraw
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        }, 3000);
    }
    
    // Show victory if all missions complete
    if (currentMission >= missions.length) {
        // Add delay before showing victory screen
        setTimeout(() => {
            showVictoryScreen();
        }, 2000);
    }
    
    // Reset bridge for next mission
    bridgeVisible = false;
    bridgePosition = -500;
    
    console.log(`Mission completed: ${currentMissionBefore} → ${currentMission}`);
}

// Updated mission complete function with custom messages
function displayMissionComplete(message = "MISSION COMPLETE!", color = "#00ff00") {
    const missionMessage = document.createElement('div');
    missionMessage.textContent = message;
    missionMessage.style = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${color}; font-size: 36px; font-family: Arial; text-shadow: 2px 2px 4px #000;`;
    document.body.appendChild(missionMessage);
    
    setTimeout(() => {
        document.body.removeChild(missionMessage);
    }, 2000);
}

function drawMissionStatus() {
    if (currentMission >= missions.length) return;
    
    const mission = missions[currentMission];
    const iconSize = 24;
    const iconX = 10;
    const iconY = 35;
    
    // Draw mission icon
    drawMissionIcon(ctx, mission.objectiveType, iconX, iconY, iconSize);
    
    // Draw mission text next to icon
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`Mission: ${mission.description}`, iconX + iconSize + 10, iconY + iconSize/2 + 5);
    
    // Progress bar
    const barX = iconX + iconSize + 10;
    const barY = iconY + iconSize + 5;
    const barWidth = 180;
    const barHeight = 10;
    
    // Background bar
    ctx.fillStyle = "#444";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Progress fill
    let progressColor;
    switch(mission.objectiveType) {
        case "distance":
            progressColor = "#8B4513"; // Brown for bridge
            break;
        case "destroyType":
            progressColor = "#cc0000"; // Red for bombers
            break;
        case "time":
            progressColor = "#ffcc00"; // Yellow for time
            break;
        default:
            progressColor = "#ff0";
    }
    
    ctx.fillStyle = progressColor;
    ctx.fillRect(barX, barY, barWidth * missionProgress, barHeight);
    
    // Progress text
    let progressText = "";
    if (mission.objectiveType === "distance") {
        progressText = `${Math.floor(distanceTraveled)}/${mission.target} distance`;
    } else if (mission.objectiveType === "destroyType") {
        progressText = `${bomberShipsDestroyed}/${mission.target} bombers`;
    } else if (mission.objectiveType === "time") {
        progressText = `${Math.floor(missionTimer)}/${mission.target} seconds`;
    }
    
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(progressText, barX, barY + barHeight + 12);
}

// First, define mission icons as simple canvas drawings
function drawMissionIcon(ctx, type, x, y, size) {
    ctx.save();
    
    switch(type) {
        case "distance":
            // Bridge icon
            ctx.fillStyle = "#8B4513"; // Brown
            ctx.fillRect(x, y + size/3, size, size/3); // Bridge deck
            
            // Bridge arches
            ctx.beginPath();
            ctx.arc(x + size/4, y + size/2, size/4, Math.PI, 0, false);
            ctx.arc(x + 3*size/4, y + size/2, size/4, Math.PI, 0, false);
            ctx.strokeStyle = "#A52A2A";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Water below
            ctx.fillStyle = "#1e5aa8";
            ctx.fillRect(x, y + 2*size/3, size, size/3);
            break;
            
        case "destroyType":
            // Target/explosion icon for bomber
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
            ctx.fillStyle = "#cc0000"; // Red
            ctx.fill();
            
            // Target rings
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.strokeStyle = "#cc0000";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Diagonal lines (crosshairs)
            ctx.beginPath();
            ctx.moveTo(x + size/5, y + size/5);
            ctx.lineTo(x + 4*size/5, y + 4*size/5);
            ctx.moveTo(x + 4*size/5, y + size/5);
            ctx.lineTo(x + size/5, y + 4*size/5);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
            
        case "time":
            // Clock icon
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Clock hands
            ctx.beginPath();
            ctx.moveTo(x + size/2, y + size/2);
            ctx.lineTo(x + size/2, y + size/4);
            ctx.moveTo(x + size/2, y + size/2);
            ctx.lineTo(x + 3*size/4, y + size/2);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Clock center dot
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, 2, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            break;
    }
    
    ctx.restore();
}

function showVictoryScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "gold";
    ctx.font = "40px Arial";
    ctx.fillText("VICTORY!", canvas.width / 2 - 100, canvas.height / 2 - 50);
    
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`You've completed all missions!`, canvas.width / 2 - 140, canvas.height / 2);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 70, canvas.height / 2 + 40);
    ctx.fillText("Press 'R' to Play Again", canvas.width / 2 - 90, canvas.height / 2 + 80);
}

function updatePlayerMovement() {
    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys["ArrowUp"] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys["ArrowDown"] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

function fireBullet() {
    if (!bulletMultiplierActive) {
        // Regular single bullet
        bullets.push({
            x: player.x + player.width / 2 - 5,
            y: player.y,
            width: 10,
            height: 20,
            speed: 5
        });
    } else {
        // Enhanced bullet patterns based on level
        switch(bulletMultiplierLevel) {
            case 2: // Dual fire (level 2)
                bullets.push({ x: player.x - 5, y: player.y, width: 10, height: 20, speed: 5 });
                bullets.push({ x: player.x + player.width - 5, y: player.y, width: 10, height: 20, speed: 5 });
                break;
                
            case 3: // Triple fire (level 3) - wider spread
                bullets.push({ x: player.x - 10, y: player.y, width: 10, height: 20, speed: 5 });
                bullets.push({ x: player.x + player.width/2 - 5, y: player.y - 10, width: 10, height: 20, speed: 5.5 }); // Center bullet slightly faster
                bullets.push({ x: player.x + player.width, y: player.y, width: 10, height: 20, speed: 5 });
                break;
                
            default: // Fallback to dual fire
                bullets.push({ x: player.x - 5, y: player.y, width: 10, height: 20, speed: 5 });
                bullets.push({ x: player.x + player.width - 5, y: player.y, width: 10, height: 20, speed: 5 });
        }
    }
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function spawnFuel() {
    fuels.push({
        x: Math.random() * (canvas.width - 30),
        y: 0,
        width: 30,
        height: 30
    });
}

function updateFuels() {
    fuels.forEach((fuel, index) => {
        fuel.y += 2;
        if (fuel.y > canvas.height) {
            fuels.splice(index, 1);
        }
        if (fuel.y < player.y + player.height && fuel.y + fuel.height > player.y &&
            fuel.x < player.x + player.width && fuel.x + fuel.width > player.x) {
            fuelLevel += 20;
            if (fuelLevel > 100) fuelLevel = 100;
            fuels.splice(index, 1);
        }
    });
}

function drawFuels() {
    fuels.forEach(fuel => {
        ctx.drawImage(fuelImg, fuel.x, fuel.y, fuel.width, fuel.height);
    });
}

function drawFuelGauge() {
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.fillStyle = "green";
    ctx.fillRect(0, canvas.height - 30, (fuelLevel / 100) * canvas.width, 30);
    ctx.fillStyle = "white";
    ctx.fillText(`Fuel: ${Math.round(fuelLevel)}%`, 10, canvas.height - 10);
}

// Spawn obstacles at regular intervals
function spawnObstacle() {
    if (gameOver) return;
    
    const enemyTypes = updateSpriteDimensions();
    
    // Modify enemy pool based on game progress and current mission
    let enemyPool = [0]; // Default to fighter
    
    // Higher levels have chance for tougher enemies
    if (currentLevel >= 2) enemyPool.push(0, 2); // Add speedboats
    
    // Add more bomber planes after passing the bridge (after first mission)
    if (currentLevel >= 3 || currentMission >= 1) {
        // Add bombers - with more weight if we're past the bridge
        enemyPool.push(1); // Add bombers
        
        if (currentMission >= 1) {
            // Add even more bombers after bridge mission
            enemyPool.push(1, 1); // Triple the bomber chance
        }
    }
    
    const selectedTypeIndex = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    const selectedType = enemyTypes[selectedTypeIndex];
    
    // Calculate river boundaries
    const leftBankWidth = (canvas.width - riverWidth) / 2;
    const rightBankBoundary = canvas.width - leftBankWidth;
    
    // Default spawn area
    let minX = 0;
    let maxX = canvas.width - selectedType.width;
    
    // If it's a boat (not airborne), strictly restrict to river area
    if (!selectedType.isAirborne) {
        minX = leftBankWidth + 15; // Add padding to avoid touching the bank
        maxX = rightBankBoundary - selectedType.width - 15;
    }
    
    obstacles.push({
        x: minX + Math.random() * (maxX - minX),
        y: -50,
        width: selectedType.width,
        height: selectedType.height,
        speed: selectedType.speed * (1 + (currentLevel - 1) * 0.1),
        health: selectedType.health,
        type: selectedType.type,
        points: selectedType.points,
        isAirborne: selectedType.isAirborne
    });
}

// Increase bullet powerup chance from 70% to 85%
function spawnPowerUp() {
    if (gameOver) return;
    
    // Increase bullet powerup chance from 85% to 95%
    // This means 95% chance for bullet powerup, 5% for speed boost
    const type = Math.random() > 0.05 ? "bulletMultiplier" : "speedBoost";
    
    powerUps.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 1.5,
        type: type
    });
}

// Add repair kits (fix powerups) to game state
let repairKits = [];

// Add repair kit spawn function
function spawnRepairKit() {
    if (gameOver || Math.random() > 0.3) return; // 30% chance to spawn repair kit
    
    // Calculate river boundaries for proper placement
    const leftBankWidth = (canvas.width - riverWidth) / 2;
    const rightBankBoundary = canvas.width - leftBankWidth;
    
    repairKits.push({
        x: leftBankWidth + 20 + Math.random() * (riverWidth - 60), // Keep within river, away from banks
        y: -30,
        width: 40, // Slightly smaller than before (was too fat)
        height: 40,
        speed: 1.5 * GAME_SPEED
    });
}

// Have a chance to spawn repair kit when enemies are destroyed
function trySpawnRepairKit(x, y) {
    if (Math.random() < 0.15) { // 15% chance
        repairKits.push({
            x: x,
            y: y,
            width: 30,
            height: 30,
            speed: 1.5
        });
    }
}

// Update repair kits
function updateRepairKits() {
    repairKits.forEach((kit, index) => {
        kit.y += kit.speed;
        
        // Remove kits that go off-screen
        if (kit.y > canvas.height) {
            repairKits.splice(index, 1);
            return;
        }
        
        // Check for collision with player
        if (checkCollision(player, kit)) {
            // Heal player
            playerHealth = Math.min(100, playerHealth + 30);
            
            // Add score bonus
            score += 25;
            
            // Add visual and sound feedback
            createSmallExplosion(kit.x + kit.width/2, kit.y + kit.height/2, "#00ff00");
            
            // Remove the kit
            repairKits.splice(index, 1);
        }
    });
}

// Draw repair kits
function drawRepairKits() {
    repairKits.forEach(kit => {
        ctx.drawImage(fixImg, kit.x, kit.y, kit.width, kit.height);
    });
}

// Fix the updateObstacles function to properly handle collisions
function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        // Regular movement
        if (!obstacle.isFalling) {
            obstacle.y += obstacle.speed;

            // Keep boats within river boundaries
            if (!obstacle.isAirborne && obstacle.type === "speedboat") {
                // Calculate river boundaries
                const leftBankWidth = (canvas.width - riverWidth) / 2;
                const rightBankWidth = leftBankWidth;
                const rightBankBoundary = canvas.width - rightBankWidth;

                // Keep speedboats in water
                if (obstacle.x < leftBankWidth + 15) {
                    obstacle.x = leftBankWidth + 15;
                }
                if (obstacle.x + obstacle.width > rightBankBoundary - 15) {
                    obstacle.x = rightBankBoundary - obstacle.width - 15;
                }
            }
            
            // Allow bombers to shoot regular bullets (only if not falling/damaged)
            if (obstacle.type === "bomber") {
                // Initialize shoot timer if not present
                if (obstacle.shootTimer === undefined) {
                    obstacle.shootTimer = 0;
                    obstacle.shootInterval = 120; // Shoot every ~2 seconds at 60fps
                }
                
                // Increment timer and check if it's time to shoot
                obstacle.shootTimer++;
                if (obstacle.shootTimer >= obstacle.shootInterval) {
                    // Reset timer
                    obstacle.shootTimer = 0;
                    
                    // Create two bullets from bomber using bomber bullet image
                    bomberBullets.push({
                        x: obstacle.x + obstacle.width/3 - 8,
                        y: obstacle.y + obstacle.height,
                        width: 16,
                        height: 25,
                        speed: 2,
                        explosionRadius: 40,
                        damage: 15
                    });
                    
                    bomberBullets.push({
                        x: obstacle.x + 2*obstacle.width/3 - 8,
                        y: obstacle.y + obstacle.height,
                        width: 16,
                        height: 25,
                        speed: 2,
                        explosionRadius: 40,
                        damage: 15
                    });
                }
            }
            
            // Check for collision with player
            if (player.alive && checkCollision(player, obstacle)) {
                console.log(`Collision with ${obstacle.type}! Reducing player health.`);
                playerHealth -= 25; // Reduce player health by 25
                createExplosion(obstacle.x, obstacle.y); // Create explosion at obstacle's position
                obstacles.splice(index, 1); // Remove the obstacle

                // Ensure health never goes below 0
                if (playerHealth <= 0) {
                    console.log("Player health reached 0 in obstacle collision");
                    playerHealth = 0; // Clamp health to 0
                    gameOver = true; // Set game over state
                    player.alive = false; // Mark player as not alive
                    createExplosion(player.x, player.y); // Create explosion at player's position
                    
                    // Force draw of game over screen on next frame
                    setTimeout(() => {
                        drawGameOver();
                    }, 10);
                }
                
                // Early return to avoid further processing of this obstacle
                return;
            }

            // Check for collision with bullets - FIX FOR ISSUE #1
            bullets.forEach((bullet, bulletIndex) => {
                if (checkCollision(bullet, obstacle)) {
                    obstacle.health--;
                    bullets.splice(bulletIndex, 1);

                    // Create proper explosion at bullet impact point using explosion.png
                    createExplosion(bullet.x, bullet.y, 30); // Smaller explosion for bullet impact

                    if (obstacle.health <= 0) {
                        // For airborne enemies, start falling animation
                        if (obstacle.isAirborne) {
                            obstacle.isFalling = true;
                            obstacle.fallSpeed = 1;
                            obstacle.rotation = 0;
                            obstacle.rotationSpeed = (Math.random() - 0.5) * 0.2;

                            // Move shadow effect to obstacle itself
                            if (!obstacle.shadow) {
                                obstacle.shadow = {
                                    width: obstacle.width * 0.8,
                                    height: 10,
                                    opacity: 0.4,
                                    offset: 70
                                };
                            }
                        }
                        // Non-airborne enemies explode immediately
                        else {
                            createExplosion(obstacle.x, obstacle.y);

                            // Chance to spawn repair kit
                            trySpawnRepairKit(obstacle.x, obstacle.y);

                            obstacles.splice(index, 1);
                            score += obstacle.points || SCORE_PER_OBSTACLE;
                            enemiesDefeatedThisLevel++;
                            checkLevelProgress();
                        }
                    }
                }
            });
        } 
        // Falling animation for planes
        else {
            // Increase falling speed
            obstacle.fallSpeed += 0.1;

            // Move downward faster while falling
            obstacle.y += obstacle.fallSpeed;

            // Add some rotation during falling
            obstacle.rotation += obstacle.rotationSpeed;

            // Reduce shadow as plane falls (shadow becomes larger but fainter)
            if (obstacle.shadow) {
                obstacle.shadow.width += 0.2;
                obstacle.shadow.opacity -= 0.01;
            
                // If shadow fades away completely, create explosion and remove
                if (obstacle.shadow.opacity <= 0) {
                    createExplosion(obstacle.x, obstacle.y);

                    // Track bomber ships for mission
                    if (obstacle.type === "bomber") {
                        bomberShipsDestroyed++;
                    }

                    // Chance to spawn repair kit
                    trySpawnRepairKit(obstacle.x, obstacle.y);

                    // Remove the obstacle
                    obstacles.splice(index, 1);

                    // Update score and level
                    score += obstacle.points || SCORE_PER_OBSTACLE;
                    enemiesDefeatedThisLevel++;
                    checkLevelProgress();
                }
            } else {
                // If shadow is missing for some reason, default to removing after some distance
                if (obstacle.fallDistance === undefined) {
                    obstacle.fallDistance = 0;
                }
                obstacle.fallDistance += obstacle.fallSpeed;
                
                // Remove after falling a certain distance
                if (obstacle.fallDistance > 200) {
                    createExplosion(obstacle.x, obstacle.y);
                    obstacles.splice(index, 1);
                    score += obstacle.points || SCORE_PER_OBSTACLE;
                    enemiesDefeatedThisLevel++;
                    checkLevelProgress();
                }
            }
        }

        // Remove obstacles that go off-screen
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            return;
        }
    });
}

// Add function to update bomber bullets
function updateBomberBullets() {
    bomberBullets.forEach((bullet, index) => {
        bullet.y += bullet.speed;
        
        // Remove bullets that go off-screen
        if (bullet.y > canvas.height) {
            bomberBullets.splice(index, 1);
            return;
        }
        
        // Check for direct collision with player
        if (checkCollision(player, bullet) && player.alive) {
            // Bomber bullets do full damage on direct hit
            playerHealth -= bullet.damage || 15;
            
            // Create explosion at impact
            createExplosion(bullet.x, bullet.y);
            bomberBullets.splice(index, 1);
            
            // Visual feedback
            createSmallExplosion(player.x + player.width/2, player.y + player.height/2, "#ff3333");
            
            // Check for player death
            if (playerHealth <= 0) {
                console.log("Player killed by bomber bullet");
                playerHealth = 0; // Clamp health to 0
                gameOver = true;
                player.alive = false;
                createExplosion(player.x, player.y);
                
                setTimeout(() => {
                    drawGameOver();
                }, 10);
            }
            return;
        }
        
        // Check for proximity explosion (if the player is near but not directly hit)
        const dx = player.x + player.width/2 - (bullet.x + bullet.width/2);
        const dy = player.y + player.height/2 - (bullet.y + bullet.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (bullet.explosionRadius + player.width/2) && player.alive) {
            // Calculate damage based on proximity (closer = more damage)
            const proximityDamage = Math.max(5, Math.floor((bullet.damage || 15) * (1 - distance/(bullet.explosionRadius + player.width/2))));
            playerHealth -= proximityDamage;
            
            // Create explosion at bullet position
            createExplosion(bullet.x, bullet.y);
            bomberBullets.splice(index, 1);
            
            // Visual feedback showing the damage was less than full
            createSmallExplosion(player.x + player.width/2, player.y + player.height/2, "#ff9933");
            
            // Check for player death
            if (playerHealth <= 0) {
                console.log("Player killed by bomber bullet explosion");
                playerHealth = 0;
                gameOver = true;
                player.alive = false;
                createExplosion(player.x, player.y);
                
                setTimeout(() => {
                    drawGameOver();
                }, 10);
            }
            return;
        }
    });
}

// Add function to draw bomber bullets
function drawBomberBullets() {
    bomberBullets.forEach(bullet => {
        // Use bomber bullet image if loaded, otherwise fall back to boss bullet or regular bullet
        const img = bomberBulletImg.complete ? bomberBulletImg : 
                  (bossBulletImg.complete ? bossBulletImg : bulletImg);
        ctx.drawImage(img, bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Fix updatePowerUps to avoid DOM manipulation and properly handle bullet powerups
function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.speed;
        
        // Remove power-ups that go off-screen
        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
            return;
        }
        
        // Check for collision with player
        if (checkCollision(player, powerUp)) {
            if (powerUp.type === "bulletMultiplier") {
                // Increase bullet multiplier level when collecting another one
                if (bulletMultiplierActive) {
                    // Increment the level, up to a maximum of 3
                    bulletMultiplierLevel = Math.min(3, bulletMultiplierLevel + 1);
                    
                    // Visual feedback for stacking
                    createSmallExplosion(player.x + player.width/2, player.y - 10, "#ffff00");
                } else {
                    // First bullet powerup, just activate it
                    bulletMultiplierLevel = 2;
                    bulletMultiplierActive = true;
                }
                
                // Reset the timer regardless if it's the first or a stacked powerup
                if (window.bulletMultiplierTimer) {
                    clearTimeout(window.bulletMultiplierTimer);
                }
                
                // Store timer ID safely
                // Increase duration from 5000 to 7000 (40% longer)
                bulletMultiplierDuration = 7000;
                window.bulletMultiplierTimer = setTimeout(() => {
                    bulletMultiplierActive = false;
                    bulletMultiplierLevel = 1; // Reset level when powerup ends
                }, bulletMultiplierDuration);
                
                // Display feedback using the safer canvas-based approach
                const levelMessages = ["", "", "DUAL FIRE", "TRIPLE FIRE"];
                displayPowerUpMessage(levelMessages[bulletMultiplierLevel]);
                
            } else if (powerUp.type === "speedBoost") {
                // Store original speed to ensure proper reset
                if (!player.originalSpeed) {
                    player.originalSpeed = player.speed;
                }
                
                // Apply speed boost
                player.speed = 5;
                
                // Clear any existing timer
                if (window.speedBoostTimer) {
                    clearTimeout(window.speedBoostTimer);
                }
                
                // Set new timer and store ID safely
                window.speedBoostTimer = setTimeout(() => {
                    player.speed = player.originalSpeed || 3;
                }, 5000);
                
                // Display feedback
                displayPowerUpMessage("SPEED BOOST");
            }
            
            // Remove the power-up after collection
            powerUps.splice(index, 1);
        }
    });
}

// Create explosion effect
function createExplosion(x, y, size = 50) {
    explosions.push({
        x: x - size/2,  // Center the explosion on the x coordinate
        y: y - size/2,  // Center the explosion on the y coordinate
        width: size,
        height: size,
        frame: 0,
        maxFrames: 10,
        useImage: true  // Explicitly flag to use the explosion.png image
    });
}

// Add smaller explosion effect for boss visual feedback
function createSmallExplosion(x, y, color = "#ff6600") {
    explosions.push({
        x: x - 10,
        y: y - 10,
        width: 20,
        height: 20,
        frame: 0,
        maxFrames: 5,
        color: color
    });
}

// Update explosion animations
function updateExplosions() {
    explosions.forEach((explosion, index) => {
        explosion.frame++;
        if (explosion.frame >= explosion.maxFrames) {
            explosions.splice(index, 1);
        }
    });
}

// Enhanced collision detection function for better accuracy
function checkCollision(obj1, obj2) {
    // Add 10% margin reduction to make hitboxes slightly smaller than visual elements
    // This makes the collision feel more natural as most sprites have some padding
    const margin = 0.1;
    
    const obj1X = obj1.x + obj1.width * margin;
    const obj1Y = obj1.y + obj1.height * margin;
    const obj1Width = obj1.width * (1 - 2 * margin);
    const obj1Height = obj1.height * (1 - 2 * margin);
    
    const obj2X = obj2.x + obj2.width * margin;
    const obj2Y = obj2.y + obj2.height * margin;
    const obj2Width = obj2.width * (1 - 2 * margin);
    const obj2Height = obj2.height * (1 - 2 * margin);
    
    return obj1X < obj2X + obj2Width &&
           obj1X + obj1Width > obj2X &&
           obj1Y < obj2Y + obj2Height &&
           obj1Y + obj1Height > obj2Y;
}

// Draw player
function drawPlayer() {
    if (player.alive) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    }
}

// Modify drawObstacles function to use different colors based on enemy type
function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.isFalling && obstacle.isAirborne) {
            // Draw falling airborne object with rotation
            ctx.save();
            ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            ctx.rotate(obstacle.rotation);
            
            switch(obstacle.type) {
                case "bomber":
                    ctx.drawImage(bomberImg, -obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height);
                    break;
                default: // fighter
                    ctx.drawImage(fighterImg, -obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height);
                    break;
            }
            ctx.restore();
        }
        else {
            // Draw normal objects
            switch(obstacle.type) {
                case "bomber":
                    ctx.drawImage(bomberImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
                case "speedboat":
                    ctx.drawImage(speedboatImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
                default: // fighter
                    ctx.drawImage(fighterImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
            }
        }
    });
}

// Draw bullets
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Draw power-ups
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        if (powerUp.type === "bulletMultiplier") {
            ctx.drawImage(powerUpBulletImg, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        } else {
            ctx.drawImage(powerUpSpeedImg, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        }
    });
}

// Draw explosions
function drawExplosions() {
    explosions.forEach(explosion => {
        // If it's a small colored explosion
        if (explosion.color) {
            ctx.fillStyle = explosion.color;
            const size = explosion.width * (1 - explosion.frame / explosion.maxFrames);
            ctx.beginPath();
            ctx.arc(
                explosion.x + explosion.width/2,
                explosion.y + explosion.height/2,
                size/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        } else {
            // Regular explosion using image
            ctx.drawImage(
                explosionImg, 
                0, 0, 
                explosionImg.width, explosionImg.height, 
                explosion.x, explosion.y, 
                explosion.width, explosion.height
            );
        }
    });
}

// Draw score and health
function drawUI() {
    // Score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, canvas.width - 120, 30);
    
    // Health bar
    ctx.fillStyle = "red";
    ctx.fillRect(10, 10, 100, 20);
    ctx.fillStyle = "green";
    ctx.fillRect(10, 10, playerHealth, 20);
    ctx.strokeStyle = "white";
    ctx.strokeRect(10, 10, 100, 20);
    ctx.fillStyle = "white";
    ctx.fillText("Health", 120, 25);

    // Level indicator
    ctx.fillStyle = "yellow";
    ctx.fillText(`Level: ${currentLevel}`, canvas.width - 120, 60);

    // Mission status
    drawMissionStatus();
}

// Create a simpler water pattern with subtle details
function createWaterPattern() {
    // Create an offscreen canvas for the water pattern
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 100;
    patternCanvas.height = 200; // Increased height for better scrolling
    const patternCtx = patternCanvas.getContext('2d');
    
    // Draw water pattern with a simpler design
    patternCtx.fillStyle = '#1e5aa8'; // Medium blue base
    patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
    
    // Add subtle horizontal lines for water flow
    patternCtx.fillStyle = '#1a4e94'; // Slightly darker blue
    for (let y = 0; y < patternCanvas.height; y += 15) {
        patternCtx.fillRect(0, y, patternCanvas.width, 3);
    }
    
    // Add just a few highlights for subtle texture
    patternCtx.fillStyle = '#2e6ab8'; // Slightly lighter blue
    for (let i = 0; i < 15; i++) { // Reduced number of highlights
        const x = Math.random() * patternCanvas.width;
        const y = Math.random() * patternCanvas.height;
        const size = 1 + Math.random() * 2; // Smaller highlights
        patternCtx.beginPath();
        patternCtx.arc(x, y, size, 0, Math.PI * 2);
        patternCtx.fill();
    }
    
    // Create the repeating pattern
    return ctx.createPattern(patternCanvas, 'repeat');
}

// River width changes with narrow passages
let riverWidth = canvas.width - 120; // Default width
let targetRiverWidth = riverWidth;
let narrowPassageActive = false;

function updateRiverBanks() {
    // Change river width gradually
    if (Math.random() < 0.005 && !narrowPassageActive) {
        narrowPassageActive = true;
        targetRiverWidth = Math.max(200, riverWidth - 100 - Math.random() * 100);
        setTimeout(() => {
            narrowPassageActive = false;
            targetRiverWidth = canvas.width - 120;
        }, 5000);
    }
    
    // Smooth transition
    riverWidth = riverWidth * 0.98 + targetRiverWidth * 0.02;
}

function drawRiverBanks() {
    const leftBankWidth = (canvas.width - riverWidth) / 2;
    const rightBankWidth = leftBankWidth;
    
    // Left bank
    ctx.fillStyle = '#2d5d2a';
    ctx.fillRect(0, 0, leftBankWidth, canvas.height);
    
    // Right bank
    ctx.fillRect(canvas.width - rightBankWidth, 0, rightBankWidth, canvas.height);
    
    // Add minimal detail to banks
    ctx.fillStyle = '#3a7a36';
    for (let y = 0; y < canvas.height; y += 60) {
        ctx.fillRect(10, y, leftBankWidth - 20, 30);
        ctx.fillRect(canvas.width - rightBankWidth + 10, y + 30, rightBankWidth - 20, 30);
    }
}

// Draw the water background with fix for top rendering
function drawWaterBackground() {
    // Update water scroll position
    waterBackground.offset += waterBackground.speed;
    if (waterBackground.offset > 200) { // Match the pattern height
        waterBackground.offset = 0;
    }
    
    // If pattern doesn't exist, create it
    if (!waterBackground.pattern) {
        waterBackground.pattern = createWaterPattern();
    }
    
    // Save context state
    ctx.save();
    
    // Apply scroll transform to pattern
    // Offset by -200 to ensure the top of the canvas always has pattern visible
    ctx.translate(0, waterBackground.offset - 200);
    
    // Fill canvas with water pattern and extend beyond canvas boundaries
    ctx.fillStyle = waterBackground.pattern;
    // Draw larger than canvas to ensure complete coverage
    ctx.fillRect(0, -200, canvas.width, canvas.height + 400);
    
    // Restore context state
    ctx.restore();
    
    // Draw river banks if enabled
    if (waterBackground.riverBanks) {
        drawRiverBanks();
    }
}

// Add this function to draw the bridge
function drawBridge() {
    if (!bridgeVisible) return;
    
    const bridgeWidth = riverWidth * 0.8;
    const leftEdge = (canvas.width - bridgeWidth) / 2;
    
    // Draw bridge structure
    ctx.fillStyle = "#8B4513"; // Brown for wooden bridge
    
    // Bridge deck
    ctx.fillRect(leftEdge, bridgePosition, bridgeWidth, 30);
    
    // Bridge railings
    ctx.fillStyle = "#A52A2A"; // Darker brown for railings
    ctx.fillRect(leftEdge, bridgePosition - 10, bridgeWidth, 5);
    ctx.fillRect(leftEdge, bridgePosition + 30, bridgeWidth, 5);
    
    // Bridge supports
    const supportWidth = 15;
    const numSupports = 5;
    const supportSpacing = bridgeWidth / (numSupports - 1);
    
    for (let i = 0; i < numSupports; i++) {
        ctx.fillRect(leftEdge + i * supportSpacing - supportWidth/2, bridgePosition - 20, supportWidth, 20);
        ctx.fillRect(leftEdge + i * supportSpacing - supportWidth/2, bridgePosition + 30, supportWidth, 20);
    }
    
    // Check if player has PASSED the bridge (not just reached it)
    // This ensures the player must cross the bridge to complete the mission
    if (player.y < bridgePosition && bridgePosition > 0 && player.y > 0) {
        // Player has crossed the bridge - set progress to 100%
        missionProgress = 1;
        // Force mission completion right away
        completeMission();
        // Make bridge invisible after crossing to prevent repeatedly triggering mission completion
        bridgeVisible = false;
    }
}

// Make sure to call init() at the beginning
window.addEventListener('load', init);

let isBossFight = false;
let bossHealth = 0;
let bossMaxHealth = 0;
let boss = null;

function spawnBoss() {
    isBossFight = true;
    bossMaxHealth = 20 + currentLevel * 10;
    bossHealth = bossMaxHealth;
    
    // Ensure the boss is properly positioned and visible with proper dimensions
    boss = {
        x: canvas.width / 2 - 75,
        y: 50,
        width: 150,
        height: 150,
        phase: 1,
        attackTimer: 0,
        attackInterval: 90, // Start slower (90 frames between attacks)
        bullets: [],
        attackPattern: 1, // Start with single bullet pattern
        phaseChangeHealth: bossMaxHealth * 0.7, // First phase change at 70% health
        visible: true // Add explicit visibility flag
    };
    
    // Check if image is loaded, and reload if needed
    if (!bossImg.complete) {
        console.log("Boss image not loaded, reloading...");
        bossImg.src = 'images/boss.png';
    }
    
    // Debug confirmation
    console.log("Boss spawned:", boss);
    
    // Display boss introduction
    displayBossWarning();
}

// Fix updateBoss function to ensure game over is set properly when health reaches zero
function updateBoss() {
    if (!boss) return;
    
    // Boss movement
    if (boss.phase === 1) {
        // Phase 1: Gentle side to side movement
        boss.x += Math.sin(Date.now() / 1200) * 1.5;
    } else if (boss.phase === 2) {
        // Phase 2: Faster side to side with slight vertical movement
        boss.x += Math.sin(Date.now() / 1000) * 2;
        boss.y = 50 + Math.sin(Date.now() / 1500) * 20;
    } else if (boss.phase === 3) {
        // Phase 3: Aggressive approach and faster movement
        boss.y = 50 + Math.sin(Date.now() / 800) * 30;
        boss.x += (player.x - boss.x) * 0.01; // Slowly follow player
    }
    
    // Keep boss in bounds
    boss.x = Math.max(60, Math.min(canvas.width - 60 - boss.width, boss.x));
    
    // Boss attacks
    boss.attackTimer++;
    if (boss.attackTimer >= boss.attackInterval) {
        bossFire();
        boss.attackTimer = 0;
    }
    
    // Update boss bullets
    boss.bullets.forEach((bullet, index) => {
        bullet.y += bullet.speed;
        
        // Remove bullets that go off-screen
        if (bullet.y > canvas.height) {
            boss.bullets.splice(index, 1);
            return;
        }
        
        // Check for collision with player
        if (checkCollision(bullet, player) && player.alive) {
            playerHealth -= 10;
            boss.bullets.splice(index, 1);
            
            // Create small explosion at impact point
            createSmallExplosion(
                bullet.x + bullet.width/2, 
                player.y, 
                "#ff0000"
            );
            
            // Ensure health is never negative
            if (playerHealth <= 0) {
                console.log("Player health reached 0 from boss bullet");
                playerHealth = 0; // Clamp health to 0
                gameOver = true;
                player.alive = false;
                
                // Create larger explosion when player is killed
                createExplosion(player.x, player.y);
                
                // Cancel any existing animation frame
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                
                // Immediately draw the game over screen
                drawGameOver();
                return;
            }
        }
    });
    
    // Check for player bullets hitting boss
    bullets.forEach((bullet, index) => {
        if (checkCollision(bullet, boss)) {
            bossHealth--;
            bullets.splice(index, 1);
            
            // Visual feedback
            createSmallExplosion(bullet.x, bullet.y);
            
            // Phase transitions happen at health thresholds
            if (bossHealth <= boss.phaseChangeHealth && boss.phase === 1) {
                boss.phase = 2;
                boss.attackInterval = 70; // Slightly faster attacks
                boss.phaseChangeHealth = bossMaxHealth * 0.4; // Next phase at 40% health
                boss.attackPattern = 2; // Double bullets
                
                // Visual indication of phase change
                createSmallExplosion(boss.x + boss.width/2, boss.y + boss.height/2, "#ff0000");
            }
            else if (bossHealth <= boss.phaseChangeHealth && boss.phase === 2) {
                boss.phase = 3;
                boss.attackInterval = 50; // Even faster attacks
                boss.attackPattern = 3; // Triple bullets
                
                // Visual indication of phase change
                createSmallExplosion(boss.x + boss.width/4, boss.y + boss.height/2, "#ff0000");
                createSmallExplosion(boss.x + 3*boss.width/4, boss.y + boss.height/2, "#ff0000");
            }
            
            // Boss defeated
            if (bossHealth <= 0) {
                createExplosion(boss.x + boss.width/2, boss.y + boss.height/2);
                createExplosion(boss.x + boss.width/4, boss.y + boss.height/4);
                createExplosion(boss.x + 3*boss.width/4, boss.y + 3*boss.height/4);
                
                // Big score bonus
                score += 500;
                
                // Move to next level
                levelUp();
                
                // End boss fight
                isBossFight = false;
                boss = null;
            }
        }
    });
}

function bossFire() {
    switch(boss.attackPattern) {
        case 1: // Phase 1: Single bullet
            boss.bullets.push({
                x: boss.x + boss.width/2 - 5,
                y: boss.y + boss.height,
                width: 10,
                height: 20,
                speed: 3
            });
            break;
            
        case 2: // Phase 2: Double bullets
            boss.bullets.push({
                x: boss.x + boss.width/3 - 5,
                y: boss.y + boss.height,
                width: 10,
                height: 20,
                speed: 3
            });
            boss.bullets.push({
                x: boss.x + 2*boss.width/3 - 5,
                y: boss.y + boss.height,
                width: 10,
                height: 20,
                speed: 3
            });
            break;
            
        case 3: // Phase 3: Triple bullets
            boss.bullets.push({
                x: boss.x + boss.width/4 - 5,
                y: boss.y + boss.height,
                width: 10,
                height: 20,
                speed: 3
            });
            boss.bullets.push({
                x: boss.x + boss.width/2 - 5,
                y: boss.y + boss.height,
                width: 10,
                height: 20,
                speed: 3.5
            });
            boss.bullets.push({
                x: boss.x + 3*boss.width/4 - 5,
                y: boss.y + boss.height,
                width: 10,
                height: 20,
                speed: 3
            });
            break;
            
        case 4: // Only reached in final moments - spread shot
            for (let i = -2; i <= 2; i++) { // Add the increment operation (i++)
                boss.bullets.push({
                    x: boss.x + boss.width / 2 - 5 + i * 20,
                    y: boss.y + boss.height,
                    width: 10,
                    height: 20,
                    speed: 3 + Math.abs(i) * 0.3 // Less speed variation
                });
            }
            break;
    }
    
    // Very small chance for special attack when in phase 3 and low health
    if (boss.phase === 3 && bossHealth < boss.phaseChangeHealth * 0.5 && Math.random() < 0.1) {
        boss.attackPattern = 4; // Temporary use of spread shot
        setTimeout(() => {
            boss.attackPattern = 3; // Return to normal pattern
        }, 1000);
    }
}

function drawBoss() {
    if (!boss) return;
    
    // Debug info to ensure we're trying to draw the boss
    console.log("Drawing boss at:", boss.x, boss.y);
    
    // Draw boss sprite (with fallback rectangle if image isn't available)
    if (bossImg && bossImg.complete) {
        ctx.drawImage(bossImg, boss.x, boss.y, boss.width, boss.height);
    } else {
        // Fallback rendering if image isn't available
        ctx.fillStyle = "red";
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        
        // Add visual indication that this is the boss
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("BOSS", boss.x + boss.width/2 - 30, boss.y + boss.height/2);
    }
    
    // Draw boss health bar
    const barWidth = 200;
    ctx.fillStyle = "#444";
    ctx.fillRect(canvas.width/2 - barWidth/2, 20, barWidth, 15);
    ctx.fillStyle = "#f00";
    ctx.fillRect(canvas.width/2 - barWidth/2, 20, barWidth * (bossHealth / bossMaxHealth), 15);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(canvas.width/2 - barWidth/2, 20, barWidth, 15);
    
    // Draw boss bullets
    boss.bullets.forEach(bullet => {
        ctx.drawImage(bossBulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

let activeEffects = [];

function updatePowerUpEffects() {
    // Update power-up timers and visual effects
    activeEffects = activeEffects.filter(effect => {
        effect.timeLeft--;
        return effect.timeLeft > 0;
    });
}

function addPowerUpEffect(type, duration) {
    activeEffects.push({
        type: type,
        timeLeft: duration,
    });
}

function drawPowerUpEffects() {
    // Draw active power-up indicators
    let y = 90;
    activeEffects.forEach(effect => {
        const timePercent = effect.timeLeft / effect.initialDuration;
        ctx.fillStyle = effect.type === "bulletMultiplier" ? "#ffcc00" : "#00ffcc";
        ctx.fillRect(10, y, 100 * timePercent, 15);
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(10, y, 100, 15);
        ctx.fillStyle = "#fff";
        ctx.fillText(effect.type === "bulletMultiplier" ? "Dual Fire" : "Speed Boost", 120, y + 12);
        y += 25;
    });
}

const achievements = [
    { id: "firstBlood", name: "First Blood", description: "Destroy your first enemy", achieved: false },
    { id: "sharpshooter", name: "Sharpshooter", description: "Destroy 5 enemies without missing", achieved: false },
    { id: "fuelEfficient", name: "Fuel Efficient", description: "Travel 1000 distance without collecting fuel", achieved: false },
    { id: "survivor", name: "Survivor", description: "Survive with less than 10% health", achieved: false },
    { id: "bossBuster", name: "Boss Buster", description: "Defeat a boss without taking damage", achieved: false }
];

let gameStats = {
    highScore: 0,
    totalEnemiesDestroyed: 0,
    totalDistanceTraveled: 0,
    accuracy: 0,
    bulletsFired: 0,
    bulletsHit: 0,
    timePlayed: 0
};

function updateAchievements() {
    // Check for achievements based on game state
    if (gameStats.totalEnemiesDestroyed >= 1 && !achievements[0].achieved) {
        unlockAchievement("firstBlood");
    }
    
    if (playerHealth <= 10 && !gameOver && !achievements[3].achieved) {
        unlockAchievement("survivor");
    }
    
    // etc. for other achievements
}

function unlockAchievement(id) {
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.achieved) {
        achievement.achieved = true;
        
        // Display notification
        displayAchievement(achievement);
    }
}

function displayAchievement(achievement) {
    const achievementElement = document.createElement('div');
    achievementElement.innerHTML = `
        <div style="background: rgba(0,0,0,0.8); color: gold; padding: 10px; border-radius: 5px;">
            <h3>Achievement Unlocked!</h3>
            <p>${achievement.name}</p>
            <p>${achievement.description}</p>
        </div>
    `;
    achievementElement.style = 'position: absolute; bottom: 20px; right: 20px; font-family: Arial;';
    document.body.appendChild(achievementElement);
    
    setTimeout(() => {
        document.body.removeChild(achievementElement);
    }, 3000);
}

function updateGameLoop() {
    // Make sure to update these in your main game loop:
    gameStats.timePlayed += 1/60; // Assuming 60 FPS
    distanceTraveled += 0.5; // Update based on game speed
    gameStats.totalDistanceTraveled = distanceTraveled;
    if (gameStats.bulletsFired > 0) {
        gameStats.accuracy = (gameStats.bulletsHit / gameStats.bulletsFired) * 100;
    }
    updateAchievements();
}

function drawMiniMap() {
    // Draw mini-map in top-right corner
    const mapSize = 100;
    const mapX = canvas.width - mapSize - 10;
    const mapY = 10;
    
    // Background
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    
    // Player position (always centered vertically)
    const playerDot = {
        x: mapX + mapSize * (player.x / canvas.width),
        y: mapY + mapSize * 0.8
    };
    
    // Draw obstacles on mini-map
    ctx.fillStyle = "#ff3333";
    obstacles.forEach(obstacle => {
        const obstacleY = mapY + mapSize * (obstacle.y / canvas.height);
        if (obstacleY > mapY && obstacleY < mapY + mapSize) {
            ctx.fillRect(
                mapX + mapSize * (obstacle.x / canvas.width),
                obstacleY,
                3, 3
            );
        }
    });
    
    // Draw fuel items on mini-map
    ctx.fillStyle = "#33ff33";
    fuels.forEach(fuel => {
        const fuelY = mapY + mapSize * (fuel.y / canvas.height);
        if (fuelY > mapY && fuelY < mapY + mapSize) {
            ctx.fillRect(
                mapX + mapSize * (fuel.x / canvas.width),
                fuelY,
                3, 3
            );
        }
    });
    
    // Draw player
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(playerDot.x - 2, playerDot.y - 2, 4, 4);
    
    // Border
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);
}

function displayBossWarning() {
    const warningElement = document.createElement('div');
    warningElement.textContent = `WARNING: BOSS APPROACHING!`;
    warningElement.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ff0000; font-size: 36px; font-family: Arial; text-shadow: 2px 2px 4px #000;';
    document.body.appendChild(warningElement);
    
    // Flash effect
    let opacity = 1;
    const flash = setInterval(() => {
        opacity = opacity === 1 ? 0.5 : 1;
        warningElement.style.opacity = opacity;
    }, 200);
    
    setTimeout(() => {
        clearInterval(flash);
        document.body.removeChild(warningElement);
    }, 3000);
}

// Speed fixes - add these variables at the top with your game state variables
const GAME_SPEED = 1; // Global speed multiplier
let lastTimestamp = 0; // For frame-rate independent movement

// Update sprite dimensions
function updateSpriteDimensions() {
    // Update enemy size definitions
    const enemyTypes = [
        { type: "fighter", health: 1, speed: 2 * GAME_SPEED, width: 60, height: 60, points: 10, isAirborne: true },
        { type: "bomber", health: 3, speed: 1 * GAME_SPEED, width: 70, height: 70, points: 25, isAirborne: true },
        { type: "speedboat", health: 1, speed: 3 * GAME_SPEED, width: 55, height: 40, points: 15, isAirborne: false }
    ];
    
    return enemyTypes;
}

// Fixed spawnObstacle function with proper boat placement and sizing
function spawnObstacle() {
    if (gameOver) return;
    
    const enemyTypes = updateSpriteDimensions();
    
    // Higher levels have chance for tougher enemies
    let enemyPool = [0]; // Default to fighter
    if (currentLevel >= 2) enemyPool.push(0, 2); // Add speedboats
    if (currentLevel >= 3) enemyPool.push(1); // Add bombers
    
    const selectedTypeIndex = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    const selectedType = enemyTypes[selectedTypeIndex];
    
    // Calculate river boundaries
    const leftBankWidth = (canvas.width - riverWidth) / 2;
    const rightBankBoundary = canvas.width - leftBankWidth;
    
    // Default spawn area
    let minX = 0;
    let maxX = canvas.width - selectedType.width;
    
    // If it's a boat (not airborne), strictly restrict to river area
    if (!selectedType.isAirborne) {
        minX = leftBankWidth + 15; // Add padding to avoid touching the bank
        maxX = rightBankBoundary - selectedType.width - 15;
    }
    
    obstacles.push({
        x: minX + Math.random() * (maxX - minX),
        y: -50,
        width: selectedType.width,
        height: selectedType.height,
        speed: selectedType.speed * (1 + (currentLevel - 1) * 0.1),
        health: selectedType.health,
        type: selectedType.type,
        points: selectedType.points,
        isAirborne: selectedType.isAirborne
    });
}


// Ensure init function properly sets up all intervals once
function init() {
    if (window.gameInitialized) return; // Prevent duplicate initialization
    window.gameInitialized = true;
    
    console.log("Initializing game...");
    
    // Create water pattern
    waterBackground.pattern = createWaterPattern();
    
    // Set up shadows for flying objects
    enhanceWithShadows();
    
    // Set up interval timers for enemy spawning and other periodic events
    obstacleInterval = setInterval(spawnObstacle, OBSTACLE_SPAWN_RATE);
    
    // Increase power-up spawn frequency from 7000ms to 5000ms (40% faster)
    powerUpInterval = setInterval(spawnPowerUp, 5000);
    
    fuelSpawnInterval = setInterval(spawnFuel, 10000); // Reduce fuel spawn frequency to every 10 seconds
    
    // Occasional repair kit spawner - only create once
    setInterval(spawnRepairKit, 15000); // Every 15 seconds
    
    // Start player with larger size
    player.width = 50;
    player.height = 65;
    player.x = canvas.width / 2 - 25;
    
    // Detect touch device and create touch controls if needed
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        createTouchControls();
    }
    
    // Start game loop
    gameLoop();
    
    console.log("Game initialized");
}

// Make sure to call init() at the beginning
window.addEventListener('load', init);

// Add these variables to your game state variables section
let touchControls = {
    active: false,
    leftBtn: null,
    rightBtn: null,
    shootBtn: null
};

// Add shadow properties to flying objects
function enhanceWithShadows() {
    // Add shadow to player object
    player.shadow = {
        offset: 90,  // Distance shadow appears below object
        width: player.width * 0.8, // Shadow slightly smaller than object
        height: 10,
        opacity: 0.4
    };
    
    // Update obstacle creation to include shadows for flying objects
    const enemyTypes = updateSpriteDimensions();
    
    // Add shadow properties to each flying enemy type in the array
    enemyTypes.forEach(type => {
        if (type.isAirborne) {
            type.shadow = {
                offset: 70, // Distance below object
                width: type.width * 0.8, // Shadow slightly smaller than object
                height: 10,
                opacity: 0.4
            };
        }
    });
    
    return enemyTypes;
}

// Draw shadows beneath flying objects
function drawShadows() {
    // Draw player shadow
    if (player.alive) {
        ctx.fillStyle = `rgba(0, 0, 0, ${player.shadow.opacity})`;
        ctx.beginPath();
        ctx.ellipse(
            player.x + player.width/2, 
            player.y + player.shadow.offset, 
            player.shadow.width/2, 
            player.shadow.height/2, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }
    
    // Draw shadows for airborne obstacles (fighters and bombers)
    obstacles.forEach(obstacle => {
        if (obstacle.isAirborne && !obstacle.isFalling) {
            // Get shadow properties from obstacle
            const shadowOpacity = obstacle.shadow ? obstacle.shadow.opacity : 0.4;
            const shadowWidth = obstacle.shadow ? obstacle.shadow.width : obstacle.width * 0.8;
            const shadowHeight = obstacle.shadow ? obstacle.shadow.height : 10;
            const shadowOffset = obstacle.shadow ? obstacle.shadow.offset : 70;
            
            // Draw shadow
            ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
            ctx.beginPath();
            ctx.ellipse(
                obstacle.x + obstacle.width/2, 
                obstacle.y + shadowOffset, 
                shadowWidth/2, 
                shadowHeight/2, 
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }
    });
}

// Modify updateObstacles to handle falling animations
function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        // Regular movement
        if (!obstacle.isFalling) {
            obstacle.y += obstacle.speed;
            
            // Keep boats within river boundaries
            if (!obstacle.isAirborne && obstacle.type === "speedboat") {
                // Calculate river boundaries
                const leftBankWidth = (canvas.width - riverWidth) / 2;
                const rightBankWidth = leftBankWidth;
                const rightBankBoundary = canvas.width - rightBankWidth;
                
                // Keep speedboats in water
                if (obstacle.x < leftBankWidth + 15) {
                    obstacle.x = leftBankWidth + 15;
                }
                if (obstacle.x + obstacle.width > rightBankBoundary - 15) {
                    obstacle.x = rightBankBoundary - obstacle.width - 15;
                }
            }
            
            // Allow bombers to shoot regular bullets
            if (obstacle.type === "bomber") {
                // Initialize shoot timer if not present
                if (obstacle.shootTimer === undefined) {
                    obstacle.shootTimer = 0;
                    obstacle.shootInterval = 120; // Shoot every ~2 seconds at 60fps
                }
                
                // Increment timer and check if it's time to shoot
                obstacle.shootTimer++;
                if (obstacle.shootTimer >= obstacle.shootInterval) {
                    // Reset timer
                    obstacle.shootTimer = 0;
                    
                    // Create bomber bullets
                    bomberBullets.push({
                        x: obstacle.x + obstacle.width/3 - 8,
                        y: obstacle.y + obstacle.height,
                        width: 16,
                        height: 25,
                        speed: 2,
                        explosionRadius: 40,
                        damage: 15
                    });
                    
                    bomberBullets.push({
                        x: obstacle.x + 2*obstacle.width/3 - 8,
                        y: obstacle.y + obstacle.height,
                        width: 16,
                        height: 25,
                        speed: 2,
                        explosionRadius: 40,
                        damage: 15
                    });
                }
            }
            
            // Check for collision with player
            if (player.alive && checkCollision(player, obstacle)) {
                console.log(`Collision with ${obstacle.type}! Reducing player health.`);
                playerHealth -= 25;
                createExplosion(obstacle.x, obstacle.y);
                obstacles.splice(index, 1);
                
                if (playerHealth <= 0) {
                    playerHealth = 0;
                    gameOver = true;
                    player.alive = false;
                    createExplosion(player.x, player.y);
                }
                return;
            }
            
            // Check for collision with bullets - THIS WAS MISSING IN THE FALLING ANIMATION SECTION
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                if (checkCollision(bullet, obstacle)) {
                    obstacle.health--;
                    bullets.splice(i, 1);
                    createExplosion(bullet.x, bullet.y, 30);
                    
                    if (obstacle.health <= 0) {
                        // For airborne enemies, start falling animation
                        if (obstacle.isAirborne) {
                            obstacle.isFalling = true;
                            obstacle.fallSpeed = 1;
                            obstacle.rotation = 0;
                            obstacle.rotationSpeed = (Math.random() - 0.5) * 0.2;
                            
                            if (!obstacle.shadow) {
                                obstacle.shadow = {
                                    width: obstacle.width * 0.8,
                                    height: 10,
                                    opacity: 0.4,
                                    offset: 70
                                };
                            }
                        } else {
                            // Non-airborne enemies explode immediately
                            createExplosion(obstacle.x, obstacle.y);
                            trySpawnRepairKit(obstacle.x, obstacle.y);
                            obstacles.splice(index, 1);
                            score += obstacle.points || SCORE_PER_OBSTACLE;
                            enemiesDefeatedThisLevel++;
                            checkLevelProgress();
                        }
                    }
                    break;
                }
            }
        } 
        // FIXED: Falling animation for planes - now has proper animation
        else {
            // Increase falling speed
            obstacle.fallSpeed += 0.1;
            
            // Move downward faster while falling
            obstacle.y += obstacle.fallSpeed;
            
            // Add rotation during falling
            obstacle.rotation += obstacle.rotationSpeed;
            
            // Handle shadow effects during falling
            if (obstacle.shadow) {
                obstacle.shadow.width += 0.2;
                obstacle.shadow.opacity -= 0.01;
                
                // Only remove when animation completes
                if (obstacle.shadow.opacity <= 0) {
                    createExplosion(obstacle.x, obstacle.y);
                    
                    // Track bomber ships for mission
                    if (obstacle.type === "bomber") {
                        bomberShipsDestroyed++;
                    }
                    
                    trySpawnRepairKit(obstacle.x, obstacle.y);
                    obstacles.splice(index, 1);
                    score += obstacle.points || SCORE_PER_OBSTACLE;
                    enemiesDefeatedThisLevel++;
                    checkLevelProgress();
                }
            }
        }
        
        // Remove obstacles that go off-screen
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
        }
    });
}
// Modified draw obstacles to handle falling animations
function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.isFalling && obstacle.isAirborne) {
            // Draw falling airborne object with rotation
            ctx.save();
            ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            ctx.rotate(obstacle.rotation);
            
            switch(obstacle.type) {
                case "bomber":
                    ctx.drawImage(bomberImg, -obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height);
                    break;
                default: // fighter
                    ctx.drawImage(fighterImg, -obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height);
                    break;
            }
            ctx.restore();
        }
        else {
            // Draw normal objects
            switch(obstacle.type) {
                case "bomber":
                    ctx.drawImage(bomberImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
                case "speedboat":
                    ctx.drawImage(speedboatImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
                default: // fighter
                    ctx.drawImage(fighterImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
            }
        }
    });
}

// Add this function to create a cockpit-style dashboard UI
function drawCockpitDashboard() {
    // TOP DASHBOARD ELEMENTS - Now as individual boxes instead of a full bar
    
    // Top Left: Mission info (as standalone box)
    drawTopMissionBox(10, 10, 380, 50);
    
    // Top Right: Score and level displays (as standalone box)
    
    // Bottom Right: Radar screen
    drawRadarScreen(canvas.width - 130, canvas.height - 110, 120, 100);
}

// Redesigned top-left mission panel as a standalone box
function drawTopMissionBox(x, y, width, height) {
    // Panel background with slight gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, "#222");
    gradient.addColorStop(1, "#333");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Panel border
    ctx.strokeStyle = "#555";
    ctx.strokeRect(x, y, width, height);
    
    // Panel header
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, width, 20);
    ctx.fillStyle = "#aaa";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText("CURRENT MISSION", x + 10, y + 14);
    
    // Mission content
    if (currentMission < missions.length) {
        const mission = missions[currentMission];
        
        // Mission icon
        drawMissionIcon(ctx, mission.objectiveType, x + 15, y + 30, 20);
        
        // Mission title
        ctx.fillStyle = "#ffcc33";
        ctx.font = "12px 'Courier New', monospace";
        ctx.fillText(`MISSION ${currentMission + 1}: ${mission.description}`, x + 45, y + 30);
        
        // Progress bar
        const barX = x + 45;
        const barY = y + 38;
        const barWidth = width - 60;
        const barHeight = 8;
        
        // Background bar
        ctx.fillStyle = "#444";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress fill with color based on mission type
        let progressColor;
        switch(mission.objectiveType) {
            case "distance": progressColor = "#8B4513"; break;
            case "destroyType": progressColor = "#cc0000"; break;
            case "time": progressColor = "#ffcc00"; break;
            default: progressColor = "#ff0";
        }
        
        ctx.fillStyle = progressColor;
        ctx.fillRect(barX, barY, barWidth * missionProgress, barHeight);
        
        // Progress text
        let progressText = "";
        if (mission.objectiveType === "distance") {
            progressText = `${Math.floor(distanceTraveled)}/${mission.target}`;
        } else if (mission.objectiveType === "destroyType") {
            progressText = `${bomberShipsDestroyed}/${mission.target}`;
        } else if (mission.objectiveType === "time") {
            progressText = `${Math.floor(missionTimer)}/${mission.target}`;
        }
        
        // Progress percentage
        const percent = Math.floor(missionProgress * 100);
        ctx.fillStyle = "#fff";
        ctx.font = "10px 'Courier New', monospace";
        ctx.fillText(`${progressText} (${percent}%)`, barX + 5, barY + 18);
    }
    
    // Add metallic details
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + 5 + i*10, y + 10, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#777";
        ctx.fill();
    }
}

// Redesigned top-right panel as a standalone box
function drawTopRightBox(x, y, width, height) {
    // Panel background with slight gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, "#222");
    gradient.addColorStop(1, "#333");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Panel border
    ctx.strokeStyle = "#555";
    ctx.strokeRect(x, y, width, height);
    
    // Panel header
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, width, 20);
    ctx.fillStyle = "#aaa";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText("COMBAT STATISTICS", x + 10, y + 14);
    
    // Score display
    ctx.fillStyle = "#33ff33"; // Green digits
    ctx.font = "18px 'Courier New', monospace";
    ctx.fillText("SCORE:", x + 10, y + 38);
    
    // Right-align the score value
    const scoreText = score.toString().padStart(6, '0');
    ctx.fillStyle = "#ffff33"; // Yellow score
    ctx.font = "18px 'Courier New', monospace";
    ctx.fillText(scoreText, x + width - 15, y + 38);
    
    // Level indicator with small pill shape
    ctx.fillStyle = "#444";
    ctx.fillRect(x + width - 80, y + 5, 70, 12); 
    
    ctx.fillStyle = "#ffcc33";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText(`LEVEL ${currentLevel}`, x + width - 75, y + 13);
    
    // Add metallic details
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + 5 + i*10, y + 10, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#777";
        ctx.fill();
    }
}

// Redesigned bottom left panel with health and fuel
function drawBottomLeftPanel(x, y, width, height) {
    // Panel background with slight gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, "#222");
    gradient.addColorStop(1, "#333");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Panel border
    ctx.strokeStyle = "#555";
    ctx.strokeRect(x, y, width, height);
    
    // Panel header
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, width, 20);
    ctx.fillStyle = "#aaa";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText("SYSTEMS STATUS", x + 10, y + 14);
    
    // Draw health gauge
    drawHealthGauge(x + 10, y + 30, width - 20, 16);
    
    // Draw fuel gauge
    drawEnhancedFuelGauge(x + 10, y + 65, width - 20, 16);
    
    // Add metallic details
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + 5 + i*10, y + 10, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#777";
        ctx.fill();
    }
}

// Redesigned radar panel
function drawRadarScreen(x, y, width, height) {
    // Panel background with gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, "#222");
    gradient.addColorStop(1, "#333");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Panel border
    ctx.strokeStyle = "#555";
    ctx.strokeRect(x, y, width, height);
    
    // Panel header
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, width, 20);
    ctx.fillStyle = "#aaa";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText("RADAR SYSTEM", x + 10, y + 14);
    
    // Add metallic details
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + 5 + i*10, y + 10, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#777";
        ctx.fill();
    }
    
    // Radar display area (slightly smaller than panel)
    const radarX = x + 10;
    const radarY = y + 25;
    const radarWidth = width - 20;
    const radarHeight = height - 35;
    
    // Radar background
    ctx.fillStyle = "#001100";
    ctx.fillRect(radarX, radarY, radarWidth, radarHeight);
    
    // Radar rings
    ctx.strokeStyle = "#004400";
    ctx.beginPath();
    ctx.arc(radarX + radarWidth/2, radarY + radarHeight/2, radarWidth/3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(radarX + radarWidth/2, radarY + radarHeight/2, radarHeight/1.5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Radar sweep - rotating line
    const sweepAngle = Date.now() / 1000 % (Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 255, 0, 0.7)";
    ctx.beginPath();
    ctx.moveTo(radarX + radarWidth/2, radarY + radarHeight/2);
    ctx.lineTo(
        radarX + radarWidth/2 + Math.cos(sweepAngle) * radarWidth/2,
        radarY + radarHeight/2 + Math.sin(sweepAngle) * radarHeight/2
    );
    ctx.stroke();
    
    // Player position (always at bottom center)
    const playerDot = {
        x: radarX + radarWidth/2,
        y: radarY + radarHeight * 0.75
    };
    
    // Draw obstacles on radar
    obstacles.forEach(obstacle => {
        const relativeY = obstacle.y / canvas.height;
        const dotY = radarY + relativeY * radarHeight;
        
        // Only show if in radar range
        if (dotY > radarY && dotY < radarY + radarHeight) {
            // Different colors for different enemy types
            if (obstacle.type === "bomber") {
                ctx.fillStyle = "rgba(255, 50, 50, 0.8)"; // Red for bombers
            } else if (obstacle.type === "speedboat") {
                ctx.fillStyle = "rgba(50, 150, 255, 0.8)"; // Blue for boats
            } else {
                ctx.fillStyle = "rgba(255, 255, 50, 0.8)"; // Yellow for fighters
            }
            
            const relativeX = obstacle.x / canvas.width;
            const dotX = radarX + relativeX * radarWidth;
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Radar blip effect
            ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
            ctx.beginPath();
            ctx.arc(dotX, dotY, 3 + Math.sin(Date.now()/100) * 1, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw player
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.moveTo(playerDot.x, playerDot.y - 3);
    ctx.lineTo(playerDot.x - 2, playerDot.y + 2);
    ctx.lineTo(playerDot.x + 2, playerDot.y + 2);
    ctx.closePath();
    ctx.fill();
    
    // Draw radar border
    ctx.strokeStyle = "#33ff33";
    ctx.lineWidth = 1;
    ctx.strokeRect(radarX, radarY, radarWidth, radarHeight);
}

// Add a single, focused and streamlined game loop
function gameLoop(timestamp = 0) {
    // Calculate delta time for smooth movement
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    const speedFactor = deltaTime / 16.67; // Normalize to ~60fps

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw water background
    drawWaterBackground();

    // Check game over conditions FIRST, before any other processing
    if (playerHealth <= 0 || fuelLevel <= 0) {
        if (!gameOver) {
            console.log("Game over triggered - health: " + playerHealth + ", fuel: " + fuelLevel);
            gameOver = true;
            player.alive = false;
            createExplosion(player.x, player.y);

            // Force draw of game over screen on next frame
            setTimeout(() => {
                drawGameOver();
            }, 10);
            return;
        }
    }

    if (!gameOver) {
        // Draw shadows
        drawShadows();

        // Update game state
        updatePlayerMovement();
        updateBullets();
        updateObstacles();
        updateBomberBullets(); // Add bomber bullets update
        updatePowerUps();
        updateFuels();
        updateRepairKits();
        updateExplosions();

        // Update with consistent speed
        distanceTraveled += 0.25 * GAME_SPEED * (speedFactor || 1);

        updateMission();
        updateRiverBanks();
        updateBoss();
        updatePowerUpEffects();

        // Update fuel at consistent rate
        fuelLevel -= fuelConsumptionRate * GAME_SPEED * (speedFactor || 1);
        
        // Check fuel level IMMEDIATELY after updating it
        if (fuelLevel <= 0) {
            console.log("Fuel depleted, forcing game over");
            fuelLevel = 0; // Ensure fuel is exactly 0, not negative
            gameOver = true;
            player.alive = false;
            createExplosion(player.x, player.y);
            
            // Stop all game processing and draw game over immediately
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            drawGameOver();
            return;
        }

        // Draw game elements
        drawBridge();
        drawPlayer();
        drawObstacles();
        drawBullets();
        drawBomberBullets(); // Draw bomber bullets
        drawPowerUps();
        drawFuels();
        drawRepairKits();
        drawExplosions();
        drawPowerupMessages();

        // Explicitly draw the boss if it exists, regardless of UI drawing
        if (boss) {
            drawBoss();
        }

        // Draw UI
        drawMinimalistUI();
    }

    // Game over state should be checked again before continuing the loop
    if (gameOver) {
        drawGameOver();
        return; // Don't continue animation loop when game is over
    }

    // Continue the animation loop only if not game over
    animationFrameId = requestAnimationFrame(gameLoop);
}

// New streamlined UI function
function drawMinimalistUI() {
    // Top left: Mission information
    drawMinimalistMission(10, 10);
    
    // Top right: Score and level
    drawMinimalistScore(canvas.width - 10, 10);
    
    // Bottom left: Health and fuel bars
    drawMinimalistHealthFuel(10, canvas.height - 55);
    
    // Bottom right: Simple radar
    drawMinimalistRadar(canvas.width - 90, canvas.height - 90, 80, 80);
    
    // Boss health (when applicable) - only draw if boss exists
    if (boss && isBossFight) {
        drawBossHealth(canvas.width / 2, 20);
    }
    
    // Active power-ups (when applicable)
    if (activeEffects && activeEffects.length > 0) {
        drawActivePowerups(canvas.width / 2, 20);
    }
}

// Simplified mission display
function drawMinimalistMission(x, y) {
    if (currentMission >= missions.length) return;
    
    const mission = missions[currentMission];
    
    // Mission title text with drop shadow for readability
    ctx.font = "14px Arial";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillText(`MISSION ${currentMission + 1}: ${mission.description}`, x + 1, y + 16);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`MISSION ${currentMission + 1}: ${mission.description}`, x, y + 15);
    
    // Progress bar with colored background based on mission type
    const barWidth = 200;
    const barHeight = 6;
    
    // Background bar with drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(x + 1, y + 21, barWidth, barHeight);
    
    // Progress color based on mission type
    let progressColor;
    switch(mission.objectiveType) {
        case "distance": progressColor = "#8B4513"; break;
        case "destroyType": progressColor = "#cc0000"; break;
        case "time": progressColor = "#ffcc00"; break;
        default: progressColor = "#ffffff";
    }
    
    // Progress fill
    ctx.fillStyle = progressColor;
    ctx.fillRect(x, y + 20, barWidth * missionProgress, barHeight);
    
    // Progress percentage at end of bar
    const percent = Math.floor(missionProgress * 100);
    ctx.font = "11px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${percent}%`, x + barWidth + 5, y + 26);
    
    // Small mission icon
    drawMissionIcon(ctx, mission.objectiveType, x - 25, y + 6, 20);
}

// Simplified score and level display
function drawMinimalistScore(x, y) {
    // Score with drop shadow
    ctx.font = "18px Arial";
    ctx.textAlign = "right";
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillText(`SCORE: ${score}`, x + 1, y + 16);
    ctx.fillStyle = "#ffcc33";
    ctx.fillText(`SCORE: ${score}`, x, y + 15);
    
    // Level with drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillText(`LEVEL: ${currentLevel}`, x + 1, y + 36);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`LEVEL: ${currentLevel}`, x, y + 35);
    
    ctx.textAlign = "left"; // Reset text alignment
}

// Improved health/fuel bars with color gradients
function drawMinimalistHealthFuel(x, y) {
    const barWidth = 150;
    const barHeight = 12;
    const spacing = 20;
    
    // Health bar
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x + 1, y + 1, barWidth, barHeight);
    
    // Health fill with color based on value
    let healthColor;
    if (playerHealth >= 70) {
        healthColor = "#33cc33"; // Green for high health
    } else if (playerHealth >= 30) {
        healthColor = "#ffcc00"; // Yellow for medium health
    } else {
        healthColor = "#cc3333"; // Red for low health
    }
    
    ctx.fillStyle = healthColor;
    ctx.fillRect(x, y, barWidth * (playerHealth / 100), barHeight);
    
    // Health text
    ctx.font = "11px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`HEALTH: ${Math.round(playerHealth)}%`, x + 5, y + barHeight - 2);
    
    // Fuel bar
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x + 1, y + spacing + 1, barWidth, barHeight);
    
    // Fuel fill with color based on value
    let fuelColor;
    if (fuelLevel >= 70) {
        fuelColor = "#3399ff"; // Blue for high fuel
    } else if (fuelLevel >= 30) {
        fuelColor = "#ffcc00"; // Yellow for medium fuel
    } else {
        fuelColor = "#cc3333"; // Red for low fuel
    }
    
    ctx.fillStyle = fuelColor;
    ctx.fillRect(x, y + spacing, barWidth * (fuelLevel / 100), barHeight);
    
    // Fuel text
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`FUEL: ${Math.round(fuelLevel)}%`, x + 5, y + spacing + barHeight - 2);
}

// Simplified radar display
function drawMinimalistRadar(x, y, width, height) {
    // Radar background with semi-transparency
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(x, y, width, height);
    
    // Radar rings
    ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/3, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/1.5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Radar sweep line
    const sweepAngle = Date.now() / 1000 % (Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 255, 0, 0.7)";
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height/2);
    ctx.lineTo(
        x + width/2 + Math.cos(sweepAngle) * width/2,
        y + height/2 + Math.sin(sweepAngle) * height/2
    );
    ctx.stroke();
    
    // Player position (always at bottom center)
    const playerDot = {
        x: x + width/2,
        y: y + height * 0.75
    };
    
    // Draw enemies on radar
    obstacles.forEach(obstacle => {
        const relativeY = obstacle.y / canvas.height;
        const radarY = y + relativeY * height;
        
        // Only show if in radar range
        if (radarY > y && radarY < y + height) {
            // Different colors for different enemy types
            if (obstacle.type === "bomber") {
                ctx.fillStyle = "rgba(255, 50, 50, 0.8)"; // Red for bombers
            } else if (obstacle.type === "speedboat") {
                ctx.fillStyle = "rgba(50, 150, 255, 0.8)"; // Blue for boats
            } else {
                ctx.fillStyle = "rgba(255, 255, 50, 0.8)"; // Yellow for fighters
            }
            
            const relativeX = obstacle.x / canvas.width;
            const radarX = x + relativeX * width;
            
            ctx.beginPath();
            ctx.arc(radarX, radarY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw player on radar
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.moveTo(playerDot.x, playerDot.y - 3);
    ctx.lineTo(playerDot.x - 2, playerDot.y + 2);
    ctx.lineTo(playerDot.x + 2, playerDot.y + 2);
    ctx.closePath();
    ctx.fill();
    
    // Small "RADAR" label
    ctx.font = "9px Arial";
    ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
    ctx.fillText("RADAR", x + 2, y + 10);
}

// Boss health display
function drawBossHealth(x, y) {
    if (!boss || !isBossFight) return;
    
    const barWidth = 200;
    const barHeight = 10;
    
    // Boss health label
    ctx.font = "12px Arial";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.textAlign = "center";
    ctx.fillText("BOSS", x + 1, y - 4);
    ctx.fillStyle = "#ff3333";
    ctx.fillText("BOSS", x, y - 5);
    
    // Health bar background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x - barWidth/2 + 1, y + 1, barWidth, barHeight);
    
    // Health bar fill
    ctx.fillStyle = "#ff3333";
    ctx.fillRect(x - barWidth/2, y, barWidth * (bossHealth / bossMaxHealth), barHeight);
    
    ctx.textAlign = "left"; // Reset alignment
}

// Active powerups display
function drawActivePowerups(x, y) {
    if (!activeEffects || activeEffects.length === 0) return;
    
    let offsetX = -80 * activeEffects.length / 2;
    
    activeEffects.forEach((effect, index) => {
        const timePercent = effect.timeLeft / effect.initialDuration;
        const barWidth = 70;
        const barHeight = 6;
        const xPos = x + offsetX;
        
        // Power-up label
        const label = effect.type === "bulletMultiplier" ? "DUAL FIRE" : "SPEED BOOST";
        ctx.font = "10px Arial";
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillText(label, xPos + 1, y - 4);
        ctx.fillStyle = effect.type === "bulletMultiplier" ? "#ffcc00" : "#00ffcc";
        ctx.fillText(label, xPos, y - 5);
        
        // Power-up timer bar background
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(xPos + 1, y + 1, barWidth, barHeight);
        
        // Power-up timer fill
        ctx.fillStyle = effect.type === "bulletMultiplier" ? "#ffcc00" : "#00ffcc";
        ctx.fillRect(xPos, y, barWidth * timePercent, barHeight);
        
        offsetX += 80;
    });
}

// Handle touch movement with more precise controls
function handleTouchMove(e) {
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    // Get touch position relative to screen
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    // Calculate the center of the screen
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Reset all movement keys
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
    keys["ArrowUp"] = false;
    keys["ArrowDown"] = false;
    
    // Determine direction based on touch position
    // Horizontal movement (prioritized)
    if (touchX < centerX - 20) {
        keys["ArrowLeft"] = true;
    } else if (touchX > centerX + 20) {
        keys["ArrowRight"] = true;
    }
    
    // Vertical movement
    if (touchY < centerY - 20) {
        keys["ArrowUp"] = true;
    } else if (touchY > centerY + 20) {
        keys["ArrowDown"] = true;
    }
}

// 5. Simplified game over display
function drawGameOver() {
    // Force gameOver to be true when drawing the game over screen
    if (playerHealth <= 0 || fuelLevel <= 0) {
        gameOver = true;
        player.alive = false;
    }
    
    if (!gameOver) return;

    console.log("drawGameOver called, gameOver =", gameOver); // Debug log

    // Dim the background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Display "Game Over" text
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 50);

    // Display final score
    ctx.font = "20px Arial";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);

    // Display restart instructions
    ctx.fillStyle = "#ffcc33";
    ctx.fillText("Press 'R' to Restart", canvas.width / 2, canvas.height / 2 + 40);

    // Display touch instructions if touch controls are active
    if (touchControls && touchControls.active) {
        ctx.fillText("Double Tap to Restart", canvas.width / 2, canvas.height / 2 + 70);
    }

    ctx.textAlign = "left"; // Reset alignment
}

// 3. Clean UI drawing function
function drawCleanUI() {
    const textShadow = 2;
    
    // Top left: Mission information
    if (currentMission < missions.length) {
        const mission = missions[currentMission];
        
        // Mission title
        ctx.font = "14px Arial";
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillText(`MISSION ${currentMission + 1}: ${mission.description}`, 10 + textShadow, 20 + textShadow);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`MISSION ${currentMission + 1}: ${mission.description}`, 10, 20);
        
        // Progress bar
        const barWidth = 200;
        const barHeight = 6;
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(10, 30, barWidth, barHeight);
        
        // Progress color based on mission type
        let progressColor;
        switch(mission.objectiveType) {
            case "distance": progressColor = "#8B4513"; break;
            case "destroyType": progressColor = "#cc0000"; break;
            case "time": progressColor = "#ffcc00"; break;
            default: progressColor = "#ffffff";
        }
        
        ctx.fillStyle = progressColor;
        ctx.fillRect(10, 30, barWidth * missionProgress, barHeight);
    }
    
    ctx.textAlign = "left";
    
    // Top right: Score display
    ctx.font = "20px Arial";
    ctx.fillStyle = "#ffcc33";
    ctx.textAlign = "right";
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 30);
    ctx.textAlign = "left";
}


function createTouchControls() {
    if (touchControls.active) return;

    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'touchControls';
    controlsContainer.style = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    `;

    const moveArea = document.createElement('div');
    moveArea.style = `
        position: absolute;
        left: 0;
        top: 0;
        width: 50%;
        height: 100%;
        pointer-events: auto;
    `;

    const fireArea = document.createElement('div');
    fireArea.style = `
        position: absolute;
        right: 0;
        top: 0;
        width: 50%;
        height: 100%;
        pointer-events: auto;
    `;

    moveArea.addEventListener('touchstart', handleTouchMove);
    moveArea.addEventListener('touchmove', handleTouchMove);
    moveArea.addEventListener('touchend', () => {
        keys["ArrowLeft"] = false;
        keys["ArrowRight"] = false;
        keys["ArrowUp"] = false;
        keys["ArrowDown"] = false;
    });

    fireArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        fireBullet();
    });

    controlsContainer.appendChild(moveArea);
    controlsContainer.appendChild(fireArea);
    canvas.parentElement.appendChild(controlsContainer);

    touchControls.active = true;
}

// Initialize key handlers once
setupKeyHandlers();

// --- Key Handler Functions ---
function setupKeyHandlers() {
    // Remove any previous key event listeners to avoid duplicates
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);

    // Add our clean handlers
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(event) {
    keys[event.key] = true;

    // When game over, pressing "R" will restart the game
    if (event.key === 'r' || event.key === 'R') {
        console.log("R pressed, gameOver =", gameOver); // Debug log
        
        if (gameOver) {
            console.log("R key pressed - restarting game");
            restartGame();
        }
    }

    // Example: pressing Space fires a bullet if game is not over
    if (event.key === " " && !gameOver) {
        fireBullet();
    }
}

function handleKeyUp(event) {
    keys[event.key] = false;
}

// --- Restart Game Function ---
function restartGame() {
    console.log("Restarting game...");

    // Cancel animation frame
    if (typeof animationFrameId !== 'undefined') {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Clear all intervals
    clearInterval(obstacleInterval);
    clearInterval(powerUpInterval);
    clearInterval(fuelSpawnInterval);

    // Reset player
    player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 65,
        speed: 3,
        alive: true,
        shadow: {
            offset: 90,
            width: 40,
            height: 10,
            opacity: 0.4
        }
    };

    // Reset game state
    obstacles = [];
    bullets = [];
    powerUps = [];
    fuels = [];
    repairKits = [];
    explosions = [];
    activeEffects = [];
    score = 0;
    playerHealth = 100;
    fuelLevel = 100;
    gameOver = false;
    bulletMultiplierActive = false;
    currentLevel = 1;
    enemiesDefeatedThisLevel = 0;
    enemiesRequiredForNextLevel = 10;

    // Reset mission variables
    currentMission = 0;
    missionProgress = 0;
    distanceTraveled = 0;
    missionTimer = 0;
    bomberShipsDestroyed = 0;

    // Reset river and bridge
    riverWidth = canvas.width - 120;
    targetRiverWidth = riverWidth;
    narrowPassageActive = false;
    bridgeVisible = false;
    bridgePosition = -500;

    // Reset boss
    isBossFight = false;
    boss = null;
    bossHealth = 0;
    bossMaxHealth = 0;

    // Create new intervals
    obstacleInterval = setInterval(spawnObstacle, 1500);
    powerUpInterval = setInterval(spawnPowerUp, 5000);
    fuelSpawnInterval = setInterval(spawnFuel, 5000);

    // Restart game loop
    lastTimestamp = 0;
    animationFrameId = requestAnimationFrame(gameLoop);

    console.log("Game restarted successfully");
}
// Add a variable to track restart state and prevent multiple restarts
let isRestartInProgress = false;
let bulletMultiplierLevel = 1; // Make sure this is defined if not already

// Ensure init only runs once when the page loads
window.gameInitialized = false;

function init() {
    if (window.gameInitialized) return; // Prevent duplicate initialization
    window.gameInitialized = true;
    
    console.log("Initializing game...");
    
    // Create water pattern
    waterBackground.pattern = createWaterPattern();
    
    // Set up shadows for flying objects
    enhanceWithShadows();
    
    // Set up interval timers for enemy spawning and other periodic events
    obstacleInterval = setInterval(spawnObstacle, OBSTACLE_SPAWN_RATE);
    
    // Increase power-up spawn frequency from 7000ms to 5000ms (40% faster)
    powerUpInterval = setInterval(spawnPowerUp, 5000);
    
    fuelSpawnInterval = setInterval(spawnFuel, 10000);
    
    // Occasional repair kit spawner - only create once
    setInterval(spawnRepairKit, 15000); // Every 15 seconds
    
    // Start player with larger size
    player.width = 50;
    player.height = 65;
    player.x = canvas.width / 2 - 25;
    
    // Set up key handlers just once
    setupKeyHandlers();
    
    // Detect touch device and create touch controls if needed
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        createTouchControls();
    }
    
    // Start game loop with clean timestamp
    lastTimestamp = 0;
    gameLoop();
    
    console.log("Game initialized");
}

// Improved key handler
function handleKeyDown(event) {
    keys[event.key] = true;

    // When game over, pressing "R" will restart the game
    if ((event.key === 'r' || event.key === 'R') && gameOver) {
        // Prevent the event from being processed multiple times
        event.preventDefault();
        
        // Prevent multiple restarts while one is in progress
        if (!isRestartInProgress) {
            console.log("R key pressed - restarting game");
            restartGame();
        }
    }

    // Pressing Space fires a bullet if game is not over
    if (event.key === " " && !gameOver) {
        fireBullet();
    }
}

// Add a single, focused and streamlined game loop
function gameLoop(timestamp = 0) {
    console.log("Game loop running...");
    // Calculate delta time for smooth movement
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    const speedFactor = deltaTime / 16.67; // Normalize to ~60fps

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw water background
    drawWaterBackground();

    // Double check game over conditions right at the beginning
    if (playerHealth <= 0 || fuelLevel <= 0) {
        if (!gameOver) {
            console.log("Game over triggered by health or fuel check");
            gameOver = true;
            player.alive = false;
            createExplosion(player.x, player.y);
        }
    }

    if (!gameOver) {
        // Draw shadows
        drawShadows();

        // Update game state
        updatePlayerMovement();
        updateBullets();
        updateObstacles();
        updateBomberBullets(); // Update bomber bullets
        updatePowerUps();
        updateFuels();
        updateRepairKits();
        updateExplosions();

        // Update with consistent speed
        distanceTraveled += 0.25 * GAME_SPEED * (speedFactor || 1);

        updateMission();
        updateRiverBanks();
        updateBoss();
        updatePowerUpEffects();

        // Update fuel at consistent rate
        fuelLevel -= fuelConsumptionRate * GAME_SPEED * (speedFactor || 1);
        if (fuelLevel <= 0) {
            gameOver = true;
            player.alive = false;
            createExplosion(player.x, player.y);
        }

        // Draw game elements
        drawBridge();
        drawPlayer();
        drawObstacles();
        drawBullets();
        drawBomberBullets(); // Draw bomber bullets
        drawPowerUps();
        drawFuels();
        drawRepairKits();
        drawExplosions();
        drawPowerupMessages();

        // Explicitly draw the boss if it exists, regardless of UI drawing
        if (boss) {
            drawBoss();
        }

        // Draw UI
        drawMinimalistUI();
    } else {
        // Game over screen
        drawGameOver();
        // Don't continue animation loop when game is over
        // The restart will trigger a new game loop
        return;
    }

    // Continue the animation loop only if not game over
    if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// For touch devices, add a reliable double tap handler for restart
function createTouchControls() {
    if (touchControls.active) return;

    // ...existing touch control code...
    
    // Add double tap functionality for restart with better detection
    let lastTapTime = 0;
    document.addEventListener('touchend', function(e) {
        if (!gameOver) return; // Only process when game over
        
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < 500 && tapLength > 0) {
            // This is a double tap - prevent default behavior
            e.preventDefault();
            
            // Handle like the 'R' key press
            if (!isRestartInProgress) {
                console.log("Double tap detected - restarting game");
                restartGame();
            }
        }
        lastTapTime = currentTime;
    });
}

// Remove any duplicate gameLoop functions - ensure there's only ONE gameLoop defined

// Delete all other gameLoop definitions from your code
// This should replace the duplicate gameLoop function definitions that might be causing problems

// Fix the powerup display message function to prevent DOM issues
function displayPowerUpMessage(message) {
    // Create a canvas-based message instead of using DOM elements
    // This avoids potential issues with DOM manipulation
    const messageObj = {
        text: message,
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        opacity: 1,
        duration: 90, // frames (about 1.5 seconds at 60fps)
        currentFrame: 0
    };
    
    // Add to a messages array if it doesn't exist yet
    if (!window.powerupMessages) {
        window.powerupMessages = [];
    }
    window.powerupMessages.push(messageObj);
}

// Add this function to render power-up messages on canvas
function drawPowerupMessages() {
    if (!window.powerupMessages) return;
    
    // Filter out expired messages
    window.powerupMessages = window.powerupMessages.filter(msg => {
        // Increase current frame
        msg.currentFrame++;
        
        // Calculate opacity based on lifetime
        if (msg.currentFrame < msg.duration * 0.2) {
            // Fade in
            msg.opacity = msg.currentFrame / (msg.duration * 0.2);
        } else if (msg.currentFrame > msg.duration * 0.8) {
            // Fade out
            msg.opacity = 1 - ((msg.currentFrame - msg.duration * 0.8) / (msg.duration * 0.2));
        }
        
        // Draw the message
        ctx.save();
        ctx.globalAlpha = msg.opacity;
        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.strokeText(msg.text, msg.x, msg.y);
        ctx.fillText(msg.text, msg.x, msg.y);
        ctx.restore();
        
        // Keep the message if its lifetime hasn't expired
        return msg.currentFrame < msg.duration;
    });
}

// Initialize bomber bullets array
let bomberBullets = [];

// Update bomber bullets function - use standard bullet movement
function updateBomberBullets() {
    bomberBullets.forEach((bullet, index) => {
        bullet.y += bullet.speed;
        
        // Remove bullets that go off-screen
        if (bullet.y > canvas.height) {
            bomberBullets.splice(index, 1);
            return;
        }
        
        // Check for direct collision with player
        if (checkCollision(player, bullet) && player.alive) {
            // Bomber bullets do full damage on direct hit
            playerHealth -= bullet.damage || 15;
            
            // Create explosion at impact
            createExplosion(bullet.x, bullet.y);
            bomberBullets.splice(index, 1);
            
            // Visual feedback
            createSmallExplosion(player.x + player.width/2, player.y + player.height/2, "#ff3333");
            
            // Check for player death
            if (playerHealth <= 0) {
                console.log("Player killed by bomber bullet");
                playerHealth = 0; // Clamp to 0
                gameOver = true;
                player.alive = false;
                createExplosion(player.x, player.y);
                
                // Force draw game over screen
                setTimeout(() => {
                    drawGameOver();
                }, 10);
            }
        }
        
        // Check for proximity explosion (if the player is near but not directly hit)
        const dx = player.x + player.width/2 - (bullet.x + bullet.width/2);
        const dy = player.y + player.height/2 - (bullet.y + bullet.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (bullet.explosionRadius + player.width/2) && player.alive) {
            // Calculate damage based on proximity (closer = more damage)
            const proximityDamage = Math.max(5, Math.floor((bullet.damage || 15) * (1 - distance/(bullet.explosionRadius + player.width/2))));
            playerHealth -= proximityDamage;
            
            // Create explosion at bullet position
            createExplosion(bullet.x, bullet.y);
            bomberBullets.splice(index, 1);
            
            // Visual feedback showing the damage was less than full
            createSmallExplosion(player.x + player.width/2, player.y + player.height/2, "#ff9933");
            
            // Check for player death
            if (playerHealth <= 0) {
                console.log("Player killed by bomber bullet explosion");
                playerHealth = 0;
                gameOver = true;
                player.alive = false;
                createExplosion(player.x, player.y);
                
                setTimeout(() => {
                    drawGameOver();
                }, 10);
            }
        }
    });
}

// Draw bomber bullets using the standard bullet image
function drawBomberBullets() {
    bomberBullets.forEach(bullet => {
        ctx.drawImage(bomberBulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Make sure to update the game loop to include bomber bullets
function gameLoop(timestamp = 0) {
    console.log("Game loop running...");
    // Calculate delta time for smooth movement
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    const speedFactor = deltaTime / 16.67; // Normalize to ~60fps

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw water background
    drawWaterBackground();

    // Double check game over conditions right at the beginning
    if (playerHealth <= 0 || fuelLevel <= 0) {
        if (!gameOver) {
            console.log("Game over triggered by health or fuel check");
            gameOver = true;
            player.alive = false;
            createExplosion(player.x, player.y);
        }
    }

    if (!gameOver) {
        // Draw shadows
        drawShadows();

        // Update game state
        updatePlayerMovement();
        updateBullets();
        updateObstacles();
        updateBomberBullets(); // Update bomber bullets
        updatePowerUps();
        updateFuels();
        updateRepairKits();
        updateExplosions();

        // Update with consistent speed
        distanceTraveled += 0.25 * GAME_SPEED * (speedFactor || 1);

        updateMission();
        updateRiverBanks();
        updateBoss();
        updatePowerUpEffects();

        // Update fuel at consistent rate
        fuelLevel -= fuelConsumptionRate * GAME_SPEED * (speedFactor || 1);
        if (fuelLevel <= 0) {
            gameOver = true;
            player.alive = false;
            createExplosion(player.x, player.y);
        }

        // Draw game elements
        drawBridge();
        drawPlayer();
        drawObstacles();
        drawBullets();
        drawBomberBullets(); // Draw bomber bullets
        drawPowerUps();
        drawFuels();
        drawRepairKits();
        drawExplosions();
        drawPowerupMessages();

        // Explicitly draw the boss if it exists, regardless of UI drawing
        if (boss) {
            drawBoss();
        }

        // Draw UI
        drawMinimalistUI();
    } else {
        // Game over screen
        drawGameOver();
        // Don't continue animation loop when game is over
        // The restart will trigger a new game loop
        return;
    }

    // Continue the animation loop only if not game over
    if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}