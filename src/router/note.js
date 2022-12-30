const express = require("express");
const auth = require("../middleware/auth");
const Note = require("../models/note");
const Video = require("../models/video");
const router = new express.Router();
router.post("/notes", auth, async (req, res) => {
  try {
    const requiredFields = ["text", "position", "videoId"];
    for (const field of requiredFields) {
      if (req.body[field] === undefined) {
        return res.status(400).send({
          success: false,
          message: `Please append the Note ${field} to the request body`,
        });
      }
    }

    const video = await Video.findById(req.body.videoId);
    if (!video) {
      return res.status(400).send({
        success: false,
        message: `The video with ID ${req.body.videoId} was not found in the database`,
      });
    }

    const note = new Note({
      ...req.body,
      userId: req.user._id,
    });
    await note.save();
    res.status(201).send({
      success: true,
      note,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});
router.patch("/notes/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["text"];
  for (const update of updates) {
    if (!allowedUpdates.includes(update)) {
      return res.status(400).send({
        success: false,
        message: `${update} is not a valid field`,
      });
    }
  }

  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!note) {
      return res.status(404).send({
        success: false,
        message: `Note with _id ${req.params.id} was not found in the database`,
      });
    }

    updates.forEach((update) => {
      note[update] = req.body[update];
    });
    await note.save();
    res.status(201).send({
      success: true,
      note,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});

router.delete("/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!note) {
      return res.status(404).send({
        success: false,
        message: `Note with _id ${req.params.id} was not found in the database`,
      });
    }

    await note.deleteOne();
    res.status(200).send({
      success: true,
      note,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});
module.exports = router;
