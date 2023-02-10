const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({

    isGroupChat:
    {
        type: Boolean,
        default:false,
        required: [true, "Is group chat? is required"]
    },

    chatName:
    {
        type: String,
        trim:true,
        default: null
    },

    admins:
        [{
            type: Schema.Types.ObjectId,
            ref: "user",
            index: true,
        }],

    participants:
        [{
            type: Schema.Types.ObjectId,
            ref: "user",
            index: true
        }],

    latestMessage:
    {
        type: Schema.Types.ObjectId,
        ref: "message",
        default:null
    }
},
    {
        timestamps: true
    })

const chatModel = mongoose.model('chat', chatSchema);
module.exports = { chatModel }
