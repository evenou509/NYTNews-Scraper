var mongoose = require("mongoose");
var logger = require("morgan");
var express = require("express");
var cheerio = require("cheerio");
var axios = require("axios");
var bodyParser = require("body-parser");
var request = require("request");
//////////
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

mongoose.Promise = Promise;

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

var routes =require("./route/route.js");

app.use("/", routes);

mongoose.connect("mongodb:");

var db = mongoose.connection;

db.on("error", function(error){
    console.log("Mongoose error: ", error);
});

db.once("open", function(){
    console.log("Mongoose connection successful.");
});

app.listen(PORT, function(){
    console.log("App running on PORT " + PORT)
});

