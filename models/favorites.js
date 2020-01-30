const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	posts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	}]
},
{
	timestamps: true
});

const Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;