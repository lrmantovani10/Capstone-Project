import axios from "axios";
export default class Signing {
  constructor(changeMessage) {
    this.changeMessage = changeMessage;
  }
  static async handleRegister() {
    const name = document.querySelector("#nameInput").value;
    const email = document.querySelector("#emailInput").value;
    const password = document.querySelector("#passwordInput").value;
    const passwordRepeat = document.querySelector("#repeatPasswordInput").value;
    const checkboxesType = document.querySelectorAll(".accountTypes");
    const signupBox = document.querySelector("#signupBox").checked;
    let responseMessage = "";

    this.changeMessage("Signing up...", "blue");
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
      this.changeMessage(responseMessage, "red");
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
        this.changeMessage("Account successfully created!", "green");
        localStorage.setItem("userToken", response.data);
        window.location.replace("/edit_profile");
      })
      .catch((error) => {
        if (error.code == "ERR_BAD_REQUEST")
          this.changeMessage(error.response.data.error.message, undefined);
        else this.changeMessage("Error signing up. Please try again!");
        this.changeMessage(undefined, "red");
      });
  }
}
