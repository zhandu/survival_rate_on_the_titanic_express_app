const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const {Schema, model} = mongoose

const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, "L'adresse e-mail est requise."],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: "L'adresse e-mail n'est pas valide."
        }
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis."],
        minlength: [6, "Le mot de passe doit comporter au moins 6 caractères."],
        maxLength: [30, "Le mot de passe doit comporter au plus 30 caractères."]
    }
}, {timestamps: true})

UserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

module.exports = model('User', UserSchema)