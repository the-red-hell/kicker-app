import console from "console";
import {
  retrieveNumTopPlayersByGoals,
  retrieveNumTopPlayersByVictories,
} from "../../../models/gamePlayers.js";
import { pool } from "../../../models/index.js";

export const topPlayersByGoals = async (req, res) => {
  const { num } = req.params;
  const client = await pool.connect();

  try {
    const numInt = parseInt(num, 10);

    if (isNaN(numInt) || numInt <= 0) {
      return res.status(400).json({ error: "Invalid parameter" });
    }

    const topPlayers = await retrieveNumTopPlayersByGoals(client, numInt);
    res.json(topPlayers);
  } catch (error) {
    console.error("Error fetching top players by goals:", error);
    res.status(500).json({ error: "Error fetching top players" });
  } finally {
    client.release();
  }
};

export const topPlayersByVictories = async (req, res) => {
  const { num } = req.params;
  const client = await pool.connect();

  try {
    const numInt = parseInt(num, 10);

    if (isNaN(numInt) || numInt <= 0) {
      return res.status(400).json({ error: "Invalid parameter" });
    }

    const topPlayers = await retrieveNumTopPlayersByVictories(client, numInt);
    res.json(topPlayers);
  } catch (error) {
    console.error("Error fetching top players by victories:", error);
    res.status(500).json({ error: "Error fetching top players" });
  } finally {
    client.release();
  }
};
