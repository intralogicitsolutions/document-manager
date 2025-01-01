const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FeedbackSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    rating: {
        type: Number,
        required: true,
        min: 1, max: 5
      },
    review: {
        type: String,
        required: true,
      },
    timestamp: {
        type: Date,
        default: Date.now,
      }

});
module.exports = mongoose.model('feedback', FeedbackSchema);