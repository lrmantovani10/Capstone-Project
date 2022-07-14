const mySecretKey = "764t6327uyqdgdhaDBSJADVBSHJ";
const mongoDBpassword = "E8JaukSjbUcpguCR";

function ensureToken(req, res, next) {
  const bearerToken = req.headers["authorization"];
  if (typeof bearerToken !== "undefined") {
    req.token = bearerToken;
    next();
  } else {
    next(new ForbiddenError("Bad Token!"));
  }
}

module.exports = { mySecretKey, ensureToken, mongoDBpassword };
