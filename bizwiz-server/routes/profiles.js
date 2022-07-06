const express = require("express")
const router = express.Router()
const Profiles = require("../models/profiles")

router.get("/", (request, response, next) =>{
    let userId = request.body.user.id
    try{
        response.status(200).send({
            "profiles": Profiles.getProfiles(userId)
        })
    }
    catch(err){
        next(err)
    }
})

router.get("/:profileId", (request, response, next) =>{
    let profileId = request.params.profileId
    try{
        response.status(200).send({
            "profile": Profiles.getProfileId(profileId)
        })
    }
    catch(err){
        next(err)
    }
})

module.exports = router