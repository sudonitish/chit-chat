const connectDB = require('../../config/mySQLconnection');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

module.exports = {
    validateName: function (name) {
        let nameRegex = /^[a-zA-Z]{1}[a-zA-z ]{0,19}$/;
        if (!nameRegex.test(name)) {
            return "invalid name format!"
        }
        return null
    },
    validateEmail: function (email) {
        let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i;
        if (!emailRegex.test(email)) {
            return ("(invalid email! (abc@xyz.com))")
        }
        return (null)
    },
    validatePassword: function (password) {
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
        if (!passwordRegex.test(password)) {
            return ("invalid password format!")
        }
        return (null)

    },
    saveUserToDB: async function (user, callback) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt)
            const Query = `
            INSERT INTO users (name,email,password,picture) VALUES ('${user.name}', '${user.email}', '${user.password}','${user.picture}'); 
          `;
            connectDB.query(Query, (err, results) => {
                if (err) { callback(err, null) };
                callback(null, results);
            });
    },
    createSecurePassword: async function (password) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt)
        return password;
    },
    updatePassword: async function (user, callback) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
            const updateQuery = `UPDATE users SET password = '${user.password}' WHERE userID = ${user.id};`;
            connectDB.query(updateQuery, (err, results) => {
                if (err) { callback(err) };
                callback(null);
            });
    },
    verifyJWT: async function (token, secret, callback) {

        try {
            const payload = await jwt.verify(token, secret);
            callback(null, payload)
        }
        catch (err) {
            callback(err, null)
        }
    },
    findUserByEmail: function (email, callback) {

            const searchQuery = `SELECT * FROM users WHERE email='${email}';`;
            connectDB.query(searchQuery, (err, results) => {
                if (err) { callback(err, null) };
                callback(null, results);
            });
    },
    findUserByID: function (id, callback) {
            const searchQuery = `SELECT * FROM users WHERE userID=${id};`;
        connectDB.query(searchQuery, (err, results) => {
                if (err) { callback(err, null) };
                callback(null, results);
            });
    },
    updatePictureOnMyProfile: function (id, pictureName, callback) {
        const searchQuery = `update users set picture='${pictureName}' where userID=${id};`;
        connectDB.query(searchQuery, (err, results) => {
            if (err) { callback(err, null) };
            callback(null, results);
        });
    }
}