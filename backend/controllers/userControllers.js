const asyncHandler = require('express-async-handler');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv');
const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET
);
const { validateName, validateEmail, validatePassword, saveUserToDB, verifyJWT, updatePassword, findUserByEmail, findUserByID, updatePictureOnMyProfile } = (process.env.DB === 'mySQL') ? require('../methods/sqlMethods/userLoginMethods') : require('../methods/mongoMethods/userLoginMethods')

dotenv.config();
const getSignUpPage = asyncHandler(async (req, res) => {
    let errors = {
        nameErr: "",
        emailErr: "",
        passwordErr: "",
        cpasswordErr: "",
        savedName: "",
        savedEmail: "",
        savedPassword: "",
        savedCPassword: "",
    }
    if (req.session.is_logged_in) {
        res.redirect('/')
    }
    else {
        res.render('signup.ejs', errors)
    }
})
const registerUser = asyncHandler(async (req, res) => {
    
    let errors = {
        nameErr: "",
        emailErr: "",
        passwordErr: "",
        cpasswordErr: "",
        savedName: req.body.name,
        savedEmail: req.body.email,
        savedPassword: req.body.password,
        savedCPassword: req.body.cpassword,
    }
    let err;
    err = validateName(req.body.name);
    if (err) {
        errors.nameErr = err;
        res.render('signup.ejs', errors)
        return;
    }
    err = validateEmail(req.body.email)
    if (err) {
        errors.emailErr = err;
        res.render('signup.ejs', errors)
        return
    }
    err = validatePassword(req.body.password)
    if (err) {
        errors.passwordErr = err;
        res.render('signup.ejs', errors)
        return
    }
    err = validatePassword(req.body.cpassword)
    if (err) {
        errors.cpasswordErr = err;
        res.render('signup.ejs', errors)
        return
    }
    if (req.body.password !== req.body.cpassword) {
        errors.cpasswordErr = "password does'nt match!";
        res.render('signup.ejs', errors)
        return
    }


    findUserByEmail(req.body.email, (err, user) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            if (user.length !== 0) {
                errors.emailErr = "email already exisits"
                res.render('signup.ejs', errors)
            }
            else {
                let pictureUploaded = 'default.png';
                if (req.file) {
                    pictureUploaded = req.file.filename
                }
                const secret = process.env.JWT_SECRET + req.body.email;
                const payload = {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    picture: pictureUploaded,
                    isAdmin: false

                }
                const token = jwt.sign(payload, secret)
                const link = `http://localhost:3000/api/user/verify/${payload.email}/${token}`

                let transporter = mailjet.post("send", { 'version': 'v3.1' }).request({
                    "Messages": [{
                        "From": {
                            "Email": process.env.SENDER_EMAIL,
                            "Name": "Chit Chat 👻"
                        },
                        "To": [{
                            "Email": req.body.email,
                            "Name": ""
                        }],
                        "Subject": " Email Verification ✔",
                        "HTMLPart": `To verify email address <a href=${link}>click</a> here.`,
                    }]
                });

                transporter
                    .then(result => {
                        console.log("email send success");
                        res.send({ error: false, message: 'Please verify your email address,verification email send to your email...' })

                        return
                    })
                    .catch(err => {
                        console.log(err);
                    });

                res.render('redirect.ejs', { message: 'Please verify your email address,verification email send to your email...' })

                return
            }
        }
    })
})
const verifyUser = asyncHandler(async (req, res) => {
    const { name, token } = req.params;
    verifyJWT(token, process.env.JWT_SECRET + name, (err, payload) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })

        }
        else {
            findUserByEmail(payload.email, (err, user) => {
                if (err) {
                    console.log(err)
                    res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                }
                else {
                    if (user.length !== 0) {
                        res.redirect('/api/user/login')
                    }
                    else {
                        saveUserToDB(payload, (err, data) => {
                            if (err) {
                                res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                                console.log('error saving')
                            }
                            else {


                                let transporter = mailjet.post("send", { 'version': 'v3.1' }).request({
                                    "Messages": [{
                                        "From": {
                                            "Email": process.env.SENDER_EMAIL,
                                            "Name": "Chit Chat 👻"
                                        },
                                        "To": [{
                                            "Email": payload.email,
                                        }],
                                        "Subject": " Email Verification ✔",
                                        "TextPart": "Email Verified successfully",
                                    }]
                                });

                                transporter.then((result) => {
                                    console.log("email send success");
                                }).catch((err) => {
                                    console.log(err);
                                });
                                res.render('redirect.ejs', { message: 'Email verified successfully...' })
                                console.log('saved successfully')
                                req.session.is_logged_in = true;
                                req.session.email = req.body.email;
                                req.session.userId = data._id;
                                req.session.name = data.name;
                                req.session.picture = data.picture
                                return;
                            }
                        })

                    }
                }
            })
        }
    })
})
const getLoginPage = asyncHandler(async (req, res) => {
    let errors = {
        emailErr: "",
        passwordErr: "",
        savedEmail: "",
        savedPassword: "",
    }
    if (req.session.is_logged_in) {
        res.redirect('/')
    }
    else {

        res.render('login.ejs', errors)
    }
})
const authorizeUser = asyncHandler(async (req, res) => {
    
    let errors = {
        emailErr: "",
        passwordErr: "",
        savedEmail: req.body.email,
        savedPassword: req.body.password,
    }
    let err = null;
    err = validateEmail(req.body.email)
    if (err) {
        errors.emailErr = err;
        res.render('login.ejs', errors)
        return
    }
    findUserByEmail(req.body.email, (err, user) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            if (user.length !== 0) {

                if (!bcrypt.compareSync(req.body.password, user[0].password)) {
                    errors.passwordErr = "password does'nt match!";
                    res.render('login.ejs', errors)
                }
                else {
                    req.session.is_logged_in = true;
                    req.session.email = req.body.email;
                    req.session.userId = (process.env.DB === 'mySQL') ? user[0].userID : user[0].id;
                    req.session.name = user[0].name;
                    req.session.picture = user[0].picture;

                    res.redirect("/");
                }
            }
            else {
                errors.passwordErr = "user not found";
                res.render('login.ejs', errors)
                return
            }
        }
    })

})
const getForgotPasswordPage = asyncHandler(async (req, res) => {
    let errors = {
        emailErr: "",
        savedEmail: ""
    }
    res.render('forgot.ejs', errors)
})
const sendResetPasswordLink = asyncHandler(async (req, res) => {
    let errors = {
        emailErr: "",
        savedEmail: req.body.email,
    }
    let err;
    err = validateEmail(req.body.email)
    if (err) {
        errors.emailErr = err;
        res.render('forgot.ejs', errors)
        return
    }
    findUserByEmail(req.body.email.toLowerCase(), (err, user) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            if (user.length === 0) {
                errors.emailErr = "user does'st exist"
                res.render('forgot.ejs', errors)
            }
            else {
                const secret = process.env.JWT_SECRET + user[0].email;
                const userID = (process.env.DB === 'mySQL') ? user[0].userID : user[0].id;
                const payload = {
                    email: user[0].email,
                    id: userID
                }
                const token = jwt.sign(payload, secret, { expiresIn: '10m' })
                const link = `http://localhost:3000/api/user/reset/${userID}/${token}`


                const request = mailjet
                    .post("send", { 'version': 'v3.1' })
                    .request({
                        "Messages": [
                            {
                                "From": {
                                    "Email": process.env.SENDER_EMAIL,
                                    "Name": "Chit Chat"
                                },
                                "To": [
                                    {
                                        "Email": user[0].email
                                    }
                                ],
                                "Subject": "Reset Password",
                                "HTMLPart": `To reset your password, please <a href=${link}>click here</a>.`
                            }
                        ]
                    });

                request.then((result) => {
                    console.log("email send success")
                })
                    .catch((err) => {
                        console.log("error")
                        console.log(err.statusCode, err.message)
                    });
                res.render('redirect.ejs', { message: 'Password reset link sent to your email...' })

                return
            }
        }
    })
})
const getResetPasswordPage = asyncHandler(async (req, res) => {

    let errors = {
        passwordErr: "",
        cpasswordErr: "",
        savedPassword: "",
        savedCPassword: "",
    }

    const { id, token } = req.params;


    findUserByID(id, (err, user) => {


        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            if (user.length === 0) {
                res.render('serverError.ejs', { errorType: "404", error: "page not found!" });
            }
            else {
                verifyJWT(token, process.env.JWT_SECRET + user[0].email, (err, payload) => {
                    if (err) {
                        console.log(err)
                        res.render('serverError.ejs', { errorType: "Server Error!", error: err })

                    }
                    else {

                        res.render('resetPassword.ejs', errors)
                    }
                })
            }
        }
    })

})
const resetToNewPassword = asyncHandler(async (req, res) => {
    let errors = {
        passwordErr: "",
        cpasswordErr: "",
        savedPassword: "",
        savedCPassword: "",
    }
    let err;
    err = validatePassword(req.body.password)
    if (err) {
        errors.passwordErr = err;
        res.render('resetPassword.ejs', errors)
        return
    }
    err = validatePassword(req.body.cpassword)
    if (err) {
        errors.cpasswordErr = err;
        res.render('resetPassword.ejs', errors)
        return
    }
    if (req.body.password !== req.body.cpassword) {
        errors.cpasswordErr = "password does'nt match!";
        res.render('resetPassword.ejs', errors)
        return
    }
    const { id, token } = req.params;

    findUserByID(id, (err, user) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            if (user.length === 0) {
                res.render('serverError.ejs', { errorType: "404", error: "page not found!" });
            }
            else {

                const secret = process.env.JWT_SECRET + user[0].email;
                try {
                    const payload = jwt.verify(token, secret)
                    const userID = (process.env.DB === 'mySQL') ? user[0].userID : user[0].id;
                    updatePassword({ id: userID, password: req.body.password }, (err) => {
                        if (err) {
                            console.log(err)
                            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                        }
                        else {
                            const request = mailjet
                            .post("send", { 'version': 'v3.1' })
                            .request({
                                "Messages": [
                                    {
                                        "From": {
                                            "Email": process.env.SENDER_EMAIL,
                                            "Name": "Chit Chat"
                                        },
                                        "To": [
                                            {
                                                "Email": user[0].email
                                            }
                                        ],
                                        "Subject": "Reset Password",
                                        "TextPart": "Password updated successfully"
                                    }
                                ]
                            });

                        request
                            .then((result) => {
                                console.log("email send success")
                            })
                            .catch((err) => {
                                console.log(err.statusCode, err.message)
                            });
                            res.render('redirect.ejs', { message: 'Password updated successfully...' })
                            console.log('password updated successfully')
                            return

                        }
                    })
                }
                catch (err) {
                    console.log(err)
                    res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                    return
                }
                // res.redirect('/api/user/login');

            }
        }
    })
})
const getResetPasswordOnProfile = asyncHandler(async (req, res) => {
    let errors = {
        opasswordErr: "",
        passwordErr: "",
        cpasswordErr: "",
        savedOPassword: "",
        savedPassword: "",
        savedCPassword: "",
    }
    if (req.session.is_logged_in)
        res.render('resetPasswordOnProfile.ejs', errors)
    else {
        res.redirect('/api/user/login')
    }
})
const setResetPasswordOnProfile = asyncHandler(async (req, res) => {
    let errors = {
        opasswordErr: "",
        passwordErr: "",
        cpasswordErr: "",
        savedOPassword: req.body.opassword,
        savedPassword: req.body.password,
        savedCPassword: req.body.cpassword,
    }

    let err;
    err = validatePassword(req.body.password)
    if (err) {
        errors.passwordErr = err;
        res.render('resetPasswordOnProfile.ejs', errors)
        return
    }
    err = validatePassword(req.body.cpassword)
    if (err) {
        errors.cpasswordErr = err;
        res.render('resetPasswordOnProfile.ejs', errors)
        return
    }
    if (req.body.password !== req.body.cpassword) {
        errors.cpasswordErr = "password does'nt match!";
        res.render('resetPasswordOnProfile.ejs', errors)
        return
    }

    findUserByEmail(req.session.email, (err, user) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            if (user.length === 0) {
                res.render('serverError.ejs', { errorType: "Server Error!", error: 'something went wrong' });
            }
            else {
                if (!bcrypt.compareSync(req.body.opassword, user[0].password)) {
                    errors.opasswordErr = 'incorrect password'
                    res.render('resetPasswordOnProfile.ejs', errors)
                    return
                }
                else {
                    updatePassword({ id: (process.env.DB === 'mySQL') ? user[0].userID : user[0].id, password: req.body.password }, (err) => {
                        if (err) {
                            console.log(err)
                            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
                        }
                        else {
                            req.session.destroy();

                            const transporter = mailjet
                                    .post("send", { 'version': 'v3.1' })
                                    .request({
                                        "Messages": [{
                                            "From": {
                                                "Email": process.env.SENDER_EMAIL,
                                                "Name": "Chit Chat 👻"
                                            },
                                            "To": [{
                                                "Email": user[0].email,
                                            }],
                                            "Subject": "Reset Password ✔",
                                            "TextPart": "password updated successfully",
                                        }]
                                    });

                                transporter
                                    .then((result) => {
                                        console.log("email send success");
                                    })
                                    .catch((err) => {
                                        console.log(err.statusCode, err.message);
                                    });
                            res.render('redirect.ejs', { message: 'Password updated successfully...' })
                            console.log('password updated successfully')
                            return

                        }
                    })
                }
            }
        }
    })

})
const logOutFromChat = asyncHandler(async (req, res) => {
    req.session.destroy();
    res.redirect('/');
})
const searchUser = asyncHandler(async (req, res) => {
    let email = req.query.search;
    findUserByEmail(email.trim(), (err, user) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })
        }
        else {
            if (user.length !== 0) {
                if (user[0].email === req.session.email) {
                    res.send({
                        found: false,
                        user: null
                    })
                }
                else {
                    res.send({
                        found: true,
                        id: (process.env.DB === 'mySQL') ? user[0].userID : user[0].id
                    })
                }
            }
            else {
                res.send({
                    found: false,
                    user: null
                })
            }
        }
    })

})
const changeProfileOfUser = asyncHandler(async (req, res) => {
    pictureUploaded = req.file.filename;
    updatePictureOnMyProfile(req.session.userId, pictureUploaded, (err, chat) => {
        if (err) {
            console.log(err)
            res.render('serverError.ejs', { errorType: "Server Error!", error: err })

        }
        else {
            req.session.picture = pictureUploaded;
            res.send({ status: "ok", picture: pictureUploaded });
        }
    })
})


module.exports =
{
    getSignUpPage, registerUser, verifyUser, getLoginPage, authorizeUser, getForgotPasswordPage, sendResetPasswordLink, getResetPasswordPage, resetToNewPassword, getResetPasswordOnProfile, setResetPasswordOnProfile, logOutFromChat, searchUser, changeProfileOfUser
}