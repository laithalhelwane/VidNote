const mongoose = require("mongoose");
const validator = require("validator");
const Note = require("./note");
const videoSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    link: {
      type: String,
      required: true,
      trim: true,
      validate: (value) => {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Youtube link");
        }
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);
videoSchema.virtual("notes", {
  ref: "Note",
  localField: "_id",
  foreignField: "videoId",
});
videoSchema.virtual("questions", {
  ref: "Question",
  localField: "_id",
  foreignField: "videoId",
});
videoSchema.pre("remove", async function (next) {
  const video = this;
  await Note.deleteMany({ videoId: video._id });
  next();
});
const Video = mongoose.model("Video", videoSchema);
module.exports = Video;
