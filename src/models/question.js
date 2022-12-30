const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      required: true,
      validate: (value) => {
        const values = ["TF", "MA", "SA"];
        if (!values.includes(value)) {
          throw new Error("Invalid Value");
        }
      },
    },
    question: {
      type: String,
      required: true,
    },
    choices: [
      {
        choice: {
          type: String,
          required: true,
        },
      },
    ],
    answers: [
      {
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    position: {
      type: Number,
      required: true,
      validate: (_value) => _value >= 0,
    },
  },
  { timestamps: true }
);
const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
