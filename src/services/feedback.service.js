const { Response } = require("../middlewares");
const { StatusCodes, ResponseMessage } = require("../constants");
const { Feedback } = require("../models");

class FeedbackService {}

FeedbackService.createFeedback = async (req, res) => {
    try{
    const feedback = new Feedback(req.body);
    const savedFeedback = await feedback.save();
    res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: savedFeedback
      });
    }catch (error) {
        res.status(400).json({
          success: false,
          message: 'Failed to submit feedback',
          error: error.message
        });
      }
}

module.exports = FeedbackService;