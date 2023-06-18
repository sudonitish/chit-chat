const mongoose = require('mongoose');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const connection = require('./mySQLconnection');
const userModel = require('../models/sqlModels/userModel');
const chatModel = require('../models/sqlModels/chatModel');
const messageModel = require('../models/sqlModels/messageModel');
const constraintsModel = require('../models/sqlModels/constraintsModel');



dotenv.config();
module.exports = async function () {
    if (process.env.DB === 'mySQL') {
        connection.connect((err) => {
            if (err) throw err;
            console.log('Connected to MySQL database!, Go to http://'+ process.env.HOST + ':' + process.env.PORT);
        });
        userModel();
        chatModel();
        messageModel();
        constraintsModel();
    }
    else {
            mongoose.set('strictQuery', false);
            try {
                const conn = await mongoose.connect(process.env.MONGO_URI)
                console.log('Connected to MongoBD database! Go to http://'+ process.env.HOST + ':' + process.env.PORT);
            }
            catch (err) {
                console.log(`ERROR: ${err.message}`)
                process.exit()
            }
    }
}

