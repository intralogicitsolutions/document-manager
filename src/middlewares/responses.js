"use strict";
class Response { }

Response.success = (req, res, status, message = "Success", data,) => {
    let Response = {
        status,
        message,
    };
    if (data) Response["data"] = data;
    return res.status(status).json(Response);
};

Response.errors = (req, res, status, message, data) => {
    let Response = {
        status,
        message,
    };
    if (data) Response["data"] = data;
    return res.status(status).json(Response);
};

Response.joierrors = (req, res, err) => {
    let error = err.details.map((e) => e.message.replace(/"/g, ""));
    let message = "Bad Request";
    let status = 400;
    return res.status(status).json({
        success: false,
        status,
        message,
        error: error.join(", "),
    });
};

module.exports = Response;