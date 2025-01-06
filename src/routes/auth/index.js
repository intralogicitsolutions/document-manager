const api = require('../../controllers/auth');
const { jsonWebToken, authValidator } = require('../../middlewares');
const { urlConstants } = require('../../constants');

module.exports = (app) => {
    app.post(urlConstants.USER_SIGNUP, authValidator.signUpValidation, api.signUp);
    app.post(urlConstants.USER_SIGNIN, authValidator.signInValidation, api.signIn);
    app.post(urlConstants.FORGOT_PASSWORD, authValidator.forgotPasswordValidation, api.forgotPassword);
    app.post(urlConstants.CHANGE_PASSWORD, jsonWebToken.validateToken, authValidator.changePasswordValidation, api.changePassword);
    app.post(urlConstants.RESET_PASSWORD, jsonWebToken.validateToken, authValidator.resetPasswordValidation, api.resetPassword);
    app.delete(urlConstants.DELETE_ACCOUNT, jsonWebToken.validateToken, authValidator.deleteAccountValidation, api.deleteAccount);

}