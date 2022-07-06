import * as React from 'react';
import './App.css';
import axios from 'axios';
import '@fontsource/abel';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme } from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import Welcome from '../Welcome/Welcome';
import SwipingPage from '../SwipingPage/SwipingPage';
import Signup from '../Signup/Signup';
import Login from '../Login/Login';
import Profile from '../Profile/Profile'
import Matches from '../Matches/Matches'
import { useState } from 'react';

export default function App() {
  
  const purpleTheme = createTheme({ palette: { primary: { main: deepPurple[500] } } });
  const apiURL = 'http://localhost:3001';

  function handleMatch() {
    
  }

  function handleReject() {
    
  }

  function handleRegister() {
    const name = document.querySelector('#nameInput').value;
    const email = document.querySelector('#emailInput').value;
    const password = document.querySelector('#passwordInput').value;
    const passwordRepeat = document.querySelector('#repeatPasswordInput').value;
    const messageElement = document.querySelector('#returnResponse');
    const signupBox = document.querySelector('#signupBox').checked;
    let responseMessage = ""

    if(name.length == 0 || email.length == 0 || password.length == 0 || 
      passwordRepeat.length == 0 || !signupBox){
      responseMessage = "Please fill out all the fields!"
    }
    else if(password.length < 10){
      responseMessage = "Password is less than 10 characters!"
    }
    else if (password != passwordRepeat) {
      responseMessage = "Passwords don't match!"
    }
    if(responseMessage.length > 0){
      messageElement.innerHTML = responseMessage
      messageElement.style.color = "red"
      return;
    }

    axios.post(`${apiURL}/signup`, {
      "name":name,
      "email":email,
      "password":password
    }).then((response) => {
      messageElement.innerHTML = "Account successfully created!"
      messageElement.style.color = "green"
      localStorage.setItem("userToken", response.data)
    }).finally(() =>{
      window.location.replace("/profile")
    }).catch((error) => {
      messageElement.innerHTML = error.response.data.error.message
      messageElement.style.color = "red"
    });
  }

  function handleLogin(){
    const email = document.querySelector('#loginInput').value;
    const password = document.querySelector('#passInput').value;
    const messageElement = document.querySelector('#returnResponse');
  
    axios.post(`${apiURL}/login`, {
      "email":email,
      "password":password
    }).then((response) => {
      messageElement.innerHTML = "Logging in..."
      messageElement.style.color = "green"
      localStorage.setItem("userToken", response.data)
    }).finally(() =>{
      window.location.replace("/")
    }).catch((error) => {
      messageElement.innerHTML = error.response.data.error.message
      messageElement.style.color = "red"
    });
  }

  function handleLogout(){
    localStorage.clear()
    window.location.replace("/login")
  }

  const navbar = (
    <ul className="nav justify-content-center">
      <li className="nav-item">
        <a className="nav-link active" href="/">Home</a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="/matches">Matches</a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="/profile">Profile</a>
      </li>
    </ul>
  );

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={(
              <>
                {navbar}
                <SwipingPage
                  purpleTheme={purpleTheme}
                  handleMatch={handleMatch}
                  handleReject={handleReject}
                />
              </>
            )}
          />
          <Route
            path="/welcome"
            element={(
              <Welcome
                deepPurple={deepPurple}
                purpleTheme={purpleTheme}
              />
            )}
          />
          <Route
            path="/signup"
            element={(
              <Signup
                purpleTheme={purpleTheme}
                handleRegister={handleRegister}
              />
          )}/>

          <Route
            path="/login"
            element={(
              <Login
                purpleTheme={purpleTheme}
                handleLogin={handleLogin}
              />
          )}/>

          <Route
            path="/profile"
            element={
              <Profile handleLogout={handleLogout}
            />}
          />

          <Route
            path="/matches"
            element={
            <Matches
            />}
          />

        </Routes>
      </BrowserRouter>
    </div>
  );
}
