const initializeRoutes = (app) => {
    app.use("/auth", require("./auth.routes"));
    app.use("/images", require("./image_upload.routes"));
};

module.exports = initializeRoutes;