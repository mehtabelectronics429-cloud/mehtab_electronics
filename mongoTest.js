// test-mongo.js
const mongoose = require("mongoose");
const uri =
  "mongodb+srv://mehtabelectronics429_db_user:T0q2ApoTj9T5b4WA@cluster0.nbzx4jv.mongodb.net/mehtab_electronics?appName=Cluster0";
const opts = {
  bufferCommands: false,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
};

mongoose
  .connect(uri, opts)
  .then(() => {
    console.log("Connected ok, readyState:", mongoose.connection.readyState);
    return mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Connection error:", err);
    process.exit(1);
  });
