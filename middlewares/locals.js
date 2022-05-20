module.exports = function (req, res, next) {
    res.locals.csrf = req.csrfToken()
    res.locals.active_tab = req.flash('active_tab')[0]
    res.locals.errors = req.flash('errors')[0]
    res.locals.form_data = req.flash('form_data')[0]
    res.locals.isAuth = req.session.isAuthenticated
    next()
}