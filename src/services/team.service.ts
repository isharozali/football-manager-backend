import httpStatus from "http-status";
import { TeamModel, TeamDocument, PlayerSubdoc } from "../models/team.model";
import { HttpError } from "../middlewares/error";
import { JobModel } from "../models/job.model";
import {
  INITIAL_SQUAD_COMPOSITION,
  PLAYER_DEFAULT_PRICE,
  TEAM_INITIAL_BUDGET,
} from "../config/constants.js";

export const teamService = {
  async getMyTeam(userId: string): Promise<TeamDocument | null> {
    return TeamModel.findOne({ userId }).exec();
  },

  async enqueueCreation(userId: string): Promise<{ jobId: string }> {
    const existing = await TeamModel.findOne({ userId }).exec();
    if (existing) {
      throw new HttpError(httpStatus.CONFLICT, "Team already exists");
    }
    const job = await JobModel.create({ type: "create-team", payload: { userId } });
    return { jobId: String(job._id) };
  },
};

export function generateInitialPlayers(): PlayerSubdoc[] {
  const players: Array<Omit<PlayerSubdoc, "_id">> = [];

  const add = (count: number, position: PlayerSubdoc["position"], namePrefix: string) => {
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

  // Cast by construction via model create
  return players as unknown as PlayerSubdoc[];
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
    players: generateInitialPlayers(),
  });
  return team;
}
