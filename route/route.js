var express = require("express");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var axios = require("axios");
var request = require("request");

var router = express.Router();

mongoose.Promise = Promise;

var Article = require("../models/Article");
var Note = require("../models/Note");

router.get("/", function (req, res) {
    res.render("index");
});

//scraped and saved in db 

router.get("/saveArticles", function (req, res) {
    Article.find({}, function (error, doc) {
        if (error) {
            console.log(error);
        } else {
            var hbsArticleObject = {
                articles: doc
            };

            res.render("saveArticles", hbsArticleObject);
        }
    });
});

// to GET the scrape from the website

router.post("/scrape", function (req, res) {
    request("https://www.nytimes.com/", function (error, response, html) {
        var $ = cheerio.load(html);

        var scrapedArticles = {};

        $("article h2").each(function (i, element) {

            var result = {};

            result.title = $(this).children("a").text();
            console.log(result.title);
            result.body = $(this).children("a").text();
            result.link = $(this).children("a"), attr("href");

            scrapedArticles[i] = result;

        });

        console.log("Scraper Articles: " + scrapedArticles);

        var hbsArticleObject = {
            articles: scrapedArticles
        };

        res.render("index", hbsArticleObject);
    });
});

router.post("/save", function (req, res) {
    console.log("This is the Title: " + req.body.title);

    var newArticleObject = {};

    newArticleObject.title = req.body.title;
    //need to add the body later 
    newArticleObject.link = req.body.link;

    var entry = new Article(newArticleObject);

    console.log("We can save the article: " + entry);


    entry.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc);
        }
    });

    res.redirect("/saveArticles")
});


router.get("/delete/ :id", function(req, res){
    console.log("ID is getting read for delete" + req.params.id);

    Article.findOneAndRemove({"_id": req.params.id}, function(err, offer){
        if(err) {
            console.log("Not able to delete: " + err);
        } else {
            console.log("Delete");
        }

        res,redirect("/saveArticles")
    });
});

router.get("/note/ :id", function(req, res){
    console.log("ID is getting read for delete" + req.params.id);

    Note.findOneAndRemove({"_id": req.params.id}, function(err, doc){
        if(err) {
            console.log("Not able to delete: " + err);
        } else {
            console.log("Delete");
        }

        res,send(doc)
    });
});

router.get("/articles/ :id", function(req, res){
    console.log("ID is getting read " + req.params.id);

    Article.findOne({"_id": req.params.id})

    .populate('notes')

    .exec(function(err, doc){
        if (err) {
            console.log("No article find ")
        } else {
            console.log("We are getting article and notes " + doc);
            res.json(doc);
        }
    });
});

router.post("/article/ :id", function(req, res){
    
    var newNote = new Note(req.body);

    newNote.save(function(error, doc){
        if (error) {
            console.log(error)
        } else {
            Article.findOneAndUpdate({"_id": req.params.id }, {$push: {notes: doc.id}}, {new: true, upset: true})

            .populate('notes')
            .exec(function (err, doc){
                if(err) {
                    console.log("No article find.")
                } else{
                    console.log("On note save we are getting notes? " + doc.notes);
                    res.send(doc);
                }
            });

        }
    });
});

// Export the routes
module.exports = router;