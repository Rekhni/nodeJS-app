exports.NotFoundPage = (req, res, next) => {
    res.status(404).render('404', {pageTitle: '404 page', path: '/404'});
}

