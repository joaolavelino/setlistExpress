var express = require("express");
var path = require("path");
var logger = require("morgan");
require("./config/database.js");
var cors = require("cors");

var usersRouter = require("./app/routes/users");
var songsRouter = require("./app/routes/songs");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/users", usersRouter);
app.use("/songs", songsRouter);

module.exports = app;
