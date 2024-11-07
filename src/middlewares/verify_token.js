"use strict";
const jwt = require("jsonwebtoken");

const Response = require("./responses");
const { StatusCodes, ResponseMessage } = require("../constants");
const { BlacklistedToken  } = require('../models');

class BaseValidation { }
BaseValidation.validate_token = async (req, res, next) => {
    try {
        let token = req.headers["authorization"];
        if (!token || (token && !token.startsWith("Bearer "))) {
            return Response.errors(req, res, StatusCodes.HTTP_UNAUTHORIZED, ResponseMessage.UNAUTHORIZED);
        };

        token = token.slice(7, token.length);

        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return Response.errors(req, res, StatusCodes.HTTP_UNAUTHORIZED, ResponseMessage.UNAUTHORIZED);
        }


        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            if (!token || (token && !token.startsWith("Bearer "))) {
                return Response.errors(req, res, StatusCodes.HTTP_UNAUTHORIZED, ResponseMessage.UNAUTHORIZED);
            };
        }

        req.user = decoded;
        return next();

    } catch (error) {
        return Response.errors(req, res, StatusCodes.HTTP_UNAUTHORIZED, ResponseMessage.UNAUTHORIZED);
    }
}

module.exports = BaseValidation;
