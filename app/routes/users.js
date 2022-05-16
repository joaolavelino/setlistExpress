var express = require("express");
var router = express.Router();
// const bcrypt = require("bcrypt");

//node js crypto class
const crypto = require("crypto");

require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_TOKEN;

const withAuth = require("../middlewares/auth");
const User = require("../models/user.js");

//USER REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  // const hashedPassword = await bcrypt.hash(password, 10);
  const hash = createCrypto(password);
  const user = new User({ name: name, email: email, password: hash });
  console.log(user);
  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error creating new user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) res.status(401).json({ error: "Invalid email or password" });
    else {
      // if (await bcrypt.compare(password, user.password)) {
      if (compareCrypto(password, user.password)) {
        const token = jwt.sign({ email }, secret, { expiresIn: "10d" });
        res.json({ user: user, token: token });
      } else {
        res.status(401).json({ error: "Invalid email or password" });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error, please try again later" });
  }
});

//USER INFO EDIT
router.put("/edit/info", withAuth, async (req, res) => {
  const { name, email, password } = req.body;
  const update = { name: name, email: email };
  try {
    // if (await bcrypt.compare(password, req.user.password)) {
    if (compareCrypto(password, req.user.password)) {
      console.log("password Ok");
      let user = await User.findByIdAndUpdate(req.user._id, update, {
        upsert: false,
        new: true,
      });
      res.status(200).json(user);
    } else {
      res.status(403).json({ error: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

//USER PASSWORD EDIT
router.put("/edit/password", withAuth, async (req, res) => {
  const { password, newPassword } = req.body;
  // const newHashedPassword = await bcrypt.hash(newPassword, 10);
  const newHash = createCrypto(newPassword);
  const update = { password: newHash };
  try {
    // if (await bcrypt.compare(password, req.user.password)) {
    if (compareCrypto(password, req.user.password)) {
      let user = await User.findByIdAndUpdate(req.user._id, update, {
        upsert: false,
        new: true,
      });
      res.status(200).json({ user: user, newPassword: newPassword });
    } else {
      res.status(403).json({ error: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

const createCrypto = (password) => {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(password)
    .digest("hex");

  return hash;
};

const compareCrypto = (inputPassword, userPasswordHash) => {
  const inputHash = createCrypto(inputPassword);
  if (inputHash === userPasswordHash) return true;
  else return false;
};

module.exports = router;
