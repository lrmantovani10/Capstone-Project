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
import { useState } from "react";

export default function App() {
  const purpleTheme = createTheme({
    palette: { primary: { main: deepPurple[500] } },
  });
  const redTheme = createTheme({ palette: { primary: { main: red[500] } } });
  const blueTheme = createTheme({
    palette: { primary: { main: lightBlue[500], contrastText: "#ffffff" } },
  });
  const apiURL = "http://localhost:3001";
  const basePath = "uploads/";
  const profilesPath = basePath + "profiles/";
  const othersPath = basePath + "others/";
  const resumesPath = basePath + "resumes/";
  const applicationId = "B2469C49-EFAA-4BD1-85D5-58B376D9337F";

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
  let [message, setMessage] = useState("");
  let [messageColor, setMessageColor] = useState("white");

  function updateParameters(user, setFunction) {
    if (user) {
      if (Object.keys(user.profile_picture).length > 0) {
        setProfileImage(user.profile_picture);
      } else {
        setProfileImage(profilesPath + "default.png");
      }
      if (user.type == 0 && Object.keys(user.resume).length > 0) {
        setResume(user.resume);
      } else {
        setResume({});
      }
      let newExtras = [];

      for (let i = 0; i < 6; i++) {
        if (user["other_pictures_" + i].length > 0) {
          newExtras.push(user["other_pictures_" + i]);
        } else {
          newExtras.push(othersPath + "default.png");
        }
      }

      setExtras(newExtras);
      setFunction(user);
    }
  }

  async function getSwipes() {
    const userToken = localStorage.getItem("userToken");
    const headers = {
      headers: {
        authorization: userToken,
      },
    };

    axios
      .get(`${apiURL}/get_profiles`, headers)
      .then((response) => {
        setProfiles(response.data);
        if (response.data.length > 0) {
          updateParameters(response.data[response.data.length - 1], setProfile);
        } else {
          setTemporaryMessage(
            "No potential matches! Broaden filters or come back later for more!"
          );
        }
      })
      .catch((error) => {
        setProfiles(["error"]);
      });
  }

  async function handleSwipe(type, userEmail) {
    let profileCopy = [...profiles];
    let swipedProfile = profileCopy.pop();
    if (profileCopy.length == 0) {
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
      .post(`${apiURL}/change_profile`, body, headers)
      .then((response) => {
        localStorage.setItem("userToken", response.data);
        if (profile.profilesLiked.includes(currentUser._id)) {
          alert("You matched with " + profile.name + "! 🎉");
        }
        setProfiles(profileCopy);
        updateParameters(profileCopy[profileCopy.length - 1], setProfile);
      })
      .catch(() => {
        setProfiles(["error"]);
      });
    if (swipeCount == 20) {
      await getSwipes();
      setSwipeCount(1);
    } else {
      setSwipeCount(swipeCount + 1);
    }
  }

  async function getMatches() {
    const userToken = localStorage.getItem("userToken");
    if (userToken.length > 0) {
      const headers = {
        headers: {
          authorization: userToken,
        },
      };
      await axios
        .get(`${apiURL}/get_user`, headers)
        .then(async (userResponse) => {
          setCurrentUser(userResponse.data);
          await axios
            .get(`${apiURL}/matches`, headers)
            .then(async (response) => {
              let rawMatches = response.data;
              if (rawMatches.length == 0)
                setTemporaryMessage("No matches so far! Keep swiping!");
              for (const element in rawMatches) {
                await axios
                  .get(`${apiURL}/matches/` + element, headers)
                  .then((response) => {
                    setMatches([...matches, response.data.user]);
                    setChatting(false);
                  });
              }
            })
            .catch(() => {
              setMatches("error");
            });
        })
        .catch(() => {
          setMatches("error");
        });
    } else {
      window.location.replace("/login");
    }
  }

  async function handleEndMatch(secondId) {
    if (confirm("Are you sure you want to remove this match?")) {
      const body = {
        secondProfile: secondId,
      };
      const headers = {
        headers: {
          authorization: localStorage.getItem("userToken"),
        },
      };
      await axios
        .post(`${apiURL}/matches/remove_match`, body, headers)
        .then(async (response) => {
          localStorage.setItem("userToken", response.data);
          window.location.replace("/matches");
        })
        .catch(() => {
          setMatches(["error"]);
        });
    }
  }

  async function handleChat(firstId, secondId, firstName, secondName) {
    let ids = [firstId, secondId];
    ids.sort();
    let chatName, channelUrl;
    if (ids[0] == firstId) {
      chatName = firstName + " | " + secondName;
      channelUrl = firstId + secondId;
    } else {
      chatName = secondName + " | " + firstName;
      channelUrl = secondId + firstId;
    }
    const headers = {
      headers: {
        authorization: localStorage.getItem("userToken"),
      },
    };
    const body = {
      name: chatName,
      channel_url: channelUrl,
      is_distinct: true,
      user_ids: ids,
    };
    await axios
      .post(`${apiURL}/matches/manage_chat`, body, headers, body, headers)
      .then((response) => {
        setCurrentChannel(response.data);
        setChatting(true);
      })
      .catch((error) => {
        setMatches(error);
      });
  }

  function handleRegister() {
    const name = document.querySelector("#nameInput").value;
    const email = document.querySelector("#emailInput").value;
    const password = document.querySelector("#passwordInput").value;
    const passwordRepeat = document.querySelector("#repeatPasswordInput").value;
    const checkboxesType = document.querySelectorAll(".accountTypes");
    const signupBox = document.querySelector("#signupBox").checked;
    let responseMessage = "";

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
      setMessage(responseMessage);
      setMessageColor("red");
      return;
    }

    axios
      .post(`${apiURL}/signup`, {
        name: name,
        email: email,
        password: password,
        type: accountType,
      })
      .then((response) => {
        setMessage("Account successfully created!");
        setMessageColor("green");
        localStorage.setItem("userToken", response.data);
        window.location.replace("/edit_profile");
      })
      .catch((error) => {
        if (error.code == "ERR_BAD_REQUEST")
          setMessage(error.response.data.error.message);
        else setMessage("Error signing up. Please try again!");
        setMessageColor("red");
      });
  }

  function handleLogin() {
    const email = document.querySelector("#loginInput").value;
    const password = document.querySelector("#passInput").value;
    axios
      .post(`${apiURL}/login`, {
        email: email,
        password: password,
      })
      .then((response) => {
        setMessage("Logging in...");
        setMessageColor("green");
        localStorage.setItem("userToken", response.data);
        window.location.replace("/");
      })
      .catch((error) => {
        setMessage(error.response.data.error.message);
        setMessageColor("red");
      });
  }

  function handleEdit() {
    window.location.replace("/edit_profile");
  }

  function handleAdd(itemId, field) {
    const newItem = document.getElementById(itemId).value;
    let user = { ...currentUser };
    if (!user[field].includes(newItem.toLowerCase()))
      user[field].push(newItem.toLowerCase());
    setCurrentUser(user);
  }

  function handleRemove(index, field) {
    let user = { ...currentUser };
    user[field].splice(index, 1);
    setCurrentUser(user);
  }

  async function storeFile(file, headers, destination, category) {
    if (file) {
      let newForm = new FormData();
      const extension = "." + file.name.split(".")[1];
      const body = {
        userId: currentUser._id,
        userEmail: currentUser.email,
        destination: destination,
        extension: extension,
        category: category,
      };

      if (file.size / 1000000 > 12) {
        setMessage("File size can't be over 12MB! Please try again!");
        setMessageColor("red");
        throw new Error("File size can't be over 12MB! Please try again!");
      }
      newForm.append("data", JSON.stringify(body));
      newForm.append("file", file);

      await axios
        .post(`${apiURL}/upload_single`, newForm, headers)
        .catch((error) => {
          setMessage("Account update failed. Please try again!");
          setMessageColor("red");
          throw new Error(error);
        });
      Promise.resolve();
    }
  }

  async function checkUser(email, headers) {
    await axios
      .post(`${apiURL}/check_user`, { email: email }, headers)
      .catch((error) => {
        if (error.code == "ERR_BAD_REQUEST")
          setMessage(error.response.data.error.message);
        else setMessage("Error updating profile. Please try again!");
        setMessageColor("red");
        throw new Error(error);
      });
    Promise.resolve();
  }

  async function storeExtraPictures(files, headers, othersPath) {
    let index = 0;
    for (const file of files) {
      await storeFile(file, headers, othersPath, "other_pictures_" + index);
      index++;
    }
    Promise.resolve();
  }

  async function changeProfile(body, headers) {
    await axios
      .post(`${apiURL}/change_profile`, body, headers)
      .then((response) => {
        localStorage.setItem("userToken", response.data);
      })
      .catch((error) => {
        setMessage("Account update failed. Please try again!");
        setMessageColor("red");
        throw new Error(error);
      });
    Promise.resolve();
  }

  async function handleSave() {
    const email = document.getElementById("emailChange").value;
    const password = document.getElementById("passwordChange").value;
    const sector = document.getElementById("sectorChange").value;
    const location = document.getElementById("locationChange").value;
    const about = document.getElementById("aboutChange").value;
    const site = document.getElementById("websiteChange").value;
    const linkedin = document.getElementById("linkedinChange").value;
    const profilePicture = document.getElementById("profilePicChange").files[0];
    const interested_years = document.getElementById("experienceChange").value;
    const initialPath = "../bizwiz-ui/public/uploads/";
    const profilePath = initialPath + "profiles/";
    const resumePath = initialPath + "resumes/";
    const othersPath = initialPath + "others/";

    const headers = {
      headers: {
        authorization: localStorage.getItem("userToken"),
      },
    };

    let other_pictures = [];
    for (let index = 0; index < 6; index++) {
      const currentPictureFile = document.getElementById("imageInput" + index)
        .files[0];
      other_pictures.push(currentPictureFile);
    }

    let body = {
      email: email,
      password: password,
      sector: sector,
      location: location,
      about: about,
      other_link: site,
      linkedin: linkedin,
      interested_years: interested_years,
      interested_sectors: currentUser.interested_sectors,
      interested_locations: currentUser.interested_locations,
      interested_positions: currentUser.interested_positions,
    };

    let userResume;
    if (currentUser.type == 0) {
      body["age"] = document.getElementById("ageChange").value;
      body["occupation"] = document.getElementById("occupationChange").value;
      userResume = document.getElementById("resumeChange").files[0];
    }

    if (password.length < 10) {
      setMessageColor("red");
      setMessage("Password is less than 10 characters!");
    } else {
      await Promise.all([
        checkUser(email, headers),
        storeFile(profilePicture, headers, profilePath, "profile_picture"),
        storeFile(userResume, headers, resumePath, "resume"),
        storeExtraPictures(other_pictures, headers, othersPath),
      ]).then(async () => {
        await changeProfile(body, headers).then(() => {
          setMessage("Account successfully updated!");
          setMessageColor("green");
          window.location.replace("profile");
        });
      });
    }
  }

  function handleDiscard() {
    window.location.replace("/profile");
  }

  function handleLogout() {
    const userToken = localStorage.getItem("userToken");
    if (userToken.length == 0) {
      window.location.replace("/login");
    }
    const headers = {
      headers: {
        authorization: userToken,
      },
    };
    axios
      .post(`${apiURL}/logout`, {}, headers)
      .then(() => {
        setMessage("Logging out...");
        setMessageColor("green");
        localStorage.clear();
        window.location.replace("/login");
      })
      .catch(() => {
        setMessage("Error logging out. Please try again!");
        setMessageColor("red");
      });
  }

  function handleDelete() {
    const userToken = localStorage.getItem("userToken");
    if (userToken.length == 0) {
      window.location.replace("/login");
    }
    const headers = {
      headers: {
        authorization: userToken,
      },
    };
    axios
      .post(`${apiURL}/delete`, {}, headers)
      .then(() => {
        setMessage("Deleting account...");
        setMessageColor("green");
        localStorage.clear();
        window.location.replace("/welcome");
      })
      .catch(() => {
        setMessage("Error deleting account. Please try again!");
        setMessageColor("red");
      });
  }

  function handleChangeImage(event, targetElement) {
    const picturePreview = document.getElementById(targetElement);
    picturePreview.src = URL.createObjectURL(event.target.files[0]);
  }

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
                  setTemporaryMessage={setTemporaryMessage}
                  getSwipes={getSwipes}
                  updateParameters={updateParameters}
                  currentResume={currentResume}
                  profileImage={profileImage}
                  extraImages={extraImages}
                  profilesPath={profilesPath}
                  othersPath={othersPath}
                  resumesPath={resumesPath}
                  purpleTheme={purpleTheme}
                  handleSwipe={handleSwipe}
                  profiles={profiles}
                  setProfiles={setProfiles}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  setProfile={setProfile}
                  profile={profile}
                  apiURL={apiURL}
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
                message={profilesPath.message}
                messageColor={profilesPath.messageColor}
                handleRegister={handleRegister}
              />
            }
          />

          <Route
            path="/login"
            element={
              <Login
                message={profilesPath.message}
                messageColor={profilesPath.messageColor}
                purpleTheme={purpleTheme}
                handleLogin={handleLogin}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <>
                {navbar}
                <Profile
                  message={message}
                  messageColor={messageColor}
                  updateParameters={updateParameters}
                  profilesPath={profilesPath}
                  othersPath={othersPath}
                  resumesPath={resumesPath}
                  purpleTheme={purpleTheme}
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                  extraImages={extraImages}
                  setExtras={setExtras}
                  handleLogout={handleLogout}
                  apiURL={apiURL}
                  handleEdit={handleEdit}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  redTheme={redTheme}
                  blueTheme={blueTheme}
                  handleDelete={handleDelete}
                  currentResume={currentResume}
                  setResume={setResume}
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
                  message={message}
                  setMessage={setMessage}
                  messageColor={messageColor}
                  setMessageColor={setMessageColor}
                  updateParameters={updateParameters}
                  profilesPath={profilesPath}
                  othersPath={othersPath}
                  resumesPath={resumesPath}
                  purpleTheme={purpleTheme}
                  handleRemove={handleRemove}
                  handleAdd={handleAdd}
                  deepPurple={deepPurple}
                  extraImages={extraImages}
                  profileImage={profileImage}
                  handleSave={handleSave}
                  handleDiscard={handleDiscard}
                  apiURL={apiURL}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  redTheme={redTheme}
                  blueTheme={blueTheme}
                  handleChangeImage={handleChangeImage}
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
                  apiURL={apiURL}
                  setCurrentUser={setCurrentUser}
                  applicationId={applicationId}
                  currentChannel={currentChannel}
                  chatting={chatting}
                  temporaryMessage={temporaryMessage}
                  setTemporaryMessage={setTemporaryMessage}
                  purpleTheme={purpleTheme}
                  handleEndMatch={handleEndMatch}
                  currentUser={currentUser}
                  handleChat={handleChat}
                  getMatches={getMatches}
                  profilesPath={profilesPath}
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
