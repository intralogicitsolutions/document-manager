const mongoose = require("mongoose");

const uri = process.env.DB_URI;

const dbConnectionPromise = mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

dbConnectionPromise.then(() => {
    console.log("MongoDB Connected!");
}).catch((err) => {
    console.error("MongoDB error:", err);
});

module.exports = {
    dbConnectionPromise
}