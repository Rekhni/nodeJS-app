exports.NotFoundPage = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: '404 page', 
        path: '/404',
        isAuthenticated: req.session.isLoggedIn
    });
}

exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error', 
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
}



