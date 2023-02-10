const mongoose = require('mongoose');
const { Schema } = mongoose;



const messageSchema = new Schema({

    sender:
    {
        type: Schema.Types.ObjectId,
        ref: "user"
    },

    content:
    {
        type: String,
        trim:true,
        required: [true, "Content is required"]
    },

    chat:
    {
        type: Schema.Types.ObjectId,
        ref: "chat",
    },

    readBy:
        [{
            type: Schema.Types.ObjectId,
            ref: "user",
            index: true,
        }],

    // deletedBy:
    //     [{
    //     type: Schema.Types.ObjectId,
    //     ref:"user"  
    //     }],
},
    {
        timestamps: true
    })

const messageModel = mongoose.model('message', messageSchema);
module.exports = { messageModel }
