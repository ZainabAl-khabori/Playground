// jshint esversion: 8

var express = require("express");
var parser = require("body-parser");

var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.post("/json-stringify", function(req, res) {
	var data = req.body;
	res.end(encodeURIComponent(JSON.stringify(data)));
});

app.listen(8080, function() {
	console.log("Express Playground server running on port 8080", "\n");
});