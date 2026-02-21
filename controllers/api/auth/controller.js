// handles registration, login, and profile retrieval
// logout is handled by the non-api router
import bcrypt from "bcrypt";
import {
  createUser,
  findUserByUsername,
  findUserById,
} from "../../../models/users.js";
import { pool } from "../../../models/index.js";

// register a new user and log them in immediately
export const register = async (req, res) => {
  const { username, password, confirmPassword, email, terms } = req.body;

  if (!terms) {
    return res
      .status(400)
      .json({ error: "You must agree to the terms and conditions" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash(password, 10); // hash password
    const newUser = await createUser(client, username, email, hash);
    req.session.userId = newUser.id; // login

    redirectIfLoggedIn(req, res);
  } catch (err) {
    // postgres unique_violation
    if (err.code === "23505") {
      return res.status(400).json({ error: "Nutzer existiert bereits" }); // TODO: specify whether username or email?
    }

    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const client = await pool.connect();
  try {
    const user = await findUserByUsername(client, username);

    if (!user) {
      return res.status(401).json({ error: "Ungültige Anmeldedaten" });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Ungültige Anmeldedaten" });
    }

    req.session.userId = user.id; // login
    redirectIfLoggedIn(req, res);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getProfile = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Nicht authentifiziert" });
  }

  const client = await pool.connect();
  try {
    const user = await findUserById(client, req.session.userId);
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

function redirectIfLoggedIn(req, res) {
  res.locals.message = "Erfolgreich eingeloggt";

  // check if we should redirect
  let returnToUrl = req.session.returnTo;
  if (returnToUrl) {
    delete req.session.returnTo;
  } else {
    returnToUrl = "/dashboard";
  }
  return res.redirect(returnToUrl);
}
