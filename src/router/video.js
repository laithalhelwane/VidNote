const express = require("express");
const auth = require("../middleware/auth");
const Video = require("../models/video");
const Note = require("../models/note");
const Question = require("../models/question");
const router = new express.Router();
router.post("/videos", auth, async (req, res) => {
  try {
    const requiredFields = ["link", "title"];
    for (const field of requiredFields) {
      if (req.body[field] === undefined) {
        return res.status(400).send({
          success: false,
          message: `Please append the Video ${field} to the request body`,
        });
      }
    }

    const video = new Video({
      ...req.body,
      userId: req.user._id,
      ownerId: req.user._id,
    });
    await video.save();
    res.status(201).send({
      success: true,
      video,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});

router.get("/videos", auth, async (req, res) => {
  let match = {};
  try {
    if (req.query.shared) {
      if (req.query.shared === "true") {
        match = {
          ownerId: { $ne: req.user._id },
        };
      }
    } else {
      match = {
        ownerId: req.user._id,
      };
    }

    await req.user
      .populate({
        path: "videos",
        match,
      })
      .execPopulate();
    res.send({
      success: true,
      videos: req.user.videos,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});
router.get("/videos/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
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

    await video
      .populate({
        path: "notes",
      })
      .execPopulate();
    await video
      .populate({
        path: "questions",
      })
      .execPopulate();
    res.send({
      success: true,
      video,
      notes: video.notes,
      question: video.questions,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});

router.patch("/videos/:id", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["link", "title"];
    const _id = req.params.id;
    for (const update of updates) {
      if (!allowedUpdates.includes(update)) {
        return res.status(400).send({
          success: false,
          message: `${update} is not a valid field`,
        });
      }
    }

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

    updates.forEach((update) => {
      video[update] = req.body[update];
    });
    await video.save();
    res.send({
      success: true,
      video,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});
router.delete("/videos/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
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

    await Note.deleteMany({
      videoId: video._id,
      userId: req.user._id,
    });
    await Question.deleteMany({
      videoId: video._id,
    });
    await video.remove();
    res.send({
      success: true,
      video,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});
module.exports = router;
