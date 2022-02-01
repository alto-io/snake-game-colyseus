import { EXPANSION_RATE } from "./constants.js";
import { onSnake, expandSnake } from "./snake.js";
import { roomReference } from "./SnakeRoom";

export let food;

//OPArcade: set food coordinate once obtained from client
export function setFood(x) {
  food = x;
}

export function update() {
  if (onSnake(food)) {
    expandSnake(EXPANSION_RATE);
    roomReference.addScore();
    roomReference.increaseSpeed();
  }
}
