const { mySecretKey, ensureToken } = require("./authentication");
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
    const filename = bodyData.userId + bodyData.extension;
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
    jwt.verify(request.token, mySecretKey, async function (error, data) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        await Profiles.delete(data.email);
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
        const fileElements = ["profile_picture", "resume"];
        for (let i = 0; i < fileElements.length; i++) {
          if (Object.keys(userData[fileElements[i]]).length != 0) {
            const fileType = userData[fileElements[i]].contentType;

            const decodedFile =
              userData[fileElements[i]].file.toString("base64");
            userData[
              fileElements[i]
            ] = `data:${fileType}/${fileType};base64,${decodedFile}`;
          }
        }
        for (let i = 0; i < 6; i++) {
          if (Object.keys(userData["other_pictures_" + i]).length != 0) {
            const fileType = userData["other_pictures_" + i].contentType;
            const decodedFile =
              userData["other_pictures_" + i].file.toString("base64");
            userData[
              "other_pictures_" + i
            ] = `data:image/${fileType};base64,${decodedFile}`;
          } else {
            userData["other_pictures_" + i] = "";
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
          let currentFile = fs.readFileSync(
            bodyData.destination + bodyData.userId + bodyData.extension
          );
          let encodedFile = currentFile.toString("base64");
          const fileBuffer = Buffer.from(encodedFile, "base64");
          let finalFile = {
            contentType: request.file.mimetype,
            file: fileBuffer,
          };
          let changeBody = {};
          changeBody[bodyData.category] = finalFile;
          await Profiles.changeProfile(bodyData.userEmail, changeBody);
          fs.unlink(
            bodyData.destination + bodyData.userId + bodyData.extension,
            (error) => {
              if (error) {
                next(error);
              }
            }
          );
          response.status(200).send();
        }
      });
    } catch (error) {
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
