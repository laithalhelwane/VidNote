const express = require("express");
const auth = require("../middleware/auth");
const Video = require("../models/video");
const Question = require("../models/question");
const router = new express.Router();
router.post("/questions", auth, async (req, res) => {
  try {
    const _id = req.body.videoId;
    const video = await Video.findOne({
      _id,
      userId: req.user._id,
    });

    if (!video) {
      return res.status(404).send({
        success: false,
        message: `The Video with id ${_id} was not found in the database`,
      });
    }

    const requiredFields = [
      "type",
      "question",
      "choices",
      "answers",
      "position",
    ];
    for (const field of requiredFields) {
      if (req.body[field] === undefined) {
        return res.status(400).send({
          success: false,
          message: `Please append the Question ${field} to the request body`,
        });
      }
    }

    const question = new Question({ ...req.body });

    await question.save();

    res.status(201).send({
      success: true,
      question,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});

router.patch("/questions/:id", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "type",
      "question",
      "choices",
      "answers",
      "position",
      "videoId",
    ];
    for (const update of updates) {
      if (!allowedUpdates.includes(update)) {
        return res.status(400).send({
          success: false,
          message: `${update} is not a valid field`,
        });
      }
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).send({
        success: false,
        message: "Question was not found",
      });
    }

    const video = await Video.findOne({
      _id: question.videoId,
      userId: req.user._id,
    });
    if (!video) {
      return res.status(404).send({
        success: false,
        message: `The Video with id ${question.videoId} was not found in the database`,
      });
    }

    updates.forEach((update) => {
      question[update] = req.body[update];
    });
    await question.save();
    res.status(200).send({
      success: true,
      question,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});

router.delete("/questions/:id", auth, async (req, res) => {
  try {
    const question = await Question.findOne({ _id: req.params.id });

    if (!question) {
      return res.status(404).send({
        success: false,
        message: `The Question with id ${req.body.videoId} was not found in the database`,
      });
    }

    await question.delete();
    res.status(200).send({
      success: true,
      question,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});
module.exports = router;
