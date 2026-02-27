import { pool } from "../../models/index.js";
import { retrievePlayersStats } from "../../models/statistics.js";
import { findUserById } from "../../models/users.js";

export const viewProfilePage = async (req, res) => {
    const client = await pool.connect();
    try {
        const user = await findUserById(client, req.session.userId);
        const [stats] = await retrievePlayersStats(client, {
            userId: user.id,
        });

        res.render("profile", {
            title: "Profile",
            stats,
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
