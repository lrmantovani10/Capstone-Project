const { MongoClient, ObjectId, GridFSBucket } = require("mongodb");
const fs = require("fs");
const {
  mongoUrl,
  mongoDatabase,
  mongoCollection,
} = require("../authentication");
const mongoClient = new MongoClient(mongoUrl);

class Profiles {
  static async getProfileEmail(profileEmail) {
    await mongoClient.connect();
    const database = mongoClient.db(mongoDatabase);
    const profiles = database.collection(mongoCollection);
    let profileRetrieved = profiles.findOne({ email: profileEmail });
    return profileRetrieved;
  }
  static async getProfileId(profileId) {
    await mongoClient.connect();
    const database = mongoClient.db(mongoDatabase);
    const profiles = database.collection(mongoCollection);
    let profileRetrieved = profiles.findOne({ _id: new ObjectId(profileId) });
    return profileRetrieved;
  }
  static async getProfiles(criteria) {
    await mongoClient.connect();
    const database = mongoClient.db(mongoDatabase);
    const profiles = database.collection(mongoCollection);
    let profilesRetrieved = await profiles.find(criteria).limit(20).toArray();
    return profilesRetrieved;
  }
  static async createProfile(profileData) {
    await mongoClient.connect();
    const database = mongoClient.db(mongoDatabase);
    const profiles = database.collection(mongoCollection);
    let newProfile = {
      name: profileData.name,
      email: profileData.email,
      password: profileData.password,
      type: profileData.type,
      linkedin: "",
      about: "",
      sector: "",
      other_link: "",
      location: "",
      profilesLiked: [],
      profilesSwiped: [],
      interested_years: 0,
      interested_sectors: [],
      interested_positions: [],
      interested_locations: [],
      matches: [],
    };

    if (profileData.type == 0) {
      newProfile["age"] = 18;
      newProfile["occupation"] = "";
    }

    await profiles.insertOne(newProfile);
  }
  static includesElement(array, comparator) {
    let conditional = false;
    array.forEach((e) => {
      if (e.toString() == comparator) {
        conditional = true;
      }
    });
    return conditional;
  }
  static async getMatches(profileId) {
    const currentUser = await this.getProfileEmail(profileId);
    return currentUser.matches;
  }
  static async removeMatch(firstEmail, secondProfile) {
    await mongoClient.connect();
    const database = mongoClient.db(mongoDatabase);
    const profiles = database.collection(mongoCollection);
    const firstUser = await this.getProfileEmail(firstEmail);
    const firstObject = firstUser._id;
    const secondObject = new ObjectId(secondProfile);
    const firstBody = {
      $pull: {
        profilesLiked: secondObject,
        matches: secondObject,
      },
      $push: {
        profilesSwiped: secondObject,
      },
    };
    const secondBody = {
      $pull: {
        profilesLiked: firstObject,
        matches: firstObject,
      },
      $push: {
        profilesSwiped: firstObject,
      },
    };
    await profiles.updateOne({ _id: firstObject }, firstBody);
    await profiles.updateOne({ _id: secondObject }, secondBody);
  }
  static async changeProfile(email, userParameters) {
    await mongoClient.connect();
    const database = mongoClient.db(mongoDatabase);
    const profiles = database.collection(mongoCollection);
    const newSwipe = userParameters["swipedProfile"];
    const newLike = userParameters["likedProfile"];
    const thisProfile = await this.getProfileEmail(email);
    let updateBody = {};
    if (newSwipe) {
      const swipeObject = new ObjectId(newSwipe);
      delete userParameters["swipedProfile"];
      let containsProfile = this.includesElement(
        thisProfile.profilesSwiped,
        newSwipe
      );
      if (!containsProfile) updateBody.$push = { profilesSwiped: swipeObject };
    } else if (newLike) {
      const likeObject = new ObjectId(newLike);
      delete userParameters["likedProfile"];
      if (userParameters["referral"]) {
        updateBody["$push"] = {
          matches: likeObject,
        };
      } else {
        let containsProfile = this.includesElement(
          thisProfile.profilesLiked,
          newLike
        );
        if (!containsProfile) updateBody.$push = { profilesLiked: likeObject };
        const otherEmail = userParameters["otherEmail"];
        delete userParameters["otherEmail"];
        const otherProfile = await this.getProfileEmail(otherEmail);
        const thisObject = thisProfile._id;
        const thisId = thisObject.toString();
        let otherLikes = this.includesElement(
          otherProfile.profilesLiked,
          thisId
        );
        let otherMatches = this.includesElement(otherProfile.matches, thisId);
        if (otherLikes && !otherMatches) {
          updateBody.$push.matches = otherProfile._id;
          this.changeProfile(otherEmail, {
            likedProfile: thisId,
            referral: true,
          });
        }
      }
    }

    updateBody.$set = userParameters;
    await profiles.updateOne({ email: email }, updateBody);
    return;
  }
  static async uploadFile(filePath, userId, category) {
    await mongoClient.connect();
    const database = mongoClient.db(mongoDatabase);
    const bucket = new GridFSBucket(database, { bucketName: userId });
    const files = await bucket.find({}).toArray();
    for (const file of files) {
      if (file.metadata.value == category) {
        await bucket.delete(file._id);
      }
    }
    await new Promise(function (resolve, reject) {
      const uploadStream = bucket.openUploadStream(filePath.split("/")[2], {
        metadata: { field: "type", value: category },
      });
      uploadStream.on("unpipe", () => {
        resolve();
      });
      uploadStream.on("error", () => {
        reject();
      });
      fs.createReadStream(filePath).pipe(uploadStream);
    });

    fs.unlink(filePath, (error) => {
      if (error) {
        throw new Error("Local file deletion failed!");
      }
    });
  }

  static async readFiles(userId) {
    await mongoClient.connect();
    const database = mongoClient.db(mongoDatabase);
    const bucket = new GridFSBucket(database, { bucketName: userId });
    const files = await bucket.find({}).toArray();
    let finalFiles = [];
    let promises = [];

    for (const file of files) {
      promises.push(
        new Promise(function (resolve, reject) {
          let encoded = "";
          const mimeType =
            (file.metadata.value != "resume" ? "image/" : "application/") +
            file.filename.split(".")[1];
          const streamReader = bucket.openDownloadStreamByName(file.filename);
          streamReader.on("data", function (data) {
            const base64Data = data.toString("base64");
            encoded += base64Data;
          });
          streamReader.on("end", () => {
            finalFiles.push([
              file.metadata.value,
              `data:${mimeType};base64,${encoded}`,
            ]);
            resolve();
          });
          streamReader.on("error", () => {
            reject();
          });
        })
      );
    }
    await Promise.all(promises);

    return finalFiles;
  }
  static async getFiles(type, data) {
    let userData = data;
    if (type == 0) {
      userData = await this.getProfileEmail(data);
    }
    let fileElements = ["profile_picture", "resume"];
    for (let i = 0; i < 6; i++) {
      fileElements.push("other_pictures_" + i);
    }
    const fileArray = await this.readFiles(userData._id);
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
    return userData;
  }
  static async delete(id) {
    await mongoClient.connect();
    const database = mongoClient.db(mongoDatabase);
    const bucket = new GridFSBucket(database, { bucketName: id });
    bucket.drop();
    const profiles = database.collection(mongoCollection);
    await profiles.updateMany(
      {},
      { $pull: { profilesLiked: _id, profilesSwiped: _id, matches: _id } }
    );
    await profiles.deleteOne({ _id: id });
  }
  static async logout() {
    await mongoClient.close();
  }
}

module.exports = Profiles;
