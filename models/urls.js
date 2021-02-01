const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  shortURL: String,
  longURL: String,
  owner: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  created: { type: Date, default: Date.now },
});

const Url = (module.exports = mongoose.model("Url", urlSchema));
