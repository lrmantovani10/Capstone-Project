const express = require("express");
const router = express.Router();
const Profiles = require("../models/profiles");
const jwt = require("jsonwebtoken");
const { mySecretKey, ensureToken } = require("../authentication");
const { ForbiddenError } = require("../utils/errors");

router.get("/", ensureToken, async (request, response, next) => {
  jwt.verify(request.token, mySecretKey, async function (error, data) {
    if (error) {
      next(new ForbiddenError("Bad Token!"));
    } else {
      const matches = await Profiles.getMatches(data.email);
      response.status(200).send(matches);
    }
  });
});

router.get("/:profileId", ensureToken, (request, response, next) => {
  let profileId = request.params.profileId;
  try {
    response.status(200).send({
      profile: Profiles.getProfileId(profileId),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
