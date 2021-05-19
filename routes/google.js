const express = require("express");
const router = express.Router();
const axios = require("axios");
const config = require("../config");

const apiKey = config.GOOGLE_PRO_KEY;

router.get("/:location", (req, res) => {
  const params = { address: req.params.location, key: apiKey };
  axios
    .get("https://maps.googleapis.com/maps/api/geocode/json", { params })
    .then((geo) => res.json(geo.data))
    .catch((err) => console.log(err));
});

router.get("/place/:iso/:find", (req, res) => {
  const params = {
    input: req.params.find,
    types: "(regions)",
    key: apiKey,
    components: `country:${req.params.iso}`,
  };
  axios
    .get("https://maps.googleapis.com/maps/api/place/autocomplete/json?", {
      params,
    })
    .then((place) => {
      res.json(place.data.predictions)
    })
    .catch((err) => console.log(err));
});

module.exports = router;