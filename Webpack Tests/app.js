import express from "express";
import parser from "body-parser";

var app = express();
app.set("views", "Views");
app.set("view engine", "ejs");
app.use(parser.json({ limit: "50mb" }));

app.use(express.static("node_modules/@fortawesome/fontawesome-free"));
app.use(express.static("node_modules/three"));
app.use(express.static("Public"));

app.get("/", async function(_, res) {
  res.render("html");
});

app.listen(process.env.PORT || 8000, function() {
  console.log("Application is running", "\n");
});
