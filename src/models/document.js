const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const DocumentSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    originalName: {
        type: String,
        required: true,
        index:{ unique: true }
      },
    size: {
        type: Number,
        required: true,
      },
    document_url: {  
        type: String,
        // required: true,
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

module.exports = mongoose.model('documentupload', DocumentSchema);

