require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const cloudinary = require('cloudinary').v2;


const routes = require("./routes");
const { dbConnectionPromise } = require("./configs/db");
const { Logger } = require('./helper');
const { ResponseMessage } = require('./constants');

const app = express();

// set view engine
app.set('view engine', 'ejs');

app.use(bodyParser.json({ limit: "1024mb" }));
app.use(bodyParser.urlencoded({ limit: "1024mb", extended: true }));
app.use('/api', routes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/files', express.static(path.join(__dirname, '../files')));

// Error-handling middleware for logging errors
app.use((err, req, res, next) => {
    console.log(err)
    Logger.error(`Error: ${err.message}`);
    res.status(500).send(ResponseMessage.TRY_AGAIN_LATER);
});

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// routers(app);

const filesDir = path.join(__dirname, '../files');
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
    console.log("Created 'files' directory");
}

Promise.all([dbConnectionPromise]).then(async () => {
    const PORT = process.env.APP_PORT || 6000;
    const server = createServer(app);

    server.listen(PORT, () => {
        console.log("server on  :", PORT);
    });
})
