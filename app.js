let fs = require('fs');
let secrets = fs.readFileSync('/data/secret_ae.txt', 'utf8').split('\n');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var credits = require('./routes/credits');

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', express.static(path.join(__dirname, 'public/ArsElectronicaGJ/')));
app.use('/users', users);
app.use('/credits', credits);

var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: secrets[0],
  consumer_secret: secrets[1],
  access_token_key: secrets[2],
  access_token_secret: secrets[3]
});

let tweetContent = 'This is @ArsElectronica having fun while hiring me...'
let tweetText = ''

app.get('/ajax/tweetText/', (req, res)=>{
	if(tweetText != '') {
		let url = tweetText.replace(tweetContent + ' ', '')
		res.send(JSON.stringify({tweet: tweetText, url: url, content: tweetContent}));
	} else {
		res.send('');
	}
})

app.post('/ajax/tweet/', (req, res)=>{
	tweetText = ''
	// const pathToMovie = '/path/to/your/video/animated-gif.gif';
	const mediaType   = 'image/gif'; // `'video/mp4'` is also supported
	// const mediaData = req.body.image.replace("data:image/gif;base64,", "")
	
	var data = req.body.image.replace("data:image/gif;base64,", "");
	var mediaData = new Buffer(data, 'base64');

	// fs.writeFile('image.png', buf);

	// const mediaData   = ;
	const mediaSize   = mediaData.byteLength;

	initUpload() // Declare that you wish to upload some media
	  .then(appendUpload) // Send the data for the media
	  .then(finalizeUpload) // Declare that you are done uploading chunks
	  .then(mediaId => {
	    // You now have an uploaded movie/animated gif
	    // that you can reference in Tweets, e.g. `update/statuses`
	    // will take a `mediaIds` param.
	    if(mediaId != null) {
	    	client.post('statuses/update', {status: tweetContent, media_ids: mediaId}, function(error, tweet, response) {
			  if (!error) {
			    console.log(tweet);
				console.log(response);  // Raw response object.
				tweetText = tweet.text;
			  }
			});
	    }
	    
	  }).catch(function(error) {
		console.log(error);
	  });

	  /**
	   * Step 1 of 3: Initialize a media upload
	   * @return Promise resolving to String mediaId
	   */
	  function initUpload () {
	    return makePost('media/upload', {
	      command    : 'INIT',
	      total_bytes: mediaSize,
	      media_type : mediaType,
	    }).then(data => {
	    	console.log(data);
	    	return data.media_id_string}
	    ).catch(function(error) {
		console.log(error);
	  });;
	  }

	  /**
	   * Step 2 of 3: Append file chunk
	   * @param String mediaId    Reference to media object being uploaded
	   * @return Promise resolving to String mediaId (for chaining)
	   */
	  function appendUpload (mediaId) {

	    return makePost('media/upload', {
	      command      : 'APPEND',
	      media_id     : mediaId,
	      media        : mediaData,
	      segment_index: 0
	    }).then(data => {
	    	console.log(data);
	    	console.log(mediaId);
	    	return mediaId;
	    }).catch(function(error) {
		console.log(error);
	  });;
	  }

	  /**
	   * Step 3 of 3: Finalize upload
	   * @param String mediaId   Reference to media
	   * @return Promise resolving to mediaId (for chaining)
	   */
	  function finalizeUpload (mediaId) {
	  	console.log(mediaId)
	    return makePost('media/upload', {
	      command : 'FINALIZE',
	      media_id: mediaId
	    }).then(data => {
	    	console.log(data);
	    	console.log(mediaId);
	    	return mediaId;
	    }).catch(function(error) {
		console.log(error);
	  });;
	  }

	  /**
	   * (Utility function) Send a POST request to the Twitter API
	   * @param String endpoint  e.g. 'statuses/upload'
	   * @param Object params    Params object to send
	   * @return Promise         Rejects if response is error
	   */
	  function makePost (endpoint, params) {
	    return new Promise((resolve, reject) => {
	      client.post(endpoint, params, (error, data, response) => {
	        if (error) {
	          reject(error);
	        } else {
	          resolve(data);
	        }
	      });
	    });
	  }
	  
	console.log('tweet.');
	console.log(req.body.image.substr(0, 100));
	// console.log(res);
	res.send('tweeted');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;