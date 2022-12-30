"use strict";
require("./db/mongoose");
const express = require("express");
const cors = require("cors");
const userRouter = require("./router/user");
const noteRouter = require("./router/note");
const questionRouter = require("./router/question");
const shareRouter = require("./router/share");
const videoRouter = require("./router/video");
const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,PATCH,POST,DELETE",
  })
);
app.use(express.json());
app.use(userRouter);
app.use(noteRouter);
app.use(questionRouter);
app.use(shareRouter);
app.use(videoRouter);

module.exports = app;
