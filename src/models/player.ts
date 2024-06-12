import pool from "../db";

export interface Player {
  player_id: number;
  player_name: string;
  team_id: string;
}

export const getAllPlayers = async (): Promise<Player[]> => {
  const [rows] = await pool.query<any[]>("SELECT * FROM players");
  return rows;
};

export const getPlayerById = async (id: number): Promise<Player | null> => {
  const [rows] = await pool.query<any[]>("SELECT * FROM players WHERE player_id = ?", [
    id,
  ]);
  return rows[0] || null;
};

export const createPlayer = async (player: Player): Promise<void> => {
  await pool.query("INSERT INTO players (player_id, player_name, team_id) VALUES (?, ?, ?)", [
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
    "UPDATE players SET player_id = ?, player_name = ?, team_id = ? WHERE player_id = ?",
    [player.id, player.name, player.team, id]
  );
};

export const deletePlayer = async (id: number): Promise<void> => {
  await pool.query("DELETE FROM players WHERE player_id = ?", [id]);
};
