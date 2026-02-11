// controllers/authController.js
import bcrypt from "bcrypt";
import {
  createUser,
  findUserByUsername,
  findUserById,
} from "../../../models/user.js";

export const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists first
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hash = await bcrypt.hash(password, 10); // hash password
    const newUser = await createUser(username, hash);
    req.session.userId = newUser.id; // login

    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Set Session
    req.session.userId = user.id;

    res.json({ message: "Logged in successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Could not log out" });
    res.clearCookie("connect.sid");
  });
  res.json({ message: "Logged out" });
};

export const getProfile = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await findUserById(req.session.userId);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
