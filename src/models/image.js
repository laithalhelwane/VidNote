const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema(
  {
    img: {
      type: Buffer,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);
const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
