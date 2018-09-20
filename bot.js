const wiki = require('wikijs').default;
var wtf = require('wtf_wikipedia');
var Twit = require('twit');
var config = require('./config');
var fs = require('fs');
var http = require('http');
var T = new Twit(config);
var request = require("request");
var completeLink = "";

//setInterval(getajoke, 3609000*20);
//setInterval(getImage, 3600000*25);
//setInterval(getWiki, 3600000*6);
getWiki();
//getImage();

function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function getImage() {
    var a = randomIntInc(1, 1800);
    request("https://xkcd.com/" + a + "/info.0.json", function (error, response, body) {
        var obj = JSON.parse(body)
        var imgrequest = require('request').defaults({
            encoding: null
        });

        imgrequest.get(obj.img, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                imdata = new Buffer(body).toString('base64');
                //tweetImage(data);
                T.post('media/upload', {
                    media_data: imdata
                }, function (err, data, response) {
                    console.log(data);
                    //  console.log(response);

                    var id = data.media_id_string;
                    var tweet = {
                        status: '#XKCD ' + obj.title,
                        media_ids: [id]
                    };
                    T.post('statuses/update', tweet, function (err, data, response) {
                        if (err) {
                            console.log("failed!");
                        } else {
                            console.log("success!");
                        }
                    });
                });
            }
        });
    });
}

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    return monthNames[monthIndex] + '_' + day;
}

function getWiki() {
    var date = formatDate(new Date());
    wtf.from_api(date, 'en', function (markup) {
        var data = wtf.parse(markup);
        var count = data.sections[1].lists[0].length;
        var item =  randomIntInc(1, count);
        var text = data.sections[1].lists[0][item].text;
        var link = "https://en.wikipedia.org/wiki/" + data.sections[1].lists[0][item].links[1].page;
        var finalTweet = text.replace("&ndash;", ":") + " " + link.replace(/ /g, "_");
        completeLink = finalTweet;
        loadImage(data.sections[1].lists[0][item].links[1].page);
    });
}

function tweetFact(imageUrl, tweetText) {
    console.log(imageUrl)
    console.log(tweetText)

    var imgrequest = require('request').defaults({
        encoding: null
    });

    imgrequest.get(imageUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            imdata = new Buffer(body).toString('base64');
            //tweetImage(data);
            T.post('media/upload', {
                media_data: imdata
            }, function (err, data, response) {
                console.log(data);
                var id = data.media_id_string;
                var tweet = {
                    status: tweetText,
                    media_ids: [id]
                };
                T.post('statuses/update', tweet, function (err, data, response) {
                    if (err) {
                        console.log("failed!");
                    } else {
                        console.log("success!");
                    }
                });
            });
        }
    });

}

function loadImage(item) {
    wiki().page(item)
        .then(function (response) {
            console.log(response)
            response.mainImage().then(function (image) {
                tweetFact(image, completeLink);
            });
        })
}

function getajoke() {
    request("https://api.chucknorris.io/jokes/random", function (error, response, body) {
        var obj = JSON.parse(body)
        console.log(obj.value);
        tweetIt(obj.value);
    });
}

function tweetIt(text) {
    T.post('statuses/update', {
        status: text
    }, function (err, data, response) {
        console.log("sucess!")
    });
}