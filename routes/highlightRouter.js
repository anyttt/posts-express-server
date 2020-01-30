const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Highlights = require('../models/highlights');

const highlightRouter = express.Router();

highlightRouter.use(bodyParser.json());

highlightRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.dendStatus(200); })
.get(cors.cors, (req, res, next) => {
	Highlights.find({})
	.then((highlights) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(highlights);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Highlights.create(req.body)
	.then((highlight) => {
		console.log('Leader Created', highlight);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(highlight);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /highlights');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Highlights.remove({})
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});

highlightRouter.route('/:highlightId')
.options(cors.corsWithOptions, (req, res) => { res.dendStatus(200); })
.get(cors.cors, (req, res, next) => {
	Highlights.findById(req.params.highlightId)
	.then((highlight) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(highlight);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
	res.statusCode = 403;
	res.end('POST operation not supported on /highlights/' + req.params.highlightId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Highlights.findByIdAndUpdate(req.params.highlightId, {
		$set: req.body
	}, { new: true })
	.then((highlight) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(highlight);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Highlights.findByIdAndRemove(req.params.highlightId)
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});

module.exports = highlightRouter;