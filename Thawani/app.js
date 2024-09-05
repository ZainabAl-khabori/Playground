import express from "express";
import parser from "body-parser";
import fetch from "node-fetch";

var app = express();
app.use(parser.json({ limit: "50mb" }));

var domain = "https://uatcheckout.thawani.om";
var secretKey = "rRQ26GcsZzoEhbrP2HZvLYDbn9C9et";
var publicKey = "HGvTMLDssJghr9tlN9gr4DVYt0qyBy";
var api = `${domain}/api/v1`;
var ckeckoutPage = `${domain}/pay`;
var userId = "cus_lP9QML6sALhMU6n4";  // Test
// var userId = "cus_vOth0mh9pEiGvrHp";  // Live

app.get("/success", function(req, res) {
  res.end("Success");
});

app.get("/cancel", function(req, res) {
  res.end("Cancel");
});

app.get("/checkoutSessions", async function(_, res) {
  var url = `${api}/checkout/session?limit=10000&skip=1`;

  var options = {
    method: "get",
    headers: { "thawani-api-key": secretKey }
  };

  try {
    var thawaniRes = await (await fetch(url, options)).json();

    if (!thawaniRes.success) {
      res.status(500).json({
        success: false,
        err: thawaniRes.data && thawaniRes.data.error ? thawaniRes.data.error[0] : thawaniRes.description
      });

      return;
    }

    console.log(thawaniRes.data, "\n");

    res.json(thawaniRes.data);
  } catch (e) {
    res.status(500).json({
      success: false,
      data: {
        errCode: "thawani_err",
        err: e.message
      }
    });
  }
});

app.post("/newCard", async function(_, res) {
  var item = {
    name: "Test Item",
    quantity: 1,
    unit_amount: 100
  };

  var body = {
    client_reference_id: "abcdef123456",
    mode: "payment",
    products: [item],
    customer_id: userId,
    success_url: "http://localhost:8080/success",
    cancel_url: "http://localhost:8080/cancel",
    save_card_on_success: true,
    expire_in_minutes: 30,
    metadata: {
      user: userId
    }
  };

  var url = `${api}/checkout/session`;

  var options = {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "thawani-api-key": secretKey,
      "Content-Type": "application/json"
    }
  };

  try {
    var thawaniRes = await (await fetch(url, options)).json();

    if (!thawaniRes.success) {
      res.status(500).json({
        success: false,
        err: thawaniRes.data && thawaniRes.data.error ? thawaniRes.data.error[0] : thawaniRes.description
      });

      return;
    }

    var sessionId = thawaniRes.data.session_id;
    var paymentPageUrl = `${ckeckoutPage}/${sessionId}?key=${publicKey}`;

    res.json({
      success: true,
      data: { checkoutSessionId: sessionId, paymentPageUrl }
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      data: {
        errCode: "thawani_err",
        err: e.message
      }
    });
  }
});

app.listen(8080, function() {
  console.log("Application is running", "\n");
});
