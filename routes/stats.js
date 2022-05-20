const express = require('express')
const async = require('async')

const authMiddleware = require('../middlewares/auth')
const Passenger = require('../models/Passenger')

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
    res.render('stats/search', {title: "Analyses statistiques"})
})

router.post('/', authMiddleware, async (req, res) => {
    try {
        const sex = req.body.sex && ['male', 'female'].includes(req.body.sex) ? req.body.sex : 'all'
        const min_age = req.body.min_age && parseInt(req.body.min_age) >= 0 && parseInt(req.body.min_age) <= 100 ? parseInt(req.body.min_age) : 0
        const max_age = req.body.max_age && parseInt(req.body.max_age) >= 0 && parseInt(req.body.max_age) <= 100 ? parseInt(req.body.max_age) : 100
        const pclass = req.body.pclass && ['1', '2', '3'].includes(req.body.pclass) ? parseInt(req.body.pclass) : 'all'

        const queries = []
        const options = {
            Age: {
                $gte: min_age,
                $lte: max_age
            }
        }
        let options2 = {}
        if (sex !== 'all') options2 = Object.assign(options2, {Sex: sex})
        if (pclass !== 'all') options2 = Object.assign(options2, {Pclass: pclass})
        // number of survivors aged min_age to max_age years
        queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: true}, options2, options)))
        // number of non survivors aged min_age to max_age years
        queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: false}, options2, options)))

        if (['all', 'female'].includes(sex)) {
            if (pclass === 'all') {
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: true, Sex: "female", Pclass: 1}, options))) // number of first class female survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: true, Sex: "female", Pclass: 2}, options))) // number of second class female survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: true, Sex: "female", Pclass: 3}, options))) // number of third class female survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: false, Sex: "female", Pclass: 1}, options))) // number of first class female non survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: false, Sex: "female", Pclass: 2}, options))) // number of second class female non survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: false, Sex: "female", Pclass: 3}, options))) // number of third class female non survivors
            } else {
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: true, Sex: "female", Pclass: pclass}, options))) // number of pclass female survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: false, Sex: "female", Pclass: pclass}, options))) // number of pclass female non survivors
            }
        }
        if (['all', 'male'].includes(sex)) {
            if (pclass === 'all') {
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: true, Sex: "male", Pclass: 1}, options))) // number of first class male survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: true, Sex: "male", Pclass: 2}, options))) // number of second class male survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: true, Sex: "male", Pclass: 3}, options))) // number of third class male survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: false, Sex: "male", Pclass: 1}, options))) // number of first class male non survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: false, Sex: "male", Pclass: 2}, options))) // number of second class male non survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: false, Sex: "male", Pclass: 3}, options))) // number of third class male non survivors
            } else {
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: true, Sex: "male", Pclass: pclass}, options))) // number of pclass male survivors
                queries.push(async() => await Passenger.countDocuments(Object.assign({Survived: false, Sex: "male", Pclass: pclass}, options))) // number of pclass male non survivors
            }
        }

        async.parallel(queries).then(responses => {
            let variables = {
                min_age,
                max_age,
                sex,
                pclass,
                nbOfSurvivors: responses[0],
                nbOfNonSurvivors: responses[1]
            }
            if (sex === 'all') {
                if (pclass === 'all') {
                    variables = Object.assign(variables, {
                        nbOfFirstClassFemaleSurvivors: responses[2],
                        nbOfSecondClassFemaleSurvivors: responses[3],
                        nbOfThirdClassFemaleSurvivors: responses[4],
                        nbOfFirstClassFemaleNonSurvivors: responses[5],
                        nbOfSecondClassFemaleNonSurvivors: responses[6],
                        nbOfThirdClassFemaleNonSurvivors: responses[7],
    
                        nbOfFirstClassMaleSurvivors: responses[8],
                        nbOfSecondClassMaleSurvivors: responses[9],
                        nbOfThirdClassMaleSurvivors: responses[10],
                        nbOfFirstClassMaleNonSurvivors: responses[11],
                        nbOfSecondClassMaleNonSurvivors: responses[12],
                        nbOfThirdClassMaleNonSurvivors: responses[13]
                    })
                } else if (pclass === 1) {
                    variables = Object.assign(variables, {
                        nbOfFirstClassFemaleSurvivors: responses[2],
                        nbOfFirstClassFemaleNonSurvivors: responses[3],
                        nbOfFirstClassMaleSurvivors: responses[4],
                        nbOfFirstClassMaleNonSurvivors: responses[5]
                    })
                } else if (pclass === 2) {
                    variables = Object.assign(variables, {
                        nbOfSecondClassFemaleSurvivors: responses[2],
                        nbOfSecondClassFemaleNonSurvivors: responses[3],
                        nbOfSecondClassMaleSurvivors: responses[4],
                        nbOfSecondClassMaleNonSurvivors: responses[5]
                    })
                } else if (pclass === 3) {
                    variables = Object.assign(variables, {
                        nbOfThirdClassFemaleSurvivors: responses[2],
                        nbOfThirdClassFemaleNonSurvivors: responses[3],
                        nbOfThirdClassMaleSurvivors: responses[4],
                        nbOfThirdClassMaleNonSurvivors: responses[5]
                    })
                }
            } else if (sex === 'female') {
                if (pclass === 'all') {
                    variables = Object.assign(variables, {
                        nbOfFirstClassFemaleSurvivors: responses[2],
                        nbOfSecondClassFemaleSurvivors: responses[3],
                        nbOfThirdClassFemaleSurvivors: responses[4],
                        nbOfFirstClassFemaleNonSurvivors: responses[5],
                        nbOfSecondClassFemaleNonSurvivors: responses[6],
                        nbOfThirdClassFemaleNonSurvivors: responses[7]
                    })
                } else if (pclass === 1) {
                    variables = Object.assign(variables, {
                        nbOfFirstClassFemaleSurvivors: responses[2],
                        nbOfFirstClassFemaleNonSurvivors: responses[3]
                    })
                } else if (pclass === 2) {
                    variables = Object.assign(variables, {
                        nbOfSecondClassFemaleSurvivors: responses[2],
                        nbOfSecondClassFemaleNonSurvivors: responses[3]
                    })
                } else if (pclass === 3) {
                    variables = Object.assign(variables, {
                        nbOfThirdClassFemaleSurvivors: responses[2],
                        nbOfThirdClassFemaleNonSurvivors: responses[3]
                    })
                }
            } else if (sex === 'male') {
                if (pclass === 'all') {
                    variables = Object.assign(variables, {
                        nbOfFirstClassMaleSurvivors: responses[2],
                        nbOfSecondClassMaleSurvivors: responses[3],
                        nbOfThirdClassMaleSurvivors: responses[4],
                        nbOfFirstClassMaleNonSurvivors: responses[5],
                        nbOfSecondClassMaleNonSurvivors: responses[6],
                        nbOfThirdClassMaleNonSurvivors: responses[7]
                    })
                } else if (pclass === 1) {
                    variables = Object.assign(variables, {
                        nbOfFirstClassMaleSurvivors: responses[2],
                        nbOfFirstClassMaleNonSurvivors: responses[3]
                    })
                } else if (pclass === 2) {
                    variables = Object.assign(variables, {
                        nbOfSecondClassMaleSurvivors: responses[2],
                        nbOfSecondClassMaleNonSurvivors: responses[3]
                    })
                } else if (pclass === 3) {
                    variables = Object.assign(variables, {
                        nbOfThirdClassMaleSurvivors: responses[2],
                        nbOfThirdClassMaleNonSurvivors: responses[3]
                    })
                }
            }
            res.render('stats/search_results', variables)
        })
    } catch (e) {
        console.log(e)
    }
})

module.exports = router