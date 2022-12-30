const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const Video = require("../../models/video");
const Image = require("../../models/image");
const Note = require("../../models/note");
const Question = require("../../models/question");
const Notification = require("../../models/notification");
const Share = require("../../models/share");

const userOneId = new mongoose.Types.ObjectId();
const userTowId = new mongoose.Types.ObjectId();
const videoOneId = new mongoose.Types.ObjectId();
const videoTowId = new mongoose.Types.ObjectId();
const noteOneId = new mongoose.Types.ObjectId();
const noteTowId = new mongoose.Types.ObjectId();
const questionOneId = new mongoose.Types.ObjectId();
const questionTowId = new mongoose.Types.ObjectId();
const img = fs.readFileSync(path.join(__dirname, "philly.jpg"));

const videoOne = {
  _id: videoOneId,
  ownerId: userOneId,
  userId: userOneId,
  link: "https://www.youtube.com/watch?v=v45p_kJV9i4",
  title: "Learn SSH In 6 Minutes - Beginners Guide to SSH Tutorial",
};

const videoTow = {
  _id: videoTowId,
  ownerId: userTowId,
  userId: userTowId,
  link: "https://www.youtube.com/watch?v=v45p_kJV9i4",
  title: "Learn SSH In 6 Minutes - Beginners Guide to SSH Tutorial",
};

const userOne = {
  _id: userOneId,
  userName: "Laith",
  email: "laith.helwany2@gmail.com",
  nickName: "Laith",
  password: "red1234",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTow = {
  _id: userTowId,
  userName: "Mary",
  email: "mary.alrayes@gmail.com",
  nickName: "Mary",
  password: "red1234",
  tokens: [
    {
      token: jwt.sign({ _id: userTowId }, process.env.JWT_SECRET),
    },
  ],
};

const avatarOne = {
  userId: userOneId,
  img,
};
const avatarTow = {
  userId: userTowId,
  img,
};
const noteOne = {
  _id: noteOneId,
  userId: userOneId,
  videoId: videoOneId,
  position: 0,
  text: "This is Note One",
};
const noteTow = {
  _id: noteTowId,
  userId: userTowId,
  videoId: videoTowId,
  position: 0,
  text: "This is Note Tow",
};
const questionOne = {
  _id: questionOneId,
  videoId: videoOneId,
  type: "TF",
  question: "This is question One",
  choices: [{ choice: "true" }, { choice: "false" }],
  answers: [{ answer: "true" }],
  position: 0,
};
const questionTow = {
  _id: questionTowId,
  videoId: videoTowId,
  type: "MA",
  question: "This is question Tow",
  choices: [{ choice: "Tow" }, { choice: "Three" }, { choice: "Four" }],
  answers: [{ answer: "Tow" }],
  position: 0,
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Video.deleteMany();
  await Note.deleteMany();
  await Question.deleteMany();
  await Notification.deleteMany();
  await Image.deleteMany();
  await Share.deleteMany();

  await new User(userOne).save();
  await new User(userTow).save();
  await new Image(avatarOne).save();
  await new Image(avatarTow).save();
  await new Video(videoOne).save();
  await new Video(videoTow).save();
  await new Note(noteOne).save();
  await new Note(noteTow).save();
  await new Question(questionOne).save();
  await new Question(questionTow).save();
};

module.exports = {
  userOne,
  userTow,
  videoOne,
  videoTow,
  avatarOne,
  avatarTow,
  noteOne,
  noteTow,
  questionOne,
  questionTow,
  setupDatabase,
};
