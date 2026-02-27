const notFoundPage = (req, res) => {
    const originalUrl = req.headers["x-original-uri"] || req.originalUrl;
    res.status(404).render("404", { title: "404 - Not Found", originalUrl });
};

export default notFoundPage;
