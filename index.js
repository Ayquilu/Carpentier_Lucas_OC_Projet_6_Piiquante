
const {app, express} = require("./server")
const {saucesRouter} = require("./routes/sauces.router")
const { authRouter } = require("./routes/auth.router");
const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
//--------Connection database----------------------------------------
require("./mongo.js");
//----------middleware---------------------------------------------- 
app.use(bodyParser.json())
app.use("/api/sauces", saucesRouter)
app.use("/api/auth", authRouter)
//---------------------route-----------------------------------------
app.get("/", (req, res) => res.send("Hello World!"));
//-----------Listen--------------------------------------------------
app.use("/images", express.static(path.join(__dirname, "images")));
app.listen(port, () => {
  console.log("listening on port " + port);
});
