// jshint esversion: 8

var express = require("express");
var parser = require("body-parser");
var { PDFDocument } = require("pdf-lib");
var fs = require("fs");

var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static("public", { redirect: false }));

app.get("/converted/:pdf", async function(req, res) {
	var name = decodeURIComponent(req.params.pdf);
	var pdf = fs.readFileSync(__dirname + "/public/pdfs/" + name);
	var doc = await PDFDocument.load(pdf);
	var pages = doc.getPages();

	var size = pages[0].getSize();
	var data = [];

	for (var i = 0; i < pages.length; i++) {
		var pageDoc = await PDFDocument.create();
		var [page] = await pageDoc.copyPages(doc, [i]);
		pageDoc.insertPage(0, page);
		data.push(await pageDoc.saveAsBase64({ dataUri: true }));
	}

	res.json({
		size: size,
		data: data
	});
});

app.get("/pdfs", function(req, res) {
	var pdfs = fs.readdirSync(__dirname + "/public/pdfs/");

	var encoded = [];
	for (var pdf of pdfs) {
		encoded.push(encodeURI(pdf));
	}

	res.json(encoded);
});

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/html.html");
});

app.listen(8080, function() {
	console.log("Server running on port", 8080, "\n");
});