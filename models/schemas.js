const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contact = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must contain at least 3 characters"],
      maxlength: [30, "Name is limited to max 30 characters"],
    },
    email: {
      type: String,
      minlength: [10, "Email must contain at least 10 characters"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email should be a valid address",
      ],
      required: [true, "Email is required"],
    },
    phone: {
      type: String,
      minlength: [10, "Phone must contain at least 10 characters"],
      maxlength: [20, "Phone is limited to max 15 characters"],
      match: [
        /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
        "Phone should be in a valid format",
      ],
      required: [true, "Phone is required"],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);
const Contact = mongoose.model("contact", contact);
module.exports = Contact;
