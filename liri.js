//js file for liri homework project
// get fs package
var fs = require("fs");

//link to keys file for twitter and spotify
var twKeys = require("./keys.js");
//link to twitter and pass in keys from keys file
var Twitter = require("twitter");
var twitbot = new Twitter({
  consumer_key: twKeys.twitterKeys.consumer_key,
  consumer_secret: twKeys.twitterKeys.consumer_secret,
  access_token_key: twKeys.twitterKeys.access_token_key,
  access_token_secret: twKeys.twitterKeys.access_token_secret
});

//link to spotify and pass in keys from keys file
var Spotify = require("node-spotify-api");
var spotbot = new Spotify({
  id: twKeys.spotifyKeys.client_id,
  secret: twKeys.spotifyKeys.client_secret
});

//link to request
var request = require("request");
//link to moment for twitter date
var moment = require('moment');

//get input arguments
var command = process.argv[2];
var inputData = process.argv[3];
var allArgs = process.argv;

//check for all the options and call appropriate function
allArgs.splice(0, 2);

switch (command) {
  case "my-tweets":

    processTweets();

    break;
  case "spotify-this-song":

    processSpotify();

    break;
  case "movie-this":

    processMovie();

    break;
  case "do-what-it-says":

    processRandomTxt();

    break;
  default:
    console.log("Sorry - but I do not understand your command");
}

//Process tweets
function processTweets() {

  twitbot.get('statuses/user_timeline', {
    screen_name: 'dancethismess',
    count: "20"
  }, function (error, tweets, response) {

    if (!error && response.statusCode === 200) {
      outputTweets(tweets);
    } else {
      console.log("Tweets had a problem. Error: " + error);
    }
  });
}

//output tweets
function outputTweets(tweets) {

  for (var i = 0; i < tweets.length; i++) {
    var createDate = moment(tweets[i].created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
    console.log((i + 1) + ". - " + moment(createDate).format("ddd MMM D hh:mm:ss A") + " " + tweets[i].text);
  }
}

//process spotify request
function processSpotify() {

  var mySong = "";
  if (inputData) {
    for (var i = 1; i < allArgs.length; i++) {
      if (i > 1 && i < allArgs.length) {
        mySong = mySong + " " + allArgs[i];
      } else {
        mySong += allArgs[i]; //i = 1
      }
    }
  } else {
    mySong = "The Sign";
  }

  spotbot.search({
    type: 'track',
    query: mySong,
    limit: '10'
  }, function (error, data) {

    if (!error) {
      outputSpotify(data, mySong);
    } else {
      console.log("Spotify had a problem. Error: " + error);
    }
  })
}

//output spotify data
function outputSpotify(data, inputSong) {
  var itemCount = 1;
  var dataArray = data.tracks.items;

  if (dataArray.length === 0) {
    console.log("Error: Track Not Found!");
    return;
  }

  for (var i = 0; i < dataArray.length; i++) {

    var songName = dataArray[i].name.toLowerCase();
    if (songName.indexOf(inputSong.toLowerCase()) !== -1) {

      console.log("-------------------" + itemCount + "-------------------");
      console.log("Artist: " + dataArray[i].artists[0].name);
      console.log("Song: " + dataArray[i].name);
      if (dataArray[i].preview_url !== null) {
        console.log("Preview URL: " + dataArray[i].preview_url);
      } else {
        console.log("Preview URL Not Available");
      }
      console.log("Album: " + dataArray[i].album.name);
      itemCount++;
    }
  }
  if (itemCount === 1) {
    console.log("Error:  No match found");
  }
}

//process and output movie requests
function processMovie() {

  var myMovie = "";

  if (inputData) {
    for (var i = 1; i < allArgs.length; i++) {
      if (i > 1 && i < allArgs.length) {
        myMovie = myMovie + "+" + allArgs[i];
      } else {
        myMovie += allArgs[i];
      }
    }
  } else {
    myMovie = "Mr.+Nobody";
  }
  // console.log("movie "+ myMovie)
  var queryUrl = "http://www.omdbapi.com/?t=" + myMovie + "&y=&plot=short&apikey=40e9cece";

  request(queryUrl, function (error, response, body) {

    // console.log(error)
    if (!error && response.statusCode === 200) {

      var jsonMovie = JSON.parse(body);

      if (jsonMovie.Response === "False") {
        console.log("Error: " + jsonMovie.Error);
      } else {
        // console.log(jsonMovie);
        console.log("Movie Title: " + jsonMovie.Title);
        console.log("Year Released: " + jsonMovie.Year);
        console.log("IMDB Rating: " + jsonMovie.imdbRating);

        var rottenTomatoesMsg = "Rotten Tomatoes Rating: Unknown";
        for (var index = 0; index < jsonMovie.Ratings.length; index++) {
          if (jsonMovie.Ratings[index].Source === "Rotten Tomatoes") {
            rottenTomatoesMsg = "Rotten Tomatoes Rating: " + jsonMovie.Ratings[index].Value;
          }
        }
        console.log(rottenTomatoesMsg);
        console.log("Production Country: " + jsonMovie.Country);
        console.log("Language: " + jsonMovie.Language);
        console.log("Plot: " + jsonMovie.Plot);
        console.log("Actors: " + jsonMovie.Actors);
      }
    } else {
      console.log("Movie Error: " + error);
    }
  })
}

//process random text file with request
function processRandomTxt() {

  fs.readFile("random.txt", "utf8", function (error, data) {

    if (error) {
      return console.log("Do what it says error: " + error);
    } else {

      var dataArr = data.split(",");
      if (dataArr.length > 0) {
        var key = dataArr[0];
        allArgs = [];
        allArgs.push(key);
        if (dataArr.length > 1) {
          inputData = JSON.parse(dataArr[1]);
          allArgs.push(inputData);
        }
        // console.log(inputData)
        switch (key) {
          case "my-tweets":
            processTweets();
            break;
          case "spotify-this-song":
            processSpotify();
            break;
          case "movie-this":
            processMovie();
            break;
          case "do-what-it-says":
            console.log("Sorry - cannot process option do-what-it-says in random.txt");
            break;
          default:
            console.log("Sorry - but I do not understand the random.txt command");
        }
      } else {
        console.log("Error with random.txt file.");
      }
    }
  })
}