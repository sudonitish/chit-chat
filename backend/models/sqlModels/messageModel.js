const connection = require('../../config/mySQLconnection');

module.exports = async function () {
        const queries = [`CREATE TABLE IF NOT EXISTS messages(
            messageID INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            chat INT(11),
            sender INT(11),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            content TEXT,
            foreign key (chat) references chats(chatID),
            foreign key (sender) references users(userID)
    );`,

            `CREATE TABLE IF NOT EXISTS readBy(
            messageID INT,
            userID INT,
            foreign key(messageID) references messages(messageID),
            foreign key(userID) references users(userID));`,
        ];
        queries.forEach(quer => {
            connection.execute(quer, (err, results) => {
                if (err) {
                    console.log(err)
                }
            });
        })
}
