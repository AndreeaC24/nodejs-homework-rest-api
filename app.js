const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const contactsRouter = require("./routes/api/contacts");
const authRouter = require("./routes/api/users");
require("./models/config/config-passport");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/contacts", contactsRouter);
app.use("/api/users", authRouter);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message: `Check your routes`,
    data: "Not found",
  });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: "fail",
    code: err.status || 500,
    message: err.message,
    data: "Internal Server Error",
  });
});

module.exports = app;
