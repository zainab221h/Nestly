const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/nestly";
main()
  .then(() => {
    console.log("Connected To Databasw");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const initDb = async () => {
  await listing.deleteMany({});
  await listing.insertMany(initData.data);
  console.log("data was initialized");
};
initDb();
