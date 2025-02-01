const mongoose = require("mongoose");

const connectDb = async function () {
  const connectionUrl = process.env.MONGODB_URL.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  );
  await mongoose.connect(connectionUrl, {});
  console.log("Connected to database ...");
};

module.exports = connectDb;
