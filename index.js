const express = require("express");
const cors = require("cors");
const ebay = require("./routes/ebay");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/ebay",ebay)

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
