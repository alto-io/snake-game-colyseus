import { Schema, Context } from "@colyseus/schema";
import { randomGridPosition } from "../grid";

const type = Context.create();

export class SnakeRoomState extends Schema {
  //end game flag
  @type("boolean")
  gameOver = false;

  //score
  @type("number")
  score = 0;

  //food x coordinate
  @type("string")
  foodPosition = JSON.stringify(randomGridPosition());
}
