const express = require('express');
const { check, body } = require('express-validator');
const User = require('../models/user');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
    [
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
            .then(userDoc => {
                if (!userDoc) {
                    return Promise.reject('User wasn\'t found');
                }
                req.user = userDoc;
                return true;
            });
        }),
        body('password', 'Password has to be valid')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim() 
    ],
    authController.postLogin
);

router.post('/signup', 
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail()
        .custom((value, { req }) => {
            // if (value === 'test@test.com') {
            //     throw new Error('This email address is forbidden.');
            // }
            // return true
            return User.findOne({ email: value })
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('There is already user with this email!');
                }
            });
        }),

        body(
            'password', 
            'Please enter a password with only numbers and text and at least 5 characters.'
        )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),

        body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have no match!');
            }
            return true;
        })

    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;