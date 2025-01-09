const uuid = require("uuid");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email_id: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image_path:{
        type: String,
        required: false
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    token: {
        type: String
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

module.exports = mongoose.model("users", UsersSchema);