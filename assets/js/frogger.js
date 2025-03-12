(function() {
    const deerCanvas = document.getElementById('frogger-canvas');
    const deerCtx = deerCanvas.getContext('2d');
    
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let pastyReward = false;
    let pastyTimer = 0;
    
    // Load images
    const deer = {
        x: deerCanvas.width / 2 - 30,
        y: deerCanvas.height - 70,
        width: 60,
        height: 60,
        speed: 30,
        sprite: new Image(),
      };
    deer.sprite.src = 'images/deer.png'; 
    
    const vehicles = [
      { x: 0, y: 120, width: 70, height: 50, speed: 1.5, sprite: new Image() }, // Old truck (slowest)
      { x: 250, y: 200, width: 80, height: 50, speed: 3, sprite: new Image() }, // School bus (medium)
      { x: 500, y: 240, width: 70, height: 40, speed: 5, sprite: new Image() }  // Sports car (fastest)
    ];
    
    vehicles[0].sprite.src = 'images/old_truck.png';
    vehicles[1].sprite.src = 'images/school_bus.png';
    vehicles[2].sprite.src = 'images/sports_car.png';
    
    const pasty = new Image();
    pasty.src = 'images/pasty.png';
    
    // Keyboard controls (Only for Deer Game)
    document.addEventListener('keydown', function(event) {
        // Check if deerCanvas is currently on the page and visible
        const deerCanvas = document.getElementById('frogger-canvas');
        if (!deerCanvas || deerCanvas.offsetParent === null) return; // Stop if not visible

        // Prevent arrow keys from scrolling the page
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
        }

        // Restart game if 'A' is pressed
        if (gameOver && (event.key === 'a' || event.key === 'A')) {
            restartGame();
            return;
        }

        if (gameOver) return;

        switch(event.key) {
            case 'ArrowLeft':
                if (deer.x > 0) deer.x -= deer.speed;
                break;

            case 'ArrowRight':
                if (deer.x + deer.width < deerCanvas.width) deer.x += deer.speed;
                break;

            case 'ArrowUp':
                if (deer.y > 0) {
                    deer.y -= deer.speed;
                    score += 10;
                }
                if (deer.y <= 60) {  // Reached the other side
                    score += 100;
                    pastyReward = true;
                    pastyTimer = 120; // Show pasty for 120 frames
                    resetDeer();
                }
                break;

            case 'ArrowDown':
                if (deer.y + deer.height < deerCanvas.height) deer.y += deer.speed;
                break;
        }
    });
    // Mobile Touch Controls for Deer Game
    document.getElementById("deer-up").addEventListener("touchstart", () => moveDeer("up"));
    document.getElementById("deer-down").addEventListener("touchstart", () => moveDeer("down"));
    document.getElementById("deer-left").addEventListener("touchstart", () => moveDeer("left"));
    document.getElementById("deer-right").addEventListener("touchstart", () => moveDeer("right"));

    function moveDeer(direction) {
        if (gameOver) return;

        switch(direction) {
            case "left": if (deer.x > 0) deer.x -= deer.speed; break;
            case "right": if (deer.x + deer.width < deerCanvas.width) deer.x += deer.speed; break;
            case "up":
                if (deer.y > 0) {
                    deer.y -= deer.speed;
                    score += 10;
                }
                if (deer.y <= 60) {  
                    score += 100;
                    pastyReward = true;
                    pastyTimer = 120; 
                    resetDeer();
                }
                break;
            case "down": if (deer.y + deer.height < deerCanvas.height) deer.y += deer.speed; break;
        }
    }
    
    function drawBackground() {
      deerCtx.fillStyle = '#2C3E50';
      deerCtx.fillRect(0, 0, deerCanvas.width, deerCanvas.height);
      deerCtx.fillStyle = '#4CAF50';
      deerCtx.fillRect(0, 0, deerCanvas.width, 60); // Safe zone
      deerCtx.fillRect(0, deerCanvas.height - 60, deerCanvas.width, 60); // Start zone
    }
    
    function drawDeer() {
      deerCtx.drawImage(deer.sprite, deer.x, deer.y, deer.width, deer.height);
    }
    
    function drawVehicles() {
      vehicles.forEach(vehicle => {
        deerCtx.drawImage(vehicle.sprite, vehicle.x, vehicle.y, vehicle.width, vehicle.height);
        vehicle.x += vehicle.speed;
        if (vehicle.x > deerCanvas.width) vehicle.x = -vehicle.width;
      });
    }
    
    function drawUI() {
      deerCtx.fillStyle = 'white';
      deerCtx.font = '18px Arial';
      deerCtx.textAlign = 'left';
      deerCtx.fillText(`Score: ${score}`, 10, 20);
      deerCtx.fillText(`Lives: ${lives}`, deerCanvas.width - 100, 20);
    }
    
    function checkCollision() {
      vehicles.forEach(vehicle => {
        if (deer.x < vehicle.x + vehicle.width &&
            deer.x + deer.width > vehicle.x &&
            deer.y < vehicle.y + vehicle.height &&
            deer.y + deer.height > vehicle.y) {
              lives--;
              resetDeer();
              if(lives === 0) {
                gameOver = true;
              }
          }
      });
    }
    
    function resetDeer() {
      deer.x = deerCanvas.width / 2 - deer.width / 2;
      deer.y = deerCanvas.height - 50;
    }
    
    function restartGame() {
      score = 0;
      lives = 3;
      gameOver = false;
      pastyReward = false;
      resetDeer();
    }
    
    function gameOverScreen() {
      deerCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      deerCtx.fillRect(0, 0, deerCanvas.width, deerCanvas.height);
      deerCtx.fillStyle = 'white';
      deerCtx.textAlign = 'center';
      deerCtx.font = '40px Arial';
      deerCtx.fillText('GAME OVER', deerCanvas.width / 2, deerCanvas.height / 2);
      deerCtx.font = '20px Arial';
      deerCtx.fillText(`Final Score: ${score}`, deerCanvas.width / 2, deerCanvas.height / 2 + 50);
      deerCtx.font = '16px Arial';
      deerCtx.fillText("Press 'A' to restart, eh!", deerCanvas.width / 2, deerCanvas.height / 2 + 80);
    }
    
    function drawPastyReward() {
      if (pastyReward) {
        deerCtx.drawImage(pasty, deerCanvas.width / 2 - 40, 100, 80, 50);
        deerCtx.fillStyle = 'white';
        deerCtx.font = '24px Arial';
        deerCtx.fillText("Made er!", deerCanvas.width / 2, 180);
        
        pastyTimer--;
        if (pastyTimer <= 0) {
          pastyReward = false;
        }
      }
    }
    
    function gameLoop() {
      deerCtx.clearRect(0, 0, deerCanvas.width, deerCanvas.height);
      
      if (!gameOver) {
        drawBackground();
        drawDeer();
        drawVehicles();
        checkCollision();
        drawUI();
        drawPastyReward();
      } else {
        gameOverScreen();
      }
    
      requestAnimationFrame(gameLoop);
    }
    
    deer.sprite.onload = () => {
      gameLoop();
    };    
  })();
  