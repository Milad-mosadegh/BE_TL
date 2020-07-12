const { User } = require('./model/user')
const connectDB = require('./db/mongoose')
const { authenticate } = require('./middleware/authenticate')
const { splitDate, printRunLevel } = require('./utils/utils')
const { logger } = require('./utils/winstonOptions')

const express = require('express')
const _ = require('lodash')
const persianDate = require('persian-date')


const fs = require('fs')
const path = require('path')

// middleware
const morgan = require('morgan')
const helmet = require('helmet')
const user = require('./model/user')

const PORT = process.env.PORT || 5000
const app = express();
connectDB();


// ye file misaze ke hame etelaate log ro unja save mikone 
const requestLogger = fs.createWriteStream(path.join(__dirname, 'log/request.log'))


// time to persian
persianDate.toLocale('en');
const date = new persianDate().format('YYYY/M/DD')

app.use(express.json())
app.use(helmet())
app.use(morgan('combined', { stream: requestLogger }))

app.post('/api/users', async (req, res) => {
    try {
        const body = _.pick(req.body, ["fullName", "email", "password"])
        let user = new User(body)
        await user.save();
        res.status(200).send(user);
    } catch (e) {
        res.status(400).json({
            Error: `Somthing is wrong body.${e}`
        })
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ["email", 'password']);
        let user = await User.findByCredentials(body.email, body.password)
        let token = await user.generateAuthToken()
        res.header('x-auth', token)
            .status(200)
            .send(token)

    } catch (e) {
        res.status(400).json({
            Error: `Somthins is Bad ${e}`
        })
    }
})

app.post('/api/payment', authenticate, async (req, res) => {
    try {
        const body = _.pick(req.body, ["info", "amount"]);
        let user = await User.findOneAndUpdate({
            _id: req.user._id
        }, {
            $push: {
                payment: {
                    info: body.info,
                    amount: body.amount,
                    // date mishe persian date
                    date
                }
            }
        });
        if (!user) {
            return res.status(404).json({
                Error: "user not found"
            })
        }

        res.status(200).json({
            Message: "payment has been saved"
        })
    } catch (e) {
        res.status(400).json({
            Error: `At the Payment somthing is wrong ${e}`
        })
    }
})

app.get('/api/payment', authenticate, async (req, res) => {
    try {
        let user = await User.findOne({
            _id: req.user._id
        })

        if (!user) {
            return res.status(404).json({
                Error: "user not found"
            })
        }

        res.status(200).send(user.payment)
    } catch (e) {
        res.status(400).json({
            Error: `In catch payment Somthing is wrong ${e}`
        })
    }
})

app.delete('/api/payment/:id', authenticate, async (req, res) => {
    let id = req.params.id;

    try {
        let user = await User.findOneAndUpdate({
            _id: req.user._id,
            "payment._id": id
        }, {
            $pull: {
                payment: {
                    _id: id
                }
            }
        });
        if (!user) {
            return res.status(404).json({
                Error: "user not found"
            })
        }

        res.status(200).send(user.payment)

    } catch (e) {
        res.status(400).json({
            Error: `In Delet payment Somthing is wrong ${e}`
        })
    }
})

// Update
app.patch('/api/payment', authenticate, async (req, res) => {
    let body = _.pick(req.body, ["id", "info", "amount", 'date'])

    try {
        let user = await User.findOneAndUpdate({
            _id: req.user._id,
            'payment._id': body.id
        }, {
            $set: {
                // dolar moshakhasseye paymente peyda shode ast
                'payment.$.info': body.info,
                'payment.$.amount': body.amount,
                'payment.$.date': body.date,
            }
        })
        if (!user) {
            return res.status(404).json({
                Error: "user not found"
            })
        }
        res.status(200).json({
            Message: "payment updated"
        })
    } catch (e) {
        res.status(400).json({
            Error: `In Delet payment Somthing is wrong ${e}`
        })
    }
})

app.get('/api/paymentSum', authenticate, async (req, res) => {
    let amount = []
    let theDate;

    try {
        let user = await User.findOne({
            _id: req.user._id
        })

        if (!user) {
            return res.status(404).json({
                Error: "user not found"
            })
        }

        user.payment.forEach(element => {
            splitArr = splitDate(element.date);
            theDate = new persianDate([Number(splitArr[0]), Number(splitArr[1]), Number(splitArr[2])]);

            todayDate = new persianDate();

            if (theDate.isSameMonth(todayDate)) {
                amount.push(element.amount)
            }
        });

        res.status(200).json({
            sum: `${_.sum(amount)}`
        })
    } catch (e) {
        res.status(400).json({
            Error: `In Delet payment Somthing is wrong ${e}`
        })
    }


})

// logout
app.delete('/api/logout', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token)
        res.status(200).json({
            Message: "Logout was Successfull"
        })
    } catch (e) {
        res.status(400).json({
            Error: "Somthing is wrong in Logout"
        })
    }
})
app.listen(PORT, () => {
    logger.info(`Server is Runing on Port ${PORT}`)
})