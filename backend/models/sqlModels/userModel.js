const connection = require('../../config/mySQLconnection');


module.exports = async function () {
        const queries = [`CREATE TABLE IF NOT EXISTS users (
                userID INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                picture VARCHAR(255) DEFAULT 'default.png' NOT NULL 
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