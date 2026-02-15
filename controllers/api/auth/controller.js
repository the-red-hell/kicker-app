// handles registration, login, and profile retrieval
// logout is handled by the non-api router
import bcrypt from "bcrypt";
import {
  createUser,
  findUserByUsername,
  findUserById,
} from "../../../models/users.js";

// register a new user and log them in immediately
export const register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if username already exists first
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Nutzername existiert bereits" });
    }

    const hash = await bcrypt.hash(password, 10); // hash password
    const newUser = await createUser(username, email, hash);
    req.session.userId = newUser.id; // login

    redirectIfLoggedIn(req, res);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await findUserByUsername(username);

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
  }
};
export const getProfile = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Nicht authentifiziert" });
  }

  try {
    const user = await findUserById(req.session.userId);
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
