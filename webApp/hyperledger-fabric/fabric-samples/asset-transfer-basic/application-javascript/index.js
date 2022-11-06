'use strict';

const express = require('express');
const app = express();

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const registrationRoutes = require("./routes/registration");
const moocsRoutes = require("./routes/moocs");

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/", registrationRoutes);
app.use("/lms/", moocsRoutes);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/moocschain", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => {
        console.log(`---- Server is up and running on port ${PORT} ----`);
    });
}).catch(err => console.log(err));
