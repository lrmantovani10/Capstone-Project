const express = require("express");
const router = express.Router();
const Profiles = require("../models/profiles");
const jwt = require("jsonwebtoken");
const { mySecretKey, ensureToken } = require("../authentication");
const { ForbiddenError } = require("../utils/errors");

router.use(ensureToken);
router.get("/", async (request, response, next) => {
  jwt.verify(request.token, mySecretKey, async function (error, data) {
    if (error) {
      next(new ForbiddenError("Bad Token!"));
    } else {
      const matches = await Profiles.getMatches(data.email);
      response.status(200).send(matches);
    }
  });
});

router.get("/:profileId", async (request, response, next) => {
  let profileId = request.params.profileId;
  jwt.verify(request.token, mySecretKey, async function (error) {
    if (error) {
      next(new ForbiddenError("Bad Token!"));
    } else {
      const userData = await Profiles.getProfileId(profileId);
      response.status(200).send({ user: userData });
    }
  });
});

router.post("/remove_match", async (request, response, next) => {
  jwt.verify(request.token, mySecretKey, async function (error, data) {
    if (error) {
      next(new ForbiddenError("Bad Token!"));
    } else {
      await Profiles.removeMatch(data.email, request.body.secondProfile);
      const token = jwt.sign({ email: data.email }, mySecretKey);
      response.status(200).send(token);
    }
  });
});
module.exports = router;
