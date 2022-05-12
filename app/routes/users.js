var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_TOKEN;

const User = require("../models/user.js");

//USER REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name: name, email: email, password: hashedPassword });
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
      if (bcrypt.compare(password, user.password)) {
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

module.exports = router;
