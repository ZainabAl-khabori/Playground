import parser from "body-parser";
import express from "express";
import { readFileSync } from "fs";
import PdfParse from "pdf-parse";
import { getDocument } from "pdfjs-dist";

var app = express();
app.set("views", "Views");
app.set("view engine", "ejs");
app.use(parser.json({ limit: "50mb" }));

app.use(express.static("node_modules/pdfjs-dist"));
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
  var file = req.body.file;
  var lang = req.body.lang;
  var year = req.body.year;

  var buffer = readFileSync(`Public/Pdfs/${year}/${lang}/${file}`);
  var offset = buffer.byteOffset;
  var length = buffer.byteLength;
  var arrayBuffer = buffer.buffer.slice(offset, offset + length);

  var pdf = await getDocument(arrayBuffer).promise;
  var page = await pdf.getPage(1);
  var objects = await page.getOperatorList();

  var args = objects.argsArray.filter(function(a) {
    return Array.isArray(a) && Array.isArray(a[0])
      && typeof a[0][0] === "object" && !Array.isArray(a[0][0]) && a[0][0] !== null
      && (a[0].length > 1 || !(a[0][0].isSpace || a[0][0].unicode === " "));
  });

  // var content = await page.getTextContent({ disableNormalization: true });

  // var text = content.items.reduce(function(all, s) {
  //   if (s.str.length > 0 && s.str !== " ") {
  //     all.push(s.str);
  //   }

  //   return all;
  // }, []);

  res.json(args);
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
