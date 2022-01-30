import { Schema, Context, type } from "@colyseus/schema";

export class SnakeRoomState extends Schema {
  @type("string") mySynchronizedProperty: string = "Hello world";
}
