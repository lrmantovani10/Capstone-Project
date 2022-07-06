const {MongoClient} = require("mongodb");
const mongoDBpassword = "E8JaukSjbUcpguCR"
const mongoUrl = "mongodb+srv://lrmantovani:"+mongoDBpassword+"@cluster0.1hhqzvi.mongodb.net/?retryWrites=true&w=majority";
const mongoClient = new MongoClient(mongoUrl)

class Profiles{
    static async getProfileId(profileId){
        await mongoClient.connect();
        const database = mongoClient.db("UserData");
        const profiles = database.collection("Profiles");
        let profileRetrieved = profiles.findOne({email:profileId});
        return profileRetrieved
    }
    static async getProfiles(criteria){
        await mongoClient.connect();
        const database = mongoClient.db("UserData");
        const profiles = database.collection("Profiles");
        let profilesRetrieved = profiles.find(criteria)
        let profilesFound = []
        profilesRetrieved.forEach((element) => {
            profilesFound.push(element)
        })
        return profilesFound
    }
    static async createProfile(profileData){
        await mongoClient.connect();
        const database = mongoClient.db("UserData");
        const profiles = database.collection("Profiles");
        const newProfile = {
            name:profileData.name,
            email:profileData.email,
            password:profileData.password,
            picture_url:"",
            other_pictures:[],
            about:"",
            interests:[],
            sector:"",
            occupation:"",
            resume_link:"",
            location:"",
            profilesSwiped:[],
            matches:[]
        }
        await profiles.insertOne(newProfile);
        await mongoClient.close();
    }
    static async getMatches(profileId){
        const currentUser = await this.getProfileId(profileId)
        return currentUser.matches
    }
}

module.exports = Profiles