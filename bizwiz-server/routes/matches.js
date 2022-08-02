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
  mapsKey,
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
        let finalMatches = [];
        for (const match of matches) {
          const matchData = await Profiles.getProfileId(match);
          if (!matchData) {
            next("Invalid profile Id!");
          }
          const userData = await Profiles.getFiles(1, matchData);

          if (userData.location) {
            await axios
              .get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userData.location.lat},${userData.location.lng}&result_type=political&key=${mapsKey}`
              )
              .then((outcome) => {
                const addressList = outcome.data.results[0].address_components;
                if (addressList.length > 0) {
                  userData["readable_address"] =
                    addressList[0].short_name +
                    (addressList.length > 1
                      ? ", " +
                        (addressList.length >= 3
                          ? addressList[2]
                          : addressList[addressList.length - 1]
                        ).short_name
                      : "");
                }
                finalMatches.push(userData);
              })
              .catch((error) => {
                next(error);
              });
          } else {
            finalMatches.push(userData);
          }
        }
        response.status(200).send(finalMatches);
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
        const headers = {
          headers: {
            "Content-Type": "application/json; charset=utf8",
            "Api-Token": sendBirdToken,
          },
        };
        let ids = [request.body.firstProfile, request.body.secondProfile];
        ids.sort();
        let channelUrl;
        if (ids[0] == request.body.firstProfile) {
          channelUrl = request.body.firstProfile + request.body.secondProfile;
        } else {
          channelUrl = request.body.secondProfile + request.body.firstProfile;
        }
        await axios
          .delete(
            `https://api-${applicationId}.sendbird.com/v3/group_channels/${channelUrl}`,
            headers
          )
          .catch((error) => {
            if (!error.response.data.message.includes("not found")) {
              next(new BadRequestError());
            }
          });

        await Profiles.removeMatch(
          request.body.firstProfile,
          request.body.secondProfile
        );
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
