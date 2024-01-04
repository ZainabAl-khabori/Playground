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
  var fontsDir = "node_modules/pdfjs-dist/standard_fonts/";

  var pdf = await getDocument({ data: arrayBuffer, standardFontDataUrl: fontsDir }).promise;
  var page = await pdf.getPage(1);
  var objects = await page.getOperatorList();
  var content = await page.getTextContent();

  var args = objects.argsArray.filter(function(a) {
    return Array.isArray(a) && Array.isArray(a[0])
      && typeof a[0][0] === "object" && !Array.isArray(a[0][0]) && a[0][0] !== null
      && (a[0].length > 1 || !(a[0][0].isSpace || a[0][0].unicode !== " "));
  }).flat();

  // var items = content.items.filter(function(s) { return s.str !== ""; });
  // var dirs = items.map(function(s) { return s.dir; });
  // var strings = items.map(function(s) { return s.str; });

  var items = content.items.reduce(function(all, s) {
    if (s.hasEOL) {
      all.push([]);
    } else {
      all[all.length - 1].push(s);
    }

    return all;
  }, [[]]);

  var textOps = args.reduce(function(all, a) {
    for (var item of a) {
      if (isNaN(item)) {
        all.push(item);
      }
    }

    return all;
  }, []);

  var text = [];

  for (var s of items) {
    var length = s.str.length;
    var str = [];

    for (var c = 0; c < length; c++) {
      var ch = textOps.shift();

      if (s.dir === "rtl") {
        str.unshift(ch);
      } else {
        str.push(ch);
      }
    }
  }

  // var text = args.map(function(a) {
  //   var str = a.reduce(function(all, s) {
  //     if (isNaN(s)) {
  //       all.unshift(s.unicode);
  //     }

  //     return all;
  //   }, []);

  //   // if (i < 10) {
  //   //   console.log({ s: str.join(""), original: strings[i], dir: dirs[i] }, "\n");
  //   // }

  //   return str.join("");
  // }).filter(function(s) { return !(new RegExp(/^\s*$/)).test(s); });

  // console.log({ text: text.length, content: items.length });

  // res.json({ success: true });
  res.json(items);
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
