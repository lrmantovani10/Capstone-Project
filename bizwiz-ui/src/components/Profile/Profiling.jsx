import axios from "axios";
import Apping from "../App/Apping";
let App = new Apping();
export default class Profiling {
  // Send a logout request and clear the local and session storages if successful.
  async handleLogout() {
    const userToken = localStorage.getItem("userToken");
    if (userToken.length == 0) {
      window.location.replace("/login");
    }
    const headers = {
      headers: {
        authorization: userToken,
      },
    };
    await axios
      .post(`${process.env.REACT_APP_APIURL}/logout`, {}, headers)
      .then(() => {
        App.changeMessage("Logging out...", "green");
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("/login");
      })
      .catch(() => {
        App.changeMessage("Error logging out. Please try again!", "red");
      });
  }

  // Send a request to delete the user's profile.
  async handleDelete(currentUser) {
    let finalUser = {};
    finalUser._id = currentUser._id;
    finalUser.matches = currentUser.matches;

    if (confirm("Delete account?")) {
      const userToken = localStorage.getItem("userToken");
      if (userToken.length == 0) {
        window.location.replace("/login");
      }
      const headers = {
        headers: {
          authorization: userToken,
        },
      };
      await axios
        .post(
          `${process.env.REACT_APP_APIURL}/delete`,
          {
            user: currentUser,
          },
          headers
        )
        .then(() => {
          App.changeMessage("Deleting account...", "green");
          localStorage.clear();
          sessionStorage.clear();
          window.location.replace("/welcome");
        })
        .catch(() => {
          App.changeMessage("Error deleting account. Please try again!", "red");
        });
    }
  }
}
