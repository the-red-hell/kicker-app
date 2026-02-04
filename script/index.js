import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import console from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
  console.log("Received a request at /");
});

const server = app.listen(PORT, () => {
  console.log(`Server started on port: ${server.address().port}`);
});