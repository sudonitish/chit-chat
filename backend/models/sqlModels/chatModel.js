const connection = require('../../config/mySQLconnection');
module.exports = async function () {
        const queries = [`CREATE TABLE IF NOT EXISTS chats(
            chatID INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            isGroupChat BOOLEAN DEFAULT 0 NOT NULL,
            chatName VARCHAR(255),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            latestMessage INT

        );`,

        `CREATE TABLE IF NOT EXISTS participants(
            chatID INT(11),
            userID INT(11),
            foreign key (chatID) references chats(chatID),
            foreign key (userID) references users(userID)
         );`,
        
         `CREATE TABLE IF NOT EXISTS admins(
            chatID INT(11),
            userID INT(11),
            foreign key (chatID) references chats(chatID),
            foreign key (userID) references users(userID)
         );`
        ];
        queries.forEach(quer => {
            connection.execute(quer, (err, results) => {
                if (err) {
                    console.log(err)
                }
            });
        })
}