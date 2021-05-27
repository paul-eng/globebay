const express = require("express");
const cors = require("cors");
const ebay = require("./routes/ebay");
const google = require("./routes/google");
const path = require("path");
const app = express();
const { wakeDyno } = require("heroku-keep-awake");
app.use(cors());
app.use(express.json());
app.use("/ebay", ebay);
app.use("/google", google);

// Heroku specific HTTPS redirect solution c/o Jake Trent
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https")
      res.redirect(`https://${req.header("host")}${req.url}`);
    else next();
  });
}

app.use(express.static(__dirname));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
});

const DYNO_URL = "https://globebay.herokuapp.com/";

// const opts = {
//   logging: false,
//   stopTimes: { start: "08:30", end: "19:15" },
// };

const port = process.env.PORT || 8080;
app.listen(port, () => {
  wakeDyno(DYNO_URL);
  console.log(`Server running on port ${port}`);
});
