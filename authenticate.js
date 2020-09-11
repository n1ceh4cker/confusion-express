const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const jwtStrategy = require('passport-jwt').Strategy
const extractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')

const User = require('./models/users')
const config = require('./config')

exports.local = passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

exports.getToken = user => jwt.sign(user, config.secretKey, { expiresIn: 3600 })

let opts = {}
opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = config.secretKey

exports.jwtPassport = passport.use(new jwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log('JWT Payload', jwt_payload)
        User.findById(jwt_payload._id, (err, user) => {
            if(err) return done(err, false)
            else if(user) return done(null, user)
            else return done(null, false)
        })
}))

exports.veryfyUser = passport.authenticate('jwt', { session: false })