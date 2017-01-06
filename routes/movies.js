var Movie = require('../models/movie');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multer  = require('multer');
var url = require('url');

//list all the movies
router.route('/').get(function(req, res) {
  var url_parts = url.parse(req.url, true);
  
  var query = url_parts.query;
  var search = "";
  var filter = {};
  if(query.search !== undefined && query.search !== ""){
    search  = query.search;
    filter.title = new RegExp(search, "i");
  }

  Movie.count(filter,function(err, count){
    var pageSize = 5;
    var skip = 0;
    var remainder = count%pageSize;
    var quotient = count/pageSize;
    var numPages = Math.round((remainder == 0) ? quotient : quotient+1);

    var pageNo = parseInt(query.page);
    if(pageNo !== undefined && pageNo !== "" && typeof pageNo == "number"){
      skip = (query.page - 1)*pageSize;
    } 
    if(isNaN(pageNo)){
      pageNo = 1;
    }
    Movie.find(filter).limit(pageSize).skip(skip).exec(function(err, movies) {
      if (err) {
        return res.send(err);
      }
      res.render('pages/index',{movies:movies, search:search, pages:numPages, pageNo:pageNo});
    });
  });
});

//movie details page
router.route('/view/:id').get(function(req,res){
  Movie.findOne({ _id: req.params.id }, function(err, movie) {
    if (err) {
      return res.send(err);
    }

    for (prop in req.body) {
      movie[prop] = req.body[prop];
    }
    res.render('pages/movie',{movie:movie});
    
  });
});

//load movie poster
router.route('/poster/:id').get(function(req,res){
  Movie.findOne({ _id: req.params.id }, function(err, movie) {
    if (err) {
      return res.send(err);
    }
    if(movie.poster !== undefined){
      var readStream = fs.createReadStream(path.join(movie.poster.destination, 
        movie.poster.filename));
      readStream.on('error',function(err){
        return res.send(err);
      });
      res.setHeader('Content-Type', movie.poster.mimetype);
      readStream.pipe(res);
    }
  });
});

//create a movie
router.route('/add').get(function(req,res){
  res.render('pages/form',{action:"add"});
});

//for handling multipart form requests
var upload = multer({ 
  dest: 'posters/',
  fileFilter: function(req, file, cb) {
    var allowed = ["image/png", "image/jpeg"];
    if(allowed.indexOf(file.mimetype) != -1){
      cb(null, true);
    } else {
      cb('Only jpg,jpeg,png extensions allowed', false);
    }
  },
  limits:{
    fileSize:2097152//2 Mb
  } 
});
var uploader = upload.single('poster');
//create a movie(form handler)
router.route('/add').post(function(req,res){
  uploader(req, res, function (err) {
    if(err){
      return res.render('pages/form',
        {errors:{"poster":{"message":err}},
        movie:movie,
        action:"add"
      });
    }
    var movie = new Movie(req.body);
    if(req.file !== undefined){
      movie.poster = req.file;
    }
    movie.save(function(err) {
        if (err) {
          if(err.name == "ValidationError"){
            return res.render('pages/form',{errors:err.errors,
              movie:movie,action:"add"});
          } else {
            return res.send(err);
          }
        }
        res.redirect('/movies');
    });
  }); 
});


//update a movie
router.route('/update/:id').get(function(req,res){
  Movie.findOne({ _id: req.params.id }, function(err, movie) {
    if (err) {
      return res.send(err);
    }
    for (prop in req.body) {
      movie[prop] = req.body[prop];
    }
    res.render('pages/form',{movie:movie,action:"update"});
  });
});


//update a movie(form handler)
router.route('/update/:id').post(function(req,res){
  Movie.findOne({ _id: req.params.id }, function(error, movie) {
    if (error) {
      return res.send(error);
    }

    uploader(req, res, function (err) {
      if(err){
        return res.render('pages/form',
          {errors:{"poster":{"message":err}},
          movie:movie,
          action:"add"
        });
      }
      
      if(movie.poster !== undefined && req.file !== undefined){
        //delete the existing poster
        try {
          fs.unlinkSync(path.join(movie.poster.destination, 
            movie.poster.filename));
        } catch (err) {
          console.log("error while deleting the existing poster");
        }
      }
 
      if(req.file !== undefined){
        movie.poster = req.file;
      }

      for (prop in req.body) {
        movie[prop] = req.body[prop];
      }

      movie.save(function(err) {
          if (err) {
            if(err.name == "ValidationError"){
              return res.render('pages/form',{errors:err.errors,
                movie:movie,action:"update"});
            } else {
              return res.send(err);
            }
          }
          res.redirect('/movies');
      });
    });
  });
});

//delete a movie
router.route('/delete/:id').get(function(req, res) {
  Movie.findOne({ _id: req.params.id }, function(err, movie) {
    if (err) {
      return res.send(err);
    }
    var poster = movie.poster;
    Movie.remove({
      _id: req.params.id
    }, function(err, movie) {
      if (err) {
        return res.send(err);
      }
      //delete the existing poster
      try {
        fs.unlinkSync(path.join(poster.destination, 
          poster.filename));
      } catch (err) {
        console.log(err);
      }
      res.redirect('/movies');
    });
  });

});


module.exports = router;
