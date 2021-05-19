const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("querystring");
const config = require("../config");

const clientId = config.EBAY_PRO_ID;
const clientSecret = config.EBAY_PRO_SECRET;
let creds = Buffer.from(`${clientId}:${clientSecret}`);
creds = creds.toString("base64");

router.get("/", (req, res) => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: "Basic " + creds,
  };
  const body = {
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  };

  axios
    .post(
      // sandbox url "https://api.sandbox.ebay.com/identity/v1/oauth2/token",
      "https://api.ebay.com/identity/v1/oauth2/token",
      qs.stringify(body),
      { headers }
    )
    .then((auth) => res.json(auth.data.access_token))
    .catch((err) => console.log(err));
});

module.exports = router;
