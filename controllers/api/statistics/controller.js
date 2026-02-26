import console from "console";
import { retrievePlayersStats } from "../../../models/statistics.js";
import { pool } from "../../../models/index.js";

const DURATION_MAP = {
  "24h": "1 day",
  "7d": "7 days",
  "1w": "7 days",
  "30d": "30 days",
  "1m": "1 month",
  "3m": "3 months",
  "1q": "1 quarter",
  "6m": "6 months",
  "1y": "1 year",
  all: null,
};

const SORT_BY_OPTIONS = {
  totalGoals: "total_goals",
  totalVictories: "total_victories",
  totalGames: "total_games",
  winRate: "win_rate",
  averageGoals: "average_goals",
};

const parseDuration = (duration) => DURATION_MAP[duration] ?? null;

export const topPlayersStats = async (req, res) => {
  const { limit, duration, sortBy } = req.query;
  const client = await pool.connect();

  try {
    const limitInt = parseInt(limit, 10);
    const limitValue = isNaN(limitInt) || limitInt <= 0 ? null : limitInt;
    const durationParsed = parseDuration(duration);

    if (sortBy && !Object.hasOwn(SORT_BY_OPTIONS, sortBy)) {
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }

    const stats = await retrievePlayersStats(client, {
      duration: durationParsed,
      sortBy: SORT_BY_OPTIONS[sortBy] || "total_games",
      limit: limitValue,
    });
    res.json(stats);
  } catch (error) {
    console.error("Error fetching top players stats:", error);
    res.status(500).json({ error: "Error fetching top players stats" });
  } finally {
    client.release();
  }
};
