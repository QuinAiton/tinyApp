const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  shorturl: {
    longURL: String,
    owner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    created: { type: Date, default: Date.now },
  },
});

const Urls = mongoose.model("Urls", urlSchema);
module.exports = Urls;
