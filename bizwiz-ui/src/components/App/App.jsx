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
  let [profiles, setProfiles] = useState([]);
  let [currentUser, setCurrentUser] = useState(0);
  let [profileImage, setProfileImage] = useState("");
  let [extraImages, setExtras] = useState([]);

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
        messageElement.innerHTML = error.response.data.error.message;
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

  async function storeFile(single, file, headers, destination) {
    const messageElement = document.getElementById("saveStatus");
    let newForm = new FormData();
    axios
      .get(`${apiURL}/get_user`, headers)
      .then((response) => {
        const body = {
          userId: response.data._id,
          destination: destination,
          multiple: !single,
          count: 0,
        };
        newForm.append("data", JSON.stringify(body));
        if (single) {
          newForm.append("file", file);
        } else {
          for (let i = 0; i < file.length; i++) {
            newForm.append("files", file[i]);
          }
        }
        axios
          .post(
            `${apiURL}/upload_${single ? "single" : "multiple"}`,
            newForm,
            headers
          )
          .then(() => {})
          .catch(() => {
            messageElement.innerHTML =
              "Account update failed. Please try again!";
            messageElement.style.color = "red";
          });
      })
      .catch(() => {
        messageElement.innerHTML = "Account update failed. Please try again!";
        messageElement.style.color = "red";
      });
  }

  async function handleSave(userPictures) {
    const age = document.getElementById("ageChange").value;
    const email = document.getElementById("emailChange").value;
    const password = document.getElementById("passwordChange").value;
    const sector = document.getElementById("sectorChange").value;
    const position = document.getElementById("occupationChange").value;
    const location = document.getElementById("locationChange").value;
    const about = document.getElementById("aboutChange").value;
    const site = document.getElementById("websiteChange").value;
    const linkedin = document.getElementById("linkedinChange").value;
    const resume = document.getElementById("resumeChange").files[0];
    const profilePicture = document.getElementById("profilePicChange").files[0];
    const messageElement = document.getElementById("saveStatus");
    const basePath = "../bizwiz-ui/public/uploads/";
    const profilePath = basePath + "profiles/";
    const resumePath = basePath + "resumes/";
    const othersPath = basePath + "others/";

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

    const body = {
      age: age,
      email: email,
      password: password,
      sector: sector,
      occupation: position,
      location: location,
      about: about,
      other_link: site,
      linkedin: linkedin,
    };

    let errorHappened = false;
    if (profilePicture) {
      try {
        storeFile(true, profilePicture, headers, profilePath);
        body["profile_picture"] = profilePicture.name.split(".")[1];
      } catch {
        errorHappened = true;
      }
    }
    if (resume) {
      try {
        storeFile(true, resume, headers, resumePath);
        body["resume"] = resume.name.split(".")[1];
      } catch {
        errorHappened = true;
      }
    }

    let addElements = [];
    let nonZero = false;
    other_pictures.forEach((element, index) => {
      if (element) {
        addElements.push(element.name.split(".")[1]);
        nonZero = true;
      } else {
        addElements.push(userPictures[index]);
      }
    });

    if (nonZero) {
      try {
        storeFile(false, other_pictures, headers, othersPath);
      } catch {
        errorHappened = true;
      }
    }

    if (!errorHappened) {
      body["other_pictures"] = addElements;
      axios
        .post(`${apiURL}/change_profile`, body, headers)
        .then((response) => {
          localStorage.setItem("userToken", response.data);
          messageElement.innerHTML = "Profile successfully changed!";
          messageElement.style.color = "green";
          //window.location.replace("/profile")
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
    const headers = {
      headers: {
        authorization: localStorage.getItem("userToken"),
      },
    };

    axios
      .post(`${apiURL}/logout`, headers)
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
    // localStorage.clear()
    // window.location.replace("/welcome")
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
                  purpleTheme={purpleTheme}
                  handleMatch={handleMatch}
                  handleReject={handleReject}
                  profiles={profiles}
                  setProfiles={setProfiles}
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
