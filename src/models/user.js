const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Note = require("./note");
const Video = require("./video");
const Share = require("./share");
const Notification = require("./notification");
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    nickName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: (value) => {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
userSchema.virtual("videos", {
  ref: "Video",
  localField: "_id",
  foreignField: "userId",
});
userSchema.virtual("notes", {
  ref: "Note",
  localField: "_id",
  foreignField: "userId",
});
userSchema.virtual("notifications", {
  ref: "Notification",
  localField: "_id",
  foreignField: "userId",
});
userSchema.virtual("avatar", {
  ref: "Image",
  localField: "_id",
  foreignField: "userId",
});
userSchema.virtual("shared_with_me", {
  ref: "Video",
  localField: "_id",
  foreignField: "ownerId",
});
userSchema.virtual("sharedVideosCount").get(async function () {
  const sharedVideosCount = await Share.countDocuments({
    fromId: this._id,
  });
  return sharedVideosCount;
});
userSchema.virtual("sharedWithMeCount").get(async function () {
  const sharedWithMeCount = await Share.countDocuments({
    toId: this._id,
  });
  return sharedWithMeCount;
});
userSchema.virtual("videoCount").get(async function () {
  const videoCount = await Video.countDocuments({
    userId: this._id,
  });
  return videoCount;
});
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User Not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Password is not correct");
  }

  return user;
};

userSchema.pre("remove", async function (next) {
  const user = this;
  await Video.deleteMany({ userId: user._id });
  await Note.deleteMany({ userId: user._id });
  await Notification.deleteMany({ userId: user._id });
  next();
});
userSchema.methods.toJSON = async function () {
  const user = this;
  const userObject = user.toObject();
  const sharedVideosCount = await this.sharedVideosCount;
  const sharedWithMeCount = await this.sharedWithMeCount;
  const videoCount = await this.videoCount;
  const avatar = await this.avatar;
  delete userObject.password;
  delete userObject.tokens;
  userObject.sharedVideosCount = sharedVideosCount;
  userObject.sharedWithMeCount = sharedWithMeCount;
  userObject.videoCount = videoCount;
  userObject.avatar = avatar;
  return userObject;
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
