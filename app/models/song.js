const mongoose = require("mongoose");

let songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  key: String,
  lyrics: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Song", songSchema);
