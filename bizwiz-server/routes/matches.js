const express = require("express");
const router = express.Router();
const Profiles = require("../models/profiles");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const {
  mySecretKey,
  ensureToken,
  sendBirdToken,
  applicationId,
} = require("../authentication");
const { ForbiddenError } = require("../utils/errors");
router.use(ensureToken);
router.get("/", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        const matches = await Profiles.getMatches(data.email);
        response.status(200).send(matches);
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:profileId", async (request, response, next) => {
  try {
    let profileId = request.params.profileId;
    jwt.verify(request.token, mySecretKey, async function (error) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        const userData = await Profiles.getProfileId(profileId);
        if (!userData) {
          next("Invalid profile Id!");
        }
        response.status(200).send({ user: userData });
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/remove_match", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        await Profiles.removeMatch(data.email, request.body.secondProfile);
        const token = jwt.sign({ email: data.email }, mySecretKey);
        response.status(200).send(token);
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/remove_match", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        await Profiles.removeMatch(data.email, request.body.secondProfile);
        const token = jwt.sign({ email: data.email }, mySecretKey);
        response.status(200).send(token);
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/manage_chat", async (req, res, next) => {
  try {
    jwt.verify(req.token, mySecretKey, async function (error) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        const headers = {
          headers: {
            "Content-Type": "application/json; charset=utf8",
            "Api-Token": sendBirdToken,
          },
        };
        const body = {
          name: req.body.name,
          channel_url: req.body.channel_url,
          user_ids: req.body.user_ids,
          is_distinct: true,
        };
        await axios
          .post(
            `https://api-${applicationId}.sendbird.com/v3/group_channels`,
            body,
            headers
          )
          .then((response) => {
            res.status(200).send(response.data.channel_url);
          })
          .catch((error) => {
            next(error);
          });
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
