export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err)
            return res
                .status(500)
                .json({ error: "Konnte nicht ausgeloggt werden" });
        res.clearCookie("connect.sid");
        res.locals.message = "Erfolgreich ausgeloggt";
        return res.redirect("/");
    });
};
