'use strict'
const Response = require("./responses")
const { StatusCodes, ResponseMessage } = require('../constants')

class BaseValidation { }
BaseValidation.body = (req, res, next, seeker_schema) => {
    try {
        const { error } = seeker_schema.validate(req.body)
        if (error) return Response.joierrors(req, res, error)
        next()
    } catch (error) {
        Response.errors(req, res, StatusCodes.HTTP_BAD_REQUEST, ResponseMessage.bad_request)
    }
};

BaseValidation.query = (req, res, next, seeker_schema) => {
    try {
        const { error } = seeker_schema.validate(req.query)
        if (error) return Response.joierrors(req, res, error)
        next()
    } catch (error) {
        Response.errors(req, res, StatusCodes.HTTP_BAD_REQUEST, ResponseMessage.bad_request)
    }
};

module.exports = BaseValidation;