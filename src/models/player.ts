import pool from "../db";

export interface Player {
  id: number;
  name: string;
  team: string;
}

export const getAllPlayers = async (): Promise<Player[]> => {
    console.log("getAllPlayers Called ")
  const [rows] = await pool.query<any[]>("SELECT * FROM players");
  return rows;
};

export const getPlayerById = async (id: number): Promise<Player | null> => {
  const [rows] = await pool.query<any[]>("SELECT * FROM players WHERE id = ?", [
    id,
  ]);
  return rows[0] || null;
};

export const createPlayer = async (player: Player): Promise<void> => {
  await pool.query("INSERT INTO players (id, name, team) VALUES (?, ?, ?)", [
    player.id,
    player.name,
    player.team,
  ]);
};

export const updatePlayer = async (
  id: number,
  player: Player
): Promise<void> => {
  await pool.query(
    "UPDATE players SET id = ?, name = ?, team = ? WHERE id = ?",
    [player.id, player.name, player.team, id]
  );
};

export const deletePlayer = async (id: number): Promise<void> => {
  await pool.query("DELETE FROM players WHERE id = ?", [id]);
};
