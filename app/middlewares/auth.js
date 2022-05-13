require("dotenv").config();
const secret = process.env.JWT_TOKEN;
const jwt = require("jsonwebtoken");

const User = require("../models/user.js");

const withAuth = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token)
    res.status(401).json({ error: "Unauthorized: Token not provided" });
  else {
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        next();
      } else {
        email = decodedToken.email;
        User.findOne({ email }).then((foundUser) => {
          req.user = foundUser;
          next();
        });
      }
    });
  }
};

module.exports = withAuth;
