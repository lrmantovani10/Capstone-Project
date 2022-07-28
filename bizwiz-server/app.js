const {
  mySecretKey,
  ensureToken,
  sendBirdToken,
  applicationId,
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
const fs = require("fs");

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
    if (file.size / 1000000 > 12) {
      return cb(
        new BadRequestError("File size can't be over 12MB! Please try again!")
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
    // _id: { $nin: allProfiles },
    // interested_sectors: {$in: userData.interested_sectors},
    // interested_positions: {$in: userData.interested_positions},
    // interested_locations: {$in: userData.interested_locations}
  };
  if (userData.type == 1) {
    results["interested_years"] = { $gte: userData.interested_years };
  }

  return results;
}

app.post("/signup", async (request, response, next) => {
  try {
    const requestBody = request.body;
    const profileData = await Profiles.getProfileEmail(requestBody.email);
    if (!profileData) {
      await Profiles.createProfile(requestBody);
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
    next(error);
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
        for (const match of request.body.user.matches) {
          let ids = [request.body.user._id, match];
          ids.sort();
          let channelUrl;
          if (ids[0] == request.body.user._id) {
            channelUrl = request.body.user._id + match;
          } else {
            channelUrl = match + request.body.user._id;
          }
          await axios
            .delete(
              `https://api-${applicationId}.sendbird.com/v3/group_channels/${channelUrl}`,
              {},
              headers
            )
            .catch((error) => {
              if (!error.message.includes("not found")) {
                next(new BadRequestError());
              }
            });
        }
        await Profiles.delete(request.body.user._id);
        response.status(200).send();
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
        let userData = await Profiles.getProfileEmail(data.email);
        let fileElements = ["profile_picture", "resume"];
        for (let i = 0; i < 6; i++) {
          fileElements.push("other_pictures_" + i);
        }
        const fileArray = await Profiles.readFiles(userData._id);
        userData["profile_picture"] = "";
        userData["other_pictures"] = ["", "", "", "", "", ""];
        if (userData.type == 0) userData["resume"] = "";
        let includeArray = ["profile_picture", "resume"];
        for (let i = 0; i < 6; i++) {
          includeArray.push("other_pictures_" + i);
        }
        for (const element of fileArray) {
          const fileType = element[0];
          if (includeArray.includes(fileType)) {
            if (fileType.includes("other_pictures")) {
              userData["other_pictures"][parseInt(fileType.split("_")[2])] =
                element[1];
            } else {
              userData[fileType] = element[1];
            }
          }
        }
        response.status(200).send(userData);
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
          ).then(() => {
            fs.unlink(filePath, (error) => {
              if (error) {
                throw new Error("Local file deletion failed!");
              }
            });
            response.status(200).send();
          });
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

app.get("/get_profiles", async (request, response, next) => {
  try {
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        const userData = await Profiles.getProfileEmail(data.email);
        const profiles = await Profiles.getProfiles(selectPotentials(userData));
        response.status(200).send(profiles);
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
