
const connectDB = require('../../config/mySQLconnection')

module.exports = {
    findAllMessages: function (chatId, skip, callback) {
            const searchMessage = `select *from messages where chat =  ${chatId} order by created_at desc limit ${skip * 7},10;`;
            const searchSender = `select *from users as t1 inner join (select sender,messageID from messages where chat = ${chatId} order by created_at desc limit ${skip*7},10) as t2 where t1.userID= t2.sender;`;
            const searchReadBy = `select t1.chat,t2.messageID,t2.userID from (select * from messages where chat = 1 order by created_at desc limit ${skip*7},10) as t1 inner join readby as t2 where t1.messageID=t2.messageID;`;

            connectDB.query(searchMessage, (err, results) => {
                if (err) { callback(err, null) };

                const data = results.map(row => {
                    return {
                        id: row.messageID,
                        chat: row.chat,
                        content: row.content,
                        created_At: row.created_at
                    };
                });

                connectDB.query(searchReadBy, (err, results) => {
                    if (err) { callback(err, null) };
                    const readby = results.map(row => {
                        return {

                            messageID: row.messageID,
                            userID: row.userID,
                        };
                    });

                    connectDB.query(searchSender, (err, results) => {
                        if (err) { callback(err, null) };
                        const sender = results.map(row => {
                            return {
                                messageID: row.messageID,
                                id: row.userID,
                                name: row.name,
                                email: row.email,
                                picture: row.picture,

                            };
                        });


                        data.forEach(message => {
                            message.sender = sender.filter((snd) => {
                                return snd.messageID == message.id;
                            })[0];

                            message.readby = [];
                            readby.filter((rb) => {
                                return rb.messageID == message.id;
                            }).forEach((rbe) => {
                                message.readby.push(rbe.userID);
                            });

                        });

                        callback(null, data);

                    });
                });
            });
    },
    findUnReadMessagesInChat: function (groupId, participantId, callback) {
            const searchMessage = `select distinct messages.messageID from messages right join readby on messages.messageID=readby.messageID where readby.messageID in (select messageID from readby group by messageID having count(messageID) < (select count(userID) from participants where chatID=${groupId})) and messages.chat = ${groupId} and readby.messageID not in (select messageID from readby where userID =${participantId});`;

            connectDB.query(searchMessage, (err, results) => {
                if (err) { callback(err, null) };
                callback(null, results)
            })
    },
    createNewMessage: function (message, senderId, callback) {
            const Query = `
        INSERT INTO messages(content,chat,sender) VALUES ('${message.message}', '${message.chatIdForSend}','${senderId}');
      `;
            connectDB.query(Query, (err, results) => {
                if (err) { callback(err, null) }
                const insertedId = results.insertId;
                connectDB.query('SELECT * FROM messages WHERE messageID = ?', insertedId, function (err, results, fields) {
                    const savedMessageID = results[0].messageID;
                    if (err) callback(err, null);
                    else {
                        const data = [
                            [results[0].messageID, senderId]
                        ];
                        const queryString = 'INSERT INTO readby(messageID,userID) VALUES ?';
                        connectDB.query(queryString, [data], (err, result, fields) => {

                            if (err) { callback(err, null) }
                            else {

                                callback(null, { _id: savedMessageID })
                            }
                        });
                    }
                });
            });
    },
    readTheUnreadMessages: function (chatId, readerId, callback) {
            const searchMessage = `select distinct messages.messageID from messages right join readby on messages.messageID=readby.messageID where readby.messageID in (select messageID from readby group by messageID having count(messageID) < (select count(userID) from participants where chatID=${chatId})) and messages.chat = ${chatId} and readby.messageID not in (select messageID from readby where userID =${readerId});`;

            connectDB.query(searchMessage, (err, results) => {
                if (err) { callback(err, null) };
                results.forEach((message) => {
                     const insert = `insert into readby(messageID,userID) values(${message.messageID},${readerId})`;

                connectDB.query(insert, (err, results) => {
                    if (err) { callback(err, null) };
                })
                })
               callback(null, results)

            })   
    },
    exportMessagesFromChat: function (chatId, startDate, endDate, callback) {
            const searchMessage = `select *from messages where chat =  ${chatId} order by created_at asc;`;
            const searchSender = `select *from users as t1 inner join (select sender,messageID from messages where chat = ${chatId} order by created_at asc) as t2 where t1.userID= t2.sender;`;
            const searchReadBy = `select t1.chat,t2.messageID,t2.userID from (select * from messages where chat = 1 order by created_at asc) as t1 inner join readby as t2 where t1.messageID=t2.messageID;`;

            connectDB.query(searchMessage, (err, results) => {
                if (err) { callback(err, null) };

                const data = results.map(row => {
                    return {
                        id: row.messageID,
                        chat: row.chat,
                        content: row.content,
                        created_At: row.created_at
                    };
                });

                connectDB.query(searchReadBy, (err, results) => {
                    if (err) { callback(err, null) };
                    const readby = results.map(row => {
                        return {

                            messageID: row.messageID,
                            userID: row.userID,
                        };
                    });

                    connectDB.query(searchSender, (err, results) => {
                        if (err) { callback(err, null) };
                        const sender = results.map(row => {
                            return {
                                messageID: row.messageID,
                                id: row.userID,
                                name: row.name,
                                email: row.email,
                                picture: row.picture,

                            };
                        });


                        data.forEach(message => {
                            message.sender = sender.filter((snd) => {
                                return snd.messageID == message.id;
                            })[0];

                            message.readby = [];
                            readby.filter((rb) => {
                                return rb.messageID == message.id;
                            }).forEach((rbe) => {
                                message.readby.push(rbe.userID);
                            });

                        });

                        callback(null, data);

                    });
                });
            }); 
    }
}