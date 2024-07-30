const path = require('path');

const express = require('express');
const { check, body } = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const Product = require('../models/product');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct)

// /admin/products => GET
router.get('/admin-product-list', isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product',
    [
        check('title', 'Title should consist at least 3 characters.')
        .isString()
        .isLength({ min: 3 })
        .trim()
        .custom((value, { req }) => {
            return Product.findOne({ title: value})
            .then(product => {
                if (product) {
                    return Promise.reject('You already have a product with that title!')
                }
                return true;
            })
        }), 

        // check('image', 'URL must be placed on "Image URL" field')
        // .isURL(),

        check('price', 'Price should be float.')
        .isFloat(),

        check('description', 'Description should consist at least 5 characters.')
        .isLength({ min: 5, max: 400 })
        .trim()
    ],

    isAuth, 
    adminController.postAddProduct)

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct); 

router.post('/edit-product', 
    [
        check('title', 'Title should consist at least 3 characters.')
        .isString()
        .isLength({ min: 3 })
        .trim(),
        // .custom((value, { req }) => {
        //     return Product.findOne({ title: value})
        //     .then(product => {
        //         if (product) {
        //             return Promise.reject('You already have a product with that title!')
        //         }
        //         return true;
        //     })
        // }), 

        check('price', 'Price should be float.')
        .isFloat(),

        // check('image', 'URL must be placed on "Image URL" field')
        // .isURL(),

        check('description', 'Description should consist at least 5 characters.')
        .isLength({ min: 5, max: 400 })
        .trim()
    ],
    isAuth, 
    adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
