const {
  mySecretKey,
  ensureToken,
  sendBirdToken,
  applicationId,
  mapsKey,
  serviceId,
  templateId,
  userId,
  emailToken,
} = require("./authentication");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("./utils/errors");
const app = express();
const matches = require("./routes/matches");
const Profiles = require("./models/profiles");
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use("/matches", matches);
app.use("/uploads", express.static("../bizwiz-ui/public/uploads/"));
const multer = require("multer");
const axios = require("axios");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const bodyData = JSON.parse(req.body.data);
    cb(null, bodyData.destination);
  },
  filename: function (req, file, cb) {
    const bodyData = JSON.parse(req.body.data);
    const filename = bodyData.userId + bodyData.category + bodyData.extension;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.size / 1000 > 60) {
      return cb(
        new BadRequestError("File size can't be over 60KB! Please try again!")
      );
    }
    let ext = file.originalname.split(".")[1];
    let bodyData = JSON.parse(req.body.data);
    if (
      (bodyData.destination.includes("resume") &&
        ext != "doc" &&
        ext != "docx" &&
        ext != "txt" &&
        ext != "pdf") ||
      ((bodyData.destination.includes("others") ||
        bodyData.destination.includes("profiles")) &&
        ext != "png" &&
        ext != "jpeg" &&
        ext != "jpg")
    ) {
      return cb(new BadRequestError("Only valid file formats are allowed"));
    }
    cb(null, true);
  },
  onError: function (next) {
    next(error);
  },
});

function selectPotentials(userData) {
  let allProfiles = userData.profilesSwiped.concat(userData.profilesLiked);
  let results = {
    type: { $ne: userData.type },
    _id: { $nin: allProfiles },
    interested_sectors: { $in: userData.interested_sectors },
    interested_positions: { $in: userData.interested_positions },
    interested_locations: { $in: userData.interested_locations },
  };
  if (userData.type == 1) {
    results["interested_years"] = { $gte: userData.interested_years };
  }

  return results;
}

function pointDistance(point1, point2) {
  let R = 3958.8;
  let rlat1 = point1.lat * (Math.PI / 180);
  let rlat2 = point2.lat * (Math.PI / 180);
  let difflat = rlat2 - rlat1;
  let difflon = (point2.lng - point1.lng) * (Math.PI / 180);
  let distance =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) +
          Math.cos(rlat1) *
            Math.cos(rlat2) *
            Math.sin(difflon / 2) *
            Math.sin(difflon / 2)
      )
    );
  return distance;
}

app.post("/signup", async (request, response, next) => {
  try {
    const requestBody = request.body;
    const profileData = await Profiles.getProfileEmail(requestBody.email);
    if (!profileData) {
      let insertedId = await Profiles.createProfile(requestBody);
      insertedId = insertedId.toString();
      const newUserBody = {
        user_id: insertedId,
        nickname: requestBody.name,
        profile_url: "",
        issue_access_token: true,
      };
      const headers = {
        headers: {
          "Content-Type": "application/json; charset=utf8",
          "Api-Token": sendBirdToken,
        },
      };
      await axios
        .post(
          `https://api-${applicationId}.sendbird.com/v3/users`,
          newUserBody,
          headers
        )
        .then(async (response) => {
          await Profiles.changeProfile(requestBody.email, {
            sendbird_access: response.data.access_token,
          });
        })
        .catch((error) => {
          next(error);
        });

      const token = jwt.sign({ email: requestBody.email }, mySecretKey);
      response.status(200).send(token);
    } else {
      next(new BadRequestError("Email already associated with an account!"));
    }
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (request, response, next) => {
  try {
    const requestBody = request.body;
    const profileData = await Profiles.getProfileEmail(requestBody.email);
    const token = jwt.sign({ email: profileData.email }, mySecretKey);
    if (!profileData) {
      next(new NotFoundError("Account doesn't exist!"));
    } else {
      if (profileData.password != requestBody.password) {
        next(new BadRequestError("Incorrect password!"));
      } else {
        response.status(200).send(token);
      }
    }
  } catch (error) {
    next("Failed to log in. Please try again!");
  }
});

app.post("/facebook_login", async (request, response, next) => {
  try {
    let requestBody = request.body;
    requestBody["password"] = request.body.id * 3.65;
    const profileData = await Profiles.getProfileEmail(requestBody.email);
    if (!profileData) {
      delete requestBody["id"];
      let insertedId = await Profiles.createProfile(requestBody);
      insertedId = insertedId.toString();
      const newUserBody = {
        user_id: insertedId,
        nickname: requestBody.name,
        profile_url: "",
        issue_access_token: true,
      };
      const headers = {
        headers: {
          "Content-Type": "application/json; charset=utf8",
          "Api-Token": sendBirdToken,
        },
      };
      await axios
        .post(
          `https://api-${applicationId}.sendbird.com/v3/users`,
          newUserBody,
          headers
        )
        .then(async (response) => {
          await Profiles.changeProfile(requestBody.email, {
            sendbird_access: response.data.access_token,
          });
        })
        .catch((error) => {
          next(error);
        });

      const token = jwt.sign({ email: requestBody.email }, mySecretKey);
      response.status(200).send({ url: "/edit_profile", token });
    } else {
      if (profileData.password != requestBody.password) {
        next(new BadRequestError("Incorrect password!"));
      } else {
        const token = jwt.sign({ email: profileData.email }, mySecretKey);
        response.status(200).send({ url: "/", token });
      }
    }
  } catch (error) {
    next("Failed to log in. Please try again!");
  }
});

app.use(ensureToken);
app.post("/logout", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        await Profiles.logout();
        response.status(200).send();
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/delete", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        const headers = {
          headers: {
            "Content-Type": "application/json; charset=utf8",
            "Api-Token": sendBirdToken,
          },
        };

        await axios
          .delete(
            `https://api-${applicationId}.sendbird.com/v3/users/${request.body.user._id}`,
            headers
          )
          .then(async () => {
            let deletePromises = [];
            for (const match of request.body.user.matches) {
              let ids = [request.body.user._id, match];
              ids.sort();
              let channelUrl;
              if (ids[0] == request.body.user._id) {
                channelUrl = request.body.user._id + match;
              } else {
                channelUrl = match + request.body.user._id;
              }
              deletePromises.push(
                axios
                  .delete(
                    `https://api-${applicationId}.sendbird.com/v3/group_channels/${channelUrl}`,
                    headers
                  )
                  .catch((error) => {
                    if (!error.response.data.message.includes("not found")) {
                      next(new BadRequestError());
                    }
                  })
              );
            }
            await Promise.all(deletePromises);
            await Profiles.delete(request.body.user._id);
            response.status(200).send();
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

app.get("/get_user", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        let userData;
        if (
          request.headers.type &&
          (parseInt(request.headers.type) == 0 ||
            parseInt(request.headers.type) == 2)
        ) {
          userData = await Profiles.getProfileEmail(data.email);
        } else {
          userData = await Profiles.getFiles(0, data.email);
        }
        if (
          userData.location &&
          (!request.headers.type ||
            (request.headers.type && parseInt(request.headers.type) != 2))
        ) {
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
              if (request.headers.type && parseInt(request.headers.type) != 1) {
                delete userData["password"];
              }
              response.status(200).send(userData);
            })
            .catch((error) => {
              next(error);
            });
        } else {
          if (request.headers.type && parseInt(request.headers.type) != 1) {
            delete userData["password"];
          }
          response.status(200).send(userData);
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/check_user", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        const userData = await Profiles.getProfileEmail(request.body.email);
        if (userData && userData.email != data.email) {
          next(new ForbiddenError("Email already associated with an account!"));
        } else {
          response.status(200).send();
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post(
  "/upload_single",
  upload.single("file"),
  async (request, response, next) => {
    try {
      jwt.verify(request.token, mySecretKey, async function (error) {
        if (error) {
          next(new ForbiddenError("Bad Token!"));
        } else {
          const bodyData = JSON.parse(request.body.data);
          const filePath =
            bodyData.destination +
            bodyData.userId +
            bodyData.category +
            bodyData.extension;
          await Profiles.uploadFile(
            filePath,
            bodyData.userId,
            bodyData.category
          );
          response.status(200).send();
        }
      });
    } catch {
      next(error);
    }
  }
);

app.post("/change_profile", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        const userParameters = request.body;
        await Profiles.changeProfile(data.email, userParameters);
        const token = jwt.sign({ email: userParameters.email }, mySecretKey);
        response.status(200).send(token);
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/get_profiles", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        const userData = await Profiles.getProfileEmail(data.email);
        const profiles = await Profiles.getProfiles(selectPotentials(userData));
        let finalProfiles = [];
        let promises = [];
        for (const profile of profiles) {
          promises.push(
            new Promise(async (resolve, reject) => {
              try {
                let userData = await Profiles.getFiles(1, profile);
                if (userData.location && request.body.location) {
                  userData["distance"] = pointDistance(
                    request.body.location,
                    userData.location
                  );
                }
                finalProfiles.push(userData);
                resolve();
              } catch (error) {
                reject(error);
              }
            })
          );
        }
        await Promise.all(promises);
        response.status(200).send(finalProfiles);
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/send_email", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        const body = {
          service_id: serviceId,
          template_id: templateId,
          user_id: userId,
          template_params: {
            match_name: request.body.match_name,
            matched_name: request.body.matched_name,
            email: request.body.email,
          },
          accessToken: emailToken,
        };
        const headers = {
          contentType: "application/json",
        };
        await axios
          .post("https://api.emailjs.com/api/v1.0/email/send", body, headers)
          .then(() => {
            response.status(200).send();
          })
          .catch((error) => {
            console.log(error);
            next(error);
          });
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res, next) => {
  next(new NotFoundError());
});

app.use((error, req, res, next) => {
  const status = error.status ? error.status : 500;
  res.status(status).json({
    error: {
      message: error.message
        ? error.message
        : "Something went wrong in the application",
      status: status,
    },
  });
});

module.exports = app;
