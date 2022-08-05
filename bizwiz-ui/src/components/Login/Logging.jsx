import axios from "axios";
import Apping from "../App/Apping";
let App = new Apping();
export default class Logging {
  // Send a login request with the user's credentials.
  async handleLogin() {
    const email = document.querySelector("#loginInput").value;
    const password = document.querySelector("#passInput").value;
    await axios
      .post(`${process.env.REACT_APP_APIURL}/login`, {
        email: email,
        password: password,
      })
      .then((response) => {
        App.changeMessage("Logging in...", "green");
        localStorage.setItem("userToken", response.data);
        window.location.replace("/");
      })
      .catch(() => {
        App.changeMessage("Error logging in. Please try again!", "red");
      });
  }

  // Handle a Facebook login failure.
  facebookFailure() {
    App.changeMessage(
      "Error logging in with Facebook. Please try again!",
      "red"
    );
  }

  // Send a Facebook login request and handle the Facebook API's response to the request.
  async responseFacebook(response) {
    await axios
      .post(`${process.env.REACT_APP_APIURL}/facebook_login`, {
        email: response.email,
        name: response.name,
        id: response.id,
        type: 0,
      })
      .then((response) => {
        App.changeMessage("Logging in...", "green");
        localStorage.setItem("userToken", response.data.token);
        window.location.replace(response.data.url);
      })
      .catch(() => {
        App.changeMessage(
          "Error logging in with Facebook. Please try again!",
          "red"
        );
      });
  }
}
