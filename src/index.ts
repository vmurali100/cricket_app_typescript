import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import playerRoutes from "./routes/players";
import teamRoutes from "./routes/teams";

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());

morgan.token("body", (req: Request) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.use("/players", playerRoutes);
app.use("/teams", teamRoutes);

app.get("/", (req: Request, resp: Response): void => {
  resp.json({ message: "welcome to NodeJS application !!!" });
});

app.listen(port, () => {
  console.log("Server Listening at " + port);
});
