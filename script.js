// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0; // Player's score

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  document.getElementById("time").textContent = "30"; // Reset timer display
  score = 0; // Reset score at the start of the game
  updateScoreDisplay(); // Update score display on screen
  countdown(); // Start the countdown timer

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
}

function endGame() {
  gameRunning = false;

  // Stop creating new drops
  clearInterval(dropMaker);

  console.log("Game has ended. Final score: " + score); // Debug log

  // Display winning message
  if(score >= 20){
    alert("Congratulations! You won with a score of " + score + "!");
  }
  else{
    alert("Game Over! Your final score is " + score + ". Try again to improve your score!");
  }
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

  // Add click handler to the drop
  drop.addEventListener("click", () => {
    if (gameRunning) {
      score++; // Increment score
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
  let timeLeft = 30; // 30 seconds countdown
  const countdownDisplay = document.getElementById("time");

  const timer = setInterval(() => {
    timeLeft--;
    countdownDisplay.textContent = `${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function updateScoreDisplay() {
  document.getElementById("score").textContent = `${score}`;
}