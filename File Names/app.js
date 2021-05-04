// jshint esversion: 8

var express = require("express");
var parser = require("body-parser");
var multer = require("multer");

var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static("public", { redirect: false }));

var upload = multer();

app.listen(8000, function() {
	console.log("File Names server running on port 8000", "\n");
});