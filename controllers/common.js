/**
 * Checks whether the user is authenticated. If not, redirects to the login page.
 */
export const authenticatedMiddleware = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/auth/login");
  }
};
