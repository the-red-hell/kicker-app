import express from "express";
import process from "process";
import console from "console";
import { Pool } from "pg";

const app = express();
const PORT = process.env.PORT;

app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
  console.log("Received a request at /");
});

const server = app.listen(PORT, () => {
  console.log(
    `Server started on: ${server.address().address}, port: ${server.address().port}`
  );
});

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

const client = await pool.connect();
console.log("Connected to PostgreSQL successfully!");
client.release();
