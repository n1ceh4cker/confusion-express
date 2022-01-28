const express = require('express')
const favoriteRouter = express.Router()
const cors = require('./cors')
const authenticate = require('../authenticate')
const Favorites = require('../models/favorites')
const favorites = require('../models/favorites')

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.veryfyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
        .populate('dishes')
        .then(favorite => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite)
        }, (err) => next(err)
        ).catch(
            err => next(err)
        )
})
.post(cors.corsWithOptions, authenticate.veryfyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite != null){
            req.body.forEach(dish => {
                if(!favorite.dishes.includes(dish._id))
                    favorite.dishes.push(dish._id)
            })
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('dishes')
                .then(favorite => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err) => next(err))
            })
        }
        else{
            Favorites.create({user: req.user.id, dishes: req.body})
            .then(favorite => {
                console.log('Favorites created ' + favorite)
                Favorites.findById(favorite._id)
                .populate('dishes')
                .then(favorite => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err) => next(err))
            }, (err) => next(err)
            ).catch(err => next(err))
        }
    }, err => next(err))
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.veryfyUser, (req, res, next) => {
    res.statusCode = 403
    res.end('PUT operation is not supported on /favorites')
})
.delete(cors.corsWithOptions, authenticate.veryfyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorites.remove({})
        .then(resp => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(resp)
        }, (err) => next(err)
        ).catch(
            err => next(err)
        )
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.veryfyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorites) => {
        if (favorites && favorites.dishes.indexOf(req.params.dishId) >= 0) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json({exists: true, favorites: favorites})
        }
        else {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json({exists: false, favorites: favorites})
        }
    }, (err) => next(err))
    .catch(err => next(err))
  
})
.post(cors.corsWithOptions, authenticate.veryfyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite != null){
            console.log(req.params)
            if(!favorite.dishes.includes(req.params.dishId))
                favorite.dishes.push(req.params.dishId)
          
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('dishes')
                .then(favorite => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err) => next(err))
            })
        }
        else{
            Favorites.create({user: req.user.id, dishes: req.params.dishId})
            .then(favorite => {
                console.log('Favorites created ' + favorite)
                Favorites.findById(favorite._id)
                .populate('dishes')
                .then(favorite => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err) => next(err))
            }, (err) => next(err)
            ).catch(err => next(err))
        }
    }, err => next(err))
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.veryfyUser, (req, res, next) => {
    res.statusCode = 403
    res.end('PUT operation is not supported on /favorites/:dishId')
})
.delete(cors.corsWithOptions, authenticate.veryfyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite != null){
          favorite.dishes = favorite.dishes.filter(id => id != req.params.dishId)
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('dishes')
                .then(favorite => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err) => next(err))
            })
        }
    }, err => next(err))
    .catch(err => next(err))
})

module.exports = favoriteRouter