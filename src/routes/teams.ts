import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { Team } from "../models/team";
import teamsLogger from "../loggers/teamsLogger";
import pool from "../db";

const router = express.Router();
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
    body("team_id").isInt().withMessage("ID must be an integer"),
    body("team_name").isString().notEmpty().withMessage("Name is required")
  ],
  validate,
  (req: Request, res: Response) => {
    const { team_id , team_name } = req.body;
    const query = `
      INSERT INTO teams (team_id, team_name)
      VALUES ('${team_id}', '${team_name}')`;
    pool.query(query, (error, results) => {
      if (error) {
        teamsLogger.error(`Error executing query: ${error}`);
        return res
          .status(500)
          .send("An error occurred while creating the Team.");
      }
      res.status(201).send({ team_id, team_name });
    });
  }
);

// Get all teams
router.get("/", (req: Request, res: Response) => {
  teamsLogger.info("Retrieved all Teams");
  pool.connect((error) => {
    if (error) {
      console.error("Error connecting to the database:", error);
      return;
    }
    const query = "SELECT * FROM teams";
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        return;
      }
      res.send(results);
    });
  });
});

router.get(
  "/:id",
  [param("id").isInt().withMessage("ID must be an integer")],
  validate,
  (req: Request, res: Response) => {
    const team_id = parseInt(req.params.id);
    const query = `SELECT * FROM teams WHERE team_id = ${team_id}`;
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        return;
      }
      res.send(results);
    });
  }
);
// Update a team by ID
router.put(
  "/:id",
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("team_name").isString().notEmpty().withMessage("Name is required"),
    body("team_id").isInt().withMessage("Team ID must be an integer"),
  ],
  validate,
  (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { team_id , team_name } = req.body;
    const query = `UPDATE teams SET team_name='${team_name}', team_id='${team_id}' WHERE team_id = ${id}`;
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        res.status(500).send("An error occurred while updating the Team.");
        return;
      }
      res.send("Team updated successfully.");
    });
  }
);

// Delete a team by ID
router.delete(
  "/:id",
  [param("id").isInt().withMessage("ID must be an integer")],
  validate,
  (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const query = `DELETE FROM teams WHERE team_id = ${id}`;
    pool.query(query, (error, results:any) => {
      if (error) {
        console.error("Error executing query:", error);
        res.status(500).send("An error occurred while deleting the player.");
        return;
      }
      if (results.affectedRows === 0) {
        teamsLogger.error(`Team not found: ID ${id}`);
        res.status(404).send("Team not found");
      } else {
        teamsLogger.info(`Team deleted: ID ${id}`);
        res.send(`Team with ID ${id} deleted successfully.`);
      }
    });
  }
);

export default router;
