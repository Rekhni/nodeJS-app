const mongodb = require('mongodb');
const mongoose = require('mongoose');
const fileHelper = require('../util/file');
const Product = require('../models/product');
const { validationResult } = require('express-validator');

const ObjectId = mongodb.ObjectId;

const ITEMS_PER_PAGE = 2;

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product", 
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        errorMessage: null,
        product: {
            title: '',
            price: 0,
            description: '',
            image: ''
        },
        validationErrors: []
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const image = req.file;
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            errorMessage: 'Attached file is not an image.',
            product: {
                title: title,
                price: price,
                description: description
            },
            validationErrors: []
        });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: {
                title: title,
                price: price,
                description: description
            },
            validationErrors: errors.array()
        });
    }

    const imageUrl = image.path;


    const product = new Product({ 
        // _id: new mongoose.Types.ObjectId('66a4359ee3db5aaab163cd4a'),
        title: title, 
        price: price, 
        description: description, 
        image: imageUrl,
        userId: req.user
    });
    product.save()
    .then(result => {
        // console.log(res);
        console.log('Created product');
        res.redirect('/admin/admin-product-list');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
} 

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
           .then(product => {
                if (!product) {
                    return res.redirect('/');
                }
                res.render('admin/edit-product', {
                    pageTitle: "Edit Product", 
                    path: "/admin/edit-product",
                    editing: editMode,
                    hasError: false,
                    product: product,
                    errorMessage: null,
                    validationErrors: []
                });
           })
           .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
           });
};

exports.postEditProduct = (req, res, next) => {
    const prodId= req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: "/admin/add-product",
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId
            },
            validationErrors: errors.array()
        });
    }

    Product.findById(prodId)
    .then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;

        if (image) {
            fileHelper.deleteFile(product.image);
            product.image = image.path;
        }

        return product.save().then(result => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/admin-product-list');
        });  
    })     
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find({ userId: req.user._id}).countDocuments()
    .then(numProducts => {
        totalItems = numProducts;
        return Product.find({ userId: req.user._id})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        res.render('admin/admin-product-list', {
            prods: products, 
            pageTitle: 'Admin Products', 
            path: '/admin/admin-product-list',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        if (!product) {
            return next(new Error('Product not found')); 
        }
        fileHelper.deleteFile(product.image);
        return  Product.deleteOne({ _id: prodId, userId: req.user._id });
    })  
    .then(() => {
        res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
        res.status(500).json({ message: 'Deleting product failed!' });
    });   
}