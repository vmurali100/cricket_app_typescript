import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.get("/test", (req: Request, resp: Response): void => {
  resp.json({ message: "welcome to NodeJS application !!!" });
});

app.listen(port, () => {
  console.log("Server Listening at " + port);
});
