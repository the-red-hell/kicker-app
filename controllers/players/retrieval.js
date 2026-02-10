import { retrievePlayerById } from "../../models/players.js";

export const getPlayerById = async (req, res) => {
  const { id } = req.params;
  try {
    const player = await retrievePlayerById(id);
    if (player) {
      res.json(player);
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  } catch (error) {
    console.error("Error fetching player:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
