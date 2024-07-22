const mongodb = require('mongodb');
const Product = require('../models/product');

const ObjectId = mongodb.ObjectId;

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Product", 
        path: "/admin/add-product",
        editing: false
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(title, price, description, imageUrl, null, req.user._id);
    product.save()
    .then(result => {
        // console.log(res);
        console.log('Created product');
        res.redirect('/admin/admin-product-list');
    })
    .catch(err => {
        console.log(err)
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
                    product: product
                });
           })
           .catch(err => {
                console.log(err);
           });
};

exports.postEditProduct = (req, res, next) => {
    const prodId= req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImgUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description

    const product = new Product(
        updatedTitle, 
        updatedPrice, 
        updatedDescription, 
        updatedImgUrl, 
        new ObjectId(prodId))

    product.save()       
    .then(() => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/admin-product-list');
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then(products => {
        res.render('admin/admin-product-list', {
            prods: products, 
            pageTitle: 'Admin Products', 
            path: '/admin/admin-product-list'
        });
    })
    .catch(err => {
        console.log(err);
    });
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId)
           .then(() => {
                res.redirect('/admin/admin-product-list');
           })
           .catch(err => console.log(err));   
}