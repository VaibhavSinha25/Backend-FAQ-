const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
  },
  answer: {
    type: String,
    required: [true, "Answer is required"],
  },
  translations: {
    type: Map,
    of: {
      question: String,
      answer: String,
    },
    default: {},
  },
});

const Faq = mongoose.model("Faq", faqSchema);
module.exports = Faq;
