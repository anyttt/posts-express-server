const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	comment: {
		type: String,
		required: true
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
},
{
	timestamps: true
});

const postSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	description: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: true
	},
	label: {
		type: String,
		default: ''
	},
	comments: [commentSchema]
},
{
	timestamps: true
});

const Posts = mongoose.model('Post', postSchema);

module.exports = Posts;