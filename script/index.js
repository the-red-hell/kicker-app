import express from "express";
import process from "process";
import console from "console";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
  console.log("Received a request at /");
});

const server = app.listen(PORT, () => {
  console.log(`Server started on: ${server.address().address}, port: ${server.address().port}`);
});