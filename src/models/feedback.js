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
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    is_deleted: {
        type: Boolean,
        default: false
    },

});
module.exports = mongoose.model('feedback', FeedbackSchema);