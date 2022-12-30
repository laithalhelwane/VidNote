const mongoose = require("mongoose");
const recordSchema = new mongoose.Schema(
  {
    fromId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const Record = mongoose.model("Record", recordSchema);
module.exports = Record;
