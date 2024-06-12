import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { Player } from "../models/player";
import playersLogger from "../loggers/playersLogger";
import pool from "../db";

const router = express.Router();
let players: Player[] = [];

// Middleware to check validation results
const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    playersLogger.error(`Validation failed: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({ errors: errors });
  }
  next();
};

// Create a new player
router.post(
  "/",
  [
    body("player_id").isInt().withMessage("ID must be an integer"),
    body("player_name").isString().notEmpty().withMessage("Name is required"),
    body("team_id").isInt().withMessage("Team ID must be an integer"),
  ],
  validate,
  (req: Request, res: Response) => {
    const { player_id, player_name, team_id } = req.body;
    const query = `
      INSERT INTO players (player_id, player_name, team_id)
      VALUES ('${player_id}', '${player_name}', '${team_id}')`;

    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        playersLogger.error(`Error executing query: ${error}`);
        return res
          .status(500)
          .send("An error occurred while creating the player.");
      }
      res.status(201).send({ player_id, player_name, team_id });
    });
  }
);

// Get all players
router.get("/", async (req: Request, res: Response) => {
  playersLogger.info("Retrieved all players");
  pool.connect((error) => {
    if (error) {
      console.error("Error connecting to the database:", error);
      return;
    }
    const query = "SELECT * FROM players";
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        return;
      }
      res.send(results);
    });
  });
});

// Get a single player by ID
router.get(
  "/:id",
  [param("id").isInt().withMessage("ID must be an integer")],
  validate,
  (req: Request, res: Response) => {
    const player_id = parseInt(req.params.id);
    const query = `SELECT * FROM players WHERE player_id = ${player_id}`;
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        return;
      }
      res.send(results);
    });
  }
);

// Update a player by ID

router.put(
  "/:id",
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("player_id").isInt().withMessage("ID must be an integer"),
    body("player_name").isString().notEmpty().withMessage("Name is required"),
    body("team_id").isInt().withMessage("Team ID must be an integer"),
  ],
  validate,
  (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { player_id, player_name, team_id } = req.body;
    const query = `UPDATE players SET player_name='${player_name}', player_id='${player_id}', team_id='${team_id}' WHERE player_id = ${id}`;
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        res.status(500).send("An error occurred while updating the player.");
        return;
      }
      res.send("Player updated successfully.");
    });
  }
);
// Delete a player by ID
router.delete(
  "/:id",
  [param("id").isInt().withMessage("ID must be an integer")],
  validate,
  (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const query = `DELETE FROM players WHERE player_id = ${id}`;
    pool.query(query, (error, results: any) => {
      if (error) {
        console.error("Error executing query:", error);
        res.status(500).send("An error occurred while deleting the player.");
        return;
      }
      if (results.affectedRows === 0) {
        playersLogger.error(`Player not found: ID ${id}`);
        res.status(404).send("Player not found");
      } else {
        playersLogger.info(`Player deleted: ID ${id}`);
        res.send(`Player with ID ${id} deleted successfully.`);
      }
    });
  }
);

export default router;
