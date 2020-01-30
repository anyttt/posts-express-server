const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const highlightSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	image: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	}
},
{
	timestamps: true
});

const Highlights = mongoose.model('Highlight', highlightSchema);

module.exports = Highlights;