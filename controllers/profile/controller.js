import { pool } from "../../models/index.js";
import {
  retrieveGoalCountByUserId,
  retrieveGamesCountByUserId,
  retrieveVictoryCountByUserId,
} from "../../models/statistics.js";
import { findUserById } from "../../models/users.js";

export const viewProfilePage = async (req, res) => {
  const client = await pool.connect();
  try {
    const user = await findUserById(client, req.session.userId);
    const goalCount = await retrieveGoalCountByUserId(
      client,
      req.session.userId
    );
    const victoryCount = await retrieveVictoryCountByUserId(
      client,
      req.session.userId
    );
    const gamesCount = await retrieveGamesCountByUserId(
      client,
      req.session.userId
    );

    res.render("profile", {
      title: "Profile",
      stats: {
        goalCount,
        victoryCount,
        gamesCount,
      },
      user: {
        username: user.username,
        email: user.email,
        profilePictureUrl: user.image_url,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
