const api = require('../../controllers/feedback');
const { jsonWebToken } = require('../../middlewares');
const { urlConstants } = require('../../constants');

module.exports = (app) => {
    app.post(urlConstants.FEEDBACK, jsonWebToken.validateToken, api.feedback);
}