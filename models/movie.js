var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var movieSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    maxlength: [50, "Title should not exceed 50 letters"],
  },
  releaseYear: {
  	type: Number,
  	required: [true, "Release year is required"],
  	max: [Number(new Date().getFullYear()), "Year is invalid, must not exceed {MAX}"],
  	min: [1900, "Year must be greater than {MIN}"]
  },
  director: {
  	type: String,
  	required: [true, "Director is required"],
  	maxlength: [40, "Title should not exceed 30 letters"],
  },
  genre: {
  	type: String,
  	required: [true, "Genre is required"],
  	maxlength: [50, "Genre should not exceed 20 letters"],
  },
  poster: {
  	type: Schema.Types.Mixed,
  	required: false
  }
});

module.exports = mongoose.model('movie', movieSchema);