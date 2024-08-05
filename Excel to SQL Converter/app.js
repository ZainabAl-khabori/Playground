import express from "express";
import parser from "body-parser";
import multer from "multer";
import xlsx from "node-xlsx";
import moment from "moment";
import { format } from "mysql2";
import { writeFileSync } from "fs";
import { createHash } from "crypto";

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

app.post("/temp", upload.fields([{ name: "exported" }, { name: "fromDB" }]), function(req, res) {
  function convertTimestamp(timestamp) {
    return moment(timestamp, "x").format("YYYY-MM-DD HH:mm:ss");
  }

  var fb = req.files.exported[0];
  var db = req.files.fromDB[0];

  var json = JSON.parse(fb.buffer);
  var rows = xlsx.parse(db.buffer)[0].data;
  var headers = rows.shift();

  var dbData = rows.map(function(r) {
    var rowData = {};

    for (var i = 0; i < headers.length; i++) {
      var key = headers[i];
      var val = r[i] === 'NULL' ? null : r[i];

      if (key === "Creation Date") {
        var timestamp = (val - 25569) * 86400;
        var date = convertTimestamp(timestamp);
        val = date;
      }

      rowData[key] = val;
    }

    return rowData;
  });

  var data = Object.values(json).filter(function(v) {
    var unix = v.orderPlacedTime;
    var date = moment(unix, "x");

    var year = date.year() === 2024;
    var month = date.month() === 6;
    var day = date.date() >= 15 && date.date() <= 21;
    var hit = year && month && day;

    return hit;
  });

  var q = "start transaction;\n"

  for (var o of data) {
    var items = o.items;
    var first = items[0];
    var timestamp = convertTimestamp(o.orderPlacedTime);

    var rowIndex = dbData.findIndex(function(r) { return r.OrderID === parseInt(o.orderID); });
    if (rowIndex > -1) { continue; }

    var order = {
      id: o.orderID,
      shop_id: 3,
      user_id: o.userID,
      driver_id: o.driverID,
      payment_trans_id: 0,
      delivery_service: o.deliveryService,
      installation_service: o.installationService,
      total_amount: first.total_amount,
      delivery_address: first.delivery_address,
      billing_address: first.billing_address,
      transaction_status: o.status,
      email: o.email,
      phone: o.phone,
      payment_method: first.payment_method,
      added: timestamp,
      status_confirmed_time: timestamp,
      status_on_the_way_time: timestamp,
      status_delivered_time: timestamp,
      status_canceled_time: timestamp,
      promo_code: first.promo_code,
      commission: first.order_commission,
      NoFeedbackLateDelivery: 0,
      NoFeedbackProductQuality: 0,
      NoFeedbackMissingItems: 0,
      NoFeedbackRudePerson: 0,
      NoFeedbackOrderNotReceived: 0,
      NoFeedbackOther: 0,
      NoFeedbackComment: 0,
      YesFeedbackOverallExp: 0,
      YesFeedbackCylinderStatus: 0,
      YesFeedbackDeliveryPerson: 0,
      YesComment: 0,
      lat: o.lat,
      lon: o.lon
    };

    q += format("insert into mk_transaction_header set ?;\n", order);

    for (var i of items) {
      var item = {
        transaction_header_id: o.orderID,
        shop_id: i.shop_id,
        item_id: i.item_id,
        item_name: i.name,
        item_attribute_id: i.item_id,
        item_attribute: "",
        unit_price: i.unit_price,
        qty: i.qty,
        discount_percent: i.discount_percent,
        added: timestamp,
        platform: i.platform,
        external_commission: i.external_commission,
        internal_commission: i.internal_commission
      };

      q += format("insert into mk_transaction_detail set ?;\n", item);
    }
  }

  q += "commit;";

  var filename = "fromFB";
  writeFileSync(`Output/${filename}.sql`, q, "utf-8");

  res.end("Done");
});

app.listen(8080, function() {
  console.log("Application is running on port 8080", "\n");
});
