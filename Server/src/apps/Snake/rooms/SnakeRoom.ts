import { Room, Client, subscribeLobby } from "colyseus";
import { SnakeRoomState } from "./schema/SnakeRoomState";
import { TournamentApi } from "../../../library/TournamentApi";

import {
  updateSnakeBody,
  getSnakeHead,
  snakeIntersection,
  onSnake,
} from "./snake.js";
import { update as updateFood, food } from "./food.js";
import { outsideGrid } from "./grid.js";
import { RATE_INCREASE, ADD_SCORE } from "./constants.js";

export var roomReference: SnakeRoom = null;

export class SnakeRoom extends Room<SnakeRoomState> {
  private api: TournamentApi; //This is REQUIRED
  maxClients = 1; //This limits the Colyseus room to one participant

  //room options -- these are parameters required to be sent from your game to Colyseus via joinorcreate()
  playerId: string;
  tourneyId: string;
  token: string;
  score: number;

  snakeSpeed = 5;

  //call this function at the end of the game round to send the score to OPArcade servers for posting
  submitScore() {
    this.api.postScore(
      this.playerId,
      this.tourneyId,
      this.token,
      this.state.score
    );
  }

  onCreate(options: any) {
    roomReference = this;
    this.api = new TournamentApi(); //This initializes the OPArcade tourney functions, keep this
    this.setState(new SnakeRoomState());
    this.registerMessages();
  }

  private registerMessages() {
    this.onMessage("*", (client, message: string) => {
      updateSnakeBody(JSON.parse(message)); // this is infomation from Client

      //we do computation on server based on input from client and then mirror the data back to client
      updateFood();
      this.state.foodPosition = JSON.stringify(food);

      this.checkDeath();

      if (this.state.gameOver) {
        this.submitScore();
        this.clock.setTimeout(() => {
          this.disconnect();
        }, 500);
      }
    });
  }

  checkDeath() {
    this.state.gameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
  }

  addScore() {
    this.state.score += Math.floor(this.snakeSpeed) + ADD_SCORE;
    if (this.snakeSpeed >= 10) {
      this.state.score += Math.floor(this.snakeSpeed) + ADD_SCORE * 2;
    }
  }

  increaseSpeed() {
    this.snakeSpeed += RATE_INCREASE;
    if (this.snakeSpeed >= 6) {
      this.snakeSpeed += RATE_INCREASE * 4;
    }
  }

  //This is a stub required for OPArcade integration, no need to modify this
  onAuth(client: Client, options: Record<string, string>): boolean {
    console.log(options);
    this.playerId = options.playerid;
    this.tourneyId = options.tourneyid;
    this.token = options.otp;

    return true;
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
