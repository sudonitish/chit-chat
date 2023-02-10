const express = require('express')
const session = require('express-session')
const multer = require('multer')
const nodemailer = require('nodemailer')
const fs = require('fs')
const init = require('./database/init')
const { userModel, cartModel, productModel } = require('./database/schemas')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { verify } = require('crypto')
const { match } = require('assert')
const { getMaxListeners } = require('process')
const app = express()
const JWT_SECRET = "SUp3R@SeCR3T&"
const port = 3000

const whiteList = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]
const imageMulter = multer({
    storage: multer.diskStorage({
        destination: (request, file, callback) => callback(null, "uploads"),
        filename: (request, file, callback) => callback(null, Date.now() + "_" + file.originalname)
    }),
    fileFilter: (request, file, callback) => {
        if (!whiteList.includes(file.mimetype)) {
            return callback(new Error('file is not allowed'))
        }
        callback(null, true)
    }
});

const imageUploadMiddleware = imageMulter.array('images');

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    // requireTLS:true, // true for 465, false for other ports
    auth: {
        user: 'userverificati0ntest@gmail.com',
        pass: 'spdpnnesztcdlcch',
    },

});

init((err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log('database connected.')
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
})

app.set('view-engine', 'ejs')
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
})
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public/styles'))
app.use(express.static('public/scripts'))
app.use(express.static('uploads'))
app.use(express.json())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}))


app.route('/')
    .get((req, res) => {
        if (req.session.is_Admin && req.session.is_logged_in) {
            res.redirect('/addProducts');
        }
        else {
            res.render('home.ejs', {
                username: req.session.user_name,
                isLoggedIn: req.session.is_logged_in,
                isAdmin: req.session.is_Admin
            })
        }
        // console.log(req.session)
    })
app.route('/productData/:productNo')
    .get((req, res) => {
        const { productNo } = req.params;
        productModel.find().skip(productNo).limit(1)
            .then((data) => {
                res.send(JSON.stringify(data[0]))
            })
            .catch((err) => {
                res.render('serverError.ejs', { errorType: "Server Error!", error: err })
            })

    })
app.route('/productDataById')
    .get((req, res) => {
        productModel.find({ _id: req.query.id })
            .then((data) => {
                res.send(JSON.stringify(data[0]))
            })
            .catch((err) => {
                res.render('serverError.ejs', { errorType: "Server Error!", error: err })
            })

    })
app.route('/getProductsCount')
    .get((req, res) => {
        productModel.find()
            .then((data) => {
                res.send({ productCount: data.length })
            })
            .catch((err) => {
                res.render('serverError.ejs', { errorType: "Server Error!", error: err })
            })

    })
app.route('/logout')
    .get((req, res) => {
        req.session.destroy();
        res.redirect('/');
    })











  


    