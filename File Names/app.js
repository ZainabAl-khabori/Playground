// jshint esversion: 8

var express = require("express");
var parser = require("body-parser");
var multer = require("multer");
var fs = require("fs");

var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static("public", { redirect: false }));

var upload = multer();

app.post("/upload", upload.single("file"), function(req, res) {
	var doc = req.body.doc;
	var file = req.file;

	var dir = __dirname + "/public/uploads/";
	doc = JSON.parse(doc);
	var docName = doc.title + "." + file.originalname.split(".")[1];

	console.log(doc, "\n");
	fs.writeFileSync(dir + docName, file.buffer);
	res.end("Done!!");
});

app.post("/json", function(req, res) {
	var data = req.body;
	var json = JSON.stringify(data);
	res.json({ json: json });
});

app.listen(8000, function() {
	console.log("File Names server running on port 8000", "\n");
});