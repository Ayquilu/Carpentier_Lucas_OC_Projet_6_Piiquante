const mongoose = require("mongoose");
const { unlink } = require("fs/promises");
const jwt = require("jsonwebtoken");
const { log } = require("console");

const productSchema = new mongoose.Schema({
  userId: String,
  name: String,
  manufacturer: String,
  description: String,
  mainPepper: String,
  imageUrl: String,
  heat: { type: Number, min: 1, max: 10 },
  likes: Number,
  dislikes: Number,
  usersLiked: [String],
  usersDisliked: [String],
});

const Product = mongoose.model("Product", productSchema);

function getSauces(req, res) {
  Product.find({})
    .then((products) => res.send(products))
    .catch((error) => res.status(500).send(error));
}

function getSauce(req, res) {
  const { id } = req.params;
  return Product.findById(id);
}

function getSauceById(req, res) {
  getSauce(req, res)
    .then((product) => sendClientResponse(product, res))
    .catch((err) => res.status(500).send(err));
}

async function deleteSauce(req, res) {
  const { id } = req.params;
  const userId = getUserIdFromToken(req.headers.authorization.split(" ")[1]);
  let sauce = await getSauce(req, res);
  if (sauce.userId !== userId) {
    return res
      .status(403)
      .send({ message: "You are not authorized to delete this sauce" });
  }

  Product.findByIdAndDelete(id)
    .then((product) => sendClientResponse(product, res))
    .then((item) => deleteImage(item))
    .then((res) => console.log("FILE DELETED", res))
    .catch((err) => res.status(500).send({ message: err }));
}

function getUserIdFromToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_PASSWORD);
  return decoded.userId;
}

function modifySauce(req, res) {
  const {
    params: { id },
  } = req;

  const hasNewImage = req.file != null;
  const payload = makePayload(hasNewImage, req);

  Product.findByIdAndUpdate(id, payload)
    .then((dbResponse) => sendClientResponse(dbResponse, res))
    .then((product) => deleteImage(product))
    .then((res) => console.log("FILE DELETED", res))
    .catch((err) => console.error("PROBLEM UPDATING", err));
}

function deleteImage(product) {
  if (product == null) return;
  console.log("DELETE IMAGE", product);
  const imageToDelete = product.imageUrl.split("/").at(-1);
  console.log("imageToDelete", imageToDelete);
  return unlink("images/" + imageToDelete);
}

function makePayload(hasNewImage, req) {
  console.log("hasNewImage", hasNewImage);
  if (!hasNewImage) return req.body;
  const payload = JSON.parse(req.body.sauce);
  payload.imageUrl = makeImageUrl(req, req.file.fileName);
  console.log("NOUVELLE IMAGE A GERER");
  console.log("voici le payload:", payload);
  return payload;
}

function sendClientResponse(product, res) {
  if (product == null) {
    console.log("NOTHING TO UPDATE");
    return res.status(404).send({ message: "Object not found in database" });
  }
  console.log("ALL GOOD UPDATING:", product);
  return Promise.resolve(res.status(200).send(product)).then(() => product);
}

function makeImageUrl(req, fileName) {
  return req.protocol + "://" + req.get("host") + "/images/" + fileName;
}

function createSauce(req, res) {
  const { body, file } = req;
  const { fileName } = file;
  const sauce = JSON.parse(body.sauce);
  const { name, manufacturer, description, mainPepper, heat, userId } = sauce;

  const product = new Product({
    userId: userId,
    name: name,
    manufacturer: manufacturer,
    description: description,
    mainPepper: mainPepper,
    imageUrl: makeImageUrl(req, fileName),
    heat: heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  product
    .save()
    .then((message) => res.status(201).send({ message }))
    .catch((err) => res.status(500).send(err));
}

module.exports = {
  sendClientResponse,
  getSauce,
  getSauces,
  createSauce,
  getSauceById,
  deleteSauce,
  modifySauce,
};
