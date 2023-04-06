
const connectDB = require('../../config/mySQLconnection')

module.exports = {
    createAPersonalChat: function (id1, id2, callback) {
        const Query = `
        INSERT INTO chats(isGroupChat) VALUES (0);
      `;
        connectDB.query(Query, (err, results) => {
            if (err) { callback(err, null) }
            const insertedId = results.insertId;
        
            connectDB.query('SELECT * FROM chats WHERE chatID = ?', insertedId, function (err, results, fields) {
                if (err) callback(err, null);
                else {
                    const data = [
                        [results[0].chatID, id1], [results[0].chatID, id2]
                    ];
                    const queryString = 'INSERT INTO participants(chatID,userID) VALUES ?';
                    connectDB.query(queryString, [data], (err, result, fields) => {

                        if (err) { callback(err, null) }
                        else {
                            callback(null, results)
                        }
                    });
                }
            });
        });
    },
    createNewGroupChat: function (title, id, callback) {
            const Query = `
        INSERT INTO chats(isGroupChat,chatName) VALUES (1,'${title}');
      `;
            connectDB.query(Query, (err, results) => {
                if (err) { callback(err, null) }
                const insertedId = results.insertId;
                connectDB.query('SELECT * FROM chats WHERE chatID = ?', insertedId, function (err, results, fields) {
                    if (err) callback(err, null);
                    else {
                        const data = [
                            [results[0].chatID, id]
                        ];
                        const queryString = 'INSERT INTO participants(chatID,userID) VALUES ?';
                        connectDB.query(queryString, [data], (err, result, fields) => {

                            if (err) { callback(err, null) }

                        });

                        const data1 = [
                            [results[0].chatID, id]
                        ];
                        const queryString1 = 'INSERT INTO admins(chatID,userID) VALUES ?';
                        connectDB.query(queryString1, [data1], (err, result, fields) => {

                            if (err) { callback(err, null) }
                            else {
                                callback(null, results[0].chatID)
                            }
                        });


                    }
                });
            });
    },
    changeGroupNameByGroupId: function (groupID, groupName, callback) {
            const searchQuery = `update chats set chatName ='${groupName}' where chatID=${groupID};`;
            connectDB.query(searchQuery, (err, results) => {
                if (err) { callback(err, null) };
                callback(null, results);
            });
    },
    addParticipantToGroupInDB: function (groupID, id, callback) {

        const data = [
            [groupID, id]
        ];
        const queryString = 'INSERT INTO participants(chatID,userID) VALUES ?';
        connectDB.query(queryString, [data], (err, result, fields) => {

            if (err) { callback(err, null) }
            else {
                const searchQuery = `select *from users where userID in (select userID from participants where chatID=${groupID} and userID=${id});`;
                connectDB.query(searchQuery, (err, results) => {
                    if (err) { callback(err, null) };
                    const participants = results.map(row => {
                        return {
                            _id: row.userID,
                            name: row.name,
                            email: row.email,
                            picture: row.picture,
                        };
                    });
                    callback(null, participants);
                });
            }
        });
    },
    addNewMessageToChat: function (chatId, messageId, callback) {
        const searchQuery = `update chats set latestMessage=${messageId} where chatID=${chatId};`;
        const timeStampQyery = `update chats set created_at=CURRENT_TIMESTAMP where chatID=${chatId};`;
        connectDB.query(searchQuery, (err, results) => {
            if (err) { callback(err, null) };
        });
        connectDB.query(timeStampQyery, (err, results) => {
            if (err) { callback(err, null) };
            callback(null, results);
        });
    },
    findUserInChat: function (id1, id2, callback) {
        const searchQuery = `select chatID from chats where chatID in (select t2.chatID from (select l1.chatID from participants as l1 where userID =${id1} ) as t1 inner join (Select l2.chatID from participants as l2 where userID =${id2}) as t2 on t1.chatID =t2.chatID) AND isGroupChat=0;`;
        connectDB.query(searchQuery, (err, results) => {
            if (err) { callback(err, null) };
            callback(null, results);
        });

    },
    findAllChatsByID: function (id, skip, callback) {
        const searchChat = `select chatID,isGroupChat,chatName,created_at from chats where chatID in (select chatID from participants where userID = ${id}) order by created_at desc limit ${skip * 10},10;`;
        const searchMessage = `select t1.chatID,t1.latestMessage,t2.messageID,t2.content from(select * from chats where chatID in(select chatID from participants where userID =  ${id})order by created_at desc limit ${skip * 10},10)as t1 left join messages as t2 on t1.latestMessage=t2.messageID;`;
        const searchUser = `select t1.chatID,t2.userID,t2.name,t2.email,t2.picture from (select t1.chatID,t1.isGroupChat,t1.chatName,t1.latestMessage,t1.created_At,t2.userID from (select * from chats where chatID in (select chatID from participants where userID = ${id})order by created_at desc limit ${skip * 10},10)as t1 inner join participants as t2 where t1.chatID = t2.chatID)as t1 inner join users as t2 where t1.userID = t2.userID;`;

        connectDB.query(searchChat, (err, results) => {
            if (err) { callback(err, null) };
            const data = results.map(row => {
                return {
                    id: row.chatID,
                    isGroupChat: row.isGroupChat,
                    chatName: row.chatName,
                    created_At: row.created_at
                };
            });

            connectDB.query(searchMessage, (err, results) => {
                if (err) { callback(err, null) };
                const latestMessage = results.map(row => {
                    return {
                        chatID: row.chatID,
                        id: row.latestMessage,
                        content: row.content,
                    };
                });

                connectDB.query(searchUser, (err, results) => {
                    if (err) { callback(err, null) };
                    const participants = results.map(row => {
                        return {
                            chatID: row.chatID,
                            id: row.userID,
                            name: row.name,
                            email: row.email,
                            picture: row.picture,

                        };
                    });
                    data.forEach(chat => {
                        chat.latestMessage = latestMessage.filter((msg) => {
                            return msg.chatID == chat.id;
                        })[0];
                        if (!chat.latestMessage.id)
                            chat.latestMessage = null
                        chat.participants = participants.filter((ppnt) => {
                            return ppnt.chatID == chat.id;
                        });
                    });
                    callback(null, data);
                });
            });
        });
    },
    findChatById: function (chatId, userId, callback) {
        const searchQuery = `select *from (select *from chats where chatID=${chatId}) as t1 where chatID in (select admins.chatID from admins where admins.chatID=${chatId} and admins.userID=${userId});`;
        const searchUser = `select *from users where userID in (select userID from participants where chatID=${chatId})`
        connectDB.query(searchQuery, (err, results) => {
            if (err) { callback(err, null) };

            const data = results.map(row => {
                return {
                    id: row.chatID,
                    isGroupChat: row.isGroupChat,
                    chatName: row.chatName,
                    created_At: row.created_at
                };
            });

            connectDB.query(searchUser, (err, results) => {
                if (err) { callback(err, null) };
                const participants = results.map(row => {
                    return {
                        _id: row.userID,
                        name: row.name,
                        email: row.email,
                        picture: row.picture,
                    };



                });
                data[0].participants = participants;

                callback(null, data);
            })
        });

    },
    findParticipantInChat: function (groupID, id, callback) {

        const searchQuery = `select *from users where userID in (select userID from participants where chatID=${groupID} and userID=${id});`;
        connectDB.query(searchQuery, (err, results) => {
            if (err) { callback(err, null) };
            const participants = results.map(row => {
                return {
                    _id: row.userID,
                    name: row.name,
                    email: row.email,
                    picture: row.picture,
                };
            });
            callback(null, participants);
        });
    },
    findChatByIdAndDeleteParticipant: function (groupID, participantId, callback) {
        const queryString = `delete from participants where chatID=${groupID} and userID=${participantId}`;
        connectDB.query(queryString, (err, result) => {

            if (err) { callback(err, null) }
            else {
                callback(null, result);
            }
        });
    }
}