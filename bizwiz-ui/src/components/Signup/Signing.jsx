import axios from "axios";
import Apping from "../App/Apping";
let App = new Apping();
export default class Signing {
  // Make sure that all of the required fields have been filled out.
  checkConditions(
    name,
    email,
    password,
    passwordRepeat,
    signupBox,
    accountType
  ) {
    let responseMessage = "";
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
      App.changeMessage(responseMessage, "red");
      return false;
    }
    return true;
  }

  // Make only one box be checked at a time
  handleCheck(id) {
    const checks = document.querySelectorAll(".accountTypes");
    const currentElement = document.getElementById(id);

    checks.forEach((element) => {
      if (element.checked && element.id != id && currentElement.checked)
        element.checked = false;
    });
  }

  // After clicking the "Register" button, send a request to the /signup endpoint to register the new user.
  async handleRegister(self) {
    const name = document.querySelector("#nameInput").value;
    const email = document.querySelector("#emailInput").value;
    const password = document.querySelector("#passwordInput").value;
    const passwordRepeat = document.querySelector("#repeatPasswordInput").value;
    const checkboxesType = document.querySelectorAll(".accountTypes");
    const signupBox = document.querySelector("#signupBox").checked;

    App.changeMessage("Signing up...", "blue");
    let accountType = 2;
    checkboxesType.forEach((element) => {
      if (element.checked && element.id == "check1") accountType = 0;
      else if (element.checked && element.id == "check2") accountType = 1;
    });

    if (
      !self.checkConditions(
        name,
        email,
        password,
        passwordRepeat,
        signupBox,
        accountType
      )
    ) {
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
        App.changeMessage("Account successfully created!", "green");
        localStorage.setItem("userToken", response.data);
        window.location.replace("/edit_profile");
      })
      .catch((error) => {
        if (error.code == "ERR_BAD_REQUEST")
          App.changeMessage(error.response.data.error.message, undefined);
        else App.changeMessage("Error signing up. Please try again!");
        App.changeMessage(undefined, "red");
      });
  }
}
