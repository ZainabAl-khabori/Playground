import parser from "body-parser";
import express from "express";

var app = express();
app.set("views", "Views");
app.set("view engine", "ejs");
app.use(parser.json({ limit: "50mb" }));
app.use(express.static("Public"));

app.get("/", function(_, res) {
  var data = {
    test: "Test text"
  };

  res.render("html", data);
});

app.listen(8080, function() {
  console.log("Application is running", "\n");
});
