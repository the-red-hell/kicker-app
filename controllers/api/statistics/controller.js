import console from "console";
import {
  retrieveNumTopPlayersByAvgGoals,
  retrieveTopPlayersByAbsolutes,
  retrieveTopPlayersByVictories,
} from "../../../models/statistics.js";
import { pool } from "../../../models/index.js";

const DURATION_MAP = {
  "24h": "1 day",
  "7d": "7 days",
  "1w": "7 days",
  "30d": "30 days",
  "1m": "1 month",
  "3m": "3 months",
  "1y": "1 year",
  all: null,
};

const parseDuration = (duration) => DURATION_MAP[duration] ?? null;

export const topPlayersByAvgGoals = async (req, res) => {
  const { amount, duration } = req.query;
  const client = await pool.connect();

  try {
    const numInt = parseInt(amount, 10);
    const limit = isNaN(numInt) || numInt <= 0 ? null : numInt;
    const durationParsed = parseDuration(duration);

    const topPlayers = await retrieveNumTopPlayersByAvgGoals(
      client,
      limit,
      durationParsed
    );
    res.json(topPlayers);
  } catch (error) {
    console.error("Error fetching top players by goals:", error);
    res.status(500).json({ error: "Error fetching top players" });
  } finally {
    client.release();
  }
};

export const topPlayersByVictories = async (req, res) => {
  const { amount, duration } = req.query;
  const client = await pool.connect();

  try {
    const numInt = parseInt(amount, 10);
    const limit = isNaN(numInt) || numInt <= 0 ? null : numInt;
    const durationParsed = parseDuration(duration);

    const topPlayers = await retrieveTopPlayersByVictories(
      client,
      limit,
      durationParsed
    );
    res.json(topPlayers);
  } catch (error) {
    console.error("Error fetching top players by victories:", error);
    res.status(500).json({ error: "Error fetching top players" });
  } finally {
    client.release();
  }
};
export const topPlayersByAbsolutes = async (req, res) => {
  const { amount, duration } = req.query;
  const client = await pool.connect();

  try {
    const numInt = parseInt(amount, 10);
    const limit = isNaN(numInt) || numInt <= 0 ? null : numInt;
    const durationParsed = parseDuration(duration);

    const topPlayers = await retrieveTopPlayersByAbsolutes(
      client,
      limit,
      durationParsed
    );
    res.json(topPlayers);
  } catch (error) {
    console.error("Error fetching top players by games:", error);
    res.status(500).json({ error: "Error fetching top players" });
  } finally {
    client.release();
  }
};
