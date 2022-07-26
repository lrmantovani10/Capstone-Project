const e = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const { mongoUrl } = require("../authentication");
const mongoClient = new MongoClient(mongoUrl);

class Profiles {
  static async getProfileEmail(profileEmail) {
    await mongoClient.connect();
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
    let profileRetrieved = profiles.findOne({ email: profileEmail });
    return profileRetrieved;
  }
  static async getProfileId(profileId) {
    await mongoClient.connect();
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
    let profileRetrieved = profiles.findOne({ _id: new ObjectId(profileId) });
    return profileRetrieved;
  }
  static async getProfiles(criteria) {
    await mongoClient.connect();
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
    let profilesRetrieved = await profiles.find(criteria).limit(20).toArray();
    return profilesRetrieved;
  }
  static async createProfile(profileData) {
    await mongoClient.connect();
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
    let newProfile = {
      name: profileData.name,
      email: profileData.email,
      password: profileData.password,
      type: profileData.type,
      profile_picture: {},
      linkedin: "",
      other_pictures_0: {},
      other_pictures_1: {},
      other_pictures_2: {},
      other_pictures_3: {},
      other_pictures_4: {},
      other_pictures_5: {},
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
      newProfile["resume"] = {};
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
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
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
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
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
  static async delete(email) {
    await mongoClient.connect();
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
    await profiles.deleteOne({ email: email });
  }
  static async logout() {
    await mongoClient.close();
  }
}

module.exports = Profiles;
