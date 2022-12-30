const mongoose = require("mongoose");
const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Video",
    },
    position: {
      type: Number,
      required: true,
      validate: (_value) => _value >= 0,
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
