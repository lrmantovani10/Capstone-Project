import * as React from "react";
import "./App.css";
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
import Apping from "./Apping";
import Matching from "../Matches/Matching";
import Editing from "../EditProfile/Editing";
import Profiling from "../Profile/Profiling";
import Logging from "../Login/Logging";
import Signing from "../Signup/Signing";
import Swiping from "../SwipingPage/Swiping";
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
  let [currentUser, setCurrentUser] = useState(2);
  let [profileImage, setProfileImage] = useState({});
  let [extraImages, setExtras] = useState([]);
  let [currentResume, setResume] = useState("");
  let [matches, setMatches] = useState([]);
  let [temporaryMessage, setTemporaryMessage] = useState(1);
  let [currentChannel, setCurrentChannel] = useState("");
  let [chatting, setChatting] = useState(false);
  let [swipeCount, setSwipeCount] = useState(1);

  const AppFunctions = new Apping(setProfileImage, setResume, setExtras);
  const EditFunctions = new Editing(setCurrentUser);
  const LoginFunctions = new Logging();
  const SignupFunctions = new Signing();
  const ProfileFunctions = new Profiling();
  const MatchingFunctions = new Matching(
    setCurrentUser,
    setTemporaryMessage,
    setMatches,
    setChatting,
    setCurrentChannel
  );
  const SwipingFunctions = new Swiping(
    setProfiles,
    setTemporaryMessage,
    setProfile,
    setSwipeCount
  );

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
                SignupFunctions={SignupFunctions}
              />
            }
          />

          <Route
            path="/login"
            element={
              <Login
                purpleTheme={purpleTheme}
                LoginFunctions={LoginFunctions}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <>
                {navbar}
                <Profile
                  AppFunctions={AppFunctions}
                  ProfileFunctions={ProfileFunctions}
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
                  AppFunctions={AppFunctions}
                  EditFunctions={EditFunctions}
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
            path="/"
            element={
              <>
                {navbar}
                <SwipingPage
                  AppFunctions={AppFunctions}
                  SwipingFunctions={SwipingFunctions}
                  temporaryMessage={temporaryMessage}
                  setTemporaryMessage={setTemporaryMessage}
                  currentResume={currentResume}
                  profileImage={profileImage}
                  extraImages={extraImages}
                  purpleTheme={purpleTheme}
                  profiles={profiles}
                  setProfiles={setProfiles}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  profile={profile}
                  swipeCount={swipeCount}
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
