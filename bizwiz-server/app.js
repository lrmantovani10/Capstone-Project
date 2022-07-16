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
});

function selectPotentials(userData) {
  // Matching algorithm -- for now, only different account type
  let results = {
    type: { $ne: userData.type },
  };
  return results;
}

app.post("/signup", async (request, response, next) => {
  const requestBody = request.body;
  try {
    const profileData = await Profiles.getProfileId(requestBody.email);
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
  const requestBody = request.body;
  const profileData = await Profiles.getProfileId(requestBody.email);
  const token = jwt.sign({ email: profileData.email }, mySecretKey);
  try {
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
  jwt.verify(request.token, mySecretKey, async function (error) {
    if (error) {
      next(new ForbiddenError("Bad Token!"));
    } else {
      await Profiles.logout();
      response.status(200).send();
    }
  });
});

app.post("/delete", async (request, response, next) => {
  jwt.verify(request.token, mySecretKey, async function (error, data) {
    if (error) {
      next(new ForbiddenError("Bad Token!"));
    } else {
      await Profiles.delete(data.email);
      response.status(200).send();
    }
  });
});

app.get("/get_user", async (request, response, next) => {
  jwt.verify(request.token, mySecretKey, async function (error, data) {
    if (error) {
      next(new ForbiddenError("Bad Token!"));
    } else {
      const userData = await Profiles.getProfileId(data.email);
      response.status(200).send(userData);
    }
  });
});

app.post("/check_user", async (request, response, next) => {
  jwt.verify(request.token, mySecretKey, async function (error, data) {
    if (error) {
      next(new ForbiddenError("Bad Token!"));
    } else {
      const userData = await Profiles.getProfileId(request.body.email);
      if (userData && userData.email != data.email) {
        next(new ForbiddenError("Email already associated with an account!"));
      } else {
        response.status(200).send();
      }
    }
  });
});

app.post(
  "/upload_single",
  upload.single("file"),
  async (request, response, next) => {
    jwt.verify(request.token, mySecretKey, async function (error) {
      if (error) {
        next(new ForbiddenError("Bad Token!"));
      } else {
        response.status(200).send();
      }
    });
  }
);

app.post("/change_profile", async (request, response, next) => {
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
});

app.get("/get_profiles", async (request, response, next) => {
  jwt.verify(request.token, mySecretKey, async function (error, data) {
    if (error) {
      next(new ForbiddenError("Bad Token!"));
    } else {
      const userData = await Profiles.getProfileId(data.email);
      const profiles = await Profiles.getProfiles(selectPotentials(userData));
      response.status(200).send(profiles);
    }
  });
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
