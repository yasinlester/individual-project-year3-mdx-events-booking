const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  createdBy: { type: String, required: false }
});

module.exports = mongoose.model("Event", eventSchema);

