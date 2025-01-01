const { Response } = require("../middlewares");
const { StatusCodes, ResponseMessage } = require("../constants");
const { Feedback } = require("../models");

class FeedbackService {}


FeedbackService.createFeedback = async (req, res) => {
  try {
    const userId = req.body.user_id; 

    const existingFeedback = await Feedback.findOne({ user_id: userId });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback.',
      });
    }

    const feedback = new Feedback(req.body);
    const savedFeedback = await feedback.save();

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: savedFeedback,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message,
    });
  }
};

module.exports = FeedbackService;
