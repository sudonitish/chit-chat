const mysql = require('mysql2');
if(process.env.DB=='mySQL'){
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'nitish',
    database: 'CHIT_CHAT'
});
module.exports = connection;
}