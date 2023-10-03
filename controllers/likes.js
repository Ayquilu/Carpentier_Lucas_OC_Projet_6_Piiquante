const { getSauce, sendClientResponse } = require("./piiquante");

async function likeSauce(req, res) {
  const { like, userId } = req.body;

  if (![0, -1, 1].includes(like))
    return res.status(403).send({ message: "Invalid like value" });

  try {
    const product = await getSauce(req, res);
    const updatedProduct = updateVote(product, like, userId);
    await updatedProduct.save();
    sendClientResponse(updatedProduct, res);
  } catch (err) {
    res.status(500).send(err);
  }
}

function updateVote(product, like, userId) {
  if (like === 1 || like === -1) {
    return incrementVote(product, userId, like);
  } else {
    return resetVote(product, userId);
  }
}

function resetVote(product, userId) {
  const { usersLiked, usersDisliked } = product;

  if (usersLiked.includes(userId)) {
    --product.likes;
    product.usersLiked = product.usersLiked.filter((id) => id !== userId);
  } else if (usersDisliked.includes(userId)) {
    --product.dislikes;
    product.usersDisliked = product.usersDisliked.filter((id) => id !== userId);
  }

  console.log("RESET VOTE", product);
  return product;
}

function incrementVote(product, userId, like) {
  const { usersLiked, usersDisliked } = product;

  const votersArray = like === 1 ? usersLiked : usersDisliked;
  if (!votersArray.includes(userId)) {
    votersArray.push(userId);
    like === 1 ? ++product.likes : ++product.dislikes;
  }

  return product;
}

module.exports = { likeSauce };
