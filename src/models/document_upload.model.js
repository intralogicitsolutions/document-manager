const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const DocumentUploadSchema = new Schema({
    filename: {
        type: String,
        required: true,
      },
    filepath: {
        type: String,
        required: true,
      },
    originalName: {
        type: String,
        required: true,
      },
    size: {
        type: Number,
        required: true,
      },
    document_url: {  
        type: String,
        // required: true,
      },
    createdAt: {
        type: Date,
        default: Date.now,
      }

});
module.exports = mongoose.model('documentupload', DocumentUploadSchema);
