const express = require("express");
const router = express.Router();

const Song = require("../models/song");
const withAuth = require("../middlewares/auth");

//CREATE SONG
router.post("/", withAuth, async (req, res) => {
  const { title, artist, key, lyrics } = req.body;
  try {
    let song = new Song({
      title: title,
      artist: artist,
      key: key,
      lyrics: lyrics,
      author: req.user._id,
    });
    await song.save();
    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

//LIST ALL SONGS BY USER
router.get("/", withAuth, async (req, res) => {
  try {
    const songs = await Song.find({ author: req.user._id });
    res.status(200).json(songs);
  } catch (error) {
    res.status(500).send(error);
  }
});

//GET SONG BY ID
router.get("/:id", withAuth, async (req, res) => {
  const { id } = req.params;
  try {
    let song = await Song.findById(id);
    isOwner(req.user, song)
      ? res.status(200).json(song)
      : res.status(403).json({
          error: "Permission denied: Song only available to the user",
        });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

//UPDATE SONG
router.put("/:id", withAuth, async (req, res) => {
  const { title, artist, key, lyrics } = req.body;
  const { id } = req.params;
  let update = { title: title, artist: artist, key: key, lyrics: lyrics };
  try {
    let song = await Song.findById(id);
    if (isOwner(req.user, song)) {
      let song = await Song.findByIdAndUpdate(id, update, { new: true });
      res.status(200).json(song);
    } else
      res.status(403).json({
        error: "Permission denied: Song only available to the user",
      });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

//DELETE SONG
router.delete("/:id", withAuth, async (req, res) => {
  const { id } = req.params;
  try {
    let song = await Song.findById(id);
    if (isOwner(req.user, song)) {
      await song.deleteOne();
      res.json({ message: "Song successfully deleted" }).status(200);
    } else
      res.status(403).json({
        error: "Permission denied: Song only available to the user",
      });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

//FUNCTION TO CHECK IF USER IS OWNER OF THE SONG
const isOwner = (user, song) => {
  if (JSON.stringify(user._id) == JSON.stringify(song.author)) return true;
  else return false;
};

module.exports = router;
