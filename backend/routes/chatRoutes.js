const express = require('express');
const router = express.Router()
const { createChat, getAllChats, createMessage, getMessages, createGroupChat, addParticipantsToGroup, checkForAdmin, deleteParticipantFromGroup, findUnReadMessagesByUserInChat, readMessages, chageGroupName, exportChat } = require('../controllers/chatControllers')

router.route('/createChat')
    .post(createChat)

router.route('/getAllChats')
    .get(getAllChats)

router.route('/createMessage')
    .post(createMessage)

router.route('/getMessages')
    .get(getMessages)

router.route('/createGroupChat')
    .post(createGroupChat)

router.route('/chageGroupName')
    .post(chageGroupName)

router.route('/addParticipantsToGroup')
    .post(addParticipantsToGroup)

router.route('/checkForAdmin')
    .post(checkForAdmin)

router.route('/deleteParticipantFromGroup')
    .post(deleteParticipantFromGroup)

router.route('/findUnReadMessagesByUserInChat')
    .post(findUnReadMessagesByUserInChat)

router.route('/readMessages')
    .post(readMessages)
    
router.route('/exportChat')
    .get(exportChat)


module.exports = router;
