const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../models/schemas/user");
const sendEmail = require("../../models/email/send-email");
require("dotenv").config();
const secret = process.env.SECRET;
const { v4: uuidv4 } = require("uuid");

var Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const gravatar = require("gravatar");
const uploadDir = path.join(process.cwd(), "tmp");
const storeImage = path.join(process.cwd(), "public", "avatars");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: "Error",
        code: 401,
        message: "Not authorized",
        data: "Not authorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.toLowerCase().split(" ").join("-"));
  },
  limits: {
    fileSize: 1048576,
  },
});

const upload = multer({
  storage: storage,
});

// Verificare e-mail
router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({
        status: "Error",
        code: 404,
        message: "User not found",
      });
    }
    user.verify = true;
    user.verificationToken = null;
    await user.save();
    res.status(200).json({
      status: "Success",
      code: 200,
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
});

//registration
router.post("/signup", async (req, res, next) => {
  const { email, password } = req.body;
  const verificationToken = uuidv4();
  const user = await User.findOne({ email });

  if (user) {
    return res.status(409).json({
      status: "Error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }
  try {
    const avatarURL = "https:" + gravatar.url(email, { s: "200", r: "pg", d: "identicon" });
    const newUser = new User({
      email,
      password,
      avatarURL,
      verificationToken,
    });
    const validationError = newUser.validateSync();

    if (validationError) {
      return res.status(400).json({
        status: "Error",
        code: 400,
        message: "Bad Request. " + validationError.message,
        data: "Error",
      });
    }

    newUser.setPass(password);
    await newUser.save();
    await sendEmail(email, verificationToken);

    res.status(201).json({
      status: "Success",
      code: 201,
      data: {
        message: "Registration successful",
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
});

// e-mail repetat
router.post("/verify", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      status: "Error",
      code: 400,
      message: "Missing required field email",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "Error",
        code: 404,
        message: "User not found",
      });
    }
    if (user.verify) {
      return res.status(400).json({
        status: "Error",
        code: 400,
        message: "Verification has already been passed",
      });
    }
    const verificationToken = user.verificationToken || uuidv4();
    await sendEmail(email, verificationToken);
    if (!user.verificationToken) {
      user.verificationToken = verificationToken;
      await user.save();
    }

    res.status(200).json({
      status: "Success",
      code: 200,
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
});

//login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isSamePass(password)) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Email or password is wrong",
      });
    }
    const payload = {
      id: user.id,
      email: user.email,
      admin: false,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1w" });
    user.setToken(token);
    await user.save();

    res.json({
      status: "Success",
      code: 200,
      data: {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        details: error.message,
      });
    } else {
      next(error);
    }
  }
});

router.get("/contacts", auth, (req, res, next) => {
  const { email } = req.user;
  res.json({
    status: "Success",
    code: 200,
    data: {
      message: `Authorization was successful: ${email}`,
    },
  });
});

//logout
router.get("/logout", auth, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }
    user.setToken(null);
    await user.save();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

//current
router.get("/current", auth, async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }
    res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
});

//avatars
router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const user = req.user;
      const email = req.user.email;
      //const { path: temporaryName, originalname } = req.file;
      //const fileName = path.join(storeImage, originalname);

      if (!user) {
        return res.status(401).json({
          message: "Not authorized",
        });
      }

      const image = await Jimp.read(req.file.path);
      image.resize(250, 250);

      const uniqueImgName =
        email.split("@")[0] + "_avatar" + path.extname(req.file.originalname);
      const avatarPath = path.join(storeImage, uniqueImgName);
      await image.writeAsync(avatarPath);
      const avatarURL = `/avatars/${uniqueImgName}`;
      req.user.avatarURL = avatarURL;
      await user.save();
      res.status(200).json({
        avatarURL: user.avatarURL,
      });
    } catch (error) {
      fs.unlinkSync(req.file.path);
      next(error);
    }
  }
);

module.exports = router;
