const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Posts = require('../models/posts');

const postRouter = express.Router();

postRouter.use(bodyParser.json());

postRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.dendStatus(200); })
.get(cors.cors, (req, res, next) => {
	Posts.find({})
	.populate('comments.author')
	.then((posts) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(posts);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Posts.create(req.body)
	.then((post) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(post);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /posts');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Posts.remove({})
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});

postRouter.route('/:postId')
.options(cors.corsWithOptions, (req, res) => { res.dendStatus(200); })
.get(cors.cors, (req, res, next) => {
	Posts.findById(req.params.postId)
	.populate('comments.author')
	.then((post) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(post);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
	res.statusCode = 403;
	res.end('POST operation not supported on /posts/' + req.params.postId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Posts.findByIdAndUpdate(req.params.postId, {
		$set: req.body
	}, { new: true })
	.then((post) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(post);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Posts.findByIdAndRemove(req.params.postId)
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});

postRouter.route('/:postId/comments')
.options(cors.corsWithOptions, (req, res) => { res.dendStatus(200); })
.get(cors.cors, (req, res, next) => {
	Posts.findById(req.params.postId)
	.populate('comments.author')
	.then((post) => {
		if (post != null) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(post.comments);
		} else {
			const err = new Error('Post ' + req.params.postId + ' not found.');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Posts.findById(req.params.postId)
	.then((post) => {
		if (post != null) {
			req.body.author = req.user._id;
			post.comments.push(req.body);
			post.save()
			.then((post) => {
				Posts.findById(post._id)
					.populate('comments.author')
					.then((post) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(post);
					})
			}, (err) => next(err));
		} else {
			const err = new Error('Post ' + req.params.postId + ' not found.');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /posts/' + req.params.postId + '/comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Posts.findById(req.params.postId)
	.then((post) => {
		if (post != null) {
			post.comments = [];
			post.save()
			.then((post) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(post);
			}, (err) => next(err));
		} else {
			const err = new Error('Post ' + req.params.postId + ' not found.');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
});

postRouter.route('/:postId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.dendStatus(200); })
.get(cors.cors, (req, res, next) => {
	Posts.findById(req.params.postId)
	.populate('comments.author')
	.then((post) => {
		if (post != null && post.comments.id(req.params.commentId) != null) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(post.comments.id(req.params.commentId));
		} else if (post == null) {
			const err = new Error('Post ' + req.params.postId + ' not found.');
			err.status = 404;
			return next(err);
		} else {
			const err = new Error('Comment ' + req.params.commentId + ' not found.');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
	res.statusCode = 403;
	res.end('POST operation not supported on /posts/' + req.params.postId + '/comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Posts.findById(req.params.postId)
	.then((post) => {
		if (post != null && post.comments.id(req.params.commentId) != null) {
			const userId =  req.user._id;
			const comment = post.comments.id(req.params.commentId);
			const authorId = comment.author;
			if (authorId.equals(userId)) {
				if (req.body.rating) {
					post.comments.id(req.params.commentId).rating = req.body.rating;
				}
				if (req.body.comment) {
					post.comments.id(req.params.commentId).comment = req.body.comment;
				}
				post.save()
				.then((post) => {
					Posts.findById(post._id)
						.populate('comments-author')
						.then((post) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(post);
						})
				}, (err) => next(err));
			} else {
				const err = new Error('Users are only allowed to update their own comments.');
				err.status = 403;
				return next(err);
			}
		} else if (post == null) {
			const err = new Error('Post ' + req.params.postId + ' not found.');
			err.status = 404;
			return next(err);
		} else {
			const err = new Error('Comment ' + req.params.commentId + ' not found.');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Posts.findById(req.params.postId)
	.then((post) => {
		if (post != null && post.comments.id(req.params.commentId) != null) {
			const userId =  req.user._id;
			const comment = post.comments.id(req.params.commentId);
			const authorId = comment.author;
			if (authorId.equals(userId)) {
				post.comments.id(req.params.commentId).remove();
				post.save()
				.then((post) => {
					Posts.findById(post._id)
						.populate('comments-author')
						.then((post) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(post);
						})
				}, (err) => next(err));
			}  else {
				const err = new Error('Users are only allowed to delete their own comments.');
				err.status = 403;
				return next(err);
			}
		} else if (post == null) {
			const err = new Error('Post ' + req.params.postId + ' not found.');
			err.status = 404;
			return next(err);
		} else {
			const err = new Error('Comment ' + req.params.commentId + ' not found.');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
});

module.exports = postRouter;