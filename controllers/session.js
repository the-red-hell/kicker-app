import { Router } from "express";

const sessionRouter = new Router();

sessionRouter.get("/set-session", (req, res) => {
  req.session.username = "test_user";
  res.send("Session data set!");
});

sessionRouter.get("/get-session", (req, res) => {
  res.send(`Username from session: ${req.session.username || "Not set"}`);
});

export default sessionRouter;
