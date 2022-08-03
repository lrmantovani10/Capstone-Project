import * as React from "react";
import "./App.css";
import axios from "axios";
import "@fontsource/abel";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createTheme } from "@mui/material";
import { deepPurple, red, lightBlue } from "@mui/material/colors";
import Welcome from "../Welcome/Welcome";
import SwipingPage from "../SwipingPage/SwipingPage";
import Signup from "../Signup/Signup";
import Login from "../Login/Login";
import Profile from "../Profile/Profile";
import Matches from "../Matches/Matches";
import EditProfile from "../EditProfile/EditProfile";
import Matching from "../Matches/Matching";
import Editing from "../EditProfile/Editing";
import Profiling from "../Profile/Profiling";
import { useState } from "react";

export default function App() {
  const purpleTheme = createTheme({
    palette: { primary: { main: deepPurple[500] } },
  });
  const redTheme = createTheme({ palette: { primary: { main: red[500] } } });
  const blueTheme = createTheme({
    palette: { primary: { main: lightBlue[500], contrastText: "#ffffff" } },
  });

  let [profiles, setProfiles] = useState([]);
  let [profile, setProfile] = useState({});
  let [currentUser, setCurrentUser] = useState("");
  let [profileImage, setProfileImage] = useState({});
  let [extraImages, setExtras] = useState([]);
  let [currentResume, setResume] = useState("");
  let [matches, setMatches] = useState([]);
  let [temporaryMessage, setTemporaryMessage] = useState("Loading...");
  let [currentChannel, setCurrentChannel] = useState("");
  let [chatting, setChatting] = useState(false);
  let [swipeCount, setSwipeCount] = useState(1);

  const EditFunctions = Editing(setCurrentUser, changeMessage);
  const ProfileFunctions = Profiling(changeMessage);
  const MatchingFunctions = Matching(
    setCurrentUser,
    setTemporaryMessage,
    setMatches,
    setChatting,
    setCurrentChannel
  );

  function updateParameters(user, setFunction) {
    if (user) {
      if (user.profile_picture.length > 0) {
        setProfileImage(user.profile_picture);
      } else {
        setProfileImage(process.env.REACT_APP_PROFILES + "default.png");
      }
      if (user.type == 0 && user.resume.length > 0) {
        setResume(user.resume);
      } else {
        setResume({});
      }
      let newExtras = [];

      for (let i = 0; i < 6; i++) {
        if (user["other_pictures"][i]) {
          newExtras.push(user["other_pictures"][i]);
        } else {
          newExtras.push(process.env.REACT_APP_OTHERS + "default.png");
        }
      }

      setExtras(newExtras);
      setFunction(user);
    }
  }

  function compareFunction(a, b) {
    if (a.distance < b.distance) {
      return -1;
    } else if (a.distance > b.distance) {
      return 1;
    }
    return 0;
  }

  async function getSwipes(userLocation) {
    const userToken = localStorage.getItem("userToken");
    const headers = {
      headers: {
        authorization: userToken,
      },
    };

    let body = {
      location: userLocation,
    };

    if (!userLocation) {
      body = {};
    }

    await axios
      .post(`${process.env.REACT_APP_APIURL}/get_profiles`, body, headers)
      .then((response) => {
        const sortedResults = response.data.sort(compareFunction);
        setProfiles(sortedResults);
        if (response.data.length > 0) {
          updateParameters(response.data[response.data.length - 1], setProfile);
        } else {
          setTemporaryMessage(
            "No potential matches! Broaden filters or come back later for more!"
          );
        }
      })
      .catch(() => {
        setProfiles(["error"]);
      });
  }

  async function handleSwipe(type, userEmail) {
    let profileCopy = [...profiles];
    let swipedProfile = profileCopy.pop();
    if (profileCopy.length == 0) {
      console.log("loading now!");
      setTemporaryMessage("Loading...");
    }
    let body = {
      email: userEmail,
    };
    if (type == 0) {
      body["swipedProfile"] = swipedProfile._id;
    } else {
      body["likedProfile"] = swipedProfile._id;
      body["otherEmail"] = profile.email;
    }
    const headers = {
      headers: {
        authorization: localStorage.getItem("userToken"),
      },
    };
    await axios
      .post(`${process.env.REACT_APP_APIURL}/change_profile`, body, headers)
      .then(async (response) => {
        localStorage.setItem("userToken", response.data);
        if (profile.profilesLiked.includes(currentUser._id)) {
          alert("You matched with " + profile.name + "! 🎉");
          let body = {
            matched_name: currentUser.name,
            match_name: profile.name,
            email: profile.email,
          };
          await axios
            .post(`${process.env.REACT_APP_APIURL}/send_email`, body, headers)
            .then(async () => {
              setProfiles(profileCopy);
              updateParameters(profileCopy[profileCopy.length - 1], setProfile);
              if (swipeCount == 20 || profileCopy.length == 0) {
                await getSwipes();
                setSwipeCount(1);
              } else {
                setSwipeCount(swipeCount + 1);
              }
            })
            .catch(() => {
              setProfiles(["error"]);
            });
        } else {
          setProfiles(profileCopy);
          updateParameters(profileCopy[profileCopy.length - 1], setProfile);
          if (swipeCount == 20 || profileCopy.length == 0) {
            await getSwipes();
            setSwipeCount(1);
          } else {
            setSwipeCount(swipeCount + 1);
          }
        }
      })
      .catch(() => {
        setProfiles(["error"]);
      });
  }

  function changeMessage(newMessage, newColor) {
    const messageElement = document.getElementById("returnResult");
    if (newMessage) messageElement.innerHTML = newMessage;
    if (newColor) messageElement.style.color = newColor;
  }

  async function handleRegister() {
    const name = document.querySelector("#nameInput").value;
    const email = document.querySelector("#emailInput").value;
    const password = document.querySelector("#passwordInput").value;
    const passwordRepeat = document.querySelector("#repeatPasswordInput").value;
    const checkboxesType = document.querySelectorAll(".accountTypes");
    const signupBox = document.querySelector("#signupBox").checked;
    let responseMessage = "";

    changeMessage("Signing up...", "blue");
    let accountType = 2;
    checkboxesType.forEach((element) => {
      if (element.checked && element.id == "check1") accountType = 0;
      else if (element.checked && element.id == "check2") accountType = 1;
    });

    if (
      name.length == 0 ||
      email.length == 0 ||
      password.length == 0 ||
      passwordRepeat.length == 0 ||
      !signupBox ||
      accountType == 2
    ) {
      responseMessage = "Please fill out all the fields!";
    } else if (password.length < 10) {
      responseMessage = "Password is less than 10 characters!";
    } else if (password != passwordRepeat) {
      responseMessage = "Passwords don't match!";
    }
    if (responseMessage.length > 0) {
      changeMessage(responseMessage, "red");
      return;
    }

    await axios
      .post(`${process.env.REACT_APP_APIURL}/signup`, {
        name: name,
        email: email,
        password: password,
        type: accountType,
      })
      .then((response) => {
        changeMessage("Account successfully created!", "green");
        localStorage.setItem("userToken", response.data);
        window.location.replace("/edit_profile");
      })
      .catch((error) => {
        if (error.code == "ERR_BAD_REQUEST")
          changeMessage(error.response.data.error.message, undefined);
        else changeMessage("Error signing up. Please try again!");
        changeMessage(undefined, "red");
      });
  }

  async function handleLogin() {
    const email = document.querySelector("#loginInput").value;
    const password = document.querySelector("#passInput").value;
    await axios
      .post(`${process.env.REACT_APP_APIURL}/login`, {
        email: email,
        password: password,
      })
      .then((response) => {
        changeMessage("Logging in...", "green");
        localStorage.setItem("userToken", response.data);
        window.location.replace("/");
      })
      .catch(() => {
        changeMessage("Error logging in. Please try again!", "red");
      });
  }

  const facebookFailure = () => {
    changeMessage("Error logging in with Facebook. Please try again!", "red");
  };
  const responseFacebook = async (response) => {
    await axios
      .post(`${process.env.REACT_APP_APIURL}/facebook_login`, {
        email: response.email,
        name: response.name,
        id: response.id,
        type: 0,
      })
      .then((response) => {
        changeMessage("Logging in...", "green");

        localStorage.setItem("userToken", response.data.token);
        window.location.replace(response.data.url);
      })
      .catch(() => {
        changeMessage(
          "Error logging in with Facebook. Please try again!",
          "red"
        );
      });
  };

  const navbar = (
    <ul className="nav justify-content-center">
      <li className="nav-item">
        <a className="nav-link active" href="/">
          Home
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="/matches">
          Matches
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="/profile">
          Profile
        </a>
      </li>
    </ul>
  );

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                {navbar}
                <SwipingPage
                  temporaryMessage={temporaryMessage}
                  setTemporaryMessage={setTemporaryMessage}
                  getSwipes={getSwipes}
                  updateParameters={updateParameters}
                  currentResume={currentResume}
                  profileImage={profileImage}
                  extraImages={extraImages}
                  purpleTheme={purpleTheme}
                  handleSwipe={handleSwipe}
                  profiles={profiles}
                  setProfiles={setProfiles}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  setProfile={setProfile}
                  profile={profile}
                />
              </>
            }
          />
          <Route
            path="/welcome"
            element={
              <Welcome deepPurple={deepPurple} purpleTheme={purpleTheme} />
            }
          />
          <Route
            path="/signup"
            element={
              <Signup
                purpleTheme={purpleTheme}
                handleRegister={handleRegister}
              />
            }
          />

          <Route
            path="/login"
            element={
              <Login
                purpleTheme={purpleTheme}
                handleLogin={handleLogin}
                responseFacebook={responseFacebook}
                facebookFailure={facebookFailure}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <>
                {navbar}
                <Profile
                  ProfileFunctions={ProfileFunctions}
                  updateParameters={updateParameters}
                  purpleTheme={purpleTheme}
                  profileImage={profileImage}
                  extraImages={extraImages}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  redTheme={redTheme}
                  blueTheme={blueTheme}
                  currentResume={currentResume}
                />
              </>
            }
          />

          <Route
            path="/edit_profile"
            element={
              <>
                {navbar}
                <EditProfile
                  EditFunctions={EditFunctions}
                  changeMessage={changeMessage}
                  updateParameters={updateParameters}
                  purpleTheme={purpleTheme}
                  deepPurple={deepPurple}
                  extraImages={extraImages}
                  profileImage={profileImage}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  redTheme={redTheme}
                  blueTheme={blueTheme}
                  currentResume={currentResume}
                />
              </>
            }
          />

          <Route
            path="/matches"
            element={
              <>
                {navbar}
                <Matches
                  MatchingFunctions={MatchingFunctions}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  currentChannel={currentChannel}
                  chatting={chatting}
                  temporaryMessage={temporaryMessage}
                  setTemporaryMessage={setTemporaryMessage}
                  purpleTheme={purpleTheme}
                  matches={matches}
                  setMatches={setMatches}
                />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
