const { AuthService } = require("../services");
const { Response } = require("../middlewares");
const { StatusCodes, ResponseMessage } = require("../constants");
const { Logger } = require("../helper");

const multer = require('multer');
const path = require('path');

class AuthController { }

AuthController.signup = async (req, res) => {
    try {
        Logger.info(`'Signup' API Called`, { user_id: req?.user?._id, method: req?.method });
        await AuthService.signup(req, res);
    } catch (error) {
        Logger.error(`'Signup' API Error: ${error.message}`, { user_id: req?.user?._id, method: req?.method });
        Response.errors(req, res, StatusCodes.HTTP_INTERNAL_SERVER_ERROR, ResponseMessage.TRY_AGAIN_LATER);
    }
}

AuthController.signin = async (req, res) => {
    try {
        Logger.info(`'Signin' API Called`, { user_id: req?.user?._id, method: req?.method });
        await AuthService.signin(req, res);
    } catch (error) {
        Logger.error(`'Signin' API Error: ${error.message}`, { user_id: req?.user?._id, method: req?.method });
        Response.errors(req, res, StatusCodes.HTTP_INTERNAL_SERVER_ERROR, ResponseMessage.TRY_AGAIN_LATER);
    }
}

AuthController.forgotPassword = async (req, res) => {
    try {
        Logger.info(`'Forgot Password' API Called`, { email: req?.user?._id, method: req?.method });
        await AuthService.forgotPassword(req, res);
    } catch (error) {
        Logger.error(`'Forgot Password' API Error: ${error.message}`, { email: req?.user?._id, method: req?.method });
        Response.errors(req, res, StatusCodes.HTTP_INTERNAL_SERVER_ERROR, ResponseMessage.TRY_AGAIN_LATER);
    }
}

AuthController.resetPassword = async (req, res) => {
    try {
        Logger.info(`'Reset Password' API Called`, { email_id: req.body?.email_id, method: req?.method });
        await AuthService.resetPassword(req, res);
    } catch (error) {
        Logger.error(`'Reset Password' API Error: ${error.message}`, { email_id: req.body?.email_id, method: req?.method });
        Response.errors(req, res, StatusCodes.HTTP_INTERNAL_SERVER_ERROR, ResponseMessage.TRY_AGAIN_LATER);
    }
    
}


module.exports = AuthController;