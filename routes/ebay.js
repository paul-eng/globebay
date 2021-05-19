const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("querystring");

const clientId = "PaulEng-GlobeBay-PRD-608f655c9-1423e662";
const clientSecret = "PRD-08f655c989ca-e8e3-4c6e-84ca-b523";
let creds = Buffer.from(`${clientId}:${clientSecret}`);
creds = creds.toString("base64");
// const sandboxId = "PaulEng-GlobeBay-SBX-069e0185b-23d9cef3";
// const sandboxSecret = "SBX-69e0185b0e4d-78a6-46c8-b42b-25c1";

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
