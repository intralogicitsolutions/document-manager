const Joi = require('joi');
const { validateRequest } = require('../validate-request');

const signUpValidation = (req, res, next) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email_id: Joi.string().email().required(),
        password: Joi.string().required()
    })
    validateRequest(req, res, schema, next)
}

const signInValidation = (req, res, next) => {
    const schema = Joi.object({
        email_id: Joi.string().email().required(),
        password: Joi.string().required()
    })
    validateRequest(req, res, schema, next)
}

const forgotPasswordValidation = (req, res, next) => {
    const schema = Joi.object({
        email_id: Joi.string().email().required()
    })
    validateRequest(req, res, schema, next)
}

const changePasswordValidation = (req, res, next) => {
    const schema = Joi.object({
        new_password: Joi.string().required()
    })
    validateRequest(req, res, schema, next)
}

const resetPasswordValidation = (req, res, next) => {
    const schema = Joi.object({
        old_password: Joi.string().required(),
        new_password: Joi.string().required()
    })
    validateRequest(req, res, schema, next)
}

const deleteAccountValidation = (req, res, next) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
    })
    validateRequest(req, res, schema, next)
}

const editUserValidation = (req, res, next) => {
    const schema = Joi.object({
        first_name: Joi.string().optional(),
        last_name: Joi.string().optional(),
        email_id: Joi.string().email().optional(),
        password: Joi.string().optional(),
    })
    validateRequest(req, res, schema, next)
}


module.exports = {
    signUpValidation,
    signInValidation,
    forgotPasswordValidation,
    changePasswordValidation,
    resetPasswordValidation,
    deleteAccountValidation,
    editUserValidation,
}