const mongoose = require('mongoose')

const {Schema, model} = mongoose

const PassengerSchema = new Schema({
    "PassengerId": {
        type: Number
    },
    "Survived": {
        type: Boolean
    },
    "Pclass": {
        type: Number,
        enum: [1, 2, 3],
        default: 3
    },
    "Name": {
        type: String
    },
    "Sex": {
        type: String,
        enum: ['male', 'female']
    },
    "Age": {
        type: Number,
        min: 0,
        max: 100
    },
    "SibSp": {
        type: Number
    },
    "Parch": {
        type: Number
    },
    "Ticket": {
        type: String
    },
    "Fare": {
        type: Number
    },
    "Cabin": {
        type: String
    },
    "Embarked": {
        type: String
    },
})

module.exports = model('Passenger', PassengerSchema)