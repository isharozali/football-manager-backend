import { TeamModel, TeamDocument, PlayerSubdoc } from "../models/team.model";
import { PlayerModel, type Position } from "../models/player.model";
import {
  INITIAL_SQUAD_COMPOSITION,
  PLAYER_DEFAULT_PRICE,
  TEAM_INITIAL_BUDGET,
} from "../config/constants.js";
import { randomInt } from "crypto";

export const teamService = {
  async getMyTeam(userId: string): Promise<{ team: TeamDocument | null; players: unknown[] }> {
    const team = await TeamModel.findOne({ userId }).exec();
    if (!team) return { team: null, players: [] };
    const players = await PlayerModel.find({ teamId: team._id }).exec();
    return { team, players };
  },
};

export function generateInitialPlayers(): Array<{
  name: string;
  position: Position;
  price: number;
  onTransferList: boolean;
}> {
  const players: Array<{
    name: string;
    position: Position;
    price: number;
    onTransferList: boolean;
  }> = [];

  const add = (count: number, position: Position, namePrefix: string) => {
    for (let i = 1; i <= count; i += 1) {
      players.push({
        name: `${namePrefix} ${i}`,
        position,
        price: PLAYER_DEFAULT_PRICE,
        onTransferList: false,
      });
    }
  };

  add(INITIAL_SQUAD_COMPOSITION.GK, "GK", "Goalkeeper");
  add(INITIAL_SQUAD_COMPOSITION.DEF, "DEF", "Defender");
  add(INITIAL_SQUAD_COMPOSITION.MID, "MID", "Midfielder");
  add(INITIAL_SQUAD_COMPOSITION.ATT, "ATT", "Attacker");

  return players;
}

export async function createTeamForUser(userId: string): Promise<TeamDocument> {
  const existing = await TeamModel.findOne({ userId }).exec();
  if (existing) {
    return existing;
  }
  const team = await TeamModel.create({
    userId,
    name: "My Team",
    budget: TEAM_INITIAL_BUDGET,
    // players: [],
  });
  const initialPlayers = generateInitialPlayers().map((p) => ({ ...p, teamId: team._id }));
  await PlayerModel.insertMany(initialPlayers);
  return team;
}
