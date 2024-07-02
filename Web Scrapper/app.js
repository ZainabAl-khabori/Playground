import express from "express";
import parser from "body-parser";
import axios from "axios";
import * as cheerio from "cheerio";

var app = express();
app.set("views", "Views");
app.set("view engine", "ejs");
app.use(parser.json({ limit: "50mb" }));

app.use(express.static("node_modules/@fortawesome/fontawesome-free"));
app.use(express.static("Public"));

app.get("/", async function(req, res) {
  var options = {
    headers: { "User-Agent": req.get("user-agent"), }
  };

  var url = "https://english.mubasher.info/markets/MSM/stocks/MGMC";
  // var { data } = await axios.get(url, options);
  // var $ = cheerio.load(data);

  var i = 0;
  var text;

  do {
    var { data } = await axios.get(url, options);
    var $ = cheerio.load(data);

    i++;
    var text = $(".market-summary__last-price").text();

    console.log(`${i}) ${text}`, "\n");
  } while (text);

  res.render("html");
});

app.listen(process.env.PORT || 8080, function() {
  console.log("Application is running", "\n");
});
