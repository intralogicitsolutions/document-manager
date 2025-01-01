const { FeedbackService } = require("../services");
const { Response } = require("../middlewares");
const { StatusCodes, ResponseMessage } = require("../constants");
const { Logger } = require("../helper");

class FeedbackController { }

FeedbackController.createFeedback = async (req, res) => {
    try{
        Logger.info(`'Create feedback' API Called`);
        await FeedbackService.createFeedback(req, res);
    }catch(error){
        Logger.error(`'Create feedback' API Error: ${error.message}`);
        Response.errors(req, res, StatusCodes.HTTP_INTERNAL_SERVER_ERROR, ResponseMessage.TRY_AGAIN_LATER);
    }
}

module.exports = FeedbackController;