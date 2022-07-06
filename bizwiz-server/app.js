const express = require('express')
const morgan = require('morgan')
const cors = require("cors")
const jwt = require("jsonwebtoken")
const {NotFoundError, BadRequestError, ForbiddenError} = require("./utils/errors")
const app = express()
const profiles = require("./routes/profiles")
const Profiles = require("./models/profiles")
app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())
app.use("/profiles", profiles)
const mySecretKey = "764t6327uyqdgdhaDBSJADVBSHJ"

function ensureToken(req, res, next){
    const bearerToken= req.headers["authorization"]
    if(typeof bearerToken !== "undefined"){
        req.token = bearerToken
        next()
    }
    else{
        next(new ForbiddenError("Bad Token!"))
    }
}

app.post("/login", async(request, response, next) =>{
    const requestBody = request.body
    const profileData = await Profiles.getProfileId(requestBody.email)
    const token = jwt.sign({profileData}, mySecretKey)
    try{
        if(!profileData){
            next(new NotFoundError("Account doesn't exist!"))
        }
        else{
            if(profileData.password != requestBody.password){
                next(new BadRequestError("Incorrect password!"))
            }
            else{
                response.status(200).send(token)
            }
        }
    }
    catch(error){
        next(error)
    }
})

app.post("/signup", async(request, response, next) =>{
    const requestBody = request.body
    try{
        const profileData = await Profiles.getProfileId(requestBody.email)
        if(!profileData){
            await Profiles.createProfile(requestBody)
            const token = jwt.sign({email:requestBody.email}, mySecretKey)
            response.status(200).send(token)
        }
        else{
            next(new BadRequestError("Email already associated with an account!"))
        }
    }
    catch(error){
        next(error)
    }
})

app.get("/get_user", ensureToken, async(request, response, next) =>{
    jwt.verify(request.token, mySecretKey, async function(error, data){
        if(error){
            next(new ForbiddenError("Bad Token!"))
        }
        else{
            const userData = await Profiles.getProfileId(data.email)
            response.status(200).send(userData)
        }
    })
})

app.get("/get_profiles", ensureToken, async(request, response, next) =>{
    jwt.verify(request.token, mySecretKey, async function(error, data){
        if(error){
            next(new ForbiddenError("Bad Token!"))
        }
        else{
            const matches = await Profiles.getMatches(data.email)
            response.status(200).send(matches)
        }
    })
})

app.get("/matches", ensureToken, async(request, response, next) =>{
    jwt.verify(request.token, mySecretKey, async function(error, data){
        if(error){
            next(new ForbiddenError("Bad Token!"))
        }
        else{
            const matches = await Profiles.getMatches(data.email)
            response.status(200).send(matches)
        }
    })
})

app.use((req,res,next) =>{
    next(new NotFoundError())
})

app.use((error,req,res,next)=>{
    const status = (error.status ? error.status : 500)
    res.status(status).json({error : {
        message : (error.message ? error.message : "Something went wrong in the application"),
        status: status
        }
    })
})

module.exports = app

