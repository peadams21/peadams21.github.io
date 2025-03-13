const starcatCanvas = document.getElementById("starcat-canvas");
const starcatCtx = starcatCanvas.getContext("2d");
const images = {
    spaceship: "images/spaceship.png",
    heart: "images/heart.png",
    sadCat: "images/sad_cat.png",
    happyCat: "images/happy_cat.png",
    background: "images/background.png",
    yarnBall: "images/yarn_ball.png" // Add this image to your project
};
 
const loadedImages = {};
let loadedCount = 0;
const totalImages = Object.keys(images).length;
function loadImages(callback) {
    for (let key in images) {
      loadedImages[key] = new Image();
      loadedImages[key].src = images[key];
      loadedImages[key].onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) callback();
      };
    }
  }  
let player = { x: 375, y: 450, width: 70, height: 70, speed: 8 };
let hearts = [];
let cats = [];
let yarnBalls = []; // Array for yarn balls
let score = 0;
let gameOver = false;

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

// Keyboard Controls
document.addEventListener("keydown", (e) => {
    if (gameOver) {
      // Restart game with 'R' key
      if (e.key === "r" || e.key === "R") {
        score = 0;
        cats = [];
        hearts = [];
        yarnBalls = [];
        player = { x: 375, y: 450, width: 70, height: 70, speed: 8 };
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
// StarCat mobile Controls
document.getElementById("starcat-up").addEventListener("touchstart", () => moveStarship("up"));
document.getElementById("starcat-down").addEventListener("touchstart", () => moveStarship("down"));
document.getElementById("starcat-left").addEventListener("touchstart", () => moveStarship("left"));
document.getElementById("starcat-right").addEventListener("touchstart", () => moveStarship("right"));

function moveStarship(direction) {
    if (gameOver) return;

    switch(direction) {
        case "left":
            if (player.x > 0) player.x -= player.speed;
            break;
        case "right":
            if (player.x + player.width < starcatCanvas.width) player.x += player.speed;
            break;
        case "up":
            if (player.y > 0) player.y -= player.speed;
            break;
        case "down":
            if (player.y + player.height < starcatCanvas.height) player.y += player.speed;
            break;
    }
}
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
      if (
        hearts[j].x < cats[i].x + cats[i].width &&
        hearts[j].x + hearts[j].width > cats[i].x &&
        hearts[j].y < cats[i].y + cats[i].height &&
        hearts[j].y + hearts[j].height > cats[i].y
      ) {
        cats[i].happy = true;
        score += 10;
        hearts.splice(j, 1);
        
        // Remove happy cat after a moment
        const catIndex = i;
        setTimeout(() => {
          for (let k = 0; k < cats.length; k++) {
            if (cats[k] === cats[catIndex]) {
              cats.splice(k, 1);
              break;
            }
          }
        }, 500);
        
        break;
      }
    }
  }
  
  // Update yarn balls
  for (let i = yarnBalls.length - 1; i >= 0; i--) {
    yarnBalls[i].y += yarnBalls[i].speed;
    yarnBalls[i].rotation += yarnBalls[i].rotationSpeed;
    
    if (yarnBalls[i].y > starcatCanvas.height) {
      yarnBalls.splice(i, 1);
      continue;
    }
    
    // Check collision with player (collecting yarn balls)
    if (
      player.x < yarnBalls[i].x + yarnBalls[i].width &&
      player.x + player.width > yarnBalls[i].x &&
      player.y < yarnBalls[i].y + yarnBalls[i].height &&
      player.y + player.height > yarnBalls[i].y
    ) {
      score += 15; // Bonus points for collecting yarn
      
      // Create a score pop-up effect
      const floatingText = {
        x: yarnBalls[i].x,
        y: yarnBalls[i].y,
        text: "+15",
        color: "#FFFF00",
        size: 20,
        life: 30 // frames to live
      };
      
      yarnBalls.splice(i, 1);
      
      // You could add a sound effect here too
      // playSound('collect.mp3');
    }
  }
  
  // Game over if score drops below -50
  if (score < -50) {
    gameOver = true;
  }
}

function draw() {
  starcatCtx.clearRect(0, 0, starcatCanvas.width, starcatCanvas.height);
  starcatCtx.drawImage(loadedImages.background, 0, 0, starcatCanvas.width, starcatCanvas.height);
  
  // Draw game elements
  if (!gameOver) {
    starcatCtx.drawImage(loadedImages.spaceship, player.x, player.y, player.width, player.height);
  }
  
  // Draw hearts
  hearts.forEach(h => starcatCtx.drawImage(loadedImages.heart, h.x, h.y, h.width, h.height));
  
  // Draw cats
  cats.forEach(c => starcatCtx.drawImage(c.happy ? loadedImages.happyCat : loadedImages.sadCat, c.x, c.y, c.width, c.height));
  
  // Draw yarn balls with rotation
  yarnBalls.forEach(y => {
    starcatCtx.save();
    starcatCtx.translate(y.x + y.width/2, y.y + y.height/2);
    starcatCtx.rotate(y.rotation);
    
    if (loadedImages.yarnBall) {
      starcatCtx.drawImage(loadedImages.yarnBall, -y.width/2, -y.height/2, y.width, y.height);
    } else {
      // Fallback if image doesn't load
      starcatCtx.fillStyle = "#FF9999"; // Pink yarn
      starcatCtx.beginPath();
      starcatCtx.arc(0, 0, y.width/2, 0, Math.PI * 2);
      starcatCtx.fill();
      
      // Draw yarn texture
      starcatCtx.strokeStyle = "#FF6666";
      starcatCtx.lineWidth = 2;
      starcatCtx.beginPath();
      starcatCtx.moveTo(-y.width/4, 0);
      starcatCtx.lineTo(y.width/4, 0);
      starcatCtx.moveTo(0, -y.height/4);
      starcatCtx.lineTo(0, y.height/4);
      starcatCtx.stroke();
    }
    
    starcatCtx.restore();
  });
  
  // Display score
  starcatCtx.fillStyle = "white";
  starcatCtx.font = "20px Arial";
  starcatCtx.fillText(`Score: ${score}`, 10, 20);
  
  // Game over screen
  if (gameOver) {
    starcatCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
    starcatCtx.fillRect(0, 0, starcatCanvas.width, starcatCanvas.height);
    
    starcatCtx.fillStyle = "white";
    starcatCtx.font = "36px Arial";
    starcatCtx.textAlign = "center";
    starcatCtx.fillText("GAME OVER", starcatCanvas.width/2, starcatCanvas.height/2 - 40);
    starcatCtx.font = "24px Arial";
    starcatCtx.fillText(`Final Score: ${score}`, starcatCanvas.width/2, starcatCanvas.height/2);
    starcatCtx.font = "18px Arial";
    starcatCtx.fillText("Press 'R' to restart", starcatCanvas.width/2, starcatCanvas.height/2 + 40);
    starcatCtx.textAlign = "left";
  }
}

function gameLoop() {
  if (!gameOver) {
    update();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

// Load images then start the game
loadImages(gameLoop);