const { MongoClient } = require("mongodb");
const { mongoDBpassword } = require("../authentication");
const mongoUrl =
  "mongodb+srv://lrmantovani:" +
  mongoDBpassword +
  "@cluster0.1hhqzvi.mongodb.net/?retryWrites=true&w=majority";
const mongoClient = new MongoClient(mongoUrl);
const baseFilePath = "../uploads/";

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
      profilesSwiped: [],
      interested_sectors: [],
      interested_positions: [],
      interested_locations: [],
      matches: [],
    };

    // Individual
    if (profileData.type == 0) {
      newProfile["age"] = "";
      newProfile["occupation"] = "";
      newProfile["resume"] = "";
    }
    // Organization
    else newProfile["interested_years"] = [];

    await profiles.insertOne(newProfile);
  }
  static async getMatches(profileId) {
    const currentUser = await this.getProfileId(profileId);
    return currentUser.matches;
  }
  static async changeProfile(email, userParameters) {
    await mongoClient.connect();
    const database = mongoClient.db("UserData");
    const profiles = database.collection("Profiles");
    await profiles.updateOne(
      { email: email },
      {
        $set: userParameters,
      }
    );
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
