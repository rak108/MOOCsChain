const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var session = require('express-session');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    cookie: { maxAge: 60000 },
    keys: ["s3cr3tkey"],
    saveUninitialized: true,
    resave: "true",
    secret: "s3cr3tkey"
}));

const registrationRoutes = require("./routes/registration");
const User = require("./models/users");

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/", registrationRoutes);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/moocschain", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => {
        console.log(`---- Server is up and running on port ${PORT} ----`);
    });
}).catch(err => console.log(err));