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
  let [profiles, setProfiles] = useState([]);
  let [profile, setProfile] = useState({});
  let [currentUser, setCurrentUser] = useState("");
  let [profileImage, setProfileImage] = useState("");
  let [extraImages, setExtras] = useState([]);
  let [currentResume, setResume] = useState("");

  function handleMatch() {}

  function handleReject() {
    let profileCopy = [...profiles];
    let swipedProfile = profileCopy.pop();
    setProfiles(profileCopy);
    // Update database with profiles swaped
  }

  function handleRegister() {
    const name = document.querySelector("#nameInput").value;
    const email = document.querySelector("#emailInput").value;
    const password = document.querySelector("#passwordInput").value;
    const passwordRepeat = document.querySelector("#repeatPasswordInput").value;
    const messageElement = document.querySelector("#returnResponse");
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
      messageElement.innerHTML = responseMessage;
      messageElement.style.color = "red";
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
        messageElement.innerHTML = "Account successfully created!";
        messageElement.style.color = "green";
        localStorage.setItem("userToken", response.data);
        window.location.replace("/edit_profile");
      })
      .catch((error) => {
        if (error.code == "ERR_BAD_REQUEST")
          messageElement.innerHTML = error.response.data.error.message;
        else messageElement.innerHTML = "Error signing up. Please try again!";
        messageElement.style.color = "red";
      });
  }

  function handleLogin() {
    const email = document.querySelector("#loginInput").value;
    const password = document.querySelector("#passInput").value;
    const messageElement = document.querySelector("#returnResponse");

    axios
      .post(`${apiURL}/login`, {
        email: email,
        password: password,
      })
      .then((response) => {
        messageElement.innerHTML = "Logging in...";
        messageElement.style.color = "green";
        localStorage.setItem("userToken", response.data);
        window.location.replace("/");
      })
      .catch((error) => {
        messageElement.innerHTML = error.response.data.error.message;
        messageElement.style.color = "red";
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

  async function storeFile(file, extension, headers, destination) {
    const messageElement = document.getElementById("saveStatus");
    let newForm = new FormData();
    const body = {
      userId: currentUser._id,
      destination: destination,
      extension: extension,
    };
    newForm.append("data", JSON.stringify(body));
    newForm.append("file", file);

    axios
      .post(`${apiURL}/upload_single`, newForm, headers)
      .then(() => {
        return;
      })
      .catch(() => {
        messageElement.innerHTML = "Account update failed. Please try again!";
        messageElement.style.color = "red";
      });
  }

  async function handleSave(userPictures) {
    const email = document.getElementById("emailChange").value;
    const password = document.getElementById("passwordChange").value;
    const sector = document.getElementById("sectorChange").value;
    const location = document.getElementById("locationChange").value;
    const about = document.getElementById("aboutChange").value;
    const site = document.getElementById("websiteChange").value;
    const linkedin = document.getElementById("linkedinChange").value;
    const profilePicture = document.getElementById("profilePicChange").files[0];
    const messageElement = document.getElementById("saveStatus");
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
      interested_sectors: currentUser.interested_sectors,
      interested_locations: currentUser.interested_locations,
      interested_positions: currentUser.interested_positions,
    };

    if (currentUser.type == 0) {
      body["age"] = document.getElementById("ageChange").value;
      body["occupation"] = document.getElementById("occupationChange").value;
      body["resume"] = document.getElementById("resumeChange").files[0];
    } else {
      const years = document.getElementById("experienceChange").value;
      body["interested_years"] = years;
    }

    let errorHappened = false;
    if (password.length < 10) {
      messageElement.innerHTML = "Password is less than 10 characters!";
      messageElement.style.color = "red";
      errorHappened = true;
    }

    if (!errorHappened) {
      await axios
        .post(`${apiURL}/check_user`, { email: email }, headers)
        .then(() => {})
        .catch((error) => {
          if (error.code == "ERR_BAD_REQUEST")
            messageElement.innerHTML = error.response.data.error.message;
          else
            messageElement.innerHTML =
              "Error updating profile. Please try again!";
          messageElement.style.color = "red";
          errorHappened = true;
        });
    }

    if (!errorHappened && profilePicture) {
      try {
        const extension = "." + profilePicture.name.split(".")[1];
        await storeFile(profilePicture, extension, headers, profilePath);
        body["profile_picture"] = profilePicture.name.split(".")[1];
      } catch {
        errorHappened = true;
      }
    }
    if (!errorHappened && currentUser.type == 0 && currentResume) {
      try {
        const extension = "." + currentResume.split(".")[1];
        await storeFile(currentResume, extension, headers, resumePath);
        body["resume"] = currentResume.split(".")[1];
      } catch (error) {
        errorHappened = true;
      }
    }

    if (!errorHappened) {
      let addElements = [];
      other_pictures.forEach((element, index) => {
        if (element) {
          const extension =
            "_" + (index + 1) + "." + element.name.split(".")[1];
          storeFile(element, extension, headers, othersPath);
          addElements.push(element.name.split(".")[1]);
        } else {
          addElements.push(userPictures[index]);
        }
      });
      body["other_pictures"] = addElements;
      axios
        .post(`${apiURL}/change_profile`, body, headers)
        .then((response) => {
          localStorage.setItem("userToken", response.data);
          messageElement.innerHTML = "Profile successfully changed!";
          messageElement.style.color = "green";
          window.location.replace("profile");
        })
        .catch(() => {
          messageElement.innerHTML = "Account update failed. Please try again!";
          messageElement.style.color = "red";
        });
    }
  }

  function handleDiscard() {
    window.location.replace("/profile");
  }

  function handleLogout() {
    const messageElement = document.getElementById("logoutStatus");
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
        messageElement.innerHTML = "Logging out...";
        messageElement.style.color = "green";
        localStorage.clear();
        window.location.replace("/login");
      })
      .catch(() => {
        messageElement.innerHTML = "Error logging out. Please try again!";
        messageElement.style.color = "red";
      });
  }

  function handleDelete() {
    const messageElement = document.getElementById("logoutStatus");
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
        messageElement.innerHTML = "Deleting account...";
        messageElement.style.color = "green";
        localStorage.clear();
        window.location.replace("/welcome");
      })
      .catch(() => {
        messageElement.innerHTML = "Error deleting account. Please try again!";
        messageElement.style.color = "red";
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
                  currentResume={currentResume}
                  setResume={setResume}
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                  extraImages={extraImages}
                  setExtras={setExtras}
                  profilesPath={profilesPath}
                  othersPath={othersPath}
                  resumesPath={resumesPath}
                  purpleTheme={purpleTheme}
                  handleMatch={handleMatch}
                  handleReject={handleReject}
                  profiles={profiles}
                  setProfiles={setProfiles}
                  profile={profile}
                  setProfile={setProfile}
                  apiURL={apiURL}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
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
              <Login purpleTheme={purpleTheme} handleLogin={handleLogin} />
            }
          />

          <Route
            path="/profile"
            element={
              <>
                {navbar}
                <Profile
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
                  profilesPath={profilesPath}
                  othersPath={othersPath}
                  resumesPath={resumesPath}
                  purpleTheme={purpleTheme}
                  handleRemove={handleRemove}
                  handleAdd={handleAdd}
                  deepPurple={deepPurple}
                  extraImages={extraImages}
                  setExtras={setExtras}
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                  handleSave={handleSave}
                  handleDiscard={handleDiscard}
                  apiURL={apiURL}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  redTheme={redTheme}
                  blueTheme={blueTheme}
                  handleChangeImage={handleChangeImage}
                  currentResume={currentResume}
                  setResume={setResume}
                />
              </>
            }
          />

          <Route
            path="/matches"
            element={
              <>
                {navbar}
                <Matches />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
