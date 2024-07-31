import express from "express";
import parser from "body-parser";
import FormData from "form-data";
import fetch from "node-fetch";

var app = express();
app.use(parser.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", async function(_, res) {
  var data = new FormData();

  data.append("merchant_id", "372");
  data.append("order_id", "1234");
  data.append("currency", "OMR");
  data.append("amount", "114.123");
  data.append("saveCard", "Y");
  data.append("customer_identifier", "1435");
  data.append("redirect_url", "https://www.muscatgas.com/ccavResponseHandler.php");
  data.append("cancel_url", "https://www.muscatgas.com/ccavResponseHandler.php");

  var options = {
    method: "post",
    body: data
  };

  var url = "https://www.muscatgas.com/ccavRequestHandler.php";
  var fetchRes = await (await fetch(url, options)).text();

  res.send(fetchRes);
});

app.listen(8080, function() {
  console.log("Application is running", "\n");
});
