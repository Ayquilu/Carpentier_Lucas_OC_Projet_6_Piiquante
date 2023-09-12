const jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
  console.log("authenticate user");
  const header = req.header("Authorization");

  if (header == null) return res.status(403).send({ message: "invalid" });

  const token = header.split(" ")[1];
  if (token == null) return res.status(403).send({ message: "invalid" });

  console.log("token", token);

  jwt.verify(token, process.env.JWT_PASSWORD, (err, decoded) => {
    if (err) return res.status(403).send({ message: "Token invalid" + err });
  
    console.log("le token est bien valid");
    next();
  });
}

module.exports = { authenticateUser };
