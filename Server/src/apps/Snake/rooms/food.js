import { EXPANSION_RATE } from "./constants.js";
import { onSnake, expandSnake } from "./snake.js";
import { randomGridPosition } from "./grid.js";
import { roomReference } from "./SnakeRoom";

export let food = getRandomFoodPosition();

export function update() {
  if (onSnake(food)) {
    expandSnake(EXPANSION_RATE);
    roomReference.addScore();
    roomReference.increaseSpeed();
    food = getRandomFoodPosition();
  }
}

function getRandomFoodPosition() {
  let newFoodPosition;
  while (newFoodPosition == null || onSnake(newFoodPosition)) {
    newFoodPosition = randomGridPosition();
  }
  return newFoodPosition;
}
