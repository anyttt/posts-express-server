const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.dendStatus(200); })
.get(cors.cors, authenticate.verifyUser,  (req, res, next) => {
	Favorites.findOne({ 'user': req.user._id })
	.populate('user')
	.populate('posts')
	.then((favorites) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(favorites);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({ 'user': req.user._id })
	.then((favorites) => {
		const newPosts = req.body;
		if (!favorites) {
			// Create a favorite list for the user
			Favorites.create({ user: req.user._id, posts: newPosts })
			.then((favorites) => {
				Favorites.findById(favorites._id)
				.populate('user')
				.populate('posts')
				.then(favorites => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorites);
				});
			}, (err) => next(err))
			.catch((err) => next(err));
		} else {
			// User already has a favorites list
			newPosts.forEach((newPost) => {
				if (!favorites.posts.includes(newPost._id)) {
					favorites.posts.push(newPost);
				}
			});
			favorites.save()
			.then((favorites) => {
				Favorites.findById(favorites._id)
				.populate('user')
				.populate('posts')
				.then(favorites => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorites);
				});
			}, (err) => next(err))
			.catch((err) => next(err));
		}
	})
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /favorites');
})
.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({ 'user': req.user._id })
	.then((favorites) => {
		favorites.posts = [];
		favorites.save()
		.then((favorites) => {
			Favorites.findById(favorites._id)
			.populate('user')
			.then(favorites => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favorites);
			});
		});
	}, (err) => next(err))
	.catch((err) => next(err));
})

favoriteRouter.route('/:postId')
.options(cors.corsWithOptions, (req, res) => { res.dendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({ 'user': req.user._id })
	.populate('posts')
	.then((favorites) => {
		const post = favorites.posts.filter((post) => post._id.equals(req.params.postId))[0];
		if (post) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(post);
		} else {
			const err = new Error('Post ' + req.params.postId + ' is not in your favorites list.');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({ 'user': req.user._id})
	.then((favorites) => {
		if (!favorites) {
			// Create a favorite list for the user
			Favorites.create({ user: req.user._id, posts: [ req.params.postId ] })
			.then((favorites) => {
				Favorites.findById(favorites._id)
				.populate('user')
				.populate('posts')
				.then(favorites => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorites);
				});
			}, (err) => next(err))
			.catch((err) => next(err));
		} else {
			// User already has a favorites list
			if (!favorites.posts.includes(req.params.postId)) {
				favorites.posts.push(req.params.postId);
				favorites.save()
				.then((favorites) => {
					Favorites.findById(favorites._id)
					.populate('user')
					.populate('posts')
					.then(favorites => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorites);
					}, (err) => next(err))
					.catch((err) => next(err));
				});
			} else {
				const err = new Error('Post ' + req.params.postId + ' is already in your favorites list.');
				err.status = 404;
				return next(err);
			}
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /favorites/' + req.params.postId);
})
.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({ 'user': req.user._id })
	.then((favorites) => {
		const post = favorites.posts.filter((post) => post._id.equals(req.params.postId))[0];
		if (post) {
			favorites.posts.remove(req.params.postId);
			favorites.save()
			.then((favorites) => {
				Favorites.findById(favorites._id)
				.populate('user')
				.populate('posts')
				.then(favorites => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorites);
				});
			}, (err) => next(err))
			.catch((err) => next(err));
		} else {
			const err = new Error('Post ' + req.params.postId + ' is not in your favorites list.');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})

module.exports = favoriteRouter;