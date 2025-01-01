const FeedbackRoute = require('express').Router();
const { FeedbackController } = require('../controllers');
const { VerifyToken } = require('../middlewares');

FeedbackRoute.post('/', VerifyToken.validate_token, FeedbackController.createFeedback);

module.exports = FeedbackRoute;