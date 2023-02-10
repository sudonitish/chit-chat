const asyncHandler = require('express-async-handler');
const { createAPersonalChat, createNewGroupChat, addParticipantToGroupInDB, addNewMessageToChat, findUserInChat, findAllChatsByID, findParticipantInChat, findChatById, findChatByIdAndDeleteParticipant, changeGroupNameByGroupId } = require('../config/methods/chatMethos');
const { findAllMessages, createNewMessage, findUnReadMessagesInChat, readTheUnreadMessages } = require('../config/methods/messageMethods');
const { findUserByEmail, findUserByID } = require('../config/methods/userLoginMethods');
const { chatModel } = require('../config/models/chatModel');
const createChat = asyncHandler(async (req, res) => {
    findUserByEmail(req.session.email, (err, user) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            if (user.length !== 0) {
                let id1 = user[0].id;
                let id2 = req.body.id;
                findUserInChat(id1, id2, (err, user) => {
                    if (err) {
                        console.log(err)
                        res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                    }
                    else {
                        if (user.length === 0) {

                            createAPersonalChat(id1, id2, (err, chat) => {
                                if (!err) {
                                    findUserByID({ _id: id2 }, (err, rdata) => {
                                        res.send({ found: false, data: { id: chat.id, name: rdata[0].name } })

                                    })
                                }

                            })
                        }
                        else {
                            findUserByID({ _id: id2 }, (err, rdata) => {
                                res.send({ found: true, data: { id: user[0].id, name: rdata[0].name } })
                            })

                        }
                    }
                })



            }
        }
    })
})
const getAllChats = asyncHandler(async (req, res) => {

    findUserByEmail(req.session.email, (err, user) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            if (user.length !== 0) {
                findAllChatsByID(user[0].id, req.query.page, (err, data) => {
                    if (!err) {

                        res.send({ email: req.session.email, data });
                    }
                })
            }
        }
    })

})
const createMessage = asyncHandler(async (req, res) => {
    if (req.body.message.trim() === "") {
        res.send({
            data: false
        })
        return
    }
    findUserByEmail(req.session.email, (err, user) => {

        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })

        }
        else {
            if (user.length !== 0) {

                createNewMessage(req.body, user[0].id, (err, data) => {
                    if (err) {
                        console.log(err)
                        res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                    }
                    else {
                        addNewMessageToChat(req.body.chatIdForSend, data._id, (err, data) => {
                            if (err) {
                                console.log(err)
                                res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                            }
                            else {
                                res.send({
                                    data: true
                                })
                            }
                        })

                    }
                })
            }
        }
    })
})

const getMessages = asyncHandler(async (req, res) => {
    findAllMessages(req.query.chatId, req.query.page, (err, messages) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            res.send({ email: req.session.email, messages });
        }
    })

})
const createGroupChat = asyncHandler(async (req, res) => {
    if (req.body.title.trim() === "") {
        res.send({
            success: false,
            groupID: "",
        })
        return
    }
    findUserByEmail(req.session.email, (err, user) => {

        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })

        }
        else {
            if (user.length !== 0) {

                createNewGroupChat(req.body.title.trim(), user[0].id, (err, data) => {
                    if (err) {
                        console.log(err)
                        res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                    }
                    else {
                        res.send({
                            success: true,
                            groupID: data

                        })
                    }
                })
            }
        }
    })
})
const addParticipantsToGroup = asyncHandler(async (req, res) => {

    if (req.body.participantEmail.trim() === "") {
        res.send({
            success: false,
            message: "empty string",
            participants: []
        })
        return
    }
    else if (req.body.participantEmail.trim() === req.session.email) {
        res.send({
            success: false,
            message: "You are already added",
            participants: []
        })
        return
    }
    findUserByEmail(req.body.participantEmail.trim(), (err, user) => {

        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })

        }
        else {
            if (user.length !== 0) {

                findParticipantInChat(req.body.groupID, user[0].id, (err, rdata) => {
                    if (err) {
                        console.log(err)
                        res.render('serverError.ejs', { errorType: "Server Error!", error: err })

                    }
                    else {
                        if (rdata.length === 0) {

                            addParticipantToGroupInDB(req.body.groupID, user[0].id, (err, data) => {
                
                                if (err) {
                                    console.log(err)
                                    res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                                }
                                else {
                                    
                                    res.send({
                                        success: true,
                                        message: "add success",
                                        participants: data.participants

                                    })
                                }
                            })
                        }
                        else {
                            res.send({
                                success: false,
                                message: "already added",
                                participants: rdata[0].participants
                            })
                        }
                    }
                })

            }
            else {
                res.send({
                    success: false,
                    message: "user Not found",
                    participants: []
                })
            }
        }
    })
})
const chageGroupName = asyncHandler(async (req, res) => {

    if (req.body.groupName.trim() === "") {
        res.send({
            success: false,
            message: "empty string",
        })
        return
    }
    changeGroupNameByGroupId(req.body.groupID, req.body.groupName.trim(), (err, data) => {
        if (!err) {
            res.send({
                success: true,
                message: "group Name Updated",
            })
        }
    })

     
})
const checkForAdmin = asyncHandler(async (req, res) => {

    findChatById(req.body.chatId.trim(), req.session.userId, (err, chat) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })

        }
        else {
            if (chat.length !== 0) {
                res.send({ isGroupChat: true, chat })
            }
            else {
                res.send({ isGroupChat: false })
            }
        }
    })
})
const deleteParticipantFromGroup = asyncHandler(async (req, res) => {

    findChatByIdAndDeleteParticipant(req.body.chatId.trim(), req.body.participantId.trim(), (err, chat) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })

        }
        else {
            if (chat.length !== 0) {
                res.send({ success: true })
            }
            else {
                res.send({ success: false })
            }
        }
    })
})
const findUnReadMessagesByUserInChat = asyncHandler(async (req, res) => {
    findUnReadMessagesInChat(req.body.chatId, req.session.userId, (err, data) => {
        if (!err) {
            res.send({ length: data.length });
        }
    })
})
const readMessages = asyncHandler(async (req, res) => {
    
    readTheUnreadMessages(req.body.chatId, req.session.userId, (err, data) => {
        if (!err) {
            res.send({success:true})
        }
    })
})
module.exports = { createChat, getAllChats, createMessage, getMessages, createGroupChat, addParticipantsToGroup, checkForAdmin, deleteParticipantFromGroup, findUnReadMessagesByUserInChat,readMessages ,chageGroupName}