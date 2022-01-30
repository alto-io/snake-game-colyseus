import { Room, Client } from "colyseus";
import { SnakeRoomState } from "./schema/SnakeRoomState";
import { TournamentApi } from "../../../library/TournamentApi";

export class SnakeRoom extends Room<SnakeRoomState> {
  private api: TournamentApi; //This is REQUIRED
  maxClients = 1; //This limits the Colyseus room to one participant

  //room options -- these are parameters required to be sent from your game to Colyseus via joinorcreate()
  playerId: string;
  tourneyId: string;
  token: string;
  finalScore: number;

  //call this function at the end of the game round to send the score to OPArcade servers for posting
  submitScore() {
    this.api.postScore(
      this.playerId,
      this.tourneyId,
      this.token,
      this.finalScore
    );
  }

  onCreate(options: any) {
    this.api = new TournamentApi(); //This initializes the OPArcade tourney functions
    this.setState(new SnakeRoomState());
    this.registerMessages();
  }

  private registerMessages() {
    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
  }

  //This is a stub required for OPArcade integration
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
