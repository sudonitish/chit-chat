const connection = require('../../config/mySQLconnection');


module.exports = async function () {
        const queries = [`ALTER TABLE chats ADD CONSTRAINT FOREIGN KEY (latestMessage) REFERENCES messages(messageID);`
        ];
        queries.forEach(quer => {
            connection.execute(quer, (err, results) => {
                if (err) {
                    console.log(err)
                }
            });
        })
}