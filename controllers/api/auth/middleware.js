const middleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Nicht authentifiziert" });
  }
  // send user to homepage
  res.redirect("/");
  next();
};

export default middleware;
