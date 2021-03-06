import { EXPANSION_RATE } from "./constants.js";
import { onSnake, expandSnake } from "./snake.js";
import { randomGridPosition } from "./grid.js";
import { increaseSpeed, addScore } from "./game.js";

let food = getRandomFoodPosition();

//OPArcade: Helper function... we will send this to server
export function getFood() {
  return food;
}

export function update() {
  if (onSnake(food)) {
    expandSnake(EXPANSION_RATE);
    addScore();
    increaseSpeed();
    food = getRandomFoodPosition();
  }
}

export function draw(gameBoard) {
  const foodElement = document.createElement("div");
  foodElement.style.gridRowStart = food.y;
  foodElement.style.gridColumnStart = food.x;
  foodElement.classList.add("food");
  gameBoard.appendChild(foodElement);
}

function getRandomFoodPosition() {
  let newFoodPosition;
  while (newFoodPosition == null || onSnake(newFoodPosition)) {
    newFoodPosition = randomGridPosition();
  }
  return newFoodPosition;
}
