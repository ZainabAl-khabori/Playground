import parser from "body-parser";
import express from "express";
import { readFileSync } from "fs";
import PdfParse from "pdf-parse";

var app = express();
app.set("views", "Views");
app.set("view engine", "ejs");
app.use(parser.json({ limit: "50mb" }));

app.use(path, express.static("node_modules/pdfjs-dist"));
app.use(express.static("Public"));

app.post("/parse", async function(req, res) {
  var file = req.body.file;
  var lang = req.body.lang;
  var year = req.body.year;

  var buffer = readFileSync(`Public/Pdfs/${year}/${lang}/${file}`);
  var pdf = await PdfParse(buffer);
  var text = pdf.text.split("\n");

  res.json(text);
});

app.post("/pdfjs", async function(req, res) {

});

app.get("/", function(_, res) {
  var data = {
    test: "Test text"
  };

  res.render("html", data);
});

app.listen(8080, function() {
  console.log("Application is running", "\n");
});
