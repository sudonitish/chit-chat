const { messageModel } = require("../../models/mongoModels/messageModel")


module.exports = {
    findAllMessages: function (chatId, skip, callback) {
        messageModel.find({ chat: chatId }, null, {
            populate: "sender", limit: 7, skip: skip * 7, sort: { createdAt: -1 }
        })
            .then((messages) => {
                callback(null, messages)
            })
            .catch((err) => {
                callback(err, null)
            })
    },
    findUnReadMessagesInChat: function (groupId, participantId, callback) {
        messageModel.find({ chat: groupId, readBy: { $nin: participantId } })
            .then(data => {
                callback(null, data)
            })
            .catch(err => {
                callback(err, null)
            })
    },
    createNewMessage: function (message, senderId, callback) {
        messageModel.create({
            content: message.message, chat: message.chatIdForSend, sender: senderId, readBy: [senderId]
        })
            .then((rdata) => {
                callback(null, rdata)
            })
            .catch((err) => {
                callback(err, null)
            })
    },
    readTheUnreadMessages: function (chatId, readerId, callback) {
        messageModel.updateMany({ chat: chatId, readBy: { $nin: readerId } }, { $push: { readBy: readerId } })
            .then(data => {
                callback(null, data)
            })
            .catch(err => {
                callback(err, null)
            })
    },
    exportMessagesFromChat: function (chatId, startDate, endDate, callback) {
        messageModel.find({ chat: chatId }, null, {
            populate: "sender", sort: { createdAt: -1 }
        })
            .then((messages) => {
                callback(null, messages)
            })
            .catch((err) => {
                callback(err, null)
            })
    },
}