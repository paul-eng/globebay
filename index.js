const express = require("express");
const cors = require("cors");
const ebay = require("./routes/ebay");
const google = require("./routes/google");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/ebay", ebay);
app.use("/google", google);

// Heroku specific force HTTPS redirect solution c/o Jake Trent (Cannot be used w custom domains at free tier)
// if (process.env.NODE_ENV === "production") {
//   app.use((req, res, next) => {
//     if (req.header("x-forwarded-proto") !== "https")
//       res.redirect(`https://${req.header("host")}${req.url}`);
//     else next();
//   });
// }

app.use(express.static(__dirname));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
