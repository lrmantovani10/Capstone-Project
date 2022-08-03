import axios from "axios";
import { changeMessage } from "../App/Apping";
export default class Logging {
  static async handleLogin() {
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

  static facebookFailure() {
    changeMessage("Error logging in with Facebook. Please try again!", "red");
  }

  static async responseFacebook(response) {
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
  }
}
