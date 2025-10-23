// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let countdownTimer; // Will store the countdown timer
let score = 0; // Player's score
let timeLeft = 30; // Game duration in seconds

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  // Clear any existing timers
  clearInterval(dropMaker);
  clearInterval(countdownTimer);

  timeLeft = 30; // Reset time left
  gameRunning = true;
  document.getElementById("time").textContent = "30"; // Reset timer display
  score = 0; // Reset score at the start of the game
  updateScoreDisplay(); // Update score display on screen
  
  // Hide game over message if visible
  document.getElementById("gameOverMessage").classList.add("hidden");
  // Remove any leftover confetti from a previous game
  const existingConfetti = document.getElementById("confetti");
  if (existingConfetti) existingConfetti.remove();
  
  countdown(); // Start the countdown timer

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
}

function endGame() {
  // Stop creating new drops
  clearInterval(dropMaker);
  clearInterval(countdownTimer);

  // Remove any remaining drops
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());
  
    gameRunning = false; 
    displayGameOverMessage();
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // NEW: mark some drops as "bad" and style them differently
  const isBad = Math.random() < 0.25; // 25% chance to be a bad drop
  drop.dataset.type = isBad ? "bad" : "good";
  if (isBad) {
    drop.classList.add("bad-drop");
    // visually distinguish bad drops
    drop.style.backgroundColor = "#e74c3c"; // red
    drop.style.boxShadow = "0 0 10px rgba(231, 76, 60, 0.7)";
  } else {
    drop.classList.add("good-drop");
  }

  // Add click handler to the drop
  drop.addEventListener("click", () => {
    if (gameRunning) {
      // Score change depends on drop type
      if (drop.dataset.type === "bad") {
        score--; // bad drop: -1
      } else {
        score++; // good drop: +1
      }
      updateScoreDisplay(); // Update score on screen
      
      // Add fade-out class and remove drop after animation
      drop.style.pointerEvents = "none"; // Prevent multiple clicks
      drop.style.opacity = "0";
      drop.style.transition = "opacity 0.5s ease";
      
      setTimeout(() => {
        drop.remove();
      }, 500); // Remove after 0.5 seconds
    }
  });

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

function countdown() {
  const countdownDisplay = document.getElementById("time");

  countdownTimer = setInterval(() => {
    timeLeft--;
    countdownDisplay.textContent = `${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      endGame();
    }
  }, 1000);
}

function updateScoreDisplay() {
  document.getElementById("score").textContent = `${score}`;
}
function displayGameOverMessage() {
  const gameOverMessage = document.getElementById("gameOverMessage");
  const gameOverTitle = document.getElementById("gameOverTitle");
  const gameOverText = document.getElementById("gameOverText");
  const finalScore = document.getElementById("finalScore");

  finalScore.textContent = score;

  if(score >= 20){
    gameOverTitle.textContent = "Congratulations!";
    gameOverText.textContent = "You won with a score of " + score + "!";
    // Fire confetti for 3.5 seconds on win
    launchConfetti(3500);
  }
  else{
    gameOverTitle.textContent = "Game Over!";
    gameOverText.textContent = "Your final score is " + score + ". Try again to improve your score!";
  }

  gameOverMessage.classList.remove("hidden");

  // ✅ bring the game over message to the very top each time
  gameOverMessage.parentElement.appendChild(gameOverMessage);
}

// Simple confetti renderer over the game container
function launchConfetti(duration = 3000) {
  const container = document.getElementById("game-container");
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.id = "confetti";
  canvas.className = "confetti-canvas";
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const COLORS = ["#FFC907", "#2E9DF7", "#4FCB53", "#FF902A", "#F5402C"];
  const COUNT = 160;

  const particles = Array.from({ length: COUNT }, () => makeParticle());

  function makeParticle() {
    return {
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 50,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      alpha: 1
    };
  }

  let startTs;

  function frame(ts) {
    if (!canvas.isConnected) return; // stop if removed externally
    if (!startTs) startTs = ts;
    const elapsed = ts - startTs;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      // physics
      p.vy += 0.05; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      // recycle while active
      if (elapsed < duration && p.y - 20 > canvas.height) {
        p.x = Math.random() * canvas.width;
        p.y = -10;
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = 2 + Math.random() * 3;
        p.rot = Math.random() * Math.PI * 2;
        p.vr = (Math.random() - 0.5) * 0.2;
        p.alpha = 1;
      }

      // fade out after duration
      if (elapsed >= duration) p.alpha -= 0.02;

      // draw
      ctx.save();
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    const allGone = elapsed > duration && particles.every(p => p.alpha <= 0);
    if (allGone) {
      canvas.remove();
      return;
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}