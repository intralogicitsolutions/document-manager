const api = require('../../controllers/auth');
const { jsonWebToken, authValidator } = require('../../middlewares');
const { urlConstants } = require('../../constants');
const upload = require('../../middlewares/document_upload');

module.exports = (app) => {
    app.post(urlConstants.USER_SIGNUP, upload.single('files'), authValidator.signUpValidation, api.signUp);
    app.post(urlConstants.USER_SIGNIN, authValidator.signInValidation, api.signIn);
    app.post(urlConstants.FORGOT_PASSWORD, authValidator.forgotPasswordValidation, api.forgotPassword);
    app.post(urlConstants.CHANGE_PASSWORD, jsonWebToken.validateToken, authValidator.changePasswordValidation, api.changePassword);
    app.post(urlConstants.RESET_PASSWORD, jsonWebToken.validateToken, authValidator.resetPasswordValidation, api.resetPassword);
    app.delete(urlConstants.DELETE_ACCOUNT, jsonWebToken.validateToken, authValidator.deleteAccountValidation, api.deleteAccount);
    app.patch(urlConstants.EDIT_USER, upload.single('files'), jsonWebToken.validateToken, authValidator.editUserValidation, api.editUser);
    app.post(urlConstants.LOGOUT, jsonWebToken.validateToken, api.logOut);

}