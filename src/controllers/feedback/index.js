const feedbackService = require('../../services/feedback');
const { logger } = require('../../utils');
const { getUserData } = require('../../middlewares');
const { messageConstants } = require('../../constants');

const feedback = async (req, res) => {
    try {
        const userData = await getUserData(req, res);
        const response = await feedbackService.feedback(req.body, userData, res);
        logger.info(`${messageConstants.RESPONSE_FROM} uploadDocument API`, JSON.stringify(response));
        res.send(response);

    } catch (err) {
        logger.error(`upload Document ${messageConstants.API_FAILED}`, err);
        res.send(err);
    }
}

module.exports = {
    feedback
}