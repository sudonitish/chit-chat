const { userModel } = require("../../models/mongoModels/userModel")
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
            user.email = user.email.toLowerCase();
            userModel.create(user)
                .then((rUser) => {
                    callback(null, rUser)

                })
                .catch((err) => {
                    callback(err, null)
                })
    },
    createSecurePassword: async function (password) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt)
        return password;
    },
    updatePassword: async function (user, callback) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
            userModel.findOneAndUpdate({ _id: user.id }, { password: user.password })
                .then((user) => {
                    callback(null)
                })
                .catch((err) => {
                    callback(err)
                })
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
            userModel.find({ email: email })
                .then((user) => {
                    callback(null, user)
                })
                .catch((err) => {
                    callback(err, null)
                })
    },
    findUserByID: function (id, callback) {     
            userModel.find({ _id: id })
                .then((user) => {
                    callback(null, user)
                })
                .catch((err) => {
                    callback(err, null)
                })
    },
    updatePictureOnMyProfile: function (id, pictureName, callback) {
            userModel.findOneAndUpdate({ _id:id }, { picture: pictureName })
            .then((user) => {
                callback(null)
            })
            .catch((err) => {
                callback(err)
            })   
    }
}
