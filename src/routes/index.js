const express = require('express');
const api = express.Router();

const routes = [
    `auth`,
    `document`,
    `feedback`,
];

routes.forEach((route) => require(`./${route}`)(api));

module.exports = api;