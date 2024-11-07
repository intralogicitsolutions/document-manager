const Joi = require("joi");
const BaseValidation = require("../middlewares/base_validation");

class AuthValidation { }

AuthValidation.signup = (req, res, next) => {
    const obj = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email_id: Joi.string().email().required(),
        password: Joi.string().required(),
       image_path: Joi.string().optional()
    });

    return BaseValidation.body(req, res, next, obj);
};

AuthValidation.signin = (req, res, next) => {
    const obj = Joi.object({
        email_id: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    return BaseValidation.body(req, res, next, obj);
};

AuthValidation.forgotPassword = (req, res, next) => {
    const obj = Joi.object({
        email_id: Joi.string().email().required(), 
    });

    return BaseValidation.body(req, res, next, obj);
};

AuthValidation.resetPassword = (req, res, next) => {
    const obj = Joi.object({
        //token: Joi.string().required(), 
        email_id: Joi.string().email().required(),
        otp: Joi.number().required(),
        new_password: Joi.string().required(), 
    });

    return BaseValidation.body(req, res, next, obj);
};

module.exports = AuthValidation;