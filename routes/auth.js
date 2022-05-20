const express = require('express')
const bcrypt = require('bcrypt')

const User = require('../models/User')
const redirectToStatsIfAuth = require('../middlewares/redirect_to_stats_if_auth')

const router = express.Router()

router.get('/', redirectToStatsIfAuth, (req, res) => {
    res.render('auth/login', {title: "Se connecter / S'inscrire"})
})

router.post('/login', redirectToStatsIfAuth, async(req, res) => {
    try {
        const {email, password} = req.body

        const candidate = await User.findOne({email})

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)

            if (areSame) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(err => {
                    if (err) {
                        throw err
                    } else {
                        res.redirect('/stats')
                    }
                })
            } else {
                req.flash('errors', {"Login Error": "Le nom d'utilisateur ou le mot de passe est incorrect."})
                req.flash('form_data', {email: req.body.email})
                res.redirect('/auth')
            }
        } else {
            req.flash('errors', {"Login Error": "Le nom d'utilisateur ou le mot de passe est incorrect."})
            req.flash('form_data', {email: req.body.email})
            res.redirect('/auth')
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', redirectToStatsIfAuth, (req, res) => {
    try {
        const user = new User({
            email: req.body.reg_email,
            password: req.body.reg_password
        })
        user.save().then(() => {
            res.redirect('/stats')
        }).catch((error) => {
            let errors = {}
            if (error.name === "ValidationError") {
                Object.keys(error.errors).forEach((key) => {
                    errors[key] = error.errors[key].message
                });
            
                req.flash('errors', errors)
            } else if (error.name === "MongoServerError" && error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0]
                errors = {[field]: `${field.charAt(0).toUpperCase() + field.slice(1)} doit être unique.`}
    
                req.flash('errors', errors)
            } else {
                req.flash('errors', {"Server Error": "Erreur de serveur interne."})
            }
            req.flash('form_data', {reg_email: req.body.reg_email})
            req.flash('active_tab', 'register')
            res.redirect('/auth')
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth')
    })
})

module.exports = router