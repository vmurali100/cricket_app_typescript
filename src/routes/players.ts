import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { getAllPlayers, Player } from "../models/player";
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
    body("id").isInt().withMessage("ID must be an integer"),
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("team").isString().notEmpty().withMessage("Team is required"),
  ],
  validate,
  (req: Request, res: Response) => {
    const newPlayer: Player = req.body;
    players.push(newPlayer);
    playersLogger.info(`Player created: ${JSON.stringify(newPlayer)}`);
    res.status(201).send(newPlayer);
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
    const player = players.find((p) => p.id === parseInt(req.params.id));
    if (player) {
      playersLogger.info(`Player retrieved: ${JSON.stringify(player)}`);
      res.send(player);
    } else {
      playersLogger.error(`Player not found: ID ${req.params.id}`);
      res.status(404).send("Player not found");
    }
  }
);

// Update a player by ID
router.put(
  "/:id",
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("id").isInt().withMessage("ID must be an integer"),
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("team").isString().notEmpty().withMessage("Team is required"),
  ],
  validate,
  (req: Request, res: Response) => {
    const index = players.findIndex((p) => p.id === parseInt(req.params.id));
    if (index !== -1) {
      players[index] = req.body;
      playersLogger.info(`Player updated: ${JSON.stringify(players[index])}`);
      res.send(players[index]);
    } else {
      playersLogger.error(`Player not found: ID ${req.params.id}`);
      res.status(404).send("Player not found");
    }
  }
);

// Delete a player by ID
router.delete(
  "/:id",
  [param("id").isInt().withMessage("ID must be an integer")],
  validate,
  (req: Request, res: Response) => {
    const index = players.findIndex((p) => p.id === parseInt(req.params.id));
    if (index !== -1) {
      const deletedPlayer = players.splice(index, 1);
      playersLogger.info(`Player deleted: ${JSON.stringify(deletedPlayer[0])}`);
      res.send(deletedPlayer[0]);
    } else {
      playersLogger.error(`Player not found: ID ${req.params.id}`);
      res.status(404).send("Player not found");
    }
  }
);

export default router;
