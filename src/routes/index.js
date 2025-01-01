const initializeRoutes = (app) => {
    app.use("/auth", require("./auth.routes"));
    app.use("/images", require("./image_upload.routes"));
    app.use("/documents", require("./document_upload.routes"));
    app.use("/feedback", require("./feedback.routes"));
};

module.exports = initializeRoutes;