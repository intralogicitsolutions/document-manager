const FeedbackSchema = require('../../models/feedback');
const { responseData, messageConstants } = require('../../constants');
const { logger } = require('../../utils');

const feedback = async (body, userData, res) => {
    return new Promise(async () => {
        
            const userId = userData._id;
            const existingFeedback = await FeedbackSchema.findOne({ user_id: userId });

            if(existingFeedback){
                logger.warn(`User has already submitted feedback.`);
                return responseData.fail(res, messageConstants.FEEDBACK_ALREADY_SUBMITTED, 400);
            }
            const feedback = new FeedbackSchema({ ...body,
                user_id: userId,});
            await feedback.save().then( async (result) => {
                logger.info(messageConstants.FEEDBACK_SUBMITTED_SUCCESS);
            return responseData.success(res, result, messageConstants.FEEDBACK_SUBMITTED_SUCCESS);
            }).catch((err) => {
                logger.error(messageConstants.FEEDBACK_SUBMISSION_FAILED, err);
            return responseData.fail(res, messageConstants.FEEDBACK_SUBMISSION_FAILED, 400)
            })
    });
}

module.exports = {
    feedback
}