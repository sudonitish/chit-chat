const { callbackPromise } = require("nodemailer/lib/shared")
const { chatModel } = require("../models/chatModel")
module.exports = {
    createAPersonalChat: function (id1, id2, callback) {

        chatModel.create({ isGroupChat: false, participants: [id1, id2] })
            .then((data) => {
                callback(null, data)
            })
            .catch((err) => {
                callback(err, null)
            })
    },
    createNewGroupChat: function (title, id, callback) {
        chatModel.create({ isGroupChat: true, chatName: title, admins: [id], participants: [id] })
        .then((data) => {
            callback(null, data._id)
        })
        .catch((err) => {
            callback(err, null)
        })
    },
    changeGroupNameByGroupId: function (groupID, groupName, callback) {
        chatModel.updateOne({ _id: groupID }, { chatName: groupName })
            .then((data) => {
            callback(null,data)
            })
            .catch(err => {
            callback(err,null)
        })
    },
    addParticipantToGroupInDB: function (groupID, id, callback) {
        
        chatModel.updateOne({ _id: groupID }, { $push: { participants: id } })
            .then((rdata) => {
                chatModel.findById(groupID, {}, { populate: "participants" })
                    .then(data => callback(null, data))
                    .catch(err => callback(err, null))
                
            })
            .catch((err) => {
                callback(err,null)
            })
        
    },
    addNewMessageToChat: function (chatId,messageId ,callback) {
        chatModel.findOneAndUpdate({ _id: chatId }, { latestMessage: messageId })
            .then((data) => {
                callback(null,data)
            })
            .catch(err => {
            callback(err,null)
        })
    },
    findUserInChat: function (id1, id2, callback) {
        chatModel.find({ isGroupChat: false, participants: { $all: [id1, id2] } })
            .then((data) => {
                callback(null,data)
            })
            .catch((err) => {
                callback(err,null)
        })
    },
    findAllChatsByID: function (id, skip, callback) {
        chatModel.find({ participants:id }, null, { populate: "participants latestMessage", limit: 10, skip:skip*10, sort: { updatedAt: -1 } })
            .then((data) => {
                callback(null, data)
            })
            .catch((err) => {
                callback(err, null)
            })
    },
    findChatById: function (chatId,userId,callback) {
        chatModel.find({ _id: chatId, admins: userId },null,{populate:"participants"})
            .then(data => {
                callback(null,data)
            })
            .catch(err => {
            callback(err,null)
        })
    }
    ,
    findParticipantInChat: function (groupID, id, callback) {
        chatModel.find({  _id:groupID,participants:id},{populate: "participants" })
            .then((data) => {
                callback(null,data)
            })
            .catch((err) => {
                callback(err,null)
        })
    },
    findChatByIdAndDeleteParticipant:function (groupID, participantId, callback) {
        chatModel.findOneAndUpdate({ _id: groupID }, { $pull: {participants:participantId } })
            .then((data) => {
                callback(null,data)
            })
            .catch((err) => {
                callback(err,null)
        })
    },
}