import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { Team } from "../models/team";
import teamsLogger from "../loggers/teamsLogger";

const router = express.Router();
let teams: Team[] = [];

// Middleware to check validation results
const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    teamsLogger.error(`Validation failed: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create a new team
router.post(
  "/",
  [
    body("id").isInt().withMessage("ID must be an integer"),
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("city").isString().notEmpty().withMessage("City is required"),
  ],
  validate,
  (req: Request, res: Response) => {
    const newTeam: Team = req.body;
    teams.push(newTeam);
    teamsLogger.info(`Team created: ${JSON.stringify(newTeam)}`);
    res.status(201).send(newTeam);
  }
);

// Get all teams
router.get("/", (req: Request, res: Response) => {
  teamsLogger.info("Retrieved all teams");

  res.send(teams);
});

// Get a single team by ID
router.get(
  "/:id",
  [param("id").isInt().withMessage("ID must be an integer")],
  validate,
  (req: Request, res: Response) => {
    const team = teams.find((t) => t.id === parseInt(req.params.id));
    if (team) {
      teamsLogger.info(`Team retrieved: ${JSON.stringify(team)}`);
      res.send(team);
    } else {
      teamsLogger.error(`Team not found: ID ${req.params.id}`);
      res.status(404).send("Team not found");
    }
  }
);

// Update a team by ID
router.put(
  "/:id",
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("id").isInt().withMessage("ID must be an integer"),
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("city").isString().notEmpty().withMessage("City is required"),
  ],
  validate,
  (req: Request, res: Response) => {
    const index = teams.findIndex((t) => t.id === parseInt(req.params.id));
    if (index !== -1) {
      teams[index] = req.body;
      teamsLogger.info(`Team updated: ${JSON.stringify(teams[index])}`);
      res.send(teams[index]);
    } else {
      teamsLogger.error(`Team not found: ID ${req.params.id}`);
      res.status(404).send("Team not found");
    }
  }
);

// Delete a team by ID
router.delete(
  "/:id",
  [param("id").isInt().withMessage("ID must be an integer")],
  validate,
  (req: Request, res: Response) => {
    const index = teams.findIndex((t) => t.id === parseInt(req.params.id));
    if (index !== -1) {
      const deletedTeam = teams.splice(index, 1);
      teamsLogger.info(`Team deleted: ${JSON.stringify(deletedTeam[0])}`);
      res.send(deletedTeam[0]);
    } else {
      teamsLogger.error(`Team not found: ID ${req.params.id}`);
      res.status(404).send("Team not found");
    }
  }
);

export default router;
