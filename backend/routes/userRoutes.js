const { reset } = require('colors');
const express = require('express');
const { verify } = require('jsonwebtoken');
const { getSignUpPage, registerUser, verifyUser, getLoginPage, authorizeUser, getForgotPasswordPage, sendResetPasswordLink, getResetPasswordPage, resetToNewPassword ,getResetPasswordOnProfile,setResetPasswordOnProfile,logOutFromChat,searchUser} = require("../controllers/userControllers");
const router = express.Router()
const multer = require('multer');
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
  
const imageUploadMiddleware = imageMulter.single('displayPicture');
router.route('/signup')
    .get(getSignUpPage)
    .post(imageUploadMiddleware,registerUser)

router.route('/login')
    .get(getLoginPage)
    .post(authorizeUser)

router.route('/verify/:name/:token')
    .get(verifyUser)


router.route('/forgot')
    .get(getForgotPasswordPage)
    .post(sendResetPasswordLink)


router.route('/reset/:id/:token')
    .get(getResetPasswordPage)
    .post(resetToNewPassword)

router.route('/resetPassword')
    .get(getResetPasswordOnProfile)
    .post(setResetPasswordOnProfile)

router.route('/logout')
    .get(logOutFromChat)

router.route('/serchUser')
    .get(searchUser)
    
module.exports = router;
