var request = require("request");
var rp = require("request-promise");
var fs = require("fs");
var util = require('util');
var inquirer = require("inquirer");
var OAuth = require('OAuth');
var keys = require("./keys.js");

var action = process.argv[2];
var value = process.argv[3];
// var action;
// var value;

askUser();

function askUser() {
    if (typeof action != 'undefined') {

        callSwitch();

    } else {

        inquirer.prompt([

            {
                type: "list",
                message: "What would you like Liri to do?",
                choices: [
                    "movie-this", "my-tweets", "spotify-this-song", "do-what-it-says"
                ],
                name: "action"
            }
        ]).then(function(user) {
            action = user.action;

            callSwitch();
            // console.log(JSON.stringify(user, null, 2));

        });
    }
}

function callSwitch() {
    switch (action) {
        case "movie-this":
            movieThis();
            break;

        case "my-tweets":
            myTweets();
            break;

        case "spotify-this-song":
            spotifyThisSong();
            break;

        case "do-what-it-says":
            doWhatItSays();
            break;
    }

}

function movieThis() {
    if (typeof value != 'undefined') {
        omdb();
    } else {

        inquirer.prompt([

            {
                type: "input",
                message: "What movie would you like to search for?",
                name: "value"
            },

            // Here we ask the user to confirm.
            {
                type: "confirm",
                message: "Are you sure:",
                name: "confirm",
                default: true

            }

        ]).then(function(user) {
            value = user.value;

            if (user.confirm) {

                if (value == '') {
                    value = 'Mr. Nobody';
                }
                // console.log(value);

                omdb();
            } else {

                console.log("");
                console.log("");
                console.log("That's okay, come again when you are more sure.");
                console.log("");
                console.log("");

            }

        });

    }
}

function omdb() {
    rp({
        url: "http://www.omdbapi.com/?t=" + value + "&y=&plot=short&r=json",
        json: true
    }).then(function(data) {
        // console.log(data);

        // Object.keys(data).forEach(function(key) {
        //     console.log(key + ": ", data[key]);
        // });

        var movie = ("----------------------------------------------" +
        '\n' +
        "Title: " + data.Title + '\n' + "Year: " + data.Year + '\n' + "imdbRating: " + data.imdbRating + '\n' + "Country: " + data.Country + '\n' + "Language: " + data.Language + '\n' + "Plot: " + data.Plot + '\n' + "Actors: " + data.Actors + '\n' + "Rotten Tomatoes: " + data.Ratings[1].Value + '\n' + "==============================================");
        log(movie);
    }).catch(function(err) {
        console.log(err);
    });
}

function myTweets() {
    if (typeof value != 'undefined') {
        twitter();
    } else {

        inquirer.prompt([

            {
                type: "input",
                message: "What's your screen name?",
                name: "value"
            },

            // Here we ask the user to confirm.
            {
                type: "confirm",
                message: "Are you sure:",
                name: "confirm",
                default: true

            }

        ]).then(function(user) {
            value = user.value;

            if (user.confirm) {

                if (value == '') {
                    value = 'maade117';
                }
                // console.log(value);

                twitter();
            } else {

                console.log("");
                console.log("");
                console.log("That's okay, come again when you are more sure.");
                console.log("");
                console.log("");

            }

        });

    }
}

function twitter() {
    // console.log(keys.twitterKeys.consumer_key);

    var oauth = new OAuth.OAuth('https://api.twitter.com/oauth/request_token', 'https://api.twitter.com/oauth/access_token', keys.twitterKeys.consumer_key, keys.twitterKeys.consumer_secret, '1.0A', null, 'HMAC-SHA1');

    oauth.get('https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=' + value + '&count=20', keys.twitterKeys.access_token_key, keys.twitterKeys.access_token_secret, function(e, data, result) {
        if (e)
            console.error(e);

        // console.log(JSON.parse(data));
        data = JSON.parse(data);
        var tweets = ("----------------------------------------------" +
        '\n');
        for (var i = 0; i < data.length && i < 20; i++) {
            if (data[i]['text']) {
                // console.log(data[i]['text']);
                var time = data[i]['created_at'].split('+');
                var year = time[1].split(' ');
                var tweet = ("Tweet: " + data[i]['text'] + '\n' + "Posted: " + time[0] + year[1] + '\n' + '\n');
                tweets += tweet;
            }

        }
        tweets += ("==============================================");
        log(tweets);
    });
}

function spotifyThisSong() {
    if (typeof value != 'undefined') {
        spotify();
    } else {

        inquirer.prompt([

            {
                type: "input",
                message: "What song would you like to search for?",
                name: "value"
            },

            // Here we ask the user to confirm.
            {
                type: "confirm",
                message: "Are you sure:",
                name: "confirm",
                default: true

            }

        ]).then(function(user) {
            value = user.value;

            if (user.confirm) {
                if (value == '') {

                    value = 'The Sign';
                }
                // console.log(value);
                spotify();

            } else {

                console.log("");
                console.log("");
                console.log("That's okay, come again when you are more sure.");
                console.log("");
                console.log("");

            }

        });
    }
}

function spotify() {
    rp({
        uri: "https://api.spotify.com/v1/search?q=" + encodeURI(value) + "&type=track&offset=0&limit=1",
        json: true
    }).then(function(data) {
        // var myArray = process.argv.slice(2, process.argv.length);
        // console.log(JSON.stringify(data, null, ' '));
        var song = ("----------------------------------------------" +
        '\n' +
        "Artist: " + data.tracks.items[0].artists[0].name + '\n' + "Song Name: " + data.tracks.items[0].name + '\n' + "preview_url: " + data.tracks.items[0].preview_url + '\n' + "Album: " + data.tracks.items[0].album.name + '\n' + "==============================================");
        log(song);
    }).catch(function(err) {
        console.log(err);
    });
}

function doWhatItSays() {

    fs.readFile("random.txt", "utf8", function(error, data) {
        dataArray = data.split(",");
        action = dataArray[0];
        value = dataArray[1]
        if (typeof action != 'undefined') {
            console.log('Selection from "random.txt".');
            callSwitch();

        } else {
            console.log('Can\'t read "random.txt" file.');
            askUser();
        }

    });
}

function log(x) {
    fs.appendFile("log.txt", x, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log(x);
        }
    });
}

// ---------------------end-----------------
