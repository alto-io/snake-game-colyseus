import {
  update as updateSnake,
  draw as drawSnake,
  getSnakeHead,
  snakeIntersection,
} from "./snake.js";
import { update as updateFood, draw as drawFood } from "./food.js";
import { outsideGrid } from "./grid.js";
import { RATE_INCREASE, ADD_SCORE } from "./constants.js";

// DOM
const gameBoard = document.getElementById("gameBoard");
const scoreContainer = document.getElementById("score");
const highScoreContainer = document.getElementById("highScore");
const playBtn = document.getElementById("play");
const instBtn = document.getElementById("instructions");
const loginBtn = document.getElementById("login");
const backBtn = document.getElementById("back");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");
const switchBtn = document.getElementById("switch");
const instModal = document.getElementById("instModal");
const titleModal = document.getElementById("titleModal");
const overlayModal = document.getElementById("overlayModal");
const gameOverModal = document.getElementById("gameOverModal");
const mobileContainer = document.getElementById("mobileContainer");
const positionText = document.getElementById("position");

// GAME LOOP
let deltaTime = 0;
let gameOver = false;
let snakeSpeed = 5; //how many times the snake moves per second
export var score = 0;
let highScore = 0;
scoreContainer.innerHTML = score;
highScoreContainer.innerHTML = score;

//OPArcade: Add these variables for communication with other files
let client = null;
export var room = null;
export var isOnline = false;
export var foodPosition = "";

function main(currentTime) {
  if (gameOver) {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }

    gameOverModal.classList.remove("display-none");
  } else {
    window.requestAnimationFrame(main);
    const secondsSinceLastRender = (currentTime - deltaTime) / 1000;

    // # of seconds between each move
    if (secondsSinceLastRender < 1 / snakeSpeed) return;
    deltaTime = currentTime;

    update();
    draw();
  }
}

async function startGame() {
  //OPArcade: Get authentication parameters from GET request
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  //OPArcade: Flag as online (tournament) if additional parameters detected
  if (params.playerid && params.otp && params.tourneyid) {
    isOnline = true;
  }

  //OPArcade: Attempt Colyseus connection if flagged as online (tournament)
  if (isOnline) {
    //OPArcade: Connect to Colyseus
    client = new Colyseus.Client(
      "ws://localhost:2567" //OPArcade: change this when actually deploying to OPArcade or Colyseus Arena
    );

    await client
      .joinOrCreate("snake_room", {
        playerid: params.playerid,
        otp: params.otp,
        tourneyid: params.tourneyid,
      })
      .then((r) => {
        room = r;

        //OPArcade:  Initialize first food position from server info, this callback is called only once
        room.onStateChange.once((state) => {
          foodPosition = JSON.parse(state.foodPosition);
        });

        registerCallbacks();
      })
      .catch((e) => {
        console.log(e);
        isOnline = false;
      });
  }

  retrieveScore();
  overlayModal.style.display = "none";
  window.requestAnimationFrame(main);
}

//OPArcade: Register callbacks from Colyseus Server
function registerCallbacks() {
  room.state.onChange = (changes) => {
    changes.forEach((change) => {
      switch (change.field) {
        case "foodPosition":
          foodPosition = JSON.parse(change.value);
          break;
        case "score":
          score = change.value;
          break;
        case "gameOver":
          gameOver = change.value;
          break;
      }
    });
  };
}

function instructions() {
  instModal.classList.remove("display-none");
  titleModal.classList.add("display-none");
}

function back() {
  instModal.classList.add("display-none");
  titleModal.classList.remove("display-none");
}

function update() {
  updateSnake();
  updateFood();
  checkDeath();
}

function draw() {
  gameBoard.innerHTML = "";
  drawSnake(gameBoard);
  drawFood(gameBoard);
}

function checkDeath() {
  //OPArcade: Death is determined server-side, but proceed to check locally in case there is lag
  if (isOnline) {
    if (gameOver) return true;
  }

  gameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
}

function compareScore(score, highScore) {
  if (score > highScore) {
    highScore = score;
    highScoreContainer.innerHTML = highScore;
  }
  return;
}

function retrieveScore() {
  if (localStorage.getItem("highScore") !== null) {
    highScore = parseInt(localStorage.getItem("highScore"));
    highScoreContainer.innerHTML = highScore;
  }
}

function restartGame() {
  score = 0;
  highScore = 0;
  window.location = "/";
}

function toggleSwitch() {
  mobileContainer.classList.toggle("row-reverse");
  if (positionText.innerHTML === "left") {
    positionText.innerHTML = "right";
  } else {
    positionText.innerHTML = "left";
  }
}

export function increaseSpeed() {
  snakeSpeed += RATE_INCREASE;
  if (snakeSpeed >= 6) {
    snakeSpeed += RATE_INCREASE * 4;
  }
}

export function addScore() {
  //OPArcade: Score will  be coming from Server
  if (isOnline) {
  } else {
    score += Math.floor(snakeSpeed) + ADD_SCORE;
    if (snakeSpeed >= 10) {
      score += Math.floor(snakeSpeed) + ADD_SCORE * 2;
    }
  }
  scoreContainer.innerHTML = score;
  compareScore(score, highScore);
}

playBtn.addEventListener("click", startGame);
instBtn.addEventListener("click", instructions);
backBtn.addEventListener("click", back);
yesBtn.addEventListener("click", restartGame);
noBtn.addEventListener("click", restartGame);
switchBtn.addEventListener("click", toggleSwitch);
