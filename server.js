//const express = require("express");
//const cors = require("cors");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
require("dotenv").config();

const app = require("./app");

//app.use(express.json());
//app.use(cors());

const PORT = process.env.PORT || 5000;
const mongoDB = process.env.MONGO_URL;

app.listen(PORT, () => {
  console.log(`The server is running at the port ${PORT}`);
  mongoose
    .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Database connection successful");
    })
    .catch((err) => {
      console.error(`Server not running. Error:`, err);
      process.exit(1);
    });
}); 
