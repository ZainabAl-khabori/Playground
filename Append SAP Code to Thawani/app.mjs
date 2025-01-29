import express from "express";
import parser from "body-parser";
import multer from "multer";
import xlsx from "node-xlsx";
import { writeFileSync } from "fs";

var app = express();
app.use(parser.urlencoded({ extended: true }));

var maxSize = 50 * 1024 * 1024;

var upload = multer({
  fileFilter: function(_, file, cb) {
    file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
    cb(null, true);
  },

  limits: {
    fileSize: maxSize,
    fieldSize: maxSize
  }
});

app.post("/fix", upload.fields([{ name: "units" }, { name: "thawani" }]), function(req, res) {
  var { units, thawani } = req.files;

  var unitsRows = xlsx.parse(units[0].buffer)[0].data.slice(1);
  var rows = xlsx.parse(thawani[0].buffer)[0].data;
  var headers = rows.shift();

  var codes = unitsRows.reduce(function(all, r) {
    all[r[0]] = r[3];
    return all;
  }, {});

  headers.push("SAP Code");

  var mapped = rows.map(function(r) {
    var id = r[22].split(",")[1].split("=").pop();
    var newRow = Object.assign(new Array(headers.length - 1), r);

    newRow.push(codes[id]);
    return newRow;
  });

  var data = [headers, ...mapped];
  var name = thawani[0].originalname.split(".");

  name.pop();
  name = name.join(".");

  var buffer = xlsx.build([{ name: "Sheet", data }]);
  writeFileSync(`Output/${name}.xlsx`, buffer);

  res.end("Done");
});

app.listen(8000, function() {
  console.log("Application is running", "\n");
});
