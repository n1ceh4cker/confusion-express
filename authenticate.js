const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const jwtStrategy = require('passport-jwt').Strategy
const facebookTokenStrategy = require('passport-facebook-token')
const extractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
var dotenv = require('dotenv').config()
const User = require('./models/users')

exports.local = passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

exports.getToken = user => jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_VALIDITY })

let opts = {}
opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET_KEY

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

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin){
        next()
    }
    else{
        let err = new Error('You are not authorized to perform this opertion!');
        err.status = 403;
        next(err);
    }
}

exports.facebookPassport = passport.use(new facebookTokenStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_SECRET_KEY
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({facebookId: profile.id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    })
}
))