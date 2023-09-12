const { getSauce, sendClientResponse } = require("./piiquante");


function likeSauce(req, res){
  const { like, userId } = req.body;

  if (![0, -1, 1].includes(like))
    return res.status(403).send({ message: "invalid like value" });

  getSauce(req, res)
    .then((product) => updateVote(product, like, userId, res))
    .then((pr) => pr.save())
    .then((prod) => sendClientResponse(prod, res))
    .catch((err) => res.status(500).send(err));
};

function updateVote(product, like, userId, res) {
  if (like === 1 || like === -1) return incrementVote(product, userId, like);
  return resetVote(product, userId, res);
}

function resetVote(product, userId, res) {
  const { usersLiked, usersDisliked } = product;

  if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
    return Promise.reject("User seems to have voted both ways");

  if (![usersLiked, usersDisliked].some((arr) => arr.Includes(userId)))
    return Promise.reject("User seems to not have voted");

  if (usersLiked.includes(userId)) {
    --product.likes;
    product.usersLiked = product.usersLiked.filter((id) => id !== userId);
  } else {
    --product.dislikes;
    product.usersDisliked = product.usersDisliked.filter(
      (id) => id !== userId);
  }
  return product
}

function incrementVote(product, userId, like) {
  const { usersLiked, usersDisliked } = product;

  const votersArray = like === 1 ? usersLiked : usersDisliked;
  if (votersArray.includes(userId)) return product;
  votersArray.push(userId);

  like === 1 ? ++product.likes : ++product.dislikes;
  return product;
}

module.exports = { likeSauce };