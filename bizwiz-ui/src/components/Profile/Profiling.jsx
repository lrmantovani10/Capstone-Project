import axios from "axios";
import { changeMessage } from "../App/Apping";
export default class Profiling {
  static async handleLogout() {
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
        changeMessage("Logging out...", "green");
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("/login");
      })
      .catch(() => {
        changeMessage("Error logging out. Please try again!", "red");
      });
  }

  static async handleDelete(currentUser) {
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
          { user: currentUser },
          headers
        )
        .then(() => {
          changeMessage("Deleting account...", "green");
          localStorage.clear();
          sessionStorage.clear();
          window.location.replace("/welcome");
        })
        .catch(() => {
          changeMessage("Error deleting account. Please try again!", "red");
        });
    }
  }
}
