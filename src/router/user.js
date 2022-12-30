const multer = require("multer");
const sharp = require("sharp");
const express = require("express");
const User = require("../models/user");
const Image = require("../models/image");
const auth = require("../middleware/auth");

const upload = multer({
  limits: {
    fileSize: 1e6,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload an image"));
    }

    cb(undefined, true);
  },
});
const router = new express.Router();

router.post("/users", async (req, res) => {
  try {
    const requiredFields = ["userName", "nickName", "email", "password"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).send({
          success: false,
          message: `Please append the User ${field} to the request body`,
        });
      }
    }

    const userSameUN = await User.findOne({ userName: req.body.userName });
    if (userSameUN) {
      return res.status(400).send({
        success: false,
        message: "The userName is already taken",
      });
    }

    const userSameEmail = await User.findOne({ userName: req.body.email });
    if (userSameEmail) {
      return res.status(400).send({
        success: false,
        message: "The email is is already taken",
      });
    }

    if (req.body.password.length < 7) {
      return res.status(400).send({
        success: false,
        message: "The password must be longer than 7 charaters",
      });
    }

    const user = new User(req.body);
    await user.save();
    const userJSON = await user.toJSON();

    res.status(201).send({
      success: true,
      user: userJSON,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});
router.post("/users/login", async (req, res) => {
  const requiredFields = ["email", "password"];
  for (const field of requiredFields) {
    if (req.body[field] === undefined) {
      return res.status(400).send({
        success: false,
        message: `Please append the User ${field} to the request body`,
      });
    }
  }

  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    const userJSON = await user.toJSON();
    res.send({
      success: true,
      user: userJSON,
      token,
    });
  } catch (e) {
    res.status(401).send({
      success: false,
      message: e.message,
    });
  }
});
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const previousImage = await Image.findOne({ userId: req.user._id });
      if (previousImage) {
        previousImage.delete();
      }

      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      const image = new Image({
        img: buffer,
        userId: req.user._id,
      });
      await image.save();
      res.send({
        success: true,
        image,
      });
    } catch (e) {
      res.status(400).send({
        success: false,
        message: e.message,
      });
    }
  },
  (error, req, res, next) => {
    res.status(400).send({
      succes: false,
      message: error.message,
    });
    next();
  }
);

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token !== req.token);
    await req.user.save();
    const userJSON = await req.user.toJSON();

    res.send({
      success: true,
      user: userJSON,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});
router.get("/users/me", auth, async (req, res) => {
  const userJSON = await req.user.toJSON();
  res.send({
    success: true,
    user: userJSON,
  });
});
router.get("/users", async (req, res) => {
  const users = await User.find({});
  const promises = users.map((user) => {
    return user.toJSON();
  });
  const usersJSON = await Promise.all(promises);
  res.send({
    success: true,
    users: usersJSON,
  });
});
router.get("/users/me/notifications", auth, async (req, res) => {
  await req.user
    .populate({
      path: "notifications",
      match: {
        received: false,
      },
    })
    .execPopulate();
  const { notifications } = req.user;
  const promises = notifications.map((notification) => {
    return notification.toJSON();
  });
  const notificationsJSON = await Promise.all(promises);
  notifications.forEach(async (notification) => {
    notification.received = true;
    await notification.save();
  });
  res.send({
    success: true,
    notifications: notificationsJSON,
  });
});
router.get("/users", async (req, res) => {
  const users = await User.find({});
  const promises = users.map((user) => {
    return user.toJSON();
  });
  const usersJSON = await Promise.allSettled(promises);
  res.send({
    success: true,
    users: usersJSON,
  });
});
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: `user with id ${req.params.id} was not found in the database`,
      });
    }

    const userJSON = await user.toJSON();
    res.send({
      success: true,
      user: userJSON,
    });
  } catch (e) {
    res.status(400).send({
      success: false,
      message: e.message,
    });
  }
});
router.get("/users/:id/avatar", auth, async (req, res) => {
  try {
    const image = await Image.findOne({ userId: req.params.id });
    if (!image) {
      res.status(404).send({
        success: false,
        message: "Image not found",
      });
    }

    res.set("Content-type", "image/png");
    res.send(image.img);
  } catch (e) {
    res.status(400).send({
      success: false,
      message: e.message,
    });
  }
});
router.patch("/users/me", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "userName",
      "password",
      "email",
      "nickName",
      "avatarId",
    ];

    for (const update of updates) {
      if (!allowedUpdates.includes(update)) {
        return res.status(400).send({
          success: false,
          message: `${update} is not a valid field`,
        });
      }
    }

    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    const userJSON = await req.user.toJSON();
    res.send({
      success: true,
      user: userJSON,
    });
  } catch (e) {
    res.status(400).send({
      success: false,
      message: e.message,
    });
  }
});
router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    const image = await Image.findOne({ userId: req.user._id });
    if (!image) {
      res.status(404).send({
        success: false,
        message: "The user had no avatar",
      });
    }

    await image.delete();
    res.send({
      succes: true,
      message: "avatar is deleted",
    });
  } catch (e) {
    res.status(400).send({
      success: false,
      message: e.message,
    });
  }
});
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    const userJSON = await req.user.toJSON();
    res.send({
      success: true,
      user: userJSON,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: e.message,
    });
  }
});

module.exports = router;
