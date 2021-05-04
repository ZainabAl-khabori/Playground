// jshint esversion: 8

var express = require("express");
var parser = require("body-parser");
var multer = require("multer");

var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static("public", { redirect: false }));

var upload = multer();

app.post("/test", upload.array("files"), function(req, res) {
	var docs = req.body.docs;
	var id = req.body.id;
	var files = req.files;

	var entries = [];
	for (var i = 0; i < docs.length; i++) {
		var data = JSON.parse(docs[i]);
		data.id = crypto.createHash("md5").update(id + data.title + data.type).digest("hex");
		data.applicantId = id;

		var doc = files[i];
		data.link = baseUrl + "job-applicants/" + id + "/" + doc.originalname;
		data.uploadedDate = formatMySQLDate(new Date(Date.now()));

		entries.push(data);
	}

	res.json(entries);
});

app.post("/test2", function(req, res) {
	var data = req.body.data;
	var arr = [];
	for (var d of data) {
		arr.push(JSON.stringify(d));
	}

	res.json({ json: arr });
});

app.listen(8000, function() {
	console.log("File Names server running on port 8000", "\n");
});