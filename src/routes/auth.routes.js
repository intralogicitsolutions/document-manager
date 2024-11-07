const AuthRoute = require('express').Router();
const { AuthController} = require('../controllers');
const { AuthValidator } = require('../validators');
const { VerifyToken } = require('../middlewares');

AuthRoute.post('/signup', AuthValidator.signup, AuthController.signup,);
AuthRoute.post('/signin', AuthValidator.signin, AuthController.signin);

AuthRoute.post('/forgotPassword', AuthValidator.forgotPassword, AuthController.forgotPassword);
AuthRoute.post('/resetPassword', AuthValidator.resetPassword, AuthController.resetPassword);

module.exports = AuthRoute;