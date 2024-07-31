import express from "express";
import parser from "body-parser";
import multer from "multer";
import xlsx from "node-xlsx";
import moment from "moment";
import { format } from "mysql2";
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

app.post("/convert", upload.single("excel"), function(req, res) {
  var data = req.body;
  var file = req.file;

  var rows = xlsx.parse(file.buffer)[0].data;
  var headers = rows.shift();

  var dateCols = data.dateCols.split(", ");
  var dateFormat = "YYYY/MM/DD HH:mm:ss";

  var q = "start transaction;\n";

  for (var r of rows) {
    var rowData = {};

    for (var i = 0; i < headers.length; i++) {
      var key = headers[i];
      var val = r[i] === 'NULL' ? null : r[i];

      if (dateCols.includes(key)) {
        var timestamp = (val - 25569) * 86400;
        var date = moment(timestamp, "X").format(dateFormat);
        val = date;
      }

      rowData[key] = val;
    }

    var id = rowData[data.idCol];
    q += format("update ?? set ? where id = ?;\n", [data.table, rowData, id]);
  }

  q += "commit;";

  var filename = file.originalname.split(".")[0];
  writeFileSync(`Output/${filename}.sql`, q, "utf-8");

  res.end("Done");
});

app.post("/deleteSQL", upload.single("excel"), function(req, res) {
  var data = req.body;
  var file = req.file;

  var rows = xlsx.parse(file.buffer)[0].data;
  var headers = rows.shift();
  var idIndex = headers.indexOf(data.idCol);

  var ids = rows.reduce(function(all, r) {
    all.push(r[idIndex]);
    return all;
  }, []);

  var q = "start transaction;\n";
  q += format("delete from mk_transaction_header where id not in (?);\n", [ids]);
  q += format("delete from mk_transaction_detail where transaction_header_id not in (?);\n", [ids]);
  q += "commit;";

  var filename = file.originalname.split(".")[0];
  writeFileSync(`Output/${filename}.sql`, q, "utf-8");

  res.end("Done");
});

app.post("/temp", upload.single("exported"), function(req, res) {
  var file = req.file;
  var json = JSON.parse(file.buffer);

  var data = Object.values(json).filter(function(v) {
    var unix = v.orderPlacedTime;
    var date = moment(unix, "x");
    return (date.month() > 5 && date.year() === 2024);
  });

  console.log(data.length, "\n");

  res.end("Done");
});

app.listen(8080, function() {
  console.log("Application is running on port 8080", "\n");
});
