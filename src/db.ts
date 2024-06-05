import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  port: 8889,
  database: "cricket",
});

export default pool;
