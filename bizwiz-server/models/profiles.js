const { MongoClient, ObjectId } = require("mongodb");
const { mongoUrl } = require("../authentication");
const mongoClient = new MongoClient(mongoUrl);

class Profiles {
  static async getProfileId(profileId) {
    await mongoClient.connect();
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
    let profileRetrieved = profiles.findOne({ email: profileId });
    return profileRetrieved;
  }
  static async getProfiles(criteria) {
    await mongoClient.connect();
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
    let profilesRetrieved = profiles.find(criteria).toArray();
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
      profile_picture: "",
      linkedin: "",
      other_pictures: ["", "", "", "", "", ""],
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
      newProfile["age"] = "";
      newProfile["occupation"] = "";
      newProfile["resume"] = "";
    }

    await profiles.insertOne(newProfile);
  }
  static includesElement(array, comparator) {
    array.forEach((e) => {
      if (e == comparator) return true;
    });
    return false;
  }
  static async getMatches(profileId) {
    const currentUser = await this.getProfileId(profileId);
    return currentUser.matches;
  }
  static async changeProfile(email, userParameters) {
    await mongoClient.connect();
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
    const newSwipe = userParameters["swipedProfile"];
    const swipeObject = new ObjectId(newSwipe);
    const newLike = userParameters["likedProfile"];
    const likeObject = new ObjectId(newLike);
    const thisProfile = await this.getProfileId(email);
    let updateBody = {};
    if (newSwipe) {
      delete userParameters["swipedProfile"];
      let containsProfile = this.includesElement(
        thisProfile.profilesSwiped,
        newSwipe
      );
      if (!containsProfile) updateBody.$push = { profilesSwiped: swipeObject };
    } else if (newLike) {
      delete userParameters["likedProfile"];
      let containsProfile = this.includesElement(
        thisProfile.profilesLiked,
        newLike
      );
      if (!containsProfile) updateBody.$push = { profilesLiked: likeObject };
      const otherEmail = userParameters["otherEmail"];
      delete userParameters["otherEmail"];
      const otherProfile = await this.getProfileId(otherEmail);
      const thisObject = new ObjectId(thisProfile._id);

      let otherLikes = this.includesElement(
        otherProfile.profilesLiked,
        thisObject
      );
      let otherMatches = this.includesElement(otherProfile.matches, thisObject);
      if (otherLikes && !otherMatches) {
        updateBody.$push.matches = new ObjectId(otherProfile._id);
        this.changeProfile(otherEmail, { likedProfile: thisProfile._id });
      }
    }

    updateBody.$set = userParameters;
    await profiles.updateOne({ email: email }, updateBody);
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
