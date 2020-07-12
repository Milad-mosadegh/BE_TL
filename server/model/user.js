const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const { reject } = require('lodash')


let tokenOption = {
    type: String,
    required: true
}
let UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minLength: 6,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: '{Value} is not valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    tokens: [{
        _id: false,
        access: tokenOption,
        token: tokenOption
    }],
    payment: [{
        info: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: String,
            required: true,
        }
    }],
    recive: [{
        info: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: String,
            required: true,
        }
    }]
})

// vase ine ke karbar passwordo nabine
UserSchema.methods.toJSON = function () {
    let user = this; // manzoor UserSchema
    let userObject = user.toObject();

    // 
    return _.pick(userObject, ["id", "fullName", 'email'])
}

// Shenasaii az tarighe Email baraye taaiid = Shabihe class amal mikone
UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;

    return User.findOne({
        email
    }).then(user => {
        if (!user) { return Promise.reject() }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) resolve(user)
                else reject()
            })
        })
    });
}

UserSchema.statics.findByToken = function (token) {
    let User = this;

    let decoded;

    try {
        decoded = jwt.verify(token, 'milad');
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })

}

UserSchema.methods.removeToken = function (token) {
    let user = this

    return user.update({
        $pull: {
            tokens: {
                token
            }
        }
    })
}

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth'

    let token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, "milad").toString();

    user.tokens.push({
        access,
        token
    });

    return user.save().then(() => {
        return token;
    })
}

// vase ine ke ghable save shoodan password be hash tabdil she 
UserSchema.pre('save', function (next) {
    let user = this; // this manzoor UserSchema

    if (user.isModified("password")) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})

let User = mongoose.model('User', UserSchema)

module.exports = { User }