const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    videoTitle: {
      type: String,
    },
    videoId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    received: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
notificationSchema.methods.toJSON = async function () {
  const notification = this;
  const notificationObject = notification.toObject();
  delete notificationObject.received;
  delete notificationObject.userId;
  delete notificationObject._id;
  return notificationObject;
};

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
