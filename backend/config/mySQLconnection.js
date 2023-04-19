const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'user', //write DB user
    password: 'password',//your DB password
    database: 'CHIT_CHAT'
});
module.exports = connection;
