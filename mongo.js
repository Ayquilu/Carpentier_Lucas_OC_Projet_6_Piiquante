
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator")
const password = process.env.DB_PASSWORD;
const username = process.env.DB_USER;
const uri = `mongodb+srv://${username}:${password}@cluster0.ftrywci.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

mongoose
  .connect(uri)
  .then(() => console.log("connect to mongo"))
  .catch((err) => console.error("Error connecting to mongo", err));

const userSchema = new mongoose.Schema({
  email: {type: String, require: true, unique: true},
  password: {type: String, require: true},
});
userSchema.plugin(uniqueValidator)

const User = mongoose.model("User", userSchema);

module.exports = {mongoose, User}

