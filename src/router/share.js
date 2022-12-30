const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const Video = require("../models/video");
const Note = require("../models/note");
const Share = require("../models/share");
const Question = require("../models/question");
const Notification = require("../models/notification");
const router = new express.Router();
router.post("/share/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findById(req.body.userId);
    const video = await Video.findOne({
      _id,
      userId: req.user._id,
    });
    let notes = [];
    let questions = [];
    if (!user) {
      return res.status(404).send({
        success: false,
        message: `The User with id ${_id} was not found in the database`,
      });
    }

    if (!video) {
      return res.status(404).send({
        success: false,
        message: `The Video with id ${_id} was not found in the database`,
      });
    }

    if (!req.query.questions && !req.query.notes) {
      return res.status(400).send({
        success: false,
        message: "Invalid Sharing Option",
      });
    }

    if (req.query.notes) {
      notes = await Note.find({
        videoId: _id,
        userId: req.user._id,
      });
    }

    if (req.query.questions) {
      questions = await Question.find({
        videoId: _id,
      });
    }

    const sharelog = new Share({
      fromId: req.user._id,
      toId: user._id,
      videoId: video._id,
    });

    const newVideo = new Video({
      link: video.link,
      title: video.title,
      ownerId: video.ownerId,
      userId: user._id,
    });
    await newVideo.save();
    notes.forEach(async (note) => {
      const newNote = new Note({
        text: note.text,
        position: note.position,
        userId: user._id,
        videoId: newVideo._id,
      });
      await newNote.save();
    });
    questions.forEach(async (questionFor) => {
      const newQuestion = new Question({
        type: questionFor.type,
        question: questionFor.question,
        choices: questionFor.choices,
        answers: questionFor.answers,
        position: questionFor.position,
        videoId: newVideo._id,
      });
      await newQuestion.save();
    });
    await sharelog.save();
    const notification = new Notification({
      userId: user._id,
      userName: req.user.userName,
      videoTitle: newVideo.title,
      videoId: newVideo._id,
    });
    await notification.save();
    res.status(200).send({
      success: true,
      sharelog,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});
router.get("/share", auth, async (req, res) => {
  const logs = await Share.find({ fromId: req.user._id });
  res.send({
    success: true,
    logs,
  });
});
module.exports = router;
